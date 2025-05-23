import { beforeEach, describe, expect, it } from "vitest";
import {
  Assignment,
  Feedback,
  LearningPath,
  Student,
  Submission,
  Teacher,
  User,
} from "@prisma/client";
import {
  createAssignment,
  createSubmission,
  createTeacher,
  giveAssignmentToTeam,
  giveFeedbackToSubmission,
  updateAssignmentForTeam,
} from "../helpers/testDataCreation";
import app from "../../index";
import request from "supertest";
import prisma from "../helpers/prisma";
import { setupTestData } from "../helpers/setupTestDataSubmissionsAndFeedback";

describe("Feedback tests", (): void => {
  const dayInMilliseconds: number = 1000 * 60 * 60 * 24;

  let teacher: User & { teacher: Teacher; token: string };
  let teacherId: number;

  let student: User & { student: Student; token: string };

  let classroomId: number;

  let teamId: number;

  let evalId: string;

  let learningPath: LearningPath;

  let onGoingAssignment: Assignment;
  let onGoingAssignmentId: number;

  let passedAssignment: Assignment;
  let passedAssignmentId: number;

  let submissionForOnGoingAssignment: Submission;
  let onGoingAssignmentSubmissionId: number;

  let submissionForPassedAssignment: Submission;
  let passedAssignmentSubmissionId: number;

  // Dit vult alle bovenstaande variabelen in zodat deze later gebruikt kunnen worden in de testen
  beforeEach(async (): Promise<void> => {
    ({
      teacher,
      teacherId,
      student,
      classroomId,
      teamId,
      evalId,
      learningPath,
    } = await setupTestData());

    // Create an assignment to give to a team
    const deadline = new Date(Date.now() + dayInMilliseconds); // Add 1 day
    onGoingAssignment = await createAssignment(
      classroomId,
      learningPath.id,
      "title ongoing ass",
      "description ongoing ass",
      deadline,
    );
    onGoingAssignmentId = onGoingAssignment.id;

    // Give the assignment to the team
    await giveAssignmentToTeam(onGoingAssignmentId, teamId);

    // Create a submission for this assignment
    submissionForOnGoingAssignment = await createSubmission(
      evalId,
      teamId,
      onGoingAssignmentId,
    );
    onGoingAssignmentSubmissionId = submissionForOnGoingAssignment.submissionId;

    // Create an assigment whose deadline has already passed
    const passedDeadline = new Date(Date.now() - dayInMilliseconds); // Subtract a day
    passedAssignment = await createAssignment(
      classroomId,
      learningPath.id,
      "title passed ass",
      "description passed ass",
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

  describe("[POST] /feedback/submission/:submissionId", (): void => {
    it("Should respond with a `403` status saying 'Failed to create feedback'", async (): Promise<void> => {
      // In deze test wordt nagegaan dat je geen feedback kan geven op een submission van een assignment
      // waarvan de deadline nog niet verstreken is
      const { status, body } = await request(app)
        .post(`/api/feedback/submission/${onGoingAssignmentSubmissionId}`)
        .set("Authorization", `Bearer ${teacher.token}`);

      expect(status).toBe(403);
      expect(body.error).toBe("ForbiddenActionError");
      expect(body.message).toEqual(
        "Deadline not over yet. Feedback can only be given after the deadline.",
      );

      // Gaat na dat er geen feedback is aangemaakt
      const feedback: Feedback | null = await findFeedback(
        onGoingAssignmentSubmissionId,
      );
      expect(feedback).toBeNull();
    });

    it("Should respond with a `401` status (UnauthorizedError)", async (): Promise<void> => {
      // In deze test wordt nagegaan dat je geen feedback kunt geven als student
      const { status, body } = await request(app)
        .post(`/api/feedback/submission/${passedAssignmentSubmissionId}`)
        .set("Authorization", `Bearer ${student.token}`);

      expect(status).toBe(401);
      expect(body.error).toEqual("UnauthorizedError");
      expect(body.message).toEqual("Not a valid teacher.");

      // Gaat na dat er geen feedback is aangemaakt
      const feedback: Feedback | null = await findFeedback(
        passedAssignmentSubmissionId,
      );
      expect(feedback).toBeNull();
    });

    it("Should respond with a `201` status and the created feedback", async (): Promise<void> => {
      const { status, body } = await request(app)
        .post(`/api/feedback/submission/${passedAssignmentSubmissionId}`)
        .set("Authorization", `Bearer ${teacher.token}`)
        .send({ description: "Mooie oplossing!" });

      expect(status).toBe(201);
      expectCorrectFeedbackBody(body.feedback);

      // Gaat na dat de feedback is aangemaakt
      const feedback: Feedback | null = await findFeedback(
        passedAssignmentSubmissionId,
      );
      expect(feedback).toBeDefined();
    });

    it("Should respond with a `400` status when the submission id is not a valid number", async (): Promise<void> => {
      const { status, body } = await request(app)
        .post(`/api/feedback/submission/notANumber`)
        .set("Authorization", `Bearer ${teacher.token}`)
        .send({ description: "Mooie oplossing!" });

      expect(status).toBe(400);
      expect(body.error).toEqual("BadRequestError");
      expect(body.message).toBe("invalid request for updating feedback");
    });

    it("Should respond with a `403` status (AccessDeniedError)", async (): Promise<void> => {
      // In deze test wordt nagegaan dat je geen feedback kunt geven als leerkracht als je geen rechten hebt op die assignment
      // Maak een nieuwe leekracht aan
      const newTeacher: User & { teacher: Teacher; token: string } =
        await createTeacher("new", "teacher", "newteacher@gmail.com");
      const { status, body } = await request(app)
        .post(`/api/feedback/submission/${passedAssignmentSubmissionId}`)
        .set("Authorization", `Bearer ${newTeacher.token}`);

      expect(status).toBe(403);
      expect(body.error).toEqual("AccessDeniedError");
      expect(body.message).toEqual(
        "Teacher should teach this class to perform this action.",
      );
    });
  });

  describe("[GET] /feedback/submission/:submissionId", (): void => {
    it("Should respond with a `200` status and the fetched feedback", async (): Promise<void> => {
      // We first need to create feedback for a submission
      await giveFeedbackToSubmission(
        passedAssignmentSubmissionId,
        teacherId,
        "Goede oplossing!",
      );

      const { status, body } = await request(app)
        .get(`/api/feedback/submission/${passedAssignmentSubmissionId}`)
        .set("Authorization", `Bearer ${teacher.token}`);

      expect(status).toBe(200);
      expectCorrectFeedbackBody(body);
    });

    it("Should respond with a `404` status and saying it found no feedback", async (): Promise<void> => {
      // Check if this returns a 404 when searching for feedback that does not yet exist
      const { status, body } = await request(app)
        .get(`/api/feedback/submission/${passedAssignmentSubmissionId}`)
        .set("Authorization", `Bearer ${teacher.token}`);

      expect(status).toBe(404);
      expect(body.error).toEqual("NotFoundError");
      expect(body.message).toBe("Feedback not found for this submission.");
    });

    it("Should respond with a `400` status when the ID is not a number", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/api/feedback/submission/notANumber`)
        .set("Authorization", `Bearer ${teacher.token}`);

      expect(status).toBe(400);
      expect(body.error).toEqual("BadRequestError");
      expect(body.message).toBe("invalid request for getting feedback");
    });

    it("Should respond with a `401` status meaning a student not allowed to fetch feedback for a submission", async (): Promise<void> => {
      // We first need to create feedback for a submission
      await giveFeedbackToSubmission(
        passedAssignmentSubmissionId,
        teacherId,
        "Goede oplossing!",
      );

      const { status, body } = await request(app)
        .get(`/api/feedback/submission/${passedAssignmentSubmissionId}`)
        .set("Authorization", `Bearer ${student.token}`);

      expect(status).toBe(401);
      expect(body.error).toEqual("UnauthorizedError");
      expect(body.message).toEqual("Not a valid teacher.");
    });

    it("Should respxond with a `403` status meaning a teacher that has no rights over the assignment", async (): Promise<void> => {
      // We first need to create feedback for a submission
      await giveFeedbackToSubmission(
        passedAssignmentSubmissionId,
        teacherId,
        "Goede oplossing!",
      );

      const newTeacher: User & { teacher: Teacher; token: string } =
        await createTeacher("new", "teacher", "newteacher@gmail.com");

      const { status, body } = await request(app)
        .get(`/api/feedback/submission/${passedAssignmentSubmissionId}`)
        .set("Authorization", `Bearer ${newTeacher.token}`);

      expect(status).toBe(403);
      expect(body.error).toEqual("AccessDeniedError");
      expect(body.message).toEqual(
        "Teacher should teach this class to perform this action.",
      );
    });
  });

  describe("[GET] /feedback/assignment/:assignmentId/evaluation/:evaluationId", (): void => {
    it("Should respond with a `403` status (the teacher can only access feedback from assignments that are given to classes he teaches)", async (): Promise<void> => {
      const assignmentIdFromOtherClass = 123;
      const { status, body } = await request(app)
        .get(
          `/api/feedback/assignment/${assignmentIdFromOtherClass}/evaluation/${evalId}`,
        )
        .set("Authorization", `Bearer ${teacher.token}`);

      expect(status).toBe(403);
      expect(body.error).toEqual("AccessDeniedError");
      expect(body.message).toEqual(
        "Teacher should teach this class to perform this action.",
      );
    });

    it("Should respond with a `401` status when a student tries to access the information", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(
          `/api/feedback/assignment/${passedAssignmentSubmissionId}/evaluation/${evalId}`,
        )
        .set("Authorization", `Bearer ${student.token}`);

      expect(status).toBe(401);
      expect(body.error).toEqual("UnauthorizedError");
      expect(body.message).toEqual("Not a valid teacher.");
    });

    it("Should respond with a `200` status and all the feedback for an assignment and evaluation combination", async (): Promise<void> => {
      // We first need to create feedback for a submission
      await giveFeedbackToSubmission(
        passedAssignmentSubmissionId,
        teacherId,
        "Netjes!",
      );

      // Now we create an extra submission to the list will be 2 items long
      const newSubmission: Submission = await createSubmission(
        evalId,
        teamId,
        passedAssignmentId,
      );

      await giveFeedbackToSubmission(
        newSubmission.submissionId,
        teacherId,
        "Goed gedaan!",
      );

      const { status, body } = await request(app)
        .get(`/api/feedback/assignment/${passedAssignmentId}/evaluation/${evalId}`)
        .set("Authorization", `Bearer ${teacher.token}`);

      expect(status).toBe(200);
      expectBodyToBeListOfFeedBackObjects(body);
    });
  });

  describe("[PATCH] /feedback/submission/:submissionId", (): void => {
    it("Should respond with a `401` status code (Unauthorized user - student)", async (): Promise<void> => {
      const { status, body } = await request(app)
        .patch(`/api/feedback/submission/:submissionId`)
        .set("Authorization", `Bearer ${student.token}`);

      expect(status).toBe(401);
      expect(body.error).toEqual("UnauthorizedError");
      expect(body.message).toEqual("Not a valid teacher.");
    });

    it("Should respond with a `400` status code when the submissionID is not valid", async (): Promise<void> => {
      const { status, body } = await request(app)
        .patch(`/api/feedback/submission/invalidSubmissionId`)
        .set("Authorization", `Bearer ${teacher.token}`);

      expect(status).toBe(400);
      expect(body.error).toEqual("BadRequestError");
      expect(body.message).toEqual("invalid request for updating feedback");
    });

    it("Should respond with a `200` status code and the updated feedback", async (): Promise<void> => {
      // We first need to create feedback for a submission
      await giveFeedbackToSubmission(
        passedAssignmentSubmissionId,
        teacherId,
        "Netjes!",
      );

      const { status, body } = await request(app)
        .patch(`/api/feedback/submission/${passedAssignmentSubmissionId}`)
        .set("Authorization", `Bearer ${teacher.token}`)
        .send({ description: "Zeer netjes!" });

      expect(status).toBe(200);
      expectCorrectFeedbackBody(body.feedback);
      expect(body.feedback.description).toEqual("Zeer netjes!");
    });

    it("Should respond with a `404` status code when updating feedback that does not exist", async (): Promise<void> => {
      const { status, body } = await request(app)
        .patch(`/api/feedback/submission/${passedAssignmentSubmissionId}`)
        .set("Authorization", `Bearer ${teacher.token}`)
        .send({ description: "Zeer netjes!" });

      expect(status).toBe(404);
      expect(body.error).toEqual("NotFoundError");
      expect(body.message).toEqual("Feedback not found for this submission.");
    });

    it("Should respond with a `403` status code (Unauthorized user - teacher)", async (): Promise<void> => {
      const newTeacher: User & { teacher: Teacher; token: string } =
        await createTeacher("new", "teacher", "newteacher@gmail.com");

      const { status, body } = await request(app)
        .patch(`/api/feedback/submission/176`)
        .set("Authorization", `Bearer ${newTeacher.token}`);

      expect(status).toBe(403);
      expect(body.error).toEqual("AccessDeniedError");
      expect(body.message).toEqual(
        "Teacher should teach this class to perform this action.",
      );
    });
  });

  describe("[DELETE] /feedback/submission/:submissionId", (): void => {
    it("Should respond with a `204` status code and no content", async (): Promise<void> => {
      // We first need to create feedback for a submission
      await giveFeedbackToSubmission(
        onGoingAssignmentSubmissionId,
        teacherId,
        "Netjes!",
      );

      const { status, body } = await request(app)
        .delete(`/api/feedback/submission/${onGoingAssignmentSubmissionId}`)
        .set("Authorization", `Bearer ${teacher.token}`);

      expect(status).toBe(204);
      // Should match an empty object since we return nothing (status code 204)
      expect(body).toStrictEqual({});

      // Double-check the feedback was removed
      const feedback: Feedback | null = await prisma.feedback.findFirst({
        where: {
          submissionId: passedAssignmentSubmissionId,
        },
      });
      expect(feedback).toBeNull();
    });

    it("Should respond with a `404` status code when trying to delete feedback that doesn't exist", async (): Promise<void> => {
      const { status, body } = await request(app)
        .delete(`/api/feedback/submission/${passedAssignmentSubmissionId}`)
        .set("Authorization", `Bearer ${teacher.token}`);

      expect(status).toBe(404);
      expect(body.error).toEqual("NotFoundError");
      expect(body.message).toEqual("Feedback not found for this submission.");
    });

    it("Should respond with a `400` status code when :submissionId is not valid", async (): Promise<void> => {
      const { status, body } = await request(app)
        .delete(`/api/feedback/submission/invalidId`)
        .set("Authorization", `Bearer ${teacher.token}`);

      expect(status).toBe(400);
      expect(body.error).toEqual("BadRequestError");
      expect(body.message).toEqual("invalid request for updating feedback");
    });

    it("Should respond with a `401` status code when a student tries to delete something", async (): Promise<void> => {
      const { status, body } = await request(app)
        .delete(`/api/feedback/submission/${passedAssignmentSubmissionId}`)
        .set("Authorization", `Bearer ${student.token}`);

      expect(status).toBe(401);
      expect(body.error).toEqual("UnauthorizedError");
      expect(body.message).toEqual("Not a valid teacher.");
    });

    it("Should respond with a `401` status code when a teacher without rights tries to delete something", async (): Promise<void> => {
      const newTeacher: User & { teacher: Teacher; token: string } =
        await createTeacher("new", "teacher", "newteacher@gmail.com");
      const { status, body } = await request(app)
        .delete(`/api/feedback/submission/${passedAssignmentSubmissionId}`)
        .set("Authorization", `Bearer ${newTeacher.token}`);

      expect(status).toBe(403);
      expect(body.error).toEqual("AccessDeniedError");
      expect(body.message).toEqual(
        "Teacher should teach this class to perform this action.",
      );
    });
  });
});

function expectBodyToBeListOfFeedBackObjects(body: any) {
  expect(body).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        submissionId: expect.any(Number),
        teacherId: expect.any(Number),
        description: expect.any(String),
        submission: expect.objectContaining({
          submissionId: expect.any(Number),
          evaluationId: expect.any(String),
          teamId: expect.any(Number),
          submitted: expect.any(String),
          assignmentId: expect.any(Number),
        }),
      }),
    ]),
  );
}

async function findFeedback(id: number): Promise<Feedback | null> {
  return prisma.feedback.findUnique({
    where: {
      submissionId: id,
    },
  });
}

function expectCorrectFeedbackBody(body: any): void {
  expect(body).toEqual({
    submissionId: expect.any(Number),
    teacherId: expect.any(Number),
    description: expect.any(String),
  });
}
