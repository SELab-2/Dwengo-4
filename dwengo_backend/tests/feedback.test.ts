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
    createTeacher, createTeamWithStudents, giveAssignmentToTeam, giveFeedbackToSubmission, updateAssignmentForTeam
} from "./helpers/testDataCreation";
import LocalLearningObjectService from "../services/localLearningObjectService";
import app from "../index";
import request from "supertest";
import prisma from "./helpers/prisma";

describe('Feedback tests', (): void => {
    const dayInMilliseconds: number = 1000 * 60 * 60 * 24;

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

    let onGoingAssignment: Assignment;
    let onGoingAssignmentId: number;

    let passedAssignment: Assignment;
    let passedAssignmentId: number;

    let submissionForOnGoingAssignment: Submission;
    let onGoingAssignmentSubmissionId: number

    let submissionForPassedAssignment: Submission;
    let passedAssignmentSubmissionId: number;

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
        const deadline = new Date(Date.now() + dayInMilliseconds); // Add 1 day
        onGoingAssignment = await createAssignment(
            classroomId,
            learningPath.id,
            deadline,
        );
        onGoingAssignmentId = onGoingAssignment.id;

        // Give the assignment to the team
        await giveAssignmentToTeam(onGoingAssignmentId, teamId);

        // Create a submission for this assignment
        submissionForOnGoingAssignment = await createSubmission(
            evalId,
            teamId,
            onGoingAssignmentId
        );
        onGoingAssignmentSubmissionId = submissionForOnGoingAssignment.submissionId;

        // Create an assigment whose deadline has already passed
        const passedDeadline = new Date(Date.now() - dayInMilliseconds); // Subtract a day
        passedAssignment = await createAssignment(
            classroomId,
            learningPath.id,
            passedDeadline,
        );
        passedAssignmentId = passedAssignment.id;

        // Since a TeamAssignment
        await updateAssignmentForTeam(passedAssignmentId, teamId);

        // Create a submission for the passed assignment
        submissionForPassedAssignment = await createSubmission(
            evalId,
            teamId,
            passedAssignmentId,
        );
        passedAssignmentSubmissionId = submissionForPassedAssignment.submissionId;
    });

    describe('POST /teacher/feedback/submission/:submissionId', (): void => {
        it("Should respond with a `500` status saying 'Failed to create feedback'", async (): Promise<void> => {
            // In deze test wordt nagegaan dat je geen feedback kan geven op een submission van een assignment
            // waarvan de deadline nog niet verstreken is
            const { status, body } = await request(app)
                .post(`/teacher/feedback/submission/${onGoingAssignmentSubmissionId}`)
                .set('Authorization', `Bearer ${teacher.token}`);

            expect(status).toBe(500);
            expect(body.error).toEqual("Failed to create feedback");

            // Gaat na dat er geen feedback is aangemaakt
            let feedback: Feedback | null = await findFeedback(onGoingAssignmentSubmissionId);
            expect(feedback).toBeNull();
        });

        it("Should respond with a `401` status (UnauthorizedError)", async (): Promise<void> => {
            // In deze test wordt nagegaan dat je geen feedback kunt geven als student
            const { status, body } = await request(app)
                .post(`/teacher/feedback/submission/${passedAssignmentSubmissionId}`)
                .set('Authorization', `Bearer ${student.token}`);

            expect(status).toBe(401);
            expect(body.error).toEqual("Leerkracht niet gevonden.");

            // Gaat na dat er geen feedback is aangemaakt
            let feedback: Feedback | null = await findFeedback(passedAssignmentSubmissionId);
            expect(feedback).toBeNull();
        });

        it("Should respond with a `201` status and the created feedback", async (): Promise<void> => {
            const { status, body } = await request(app)
                .post(`/teacher/feedback/submission/${passedAssignmentSubmissionId}`)
                .set('Authorization', `Bearer ${teacher.token}`)
                .send({description: "Mooie oplossing!"});

            expect(status).toBe(201);
            expectCorrectFeedbackBody(body);

            // Gaat na dat de feedback is aangemaakt
            let feedback: Feedback | null = await findFeedback(passedAssignmentSubmissionId);
            expect(feedback).toBeDefined();
        });
    });

    describe('GET /teacher/feedback/submission/:submissionId', (): void => {
        it("Should respond with a `200` status and the fetched feedback", async (): Promise<void> => {

            // We first need to create feedback for a submission
            await giveFeedbackToSubmission(passedAssignmentSubmissionId, teacherId, "Goede oplossing!");

            const {status, body} = await request(app)
                .get(`/teacher/feedback/submission/${passedAssignmentSubmissionId}`)
                .set('Authorization', `Bearer ${teacher.token}`);

            expect(status).toBe(200);
            expectCorrectFeedbackBody(body);
        });

        it("Should respond with a `404` status and saying it found no feedback", async (): Promise<void> => {
            // Check if this returns a 404 when searching for feedback that does not yet exist
            const {status, body} = await request(app)
                .get(`/teacher/feedback/submission/${passedAssignmentSubmissionId}`)
                .set('Authorization', `Bearer ${teacher.token}`);

            expect(status).toBe(404);
            expect(body.error).toEqual("Feedback not found");
        });

        it("Should respond with a `500` status when the ID is not a number", async (): Promise<void> => {
            // Check if this returns a 404 when searching for feedback that does not yet exist
            const {status, body} = await request(app)
                .get(`/teacher/feedback/submission/notANumber`)
                .set('Authorization', `Bearer ${teacher.token}`);

            expect(status).toBe(500);
            expect(body.error).toEqual("Failed to retrieve feedback");
        });

        it("Should respond with a `401` status meaning a student not allowed to fetch feedback for a submission", async (): Promise<void> => {

            // We first need to create feedback for a submission
            await giveFeedbackToSubmission(passedAssignmentSubmissionId, teacherId, "Goede oplossing!");

            const {status, body} = await request(app)
                .get(`/teacher/feedback/submission/${passedAssignmentSubmissionId}`)
                .set('Authorization', `Bearer ${student.token}`);

            expect(status).toBe(401);
            expect(body.error).toEqual("Leerkracht niet gevonden.");
        });
    });

    describe('GET /teacher/feedback/assignment/:assignmentId/evaluation/:evaluationId', (): void => {
        it("Should respond with a `500` status (the teacher can only access feedback from assignments that are given to classes he teaches)", async (): Promise<void> => {

            const { status, body } = await request(app)
                .get(`/teacher/feedback/assignment/${passedAssignmentSubmissionId}/evaluation/${evalId}`)
                .set('Authorization', `Bearer ${teacher.token}`);

            expect(status).toBe(500);
            expect(body.error).toEqual("Failed to retrieve feedback");
        });

        it("Should respond with a `404` status when a student tries to access the information", async (): Promise<void> => {

            const { status, body } = await request(app)
                .get(`/teacher/feedback/assignment/${passedAssignmentSubmissionId}/evaluation/${evalId}`)
                .set('Authorization', `Bearer ${student.token}`);

            expect(status).toBe(401);
            expect(body.error).toEqual("Leerkracht niet gevonden.");
        });
    });
});

async function findFeedback(id: number): Promise<Feedback | null> {
    return prisma.feedback.findUnique({
        where: {
            submissionId: id
        }
    });
}

function expectCorrectFeedbackBody(body: any): void {
    expect(body).toEqual({
        submissionId: expect.any(Number),
        teacherId: expect.any(Number),
        description: expect.any(String),
    });
}