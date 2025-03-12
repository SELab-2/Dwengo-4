import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest';
import prisma from './helpers/prisma'
import app from '../index';
import { Class, Teacher, User } from '@prisma/client';
import { addStudentToClass, addTeacherToClass, createClass, createInvite, createJoinRequest, createStudent, createTeacher } from './helpers/testDataCreation';

const APP_URL = process.env.APP_URL || "http://localhost:5000";

describe('classroom tests', () => {
    let teacherUser1: User & { teacher: Teacher, token: string };
    beforeEach(async () => {
        // clear database before each test
        await prisma.$transaction([
            prisma.invite.deleteMany(),
            prisma.classTeacher.deleteMany(),
            prisma.classStudent.deleteMany(),
            prisma.class.deleteMany(),
            prisma.student.deleteMany(),
            prisma.teacher.deleteMany(),
            prisma.user.deleteMany()
        ]);
        // create a teacher
        teacherUser1 = await createTeacher("Bob", "Boons", "bob.boons@gmail.com");
    });
    describe('POST /teacher/classes', () => {
        it('should respond with a `201` status code and a created class', async () => {
            const { status, body } = await request(app)
                .post('/teacher/classes')
                .set('Authorization', `Bearer ${teacherUser1.token}`)
                .send({ name: "5A" });

            expect(status).toBe(201);
            expect(body.message).toBe("Klas aangemaakt");
            expect(body.classroom).toBeDefined();
            // verify that class was created
            const classroom = await prisma.class.findFirst({ where: { name: "5A"}, include: { ClassTeacher: true}  });
            expect(classroom).toBeDefined();
            expect(classroom!.ClassTeacher[0].teacherId).toBe(teacherUser1.id);
        });
        it('should respond with a `400` status code and a message when no valid class name is provided', async () => {
            const { status, body } = await request(app)
                .post('/teacher/classes')
                .set('Authorization', `Bearer ${teacherUser1.token}`)
                .send({ name: "" });

            expect(status).toBe(400);
            expect(body.message).toBe("Vul een geldige klasnaam in");
        });
        it('should not allow a student to create a class', async () => {
            const studentUser = await createStudent("Alice", "Anderson", "aaaaa@gmail.com");
            const { status, body } = await request(app)
                .post('/teacher/classes')
                .set('Authorization', `Bearer ${studentUser.token}`)
                .send({ name: "5A" });

            expect(status).toBe(401);
            expect(body.error).toBe("Leerkracht niet gevonden.");
        });
    });
    describe('DELETE /teacher/classes/:classId', () => {
        let classroom: Class;
        beforeEach(async () => {
            // create a class
            classroom = await createClass("5A", "ABCD");
        });
        it('should respond with a `200` status code and a message when the class is deleted', async () => {
            // add teacherUser1 to class, so we can test deleting it
            await addTeacherToClass(teacherUser1.id, classroom.id);

            // also add some records related to the class, so we can test if they all get deleted when the class is deleted
            const studentUser1 = await createStudent("Alice", "Anderson", "aaaaa@gmail.com");
            await addStudentToClass(studentUser1.id, classroom.id);
            await prisma.classStudent.findMany({ where: { classId: classroom.id } }).then((classStudents) => {
                expect(classStudents.length).toBe(1);
            });
            const studentUser2 = await createStudent("Bob", "Baker", "bobbaker@gmail.com");
            await createJoinRequest(studentUser2.id, classroom.id);
            await prisma.joinRequest.findMany({ where: { classId: classroom.id } }).then((joinRequests) => {
                expect(joinRequests.length).toBe(1);
            });
            const teacherUser2 = await createTeacher("Charlie", "Chaplin", "char.ch@gmail.com");
            await createInvite(teacherUser1.id, teacherUser2.id, classroom.id);
            await prisma.invite.findMany({ where: { classId: classroom.id } }).then((invites) => {
                expect(invites.length).toBe(1);
            });

            // now test deleting the class
            const { status, body } = await request(app)
                .delete(`/teacher/classes/${classroom.id}`)
                .set('Authorization', `Bearer ${teacherUser1.token}`);

            expect(status).toBe(200);
            expect(body.message).toBe(`Klas met id ${classroom.id} verwijderd`);
            // verify that class was deleted
            const deletedClass = await prisma.class.findFirst({ where: { id: classroom.id } });
            expect(deletedClass).toBeNull();

            // verify that all associated records were also deleted
            await prisma.classTeacher.findMany({ where: { classId: classroom.id } }).then((classTeachers) => {
                expect(classTeachers.length).toBe(0);
            });
            await prisma.classStudent.findMany({ where: { classId: classroom.id } }).then((classStudents) => {
                expect(classStudents.length).toBe(0);
            });
            await prisma.invite.findMany({ where: { classId: classroom.id } }).then((invites) => {
                expect(invites.length).toBe(0);
            });
            await prisma.joinRequest.findMany({ where: { classId: classroom.id } }).then((joinRequests) => {
                expect(joinRequests.length).toBe(0);
            });
            await prisma.classAssignment.findMany({ where: { classId: classroom.id } }).then((classAssignments) => {
                expect(classAssignments.length).toBe(0);
            });
        });
        it('should respond with a `403` status code and a message when the teacher is not associated with the class', async () => {
            // try having a teacher delete a class they are not associated with
            const { status, body } = await request(app)
                .delete(`/teacher/classes/${classroom.id}`)
                .set('Authorization', `Bearer ${teacherUser1.token}`);  // teacherUser1 is not associated with the class

            expect(status).toBe(403);
            expect(body.message).toBe(`Acces denied: Teacher ${teacherUser1.id} is not part of class ${classroom.id}`);
            // verfiy that class not deleted
            await prisma.class.findUnique({ where: { id: classroom.id } }).then((classroom) => {
                expect(classroom).toBeDefined();
            });
        });
    });
    describe('GET /teacher/classes/:classId/join-link', () => {
        let classroom: Class;
        beforeEach(async () => {
            classroom = await createClass("5A", "ABCD");
        });
        it('should respond with a `200` status code and a join link', async () => {
            // add teacherUser1 to class, so we can test getting the join link
            await addTeacherToClass(teacherUser1.id, classroom.id);
            const { status, body } = await request(app)
                .get(`/teacher/classes/${classroom.id}/join-link`)  
                .set('Authorization', `Bearer ${teacherUser1.token}`);

            expect(status).toBe(200);
            expect(body.joinLink).toStrictEqual(`${APP_URL}/student/classes/join?joinCode=${classroom.code}`);
        });
        it('should respond with a `403` status code and a message when the teacher is not associated with the class', async () => {
            // try getting the join link for a class the teacher is not associated with
            const { status, body } = await request(app)
                .get(`/teacher/classes/${classroom.id}/join-link`)
                .set('Authorization', `Bearer ${teacherUser1.token}`);  // teacherUser1 is not associated with the class

            expect(status).toBe(403);
            expect(body.message).toBe(`Acces denied: Teacher ${teacherUser1.id} is not part of class ${classroom.id}`);
            expect(body.joinLink).toBeUndefined();
        });
        it('should respond with a `404` status code if the class does not exist', async () => {
            // get an id that isn't used for any existing class in the database
            const maxClass = await prisma.class.findFirst({
                orderBy: {
                    id: 'desc'
                }
            });
            const invalidClassId = (maxClass?.id ?? 0) + 1;

            const { status, body } = await request(app)
                .get(`/teacher/classes/${invalidClassId}/join-link`)
                .set('Authorization', `Bearer ${teacherUser1.token}`);

            expect(status).toBe(404);
            expect(body.message).toBe(`Class with id ${invalidClassId} not found`);
            expect(body.joinLink).toBeUndefined();
        });
    });
    describe('POST /teacher/classes/:classId/regenerate-join-link', () => {
        it('should respond with a `200` status code and a new join link', async () => {
        });
        it('should respond with a `403` status code and a message when the teacher is not associated with the class', async () => {
        });
        it('should respond with a `404` status code if the class does not exist', async () => {
        });
    });
    describe('GET /teacher/classes/:classId/students', () => {
        it('should respond with a `200` status code and a list of students', async () => {
        });
        it('should respond with a `403` status code when the teacher is not associated with the class', async () => {
        });
        it('should respond with a `404` status code when the class does not exist', async () => {
        });
    });

    
});