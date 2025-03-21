import {beforeEach, describe, expect, it} from 'vitest'
import request from 'supertest';
import app from '../index';
import {
    Assignment,
    Class,
    ContentType,
    Evaluation,
    EvaluationType,
    LearningObject, LearningPath,
    Student,
    Teacher,
    User
} from '@prisma/client';
import {
    addStudentToClass,
    addTeacherToClass, createAssignment,
    createClass,
    createEvaluation, createLearningPath,
    createStudent,
    createTeacher
} from './helpers/testDataCreation';
import LocalLearningObjectService from "../services/localLearningObjectService";

const APP_URL: string = process.env.APP_URL || "http://localhost:5000";

describe('Submission tests', (): void => {
    let teacher: User & { teacher: Teacher, token: string };
    let teacherId: number;

    let student: User & { student: Student, token: string };
    let studentId: number;

    let classroom: Class;
    let classroomId: number;

    let evaluation: Evaluation;
    let evalId: string;

    let assignment: Assignment;
    let assignmentId: number;

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

        // De data voor het aanmaken van een LocalLearningObject
        const data = {
            title: "Test LO",
            description: "Niet voor echt gebruik",
            contentType: ContentType.TEXT_PLAIN,
        };

        // Create a local learningObject
        const LO: LearningObject = await LocalLearningObjectService.createLearningObject(
            teacherId,
            data
        );

        // Create an evaluation so a student can send in a submission$
        const learningObjectId: string = LO.id;
        evaluation = await createEvaluation(learningObjectId, EvaluationType.OPEN);
        evalId = evaluation.id;

        // Create a learningPath
        const learningPath: LearningPath = await createLearningPath(
            "Fake learning path",
            "This path is solely used for testing.",
            teacherId
        );

        // Create an assignment
        const deadline = new Date(Date.now() + 1000 * 60 * 60 * 24); // Add 1 day
        assignment = await createAssignment(
            classroomId,
            learningPath.id,
            deadline,
        );
        assignmentId = assignment.id;
    })

    describe('POST /student/submissions/assignment/:assignmentId/evaluation/:evaluationId', (): void => {
        it("Should respond with a `201` status code and the submission", async (): Promise<void> => {
            const { status, body } = await request(app)
                .post(`/student/submissions/assignment/${assignmentId}/evaluation/${evalId}`)
                .set('Authorization', `Bearer ${student.token}`);

            expect(status).toBe(201);
            expect(body.submission).toBeDefined();
        })
    })

})