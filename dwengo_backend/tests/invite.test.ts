import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest';
import prisma from './helpers/prisma'
import app from '../index';
import { AuthenticatedRequest } from '../middleware/teacherAuthMiddleware';
import { Response, NextFunction } from 'express';
import { Class, Invite, JoinRequestStatus, Teacher, User } from '@prisma/client';
import { addTeacherToClass, createClass, createInvite, createTeacher } from './helpers/testDataCreation';

// mock the protectTeacher middleware, as it's not relevant for these tests
// (protectTeacher should be tested seperately though, TODO)
vi.mock('../middleware/teacherAuthMiddleware', () => ({
    protectTeacher: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => next()
}));

describe('invite tests', async () => {
    let teacherUser1: User & { teacher: Teacher };
    let teacherUser2: User & { teacher: Teacher };
    let classroom: Class;
    beforeEach(async () => {
        // create two teachers
        teacherUser1 = await createTeacher("Bob", "Boons", "bob.boons@gmail.com");
        teacherUser2 = await createTeacher("John", "Doe", "john.doe@gmail.com");
        // create a class
        classroom = await createClass("5A", "ABCD");
    });
    describe('[POST] /teacher/classes/:classId/invite', async () => {
        it('should respond with a `201` status code and an invite', async () => {
            // set up scenario where there's two teachers and a class, the first one being a teacher of the class
            await addTeacherToClass(teacherUser1.id, classroom.id);

            // now we can test the invite creation
            const { status, body } = await request(app)
                .post(`/teacher/classes/${classroom.id}/invite`)
                .send({
                    user: teacherUser1,
                    otherTeacherId: teacherUser2.id,
                    classId: classroom.id
                });

            expect(status).toBe(201)
            // double check that data was created
            const invite = await prisma.invite.findUnique({
                where: {
                    teacherId_classId: {
                        teacherId: teacherUser2.id,
                        classId: classroom.id
                    }
                }
            });
            expect(invite).not.toBeNull();
            // ensure response body contains the invite as expected
            expect(body.invite).toStrictEqual(invite);
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
                .post(`/teacher/classes/${invalidClassId}/invite`)
                .send({
                    user: teacherUser1,
                    otherTeacherId: teacherUser2.id,
                    classId: invalidClassId
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
                .post(`/teacher/classes/${classroom.id}/invite`)
                .send({
                    user: teacherUser1,
                    otherTeacherId: teacherUser2.id,
                    classId: classroom.id
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
            await addTeacherToClass(teacherUser1.teacher.userId, classroom.id);
            await addTeacherToClass(teacherUser2.teacher.userId, classroom.id);
            
            // try to create the invite
            const { status, body } = await request(app)
                .post(`/teacher/classes/${classroom.id}/invite`)
                .send({
                    user: teacherUser1,
                    otherTeacherId: teacherUser2.id,
                    classId: classroom.id
                })

            expect(body.message).toBe("Leerkracht is al lid van de klas");
            expect(status).toBe(400);
            // verify that no invite was created
            await prisma.invite.findMany().then((invites) => {
                expect(invites.length).toBe(0);
            });
        });
        it('should respond with a `409` status code when the teacher has already received an invite', async () => {
            // set up scenario where there's two valid teachers and a class, the first one being a teacher of the class, and the second one has already received an invite
            await addTeacherToClass(teacherUser1.teacher.userId, classroom.id);
            // send a first invite
            await request(app)
                .post(`/teacher/classes/${classroom.id}/invite`)
                .send({
                    user: teacherUser1,
                    otherTeacherId: teacherUser2.id,
                    classId: classroom.id
                });
            
            // verify an invite was created
            await prisma.invite.findMany().then((invites) => {
                expect(invites.length).toBe(1);
            });
            
            // try to create another invite for the same class and teacher
            const { status, body } = await request(app)
                .post(`/teacher/classes/${classroom.id}/invite`)
                .send({
                    user: teacherUser1,
                    otherTeacherId: teacherUser2.id,
                    classId: classroom.id
                })
            // no new invite should have been created
            await prisma.invite.findMany().then((invites) => {
                expect(invites.length).toBe(1);
            });

            expect(body.message).toBe("Er bestaat al een uitnodiging voor deze leerkracht en klas.");
            expect(status).toBe(409);
            // verify that no additional invite was created
            await prisma.invite.findMany().then((invites) => {
                expect(invites.length).toBe(1);
            });
        });
    });
    describe('[GET] /teacher/invites', async () => {
        it('should respond with a `200` status code and a list of invites', async () => {
            // set up scenario where a teacher has received a few invites
            await addTeacherToClass(teacherUser1.teacher.userId, classroom.id);
            const classroom2: Class = await createClass("6A", "EFGH");
            await addTeacherToClass(teacherUser1.teacher.userId, classroom2.id);
            const invite1: Invite = await createInvite(teacherUser2.teacher.userId, classroom.id);
            const invite2: Invite = await createInvite(teacherUser2.teacher.userId, classroom2.id);

            const { status, body } = await request(app)
                .get('/teacher/classes/invites')
                .send({
                    user: teacherUser2
                });

            expect(status).toBe(200);
            expect(body.invites).toStrictEqual([invite1, invite2]);
        });
    });
    describe('[PATCH] /teacher/classes/:classId/invite', async () => {
        let invite: Invite;
        beforeEach(async () => {
            // set up scenario with a valid pending invite
            await addTeacherToClass(teacherUser1.teacher.userId, classroom.id);
            invite = await createInvite(teacherUser2.teacher.userId, classroom.id);
        });
        it('should respond with a `200` status code and an updated invite when the action is `accept`', async () => {
            // we've got a scenario with a valid pending invite, test accepting it
            const { status, body } = await request(app)
                .patch(`/teacher/classes/${classroom.id}/invite`)
                .send({
                    user: teacherUser2,
                    action: "accept",
                    classId: classroom.id
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
                .patch(`/teacher/classes/${classroom.id}/invite`)
                .send({
                    user: teacherUser2,
                    action: "decline",
                    classId: classroom.id
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
                .patch(`/teacher/classes/${classroom.id}/invite`)
                .send({
                    user: teacherUser2,
                    action: "invalidaction",
                    classId: classroom.id
                });

            expect(status).toBe(400);
            expect(body.error).toBe("Action must be 'accept' or 'decline'");
            // verify that the invite was not updated
            const updatedInvite = await prisma.invite.findFirst({
                where: {
                    teacherId: teacherUser2.id,
                    classId: classroom.id
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
        it('should respond with a `404` status code when the invite does not exist', async () => {
            // delete the existing invite
            await prisma.invite.delete({
                where: {
                    teacherId_classId: {
                        teacherId: teacherUser2.id,
                        classId: classroom.id
                    }
                }
            });
            // now let's try to accept the non-existent invite
            const { status, body } = await request(app)
                .patch(`/teacher/classes/${classroom.id}/invite`)
                .send({
                    user: teacherUser2,
                    action: "accept",
                    classId: classroom.id
                });
            expect(status).toBe(404);
            expect(body.message).toBe("Geen pending uitnodiging gevonden voor deze leerkracht en klas");
            // verify that the teacher was not added to the class
            const classTeacher2 = await prisma.classTeacher.findFirst({
                where: {
                    teacherId: teacherUser2.id,
                    classId: classroom.id
                }
            });
            expect(classTeacher2).toBeNull();
        });
    });
});

