import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest';
import prisma from './helpers/prisma'
import app from '../index';
import { AuthenticatedRequest } from '../middleware/teacherAuthMiddleware';
import { Response, NextFunction } from 'express';
import { Teacher, User } from '@prisma/client';

// mock the protectTeacher middleware
vi.mock('../middleware/teacherAuthMiddleware', () => ({
    protectTeacher: (req: AuthenticatedRequest, res: Response, next: NextFunction) => next()
}));

describe('invite tests', async () => {
    describe('[POST] /teacher/classes/:classId/invite', async () => {
        let teacherUser1: User & { teacher: Teacher };
        let teacherUser2: User & { teacher: Teacher };
        beforeEach(async () => {
            // create two teachers
            const tu1 = await prisma.user.create({
                data: {
                    firstName: "Bob",
                    lastName: "Boons",
                    email: "bob.boons@gmail.com",
                    password: "testpassword",
                    role: "TEACHER",
                    teacher: {
                        create: {}
                    }
                },
                include: {
                    teacher: true
                }
            });
            expect(tu1).not.toBeNull();
            expect(tu1.teacher).not.toBeNull();
            teacherUser1 = {...tu1!, teacher: tu1.teacher!};

            const tu2 = await prisma.user.create({
                data: {
                    firstName: "John",
                    lastName: "Doe",
                    email: "john.doe@gmail.com",
                    password: "testpassword",
                    role: "TEACHER",
                    teacher: {
                        create: {}
                    }
                },
                include: {
                    teacher: true
                }
            });
            expect(tu2).not.toBeNull();
            expect(tu2.teacher).not.toBeNull();
            teacherUser2 = {...tu2!, teacher: tu2.teacher!};
        });
        it('should respond with a `201` status code and an invite', async () => {
            // set up scenario where there's two teachers and a class, the first one being a teacher of the class
            const classroom = await prisma.class.create({
                data: {
                    name: "5A",
                    code: "ABCD"
                }
            });
            expect(classroom).not.toBeNull();

            const classTeacher = await prisma.classTeacher.create({
                data: {
                    teacherId: teacherUser1.id,
                    classId: classroom.id,
                }
            });
            expect(classTeacher).not.toBeNull();

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
            // try to create invite for non-existent class
            const { status, body } = await request(app)
                .post(`/teacher/classes/${1234}/invite`)
                .send({
                    user: teacherUser1,
                    otherTeacherId: teacherUser2.id,
                    classId: 1234
                })

            expect(body.message).toBe("Klas niet gevonden");
            expect(status).toBe(404);
            // verify that no invite was created
            await prisma.invite.findMany().then((invites) => {
                expect(invites.length).toBe(0);
            });
        });
        it('should respond with a `403` status code when the teacher making the invite is not a teacher of the class', async () => {
            // set up scenario where there's two valid teachers and a class, but none of them are a teacher of that class
            // don't connect any teachers to the class
            const classroom = await prisma.class.create({
                data: {
                    name: "5A",
                    code: "ABCD"
                }
            });
            expect(classroom).not.toBeNull();
            
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
            const classroom = await prisma.class.create({
                data: {
                    name: "5A",
                    code: "ABCD"
                }
            });
            expect(classroom).not.toBeNull();

            const classTeacher1 = await prisma.classTeacher.create({
                data: {
                    teacherId: teacherUser1.id,
                    classId: classroom.id,
                }
            });
            expect(classTeacher1).not.toBeNull();

            const classTeacher2 = await prisma.classTeacher.create({
                data: {
                    teacherId: teacherUser2.id,
                    classId: classroom.id,
                }
            });
            expect(classTeacher2).not.toBeNull();
            
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
            const classroom = await prisma.class.create({
                data: {
                    name: "5A",
                    code: "ABCD"
                }
            });
            expect(classroom).not.toBeNull();

            const classTeacher = await prisma.classTeacher.create({
                data: {
                    teacherId: teacherUser1.id,
                    classId: classroom.id,
                }
            });
            expect(classTeacher).not.toBeNull();

            await request(app)
                .post(`/teacher/classes/${classroom.id}/invite`)
                .send({
                    user: teacherUser1,
                    otherTeacherId: teacherUser2.id,
                    classId: classroom.id
                });
            
            // try to create another invite for the same class and teacher
            const { status, body } = await request(app)
                .post(`/teacher/classes/${classroom.id}/invite`)
                .send({
                    user: teacherUser1,
                    otherTeacherId: teacherUser2.id,
                    classId: classroom.id
                })
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
});
