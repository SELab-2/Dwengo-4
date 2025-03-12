import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest';
import prisma from './helpers/prisma'
import app from '../index';
import { Teacher, User } from '@prisma/client';
import { createStudent, createTeacher } from './helpers/testDataCreation';

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
        });
    });
    describe('DELETE /teacher/classes/:classId', () => {
        it('should respond with a `200` status code and a message when the class is deleted', async () => {
        });
        it('should respond with a `403` status code and a message when the teacher is not associated with the class', async () => {
        });
    });
    describe('GET /teacher/classes/:classId/join-link', () => {
        it('should respond with a `200` status code and a join link', async () => {
        });
        it('should respond with a `403` status code and a message when the teacher is not associated with the class', async () => {
        });
        it('should respond with a `404` status code if the class does not exist', async () => {
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