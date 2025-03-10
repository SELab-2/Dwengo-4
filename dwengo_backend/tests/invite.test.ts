import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest';
import prisma from './helpers/prisma'
import app from '../index';
import { Class, Invite, JoinRequestStatus, Teacher, User } from '@prisma/client';
import { addTeacherToClass, createClass, createInvite, createTeacher } from './helpers/testDataCreation';

// mock the protectTeacher middleware, as it's not relevant for these tests
// (protectTeacher should be tested seperately though, TODO)
// vi.mock('../middleware/teacherAuthMiddleware', async () => {
//     const actual = await vi.importActual("../middleware/teacherAuthMiddleware");
//     return {
//         ...actual,
//         protectTeacher: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => next()
//     };
// });

describe('invite tests', async () => {
    let teacherUser1: User & { teacher: Teacher, token: string };
    let teacherUser2: User & { teacher: Teacher, token: string };
    let classroom: Class;
    beforeEach(async () => {
        // clear the database
        await prisma.$transaction([
            prisma.invite.deleteMany(),
            prisma.classTeacher.deleteMany(),
            prisma.class.deleteMany(),
            prisma.student.deleteMany(),
            prisma.teacher.deleteMany(),
            prisma.user.deleteMany()
        ]);
        // create two teachers
        teacherUser1 = await createTeacher("Bob", "Boons", "bob.boons@gmail.com");
        teacherUser2 = await createTeacher("John", "Doe", "john.doe@gmail.com");
        // create a class
        classroom = await createClass("5A", "ABCD");
    });
    describe('[POST] /teacher/classes/:classId/invites', async () => {
        it('should respond with a `201` status code and an invite', async () => {
            // set up scenario where there's two teachers and a class, the first one being a teacher of the class
            await addTeacherToClass(teacherUser1.id, classroom.id);

            // now we can test the invite creation
            const { status, body } = await request(app)
                .post(`/teacher/classes/${classroom.id}/invites`)
                .set('Authorization', `Bearer ${teacherUser1.token}`)
                .send({
                    otherTeacherId: teacherUser2.id
                });

            expect(status).toBe(201)
            // double check that the invite was created
            const invite = await prisma.invite.findFirst({
                where: {
                    otherTeacherId: teacherUser2.id,
                    classTeacherId: teacherUser1.id,
                    classId: classroom.id,
                    status: JoinRequestStatus.PENDING
                }
            });
            expect(invite).not.toBeNull();
            // ensure response body contains the invite as expected
            expect(body.invite).toStrictEqual(invite);
        });
        it('should create an invite, even when there is already a non-pending invite in the database', async () => {
            // emphasis on the 'non-pending' here
            // set up scenario where teacher has rejected the invite
            await addTeacherToClass(teacherUser1.id, classroom.id);
            let invite: Invite = await createInvite(teacherUser1.id, teacherUser2.id, classroom.id);
            invite = await prisma.invite.update({
                where: {
                    inviteId: invite.inviteId
                },
                data: {
                    status: JoinRequestStatus.DENIED
                }
            });
            
            // it should be possible to send another invite
            const { status, body } = await request(app)
                .post(`/teacher/classes/${classroom.id}/invites`)
                .set('Authorization', `Bearer ${teacherUser1.token}`)
                .send({
                    otherTeacherId: teacherUser2.id
                });
            expect(status).toBe(201)
            const newInvite = await prisma.invite.findFirst({
                where: {
                    otherTeacherId: teacherUser2.id,
                    classTeacherId: teacherUser1.id,
                    classId: classroom.id,
                    status: JoinRequestStatus.PENDING
                }
            });
            expect(newInvite).not.toBeNull();
            expect(body.invite).toStrictEqual(newInvite);
        });
        it('should respond with a `404` status code when the class does not exist', async () => {
            // get an id that isn't used for any existing class in the database
            const maxClass = await prisma.class.findFirst({
                orderBy: {
                    id: 'desc'
                }
            });
            const invalidClassId = (maxClass?.id ?? 0) + 1;
            // try to create invite for non-existent class
            const { status, body } = await request(app)
                .post(`/teacher/classes/${invalidClassId}/invites`)
                .set('Authorization', `Bearer ${teacherUser1.token}`)
                .send({
                    otherTeacherId: teacherUser2.id
                })

            expect(body.message).toBe("Klas niet gevonden");
            expect(status).toBe(404);
            // verify that no invite was created
            await prisma.invite.findMany().then((invites) => {
                expect(invites.length).toBe(0);
            });
        });
        it('should respond with a `403` status code when the teacher making the invite is not a teacher of the class', async () => {
            // we can use the existing scenarion with two valid teachers and a class, but none of them are a teacher of the class
            // try to create invite for class where teacher1 is not a teacher
            const { status, body } = await request(app)
                .post(`/teacher/classes/${classroom.id}/invites`)
                .set('Authorization', `Bearer ${teacherUser1.token}`)
                .send({
                    otherTeacherId: teacherUser2.id
                })

            expect(body.message).toBe("Leerkracht is geen beheerder van de klas");
            expect(status).toBe(403);
            // verify that no invite was created
            await prisma.invite.findMany().then((invites) => {
                expect(invites.length).toBe(0);
            });
        });
        it('should respond with a `400` status code when the teacher receiving the invite is already a teacher of the class', async () => {
            // set up scenario where there's two valid teachers and a class, both are teachers of the class
            await addTeacherToClass(teacherUser1.id, classroom.id);
            await addTeacherToClass(teacherUser2.id, classroom.id);
            
            // try to create the invite
            const { status, body } = await request(app)
                .post(`/teacher/classes/${classroom.id}/invites`)
                .set('Authorization', `Bearer ${teacherUser1.token}`)
                .send({
                    otherTeacherId: teacherUser2.id
                })

            expect(body.message).toBe("Leerkracht is al lid van de klas");
            expect(status).toBe(400);
            // verify that no invite was created
            await prisma.invite.findMany().then((invites) => {
                expect(invites.length).toBe(0);
            });
        });
        it('should respond with a `409` status code when the teacher already has a pending invite', async () => {
            // set up scenario where there's two valid teachers and a class, the first one being a teacher of the class, and the second one has already received an invite
            await addTeacherToClass(teacherUser1.id, classroom.id);
            // send a first invite
            await request(app)
                .post(`/teacher/classes/${classroom.id}/invites`)
                .set('Authorization', `Bearer ${teacherUser1.token}`)
                .send({
                    otherTeacherId: teacherUser2.id
                });
            
            // verify an invite was created
            await prisma.invite.findMany().then((invites) => {
                expect(invites.length).toBe(1);
            });
            
            // try to create another invite for the same class and teacher
            const { status, body } = await request(app)
                .post(`/teacher/classes/${classroom.id}/invites`)
                .set('Authorization', `Bearer ${teacherUser1.token}`)
                .send({
                    otherTeacherId: teacherUser2.id
                })
            // no new invite should have been created
            await prisma.invite.findMany().then((invites) => {
                expect(invites.length).toBe(1);
            });

            expect(body.message).toBe("Er bestaat al een pending uitnodiging voor deze leerkracht en klas");
            expect(status).toBe(409);
        });
    });
    describe('[GET] /teacher/classes/invites', async () => {
        it('should respond with a `200` status code and a list of invites', async () => {
            // set up scenario where a teacher has received a few invites
            await addTeacherToClass(teacherUser1.id, classroom.id);
            const classroom2: Class = await createClass("6A", "EFGH");
            await addTeacherToClass(teacherUser1.id, classroom2.id);
            const invite1: Invite = await createInvite(teacherUser1.id, teacherUser2.id, classroom.id);
            const invite2: Invite = await createInvite(teacherUser1.id, teacherUser2.id, classroom2.id);

            const { status, body } = await request(app)
                .get('/teacher/classes/invites')
                .set('Authorization', `Bearer ${teacherUser2.token}`)

            expect(status).toBe(200);
            expect(body.invites).toStrictEqual([invite1, invite2]);
        });
    });
    describe('[PATCH] /teacher/classes/invites/:inviteId', async () => {
        let invite: Invite;
        beforeEach(async () => {
            // set up scenario with a valid pending invite
            await addTeacherToClass(teacherUser1.id, classroom.id);
            invite = await createInvite(teacherUser1.id, teacherUser2.id, classroom.id);
        });
        it('should respond with a `200` status code and an updated invite when the action is `accept`', async () => {
            // we've got a scenario with a valid pending invite, test accepting it
            const { status, body } = await request(app)
                .patch(`/teacher/classes/invites/${invite.inviteId}`)
                .set('Authorization', `Bearer ${teacherUser2.token}`)
                .send({
                    action: "accept"
                });

            expect(status).toBe(200);
            expect(body.invite.status).toBe(JoinRequestStatus.APPROVED);
            // verify that the teacher was added to the class
            const classTeacher2 = await prisma.classTeacher.findFirst({
                where: {
                    teacherId: teacherUser2.id,
                    classId: classroom.id
                }
            });
            expect(classTeacher2).not.toBeNull();
            expect(classTeacher2!.teacherId).toBe(teacherUser2.id);
            expect(classTeacher2!.classId).toBe(classroom.id);
        });
        it('should respond with a `200` status code and an updated invite when the action is `decline`', async () => {
            // we've got a scenario with a valid pending invite, test declining it
            const { status, body } = await request(app)
                .patch(`/teacher/classes/invites/${invite.inviteId}`)
                .set('Authorization', `Bearer ${teacherUser2.token}`)
                .send({
                    action: "decline"
                });

            expect(status).toBe(200);
            expect(body.invite.status).toBe(JoinRequestStatus.DENIED);
            // verify that the teacher was not added to the class
            const classTeacher2 = await prisma.classTeacher.findFirst({
                where: {
                    teacherId: teacherUser2.id,
                    classId: classroom.id
                }
            });
            expect(classTeacher2).toBeNull();
        });
        it('should respond with a `400` status code when the action is neither `accept` nor `decline`', async () => {
            // we've got a scenario with a valid pending invite, test invalid action
            const { status, body } = await request(app)
                .patch(`/teacher/classes/invites/${invite.inviteId}`)
                .set('Authorization', `Bearer ${teacherUser2.token}`)
                .send({
                    action: "invalidaction"
                });

            expect(status).toBe(400);
            expect(body.error).toBe("Action must be 'accept' or 'decline'");
            // verify that the invite was not updated
            const updatedInvite = await prisma.invite.findFirst({
                where: {
                    inviteId: invite.inviteId
                }
            });
            expect(updatedInvite).not.toBeNull();
            expect(updatedInvite).toStrictEqual(invite);

            // verify that the teacher was not added to the class
            const classTeacher2 = await prisma.classTeacher.findFirst({
                where: {
                    teacherId: teacherUser2.id,
                    classId: classroom.id
                }
            });
            expect(classTeacher2).toBeNull();
        });
        it('should respond with a `400` status code when the invite does not exist', async () => {
            // delete the existing invite
            await prisma.invite.delete({
                where: {
                    inviteId: invite.inviteId
                }
            });
            // now let's try to accept the non-existent invite
            const { status, body } = await request(app)
                .patch(`/teacher/classes/invites/${invite.inviteId}`)
                .set('Authorization', `Bearer ${teacherUser2.token}`)
                .send({
                    action: "accept"
                });
            expect(status).toBe(400);
            expect(body.message).toBe("Uitnodiging is niet pending of bestaat niet");
            // verify that the teacher was not added to the class
            const classTeacher2 = await prisma.classTeacher.findFirst({
                where: {
                    teacherId: teacherUser2.id,
                    classId: classroom.id
                }
            });
            expect(classTeacher2).toBeNull();
        });
        it('should should respond with a `400` status code when the invite exists, but is not pending', async () => {
            // change status of existing invite
            invite = await prisma.invite.update({
                where: {
                    inviteId: invite.inviteId
                },
                data: {
                    status: JoinRequestStatus.DENIED
                }
            });
            // now let's try to accept the invite
            const { status, body } = await request(app)
                .patch(`/teacher/classes/invites/${invite.inviteId}`)
                .set('Authorization', `Bearer ${teacherUser2.token}`)
                .send({
                    action: "accept"
                });
            expect(status).toBe(400);
            expect(body.message).toBe("Uitnodiging is niet pending of bestaat niet");
            // verify that the invite wasn't updated
            const checkInvite: Invite | null = await prisma.invite.findFirst({
                where: {
                    inviteId: invite.inviteId
                }
            });
            expect(checkInvite).not.toBeNull();
            expect(checkInvite!.status).toStrictEqual(invite.status);
        });
    });
    describe('[DELETE] /teacher/classes/:classId/invites/:inviteId', async () => {
        it('should respond with a `200` status code and the deleted invite', async () => {
            // set up scenario with a valid invite
            await addTeacherToClass(teacherUser1.id, classroom.id);
            const invite: Invite = await createInvite(teacherUser1.id, teacherUser2.id, classroom.id);

            // test deleting the invite
            const { status, body } = await request(app)
                .delete(`/teacher/classes/${classroom.id}/invites/${invite.inviteId}`)
                .set('Authorization', `Bearer ${teacherUser1.token}`)

            expect(status).toBe(200);
            expect(body.invite).toStrictEqual(invite);
            expect(body.message).toBe("invite was succesfully deleted");
            // verify that the invite was deleted
            const deletedInvite = await prisma.invite.findUnique({
                where: {
                    inviteId: invite.inviteId
                }
            });
            expect(deletedInvite).toBeNull();
        });
        it('should respond with a `403` status code when the teacher trying to delete the invite is not part of the class', async () => {
            await addTeacherToClass(teacherUser1.id, classroom.id);
            const invite: Invite = await createInvite(teacherUser1.id, teacherUser2.id, classroom.id);
            const teacherUser3: User & { teacher: Teacher, token: string } = await createTeacher("Jane", "Doe", "jane.doe@gmail.com");
            const { status, body } = await request(app)
                .delete(`/teacher/classes/${classroom.id}/invites/${invite.inviteId}`)
                .set('Authorization', `Bearer ${teacherUser3.token}`)

            expect(status).toBe(403);
            expect(body.message).toBe("Leerkracht is geen beheerder van de klas");
            // verify that the invite was not deleted   
            const checkInvite = await prisma.invite.findUnique({
                where: {
                    inviteId: invite.inviteId
                }
            });
            expect(checkInvite).toStrictEqual(invite);
        });
    });
    describe('[GET] /teacher/classes/:classId/invites', async () => {
        it('should respond with a `200` status code and a list of invites', async () => {
            // set up scenario where there's some pending invites for a class
            await addTeacherToClass(teacherUser1.id, classroom.id);
            const teacherUser3: User & { teacher: Teacher } = await createTeacher("Bleep", "Bloop", "bleep.bloop@gmail.com");
            const invite1: Invite = await createInvite(teacherUser1.id, teacherUser2.id, classroom.id);
            const invite2: Invite = await createInvite(teacherUser1.id, teacherUser3.id, classroom.id);

            // test getting the invites
            const { status, body } = await request(app)
                .get(`/teacher/classes/${classroom.id}/invites`)
                .set('Authorization', `Bearer ${teacherUser1.token}`)

            expect(status).toBe(200);
            expect(body.invites).toStrictEqual([invite1, invite2]);
        });
        it('should respond with a `403` status code when the teacher is not part of the class', async () => {
            // try to get invites for a class where the teacher is part of the class
           const { status, body } = await request(app)
                .get(`/teacher/classes/${classroom.id}/invites`)
                .set('Authorization', `Bearer ${teacherUser1.token}`)

            expect(status).toBe(403);
            expect(body.message).toBe("Leerkracht is geen beheerder van de klas"); 
            expect(body.invites).toBeUndefined();
        });
    });
});
