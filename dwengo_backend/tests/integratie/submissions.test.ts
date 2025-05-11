import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../index";
import {
  Assignment,
  LearningPath,
  Student,
  Submission,
  Teacher,
  User,
} from "@prisma/client";
import {
  createAssignment,
  createSubmission,
  giveAssignmentToTeam,
} from "../helpers/testDataCreation";
import { setupTestData } from "../helpers/setupTestDataSubmissionsAndFeedback";
import prisma from "../helpers/prisma";

describe("Submission tests", (): void => {
  let teacher: User & { teacher: Teacher; token: string };
  let student: User & { student: Student; token: string };
  let studentId: number;
  let classroomId: number;
  let teamId: number;
  let evalId: string;
  let assignment: Assignment;
  let assignmentId: number;
  let learningPath: LearningPath;

  // Dit vult alle bovenstaande variabelen in zodat deze later gebruikt kunnen worden in de testen
  beforeEach(async (): Promise<void> => {
    ({
      teacher,
      student,
      studentId,
      classroomId,
      teamId,
      evalId,
      learningPath,
    } = await setupTestData());

    // Create an assignment to give to a team
    const deadline = new Date(Date.now() + 1000 * 60 * 60 * 24); // Add 1 day
    assignment = await createAssignment(
      classroomId,
      learningPath.id,
      "title ass",
      "description ass",
      deadline,
    );
    assignmentId = assignment.id;

    // Give the assignment to the team
    await giveAssignmentToTeam(assignmentId, teamId);

    // Create a submission for this assignment
    await createSubmission(evalId, teamId, assignmentId);
  });

  describe("[POST] /submission/student/assignment/:assignmentId/evaluation/:evaluationId", (): void => {
    it("Should throw an error if the student is not yet part of the team with the assignment", async (): Promise<void> => {
      // Hiermee garandeer ik dat de student geen deel uitmaakt van de groep met de assignment
      await prisma.team.update({
        where: {
          id: teamId,
        },
        data: {
          students: {
            disconnect: [{ userId: studentId }], // Optionally, you can disconnect specific students if you know them
          },
        },
      });

      const { status, body } = await request(app)
        .post(
          `/submission/student/assignment/${assignmentId}/evaluation/${evalId}`,
        )
        .set("Authorization", `Bearer ${student.token}`);

      expect(status).toBe(403);
      expect(body.error).toBe("AccessDeniedError");
      expect(body.message).toBe(
        "Student is not part of a team for this assignment.",
      );
    });

    it("Should respond with a `201` status code and the created submission", async (): Promise<void> => {
      const { status, body } = await request(app)
        .post(
          `/submission/student/assignment/${assignmentId}/evaluation/${evalId}`,
        )
        .set("Authorization", `Bearer ${student.token}`);

      expectSuccessfulSubmissionCreation(status, body.submission);

      // Double check that the database now contains the submission
      const newSubmission: Submission | null =
        await prisma.submission.findUnique({
          where: {
            submissionId: body.submission.submissionId,
          },
        });
      expect(newSubmission).toBeDefined();
    });
  });

  describe("[GET] /submission/student/assignment/:assignmentId", (): void => {
    it("Should respond with a `200` status code and return the submission for an assignment", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/submission/student/assignment/${assignmentId}`)
        .set("Authorization", `Bearer ${student.token}`);

      expectSuccessfulSubmissionRetrieval(status, body);
    });
  });

  describe("[GET] /submission/student/:studentId", (): void => {
    it("Should respond with a `401` status code because a teacher is unauthorized", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/submission/student/${studentId}`)
        .set("Authorization", `Bearer ${teacher.token}`);

      expect(status).toBe(401);
      expect(body.error).toBe("UnauthorizedError");
      expect(body.message).toBe("Not a valid student.");
    });
  });

  describe("[GET] /submission/student/assignment/:assignmentId/evaluation/:evaluationId", (): void => {
    it("Should respond with a `200` status code and return the submission for an evaluation", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(
          `/submission/student/assignment/${assignmentId}/evaluation/${evalId}`,
        )
        .set("Authorization", `Bearer ${student.token}`);

      expectSuccessfulSubmissionRetrieval(status, body);
    });
  });

  describe("[GET] /submissions/teacher/student/:studentId", (): void => {
    it("Should respond with a `401` status code because a student is unauthorized", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/submission/teacher/student/${studentId}`)
        .set("Authorization", `Bearer ${student.token}`);

      expect(status).toBe(401);
      expect(body.error).toBe("UnauthorizedError");
      expect(body.message).toBe("Not a valid teacher.");
    });
  });

  describe("[GET] /submission/teacher/student/:studentId", (): void => {
    it("Should respond with a `200` status code and return the submissions for a student", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/submission/teacher/student/${studentId}`)
        .set("Authorization", `Bearer ${teacher.token}`);

      expectSuccessfulSubmissionRetrieval(status, body);
    });
  });

  describe("[GET] /submission/teacher/team/:teamId", (): void => {
    it("Should respond with a `200` status code and return the submissions for a team", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/submission/teacher/team/${teamId}`)
        .set("Authorization", `Bearer ${teacher.token}`);

      expectSuccessfulSubmissionRetrieval(status, body);
    });
  });

  describe("[GET] /submission/teacher/student/:studentId", (): void => {
    it("Should respond with a `200` status code and return the submissions for a specific assignment and student", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/submission/teacher/student/${studentId}`)
        .set("Authorization", `Bearer ${teacher.token}`);

      expectSuccessfulSubmissionRetrieval(status, body);
    });
  });

  describe("[GET] /submission/teacher/team/:teamId", (): void => {
    it("Should respond with a `200` status code and return the submissions for a specific assignment and team", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/submission/teacher/team/${teamId}`)
        .set("Authorization", `Bearer ${teacher.token}`);

      expectSuccessfulSubmissionRetrieval(status, body);
    });
  });
});

function expectSuccessfulSubmissionRetrieval(status: number, body: any): void {
  expect(status).toBe(200);
  expectCorrectSubmissionListBody(body);
}

function expectSuccessfulSubmissionCreation(status: number, body: any): void {
  expect(status).toBe(201);
  expectCorrectSubmissionBody(body);
}

function expectCorrectSubmissionBody(body: any): void {
  expect(body).toEqual({
    assignmentId: expect.any(Number),
    evaluationId: expect.any(String),
    submissionId: expect.any(Number),
    submitted: expect.any(String),
    teamId: expect.any(Number),
  });
}

function expectCorrectSubmissionListBody(body: any): void {
  expect(body).toEqual([
    {
      assignmentId: expect.any(Number),
      evaluationId: expect.any(String),
      submissionId: expect.any(Number),
      submitted: expect.any(String),
      teamId: expect.any(Number),
    },
  ]);
}
