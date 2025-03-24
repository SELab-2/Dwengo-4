import {beforeEach, describe, expect, it} from "vitest";
import {
    Assignment,
    Class,
    ContentType,
    Evaluation,
    EvaluationType, Feedback,
    LearningObject, LearningPath,
    Student, Submission,
    Teacher,
    Team,
    User
} from "@prisma/client";
import {
    addStudentToClass,
    addTeacherToClass, createAssignment,
    createClass, createEvaluation, createLearningPath,
    createStudent, createSubmission,
    createTeacher, createTeamWithStudents, giveAssignmentToTeam, giveFeedbackToSubmission
} from "./helpers/testDataCreation";
import LocalLearningObjectService from "../services/localLearningObjectService";
import app from "../index";
import request from "supertest";
import prisma from "./helpers/prisma";

describe('Feedback tests', (): void => {
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
    let submissionId: number

    // Dit vult alle bovenstaande variabelen in zodat deze later gebruikt kunnen worden in de testen
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

        // Now we will need to give feedback to this submission
        const description = "Mooie oplossing!"
        await giveFeedbackToSubmission(
            submissionId,
            teacherId,
            description
        );
    });

    describe('POST /teacher/feedback/submission/:submissionId', (): void => {
        it("Should respond with a `201` status and the created feedback", async (): Promise<void> => {
            const { status, body } = await request(app)
                .post('/teacher/feedback')
                .set('Authorization', `Bearer ${teacher.token}`)

            expect(status).toBe(201);
            expectCorrectFeedbackBody(body);

            let newFeedback: Feedback | null = await prisma.feedback.findUnique({
                where: {
                    submissionId: submissionId
                }
            });
            expect(newFeedback).toBeDefined();
        });
    });
});

function expectCorrectFeedbackBody(body: any): void {
    expect(body).toEqual({
        submissionId: expect.any(Number),
        teacherId: expect.any(Number),
        description: expect.any(String),
    });
}