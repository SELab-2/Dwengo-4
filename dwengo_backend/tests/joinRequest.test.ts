import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import prisma from './helpers/prisma'
import app from '../index'
import { Class, JoinRequestStatus, Student, Teacher, User } from '@prisma/client';
import { addStudentToClass, addTeacherToClass, createClass, createStudent, createTeacher } from './helpers/testDataCreation';

describe('join request tests', async() => {
    let classroom: Class;
    let teacherUser1: User & { teacher: Teacher, token: string };
    let studentUser1: User & { student: Student, token: string };
    beforeEach(async() => {
        // clear relevant records from the database
        await prisma.$transaction([
            prisma.joinRequest.deleteMany(),
            prisma.classStudent.deleteMany(),
            prisma.classTeacher.deleteMany(),
            prisma.class.deleteMany(),
            prisma.student.deleteMany(),
            prisma.teacher.deleteMany(),
            prisma.user.deleteMany()
        ]);
        // create test data
        classroom = await createClass("5A", "ABCDE");
        teacherUser1 = await createTeacher("Jan", "Janssens", "jan.janssens@gmail.com");
        await addTeacherToClass(teacherUser1.id, classroom.id);
        studentUser1 = await createStudent("Piet", "Pieters", "piet.pieters@gmail.com");
    });
    describe('[POST] /student/classes/join', async() => {
        it('should respond with a `201` status code and return the created join request', async() => {
            // we've got a scenario with a valid class and student, let's test a student creating a join request
            const { status, body } = await request(app)
                .post('/student/classes/join')
                .set('Authorization', `Bearer ${studentUser1.token}`)
                .send({
                    classCode: classroom.code
                }) 

            expect(status).toBe(201);
            expect(body).toHaveProperty('joinRequest');
            
            // check if the join request is stored in the database
            const joinRequest = await prisma.joinRequest.findFirst({
                where: {
                    studentId: studentUser1.id,
                    classId: classroom.id,
                    status: JoinRequestStatus.PENDING
                }
            });
            expect(body.joinRequest).toEqual(joinRequest);
        });
        it('should respond with a `404` status code when the class does not exist', async() => { 
            // try to send a join request for a class with a non-existent class code
            const { status, body } = await request(app)
                .post('/student/classes/join')
                .set('Authorization', `Bearer ${studentUser1.token}`)
                .send({
                    classCode: "BLABLA" // non-existent class code
                })

            expect(status).toBe(404);
            expect(body.error).toBe(`Error creating join request: Class with code BLABLA not found.`);
            // verify that no join request was created
            await prisma.joinRequest.findMany().then((joinRequests) => {
                expect(joinRequests.length).toBe(0);
            });
        });
        it('should respond with a `400` status code when student is already a member of the class', async() => {
            await addStudentToClass(studentUser1.id, classroom.id);
            const { status, body } = await request(app)
                .post('/student/classes/join')
                .set('Authorization', `Bearer ${studentUser1.token}`)
                .send({
                    classCode: classroom.code
                })
            expect(status).toBe(400);
            expect(body.error).toBe(`Error creating join request: Student ${studentUser1.id} is already a member of class ${classroom.id}`);
        });
        it('should reposnd with a `400` status code when there is already a pending join request for the student and class', async() => {
            // send a first join request
            await request(app)
                .post('/student/classes/join')
                .set('Authorization', `Bearer ${studentUser1.token}`)
                .send({
                    classCode: classroom.code
                })
            // verify that the join request was created
            await prisma.joinRequest.findMany().then((joinRequests) => {
                expect(joinRequests.length).toBe(1);
            });
            // send a second join request
            const { status, body } = await request(app)
                .post('/student/classes/join')
                .set('Authorization', `Bearer ${studentUser1.token}`)
                .send({
                    classCode: classroom.code
                })
            expect(status).toBe(400);
            expect(body.error).toBe(`Error creating join request: There's already a pending join request for student ${studentUser1.id} and class ${classroom.id}`);
            // verify no additional join request was created
            await prisma.joinRequest.findMany().then((joinRequests) => {
                expect(joinRequests.length).toBe(1);
            });
        });
        
    })
});
