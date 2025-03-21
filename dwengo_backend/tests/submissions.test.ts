import {beforeEach, describe, expect, it} from 'vitest'
import request from 'supertest';
import app from '../index';
import {
    Assignment,
    Class,
    ContentType,
    Evaluation,
    EvaluationType,
    LearningObject,
    LearningPath,
    Student, Submission,
    Teacher,
    Team,
    User
} from '@prisma/client';
import {
    addStudentToClass,
    addTeacherToClass,
    createAssignment,
    createClass,
    createEvaluation,
    createLearningPath,
    createStudent, createSubmission,
    createTeacher,
    createTeamWithStudents,
    giveAssignmentToTeam
} from './helpers/testDataCreation';
import LocalLearningObjectService from "../services/localLearningObjectService";
import prisma from "./helpers/prisma";

describe('Submission tests', (): void => {
    let teacher: User & { teacher: Teacher, token: string };
    let teacherId: number;

    let student: User & { student: Student, token: string };
    let studentId: number;

    let classroom: Class;
    let classroomId: number;

    let team: Team;
    let teamId: number;

    let evaluation: Evaluation;
    let evalId: string;

    let assignment: Assignment;
    let assignmentId: number;

    let submission: Submission;
    let submissionId: number;

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

        // Create a team to receive the assignment
        team = await createTeamWithStudents(
            "Testing teamName",
            classroomId,
            [student.student]
        );
        teamId = team.id;

        // Create an assignment to give to a team
        const deadline = new Date(Date.now() + 1000 * 60 * 60 * 24); // Add 1 day
        assignment = await createAssignment(
            classroomId,
            learningPath.id,
            deadline,
        );
        assignmentId = assignment.id;

        // Give the assignment to the team
        await giveAssignmentToTeam(assignmentId, teamId);

        // Create a submission for this assignment
        submission = await createSubmission(
            evalId,
            teamId,
            assignmentId
        );
        submissionId = submission.submissionId;
    })

    describe('POST /student/submissions/assignment/:assignmentId/evaluation/:evaluationId', (): void => {
        it("Should throw an error if the student is not yet part of the team with the assignment", async (): Promise<void> => {

            // Hiermee garandeer ik dat de student geen deel uitmaakt van de groep met de assignment
            await prisma.team.update({
                where: {
                    id: teamId
                },
                data: {
                    students: {
                        disconnect: [{ userId: studentId }]  // Optionally, you can disconnect specific students if you know them
                    }
                }
            });

            const { status, body } = await request(app)
                    .post(`/student/submissions/assignment/${assignmentId}/evaluation/${evalId}`)
                    .set('Authorization', `Bearer ${student.token}`);
            expect(status).toBe(403);
            expect(body.message).toBe("Student is not in a team for this assignment");
        });

        it("Should respond with a `201` status code and the created submission", async (): Promise<void> => {

            const { status, body } = await request(app)
                .post(`/student/submissions/assignment/${assignmentId}/evaluation/${evalId}`)
                .set('Authorization', `Bearer ${student.token}`);

            expect(status).toBe(201);
            expect(body).toEqual({
                submissionId: expect.any(Number),
                evaluationId: expect.any(String),
                teamId: expect.any(Number),
                submitted: expect.any(String),
                assignmentId: expect.any(Number),
            });

            // Double check that the database now contains the submission
            await prisma.submission.findUnique({
                where: {
                    submissionId: body.submissionId
                }
            });
        });
    });

    describe('GET /student/submissions/assignment/:assignmentId', (): void => {
        it("Should respond with a `200` status code and return the submission for an assignment", async (): Promise<void> => {

            const { status, body } = await request(app)
                .get(`/student/submissions/assignment/${assignmentId}`)
                .set('Authorization', `Bearer ${student.token}`);

            expect(status).toBe(200);
            expect(body).toEqual([{
                assignmentId: expect.any(Number),
                evaluationId: expect.any(String),
                submissionId: expect.any(Number),
                submitted: expect.any(String),
                teamId: expect.any(Number),
            }]);
        })
    })
})