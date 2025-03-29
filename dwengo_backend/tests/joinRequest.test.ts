import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import prisma from "./helpers/prisma";
import app from "../index";
import {
  Class,
  JoinRequest,
  JoinRequestStatus,
  Student,
  Teacher,
  User,
} from "@prisma/client";
import {
  addStudentToClass,
  addTeacherToClass,
  createClass,
  createJoinRequest,
  createStudent,
  createTeacher,
} from "./helpers/testDataCreation";

describe("join request tests", async () => {
  let classroom: Class;
  let teacherUser1: User & { teacher: Teacher; token: string };
  let studentUser1: User & { student: Student; token: string };
  beforeEach(async () => {
    // create test data
    classroom = await createClass("5A", "ABCDE");
    teacherUser1 = await createTeacher(
      "Jan",
      "Janssens",
      "jan.janssens@gmail.com",
    );
    await addTeacherToClass(teacherUser1.id, classroom.id);
    studentUser1 = await createStudent(
      "Piet",
      "Pieters",
      "piet.pieters@gmail.com",
    );
  });
  describe("[POST] /student/classes/join", async () => {
    it("should respond with a `201` status code and return the created join request", async () => {
      // we've got a scenario with a valid class and student, let's test a student creating a join request
      const { status, body } = await request(app)
        .post("/student/classes/join")
        .set("Authorization", `Bearer ${studentUser1.token}`)
        .send({
          joinCode: classroom.code,
        });

      expect(status).toBe(201);
      expect(body).toHaveProperty("joinRequest");

      // check if the join request is stored in the database
      const joinRequest = await prisma.joinRequest.findFirst({
        where: {
          studentId: studentUser1.id,
          classId: classroom.id,
          status: JoinRequestStatus.PENDING,
        },
      });
      expect(body.joinRequest).toEqual(joinRequest);
    });
    it("should respond with a `201` status code and return the created join request, even when a previous join request was denied before", async () => {
      // set up scenario where a previous join request was denied
      let joinRequest: JoinRequest = await createJoinRequest(
        studentUser1.id,
        classroom.id,
      );
      joinRequest = await prisma.joinRequest.update({
        where: {
          requestId: joinRequest.requestId,
        },
        data: {
          status: JoinRequestStatus.DENIED,
        },
      });
      // test creating a new join request
      const { status, body } = await request(app)
        .post("/student/classes/join")
        .set("Authorization", `Bearer ${studentUser1.token}`)
        .send({
          joinCode: classroom.code,
        });
      expect(status).toBe(201);
      expect(body).toHaveProperty("joinRequest");
      // verify that the join request was created
      const newJoinRequest = await prisma.joinRequest.findFirst({
        where: {
          studentId: studentUser1.id,
          classId: classroom.id,
          status: JoinRequestStatus.PENDING,
        },
      });
      expect(body.joinRequest).toStrictEqual(newJoinRequest);
      await prisma.joinRequest.findMany().then((joinRequests) => {
        expect(joinRequests).toStrictEqual([joinRequest, body.joinRequest]);
      });
    });
    it("should respond with a `404` status code when the class does not exist", async () => {
      // try to send a join request for a class with a non-existent class code
      const { status, body } = await request(app)
        .post("/student/classes/join")
        .set("Authorization", `Bearer ${studentUser1.token}`)
        .send({
          joinCode: "BLABLA", // non-existent class code
        });

      expect(status).toBe(404);
      expect(body.error).toBe(
        `Error creating join request: Class with code BLABLA not found.`,
      );
      // verify that no join request was created
      await prisma.joinRequest.findMany().then((joinRequests) => {
        expect(joinRequests.length).toBe(0);
      });
    });
    it("should respond with a `400` status code when student is already a member of the class", async () => {
      await addStudentToClass(studentUser1.id, classroom.id);
      const { status, body } = await request(app)
        .post("/student/classes/join")
        .set("Authorization", `Bearer ${studentUser1.token}`)
        .send({
          joinCode: classroom.code,
        });
      expect(status).toBe(400);
      expect(body.error).toBe(
        `Error creating join request: Student ${studentUser1.id} is already a member of class ${classroom.id}`,
      );
    });
    it("should respond with a `400` status code when there is already a pending join request for the student and class", async () => {
      // send a first join request
      await request(app)
        .post("/student/classes/join")
        .set("Authorization", `Bearer ${studentUser1.token}`)
        .send({
          joinCode: classroom.code,
        });
      // verify that the join request was created
      await prisma.joinRequest.findMany().then((joinRequests) => {
        expect(joinRequests.length).toBe(1);
      });
      // send a second join request
      const { status, body } = await request(app)
        .post("/student/classes/join")
        .set("Authorization", `Bearer ${studentUser1.token}`)
        .send({
          joinCode: classroom.code,
        });
      expect(status).toBe(400);
      expect(body.error).toBe(
        `Error creating join request: There's already a pending join request for student ${studentUser1.id} and class ${classroom.id}`,
      );
      // verify no additional join request was created
      await prisma.joinRequest.findMany().then((joinRequests) => {
        expect(joinRequests.length).toBe(1);
      });
    });
  });
  describe("[PATCH] /teacher/classes/:classId/join-requests/:requestId", async () => {
    let joinRequest: JoinRequest;
    beforeEach(async () => {
      joinRequest = await createJoinRequest(studentUser1.id, classroom.id);
    });
    it("should respond with a `200` status code and an updated join request when the action is `approve`", async () => {
      // test approving the join request
      const { status, body } = await request(app)
        .patch(
          `/teacher/classes/${classroom.id}/join-requests/${joinRequest.requestId}`,
        )
        .set("Authorization", `Bearer ${teacherUser1.token}`) // teacherUser1 is a teacher of the class
        .send({
          action: "approve",
        });

      expect(status).toBe(200);
      expect(body).toHaveProperty("joinRequest");
      expect(body).toHaveProperty("message", "Join request approved.");
      // verify that the join request was updated
      const updatedJoinRequest = await prisma.joinRequest.findUnique({
        where: {
          requestId: joinRequest.requestId,
        },
      });
      expect(updatedJoinRequest).not.toBeNull();
      expect(updatedJoinRequest).toStrictEqual(body.joinRequest);
      expect(updatedJoinRequest!.status).toBe(JoinRequestStatus.APPROVED);
      // verify that the student was added to the class
      const classStudent = await prisma.classStudent.findUnique({
        where: {
          studentId_classId: {
            studentId: studentUser1.id,
            classId: classroom.id,
          },
        },
      });
      expect(classStudent).not.toBeNull();
    });
    it("should respond with a `200` status code and an updated join request when the action is `deny`", async () => {
      // test denying the join request
      const { status, body } = await request(app)
        .patch(
          `/teacher/classes/${classroom.id}/join-requests/${joinRequest.requestId}`,
        )
        .set("Authorization", `Bearer ${teacherUser1.token}`) // teacherUser1 is a teacher of the class
        .send({
          action: "deny",
        });

      expect(status).toBe(200);
      expect(body).toHaveProperty("joinRequest");
      expect(body).toHaveProperty("message", "Join request denied.");
      // verify that the join request was updated
      const updatedJoinRequest = await prisma.joinRequest.findUnique({
        where: {
          requestId: joinRequest.requestId,
        },
      });
      expect(updatedJoinRequest).not.toBeNull();
      expect(updatedJoinRequest).toStrictEqual(body.joinRequest);
      expect(updatedJoinRequest!.status).toBe(JoinRequestStatus.DENIED);
      // verify that the student was not added to the class
      const classStudent = await prisma.classStudent.findUnique({
        where: {
          studentId_classId: {
            studentId: studentUser1.id,
            classId: classroom.id,
          },
        },
      });
      expect(classStudent).toBeNull();
    });
    it("should respond with a `400` status code when the action is neither `approve` or `deny`", async () => {
      // test sending an invalid action
      const { status, body } = await request(app)
        .patch(
          `/teacher/classes/${classroom.id}/join-requests/${joinRequest.requestId}`,
        )
        .set("Authorization", `Bearer ${teacherUser1.token}`) // teacherUser1 is a teacher of the class
        .send({
          action: "invalidaction",
        });

      expect(status).toBe(400);
      expect(body.error).toBe("Action must be 'approve' or 'deny'");
      // verify that the join request was not updated
      const dbJoinRequest = await prisma.joinRequest.findUnique({
        where: {
          requestId: joinRequest.requestId,
        },
      });
      expect(dbJoinRequest).not.toBeNull();
      expect(dbJoinRequest).toStrictEqual(joinRequest);
      // verify that the student was not added to the class
      const classStudent = await prisma.classStudent.findUnique({
        where: {
          studentId_classId: {
            studentId: studentUser1.id,
            classId: classroom.id,
          },
        },
      });
      expect(classStudent).toBeNull();
    });
    it("should respond with a `404` status code when the join request does not exist", async () => {
      // let's delete the join request and then try accepting it
      await prisma.joinRequest.delete({
        where: {
          requestId: joinRequest.requestId,
        },
      });
      const { status, body } = await request(app)
        .patch(
          `/teacher/classes/${classroom.id}/join-requests/${joinRequest.requestId}`,
        )
        .set("Authorization", `Bearer ${teacherUser1.token}`) // teacherUser1 is a teacher of the class
        .send({
          action: "approve",
        });

      expect(status).toBe(404);
      expect(body.error).toBe(
        `Error approving join request ${joinRequest.requestId} for class ${classroom.id}: Join request ${joinRequest.requestId} for class ${classroom.id} not found/not pending.`,
      );
    });
    it("should respond with a `404` status code when the join request is not pending", async () => {
      // update the status of the join request to denied
      await prisma.joinRequest.update({
        where: {
          requestId: joinRequest.requestId,
        },
        data: {
          status: JoinRequestStatus.DENIED,
        },
      });
      // now let's try approving it
      const { status, body } = await request(app)
        .patch(
          `/teacher/classes/${classroom.id}/join-requests/${joinRequest.requestId}`,
        )
        .set("Authorization", `Bearer ${teacherUser1.token}`) // teacherUser1 is a teacher of the class
        .send({
          action: "approve",
        });

      expect(status).toBe(404);
      expect(body.error).toBe(
        `Error approving join request ${joinRequest.requestId} for class ${classroom.id}: Join request ${joinRequest.requestId} for class ${classroom.id} not found/not pending.`,
      );
    });
    it("should respond with a `403` status code when the teacher is not allowed to approve/deny the request", async () => {
      // create teacher that's not part of the class
      const teacherUser2: User & { teacher: Teacher; token: string } =
        await createTeacher("bleep", "blop", "bleep.blop@gmail.com");
      // try having teacherUser2 approve the join request
      const { status, body } = await request(app)
        .patch(
          `/teacher/classes/${classroom.id}/join-requests/${joinRequest.requestId}`,
        )
        .set("Authorization", `Bearer ${teacherUser2.token}`) // teacherUser2 is not a teacher of the class
        .send({
          action: "approve",
        });

      expect(status).toBe(403);
      expect(body.error).toBe(
        `Error approving join request ${joinRequest.requestId} for class ${classroom.id}: Teacher ${teacherUser2.id} is not a teacher of class ${classroom.id}`,
      );
      // verify that the join request was not updated
      const dbJoinRequest = await prisma.joinRequest.findUnique({
        where: {
          requestId: joinRequest.requestId,
        },
      });
      expect(dbJoinRequest).not.toBeNull();
      expect(dbJoinRequest).toStrictEqual(joinRequest);
      // verify that student was not added to class
      const classStudent = await prisma.classStudent.findUnique({
        where: {
          studentId_classId: {
            studentId: studentUser1.id,
            classId: classroom.id,
          },
        },
      });
      expect(classStudent).toBeNull();
    });
  });
  describe("[GET] /teacher/classes/:classId/join-requests", async () => {
    let joinRequest1: JoinRequest;
    let joinRequest2: JoinRequest;
    let studentUser2: User & { student: Student; token: string };
    beforeEach(async () => {
      joinRequest1 = await createJoinRequest(studentUser1.id, classroom.id);
      studentUser2 = await createStudent("Meep", "Moop", "meep.moop@gmail.com");
      joinRequest2 = await createJoinRequest(studentUser2.id, classroom.id);
    });
    it("should respond with a `200` status code and a list of join requests", async () => {
      // test getting the join requests
      const { status, body } = await request(app)
        .get(`/teacher/classes/${classroom.id}/join-requests`)
        .set("Authorization", `Bearer ${teacherUser1.token}`); // teacherUser1 is a teacher of the class

      expect(status).toBe(200);
      expect(body).toHaveProperty("joinRequests");
      expect(body.joinRequests).toStrictEqual(
        expect.arrayContaining([joinRequest1, joinRequest2]),
      );
    });
    it("should respond with a `403` status code when the teacher is not allowed to view the join requests", async () => {
      // create teacher that's not part of the class
      const teacherUser2: User & { teacher: Teacher; token: string } =
        await createTeacher("Hi", "Ho", "hiho@gmail.com");
      // try having teacherUser2 view the join requests
      const { status, body } = await request(app)
        .get(`/teacher/classes/${classroom.id}/join-requests`)
        .set("Authorization", `Bearer ${teacherUser2.token}`); // teacherUser2 is not a teacher of the class

      expect(status).toBe(400);
      expect(body.error).toBe(
        "Er is een probleem opgetreden bij het ophalen van join requests.",
      );
      expect(body.joinRequests).toBeUndefined();
    });
  });
});
