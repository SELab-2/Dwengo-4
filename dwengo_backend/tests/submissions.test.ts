import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest';
import prisma from './helpers/prisma'
import app from '../index';
import {Class, Evaluation, EvaluationType, Student, Teacher, User} from '@prisma/client';
import {
    addStudentToClass,
    addTeacherToClass,
    createClass,
    createEvaluation,
    createInvite,
    createJoinRequest,
    createStudent,
    createTeacher
} from './helpers/testDataCreation';

const APP_URL: string = process.env.APP_URL || "http://localhost:5000";

describe('Submission tests', (): void => {
    let teacher: User & { teacher: Teacher, token: string };
    let teacherId: number;

    let student: User & { student: Student, token: string };
    let studentId: number;

    let classroom: Class;
    let classroomId: number;

    let evaluation: Evaluation;

    beforeEach(async (): Promise<void> => {
        // Create a teacher
        teacher = await createTeacher("Sponge", "Bob", "sponge.bob@gmail.com");
        teacherId = teacher.teacher.userId;

        // Create a student
        student = await createStudent("Patrick", "Star", "patrick.star@gmail.com");
        studentId = student.student.userId;

        // Create a class
        classroom = await createClass("Moderne Talen 5A", "ABCD");
        classroomId = classroom.id;

        // Make the teacher the teacher of that class
        await addTeacherToClass(teacherId, classroomId);

        // Add the student to the class
        await addStudentToClass(studentId, classroomId);

        // Create an evaluation so a student can send in a submission$
        const learningObjectId = "FOO"
        evaluation = await createEvaluation(learningObjectId, EvaluationType.OPEN);
    })

})