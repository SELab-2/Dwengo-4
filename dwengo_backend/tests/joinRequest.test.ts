import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import prisma from "./helpers/prisma";
import app from "../index";
import {
  Class,
  ClassStudent,
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

describe("join request tests", async (): Promise<void> => {
  let classroom: Class;
  let teacherUser1: User & { teacher: Teacher; token: string };
  let studentUser1: User & { student: Student; token: string };
  beforeEach(async (): Promise<void> => {
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

  describe("[POST] /join-request/student", async (): Promise<void> => {
    it("should respond with a `201` status code and return the created join request", async (): Promise<void> => {
      // we've got a scenario with a valid class and student, let's test a student creating a join request
      await createJoinCodeAndCheckExistence(studentUser1, classroom);
    });

    it("should respond with a `201` status code and return the created join request, even when a previous join request was denied before", async (): Promise<void> => {
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
      const bodyJoinRequest: JoinRequest | null =
        await createJoinCodeAndCheckExistence(studentUser1, classroom);
      await prisma.joinRequest
        .findMany()
        .then((joinRequests: JoinRequest[]): void => {
          expect(joinRequests).toStrictEqual([joinRequest, bodyJoinRequest]);
        });
    });

    it("should respond with a `404` status code when the class does not exist", async (): Promise<void> => {
      // try to send a join request for a class with a non-existent class code
      const { status, body } = await request(app)
        .post("/join-request/student")
        .set("Authorization", `Bearer ${studentUser1.token}`)
        .send({
          joinCode: "BLABLA", // non-existent class code
        });

      expect(status).toBe(404);
      expect(body.error).toBe("NotFoundError");
      expect(body.message).toBe(
        "Class corresponding to join code BLABLA not found.",
      );
      // verify that no join request was created
      await prisma.joinRequest
        .findMany()
        .then((joinRequests: JoinRequest[]): void => {
          expect(joinRequests.length).toBe(0);
        });
    });

    it("should respond with a `409` status code when student is already a member of the class", async (): Promise<void> => {
      await addStudentToClass(studentUser1.id, classroom.id);
      const { status, body } = await request(app)
        .post("/join-request/student")
        .set("Authorization", `Bearer ${studentUser1.token}`)
        .send({
          joinCode: classroom.code,
        });
      expect(status).toBe(409);
      expect(body.error).toBe("ConflictError");
      expect(body.message).toBe("Student is already a member of this class.");
    });

    it("should respond with a `409` status code when there is already a pending join request for the student and class", async (): Promise<void> => {
      // send a first join request
      await request(app)
        .post("/join-request/student")
        .set("Authorization", `Bearer ${studentUser1.token}`)
        .send({
          joinCode: classroom.code,
        });
      // verify that the join request was created
      await prisma.joinRequest
        .findMany()
        .then((joinRequests: JoinRequest[]): void => {
          expect(joinRequests.length).toBe(1);
        });
      // send a second join request
      const { status, body } = await request(app)
        .post("/join-request/student")
        .set("Authorization", `Bearer ${studentUser1.token}`)
        .send({
          joinCode: classroom.code,
        });
      expect(status).toBe(409);
      expect(body.error).toBe("ConflictError");
      expect(body.message).toBe(
        "There's already a pending join request for this student and this class.",
      );
      // verify no additional join request was created
      await prisma.joinRequest
        .findMany()
        .then((joinRequests: JoinRequest[]): void => {
          expect(joinRequests.length).toBe(1);
        });
    });
  });

  describe("[PATCH] /join-request/teacher/:requestId/class/:classId", async (): Promise<void> => {
    let joinRequest: JoinRequest;
    beforeEach(async (): Promise<void> => {
      joinRequest = await createJoinRequest(studentUser1.id, classroom.id);
    });

    it("should respond with a `200` status code and an updated join request when the action is `approve`", async (): Promise<void> => {
      // test approving the join request
      const { status, body } = await request(app)
        .patch(
          `/join-request/teacher/${joinRequest.requestId}/class/${classroom.id}`,
        )
        .set("Authorization", `Bearer ${teacherUser1.token}`) // teacherUser1 is a teacher of the class
        .send({
          action: "approve",
        });

      expect(status).toBe(200);
      expect(body).toHaveProperty("joinRequest");
      expect(body).toHaveProperty("message", "Join request approved.");
      // verify that the join request was updated
      await verifyJoinRequestUpdated(
        body,
        joinRequest,
        JoinRequestStatus.APPROVED,
      );
      // verify that the student was added to the class
      await verifyStudentAddedToClass(classroom, studentUser1);
    });

    it("should respond with a `200` status code and an updated join request when the action is `deny`", async (): Promise<void> => {
      // test denying the join request
      const { status, body } = await request(app)
        .patch(
          `/join-request/teacher/${joinRequest.requestId}/class/${classroom.id}`,
        )
        .set("Authorization", `Bearer ${teacherUser1.token}`) // teacherUser1 is a teacher of the class
        .send({
          action: "deny",
        });

      expect(status).toBe(200);
      expect(body).toHaveProperty("joinRequest");
      expect(body).toHaveProperty("message", "Join request denied.");

      // verify that the join request was updated
      await verifyJoinRequestUpdated(
        body,
        joinRequest,
        JoinRequestStatus.DENIED,
      );

      // verify that the student was not added to the class
      await verifyStudentNotAddedToClass(classroom, studentUser1);
    });

    it("should respond with a `400` status code when the action is neither `approve` or `deny`", async (): Promise<void> => {
      // test sending an invalid action
      const { status, body } = await request(app)
        .patch(
          `/join-request/teacher/${joinRequest.requestId}/class/${classroom.id}`,
        )
        .set("Authorization", `Bearer ${teacherUser1.token}`) // teacherUser1 is a teacher of the class
        .send({
          action: "invalid_action",
        });

      expect(status).toBe(400);
      expect(body.error).toBe("BadRequestError");
      expect(body.message).toBe("invalid request params");
      await verifyJoinRequestNotUpdatedStudentNotAdded(
        joinRequest,
        studentUser1,
        classroom,
      );
    });

    it("should respond with a `404` status code when the join request does not exist", async (): Promise<void> => {
      // let's delete the join request and then try accepting it
      await prisma.joinRequest.delete({
        where: {
          requestId: joinRequest.requestId,
        },
      });
      await approveAndVerifyJoinRequest();
    });

    it("should respond with a `404` status code when the join request is not pending", async (): Promise<void> => {
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
      await approveAndVerifyJoinRequest();
    });

    async function approveAndVerifyJoinRequest(): Promise<void> {
      const { status, body } = await request(app)
        .patch(
          `/join-request/teacher/${joinRequest.requestId}/class/${classroom.id}`,
        )
        .set("Authorization", `Bearer ${teacherUser1.token}`) // teacherUser1 is a teacher of the class
        .send({
          action: "approve",
        });

      expect(status).toBe(404);
      expect(body.error).toBe("NotFoundError");
      expect(body.message).toBe(
        "Join request for this class is not found or is not pending.",
      );
    }

    it("should respond with a `403` status code when the teacher is not allowed to approve/deny the request", async (): Promise<void> => {
      // create teacher that's not part of the class
      const teacherUser2: User & { teacher: Teacher; token: string } =
        await createTeacher("bleep", "blop", "bleep.blop@gmail.com");
      // try having teacherUser2 approve the join request
      const { status, body } = await request(app)
        .patch(
          `/join-request/teacher/${joinRequest.requestId}/class/${classroom.id}`,
        )
        .set("Authorization", `Bearer ${teacherUser2.token}`) // teacherUser2 is not a teacher of the class
        .send({
          action: "approve",
        });

      expect(status).toBe(403);
      expect(body.error).toBe("AccessDeniedError");
      expect(body.message).toBe("Teacher is not a part of this class.");

      await verifyJoinRequestNotUpdatedStudentNotAdded(
        joinRequest,
        studentUser1,
        classroom,
      );
    });

    it("should respond with a `404` status code when the join request does not exist", async (): Promise<void> => {
      // let's delete the join request and then try denying it
      await prisma.joinRequest.delete({
        where: {
          requestId: joinRequest.requestId,
        },
      });
      await denyAndVerifyJoinRequest();
    });

    it("should respond with a `404` status code when the join request is not pending", async (): Promise<void> => {
      // update the status of the join request to approved
      await prisma.joinRequest.update({
        where: {
          requestId: joinRequest.requestId,
        },
        data: {
          status: JoinRequestStatus.APPROVED,
        },
      });
      // now let's try approving it
      await denyAndVerifyJoinRequest();
    });

    async function denyAndVerifyJoinRequest(): Promise<void> {
      const { status, body } = await request(app)
        .patch(
          `/join-request/teacher/${joinRequest.requestId}/class/${classroom.id}`,
        )
        .set("Authorization", `Bearer ${teacherUser1.token}`) // teacherUser1 is a teacher of the class
        .send({
          action: "approve",
        });

      expect(status).toBe(404);
      expect(body.error).toBe("NotFoundError");
      expect(body.message).toBe(
        "Join request for this class is not found or is not pending.",
      );
    }

    it("should respond with a `403` status code when the teacher is not allowed to approve/deny the request", async (): Promise<void> => {
      // create teacher that's not part of the class
      const teacherUser2: User & { teacher: Teacher; token: string } =
        await createTeacher("bleep", "blop", "bleep.blop@gmail.com");
      // try having teacherUser2 approve the join request
      const { status, body } = await request(app)
        .patch(
          `/join-request/teacher/${joinRequest.requestId}/class/${classroom.id}`,
        )
        .set("Authorization", `Bearer ${teacherUser2.token}`) // teacherUser2 is not a teacher of the class
        .send({
          action: "deny",
        });

      expect(status).toBe(403);
      expect(body.error).toBe("AccessDeniedError");
      expect(body.message).toBe("Teacher is not a part of this class.");

      await verifyJoinRequestNotUpdatedStudentNotAdded(
        joinRequest,
        studentUser1,
        classroom,
      );
    });
  });

  describe("[GET] /join-request/teacher/class/:classId", async (): Promise<void> => {
    let studentUser2: User & { student: Student; token: string };
    beforeEach(async (): Promise<void> => {
      await createJoinRequest(studentUser1.id, classroom.id);
      studentUser2 = await createStudent("Meep", "Moop", "meep.moop@gmail.com");
      await createJoinRequest(studentUser2.id, classroom.id);
    });

    it("should respond with a `200` status code and a list of join requests", async (): Promise<void> => {
      // test getting the join requests
      const { status, body } = await request(app)
        .get(`/join-request/teacher/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`); // teacherUser1 is a teacher of the class

      expect(status).toBe(200);
      expectBodyToHaveListOfJoinRequest(body);
    });

    it("should respond with a `403` status code when the teacher is not allowed to view the join requests", async (): Promise<void> => {
      // create teacher that's not part of the class
      const teacherUser2: User & { teacher: Teacher; token: string } =
        await createTeacher("Hi", "Ho", "hiho@gmail.com");
      // try having teacherUser2 view the join requests
      const { status, body } = await request(app)
        .get(`/join-request/teacher/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser2.token}`); // teacherUser2 is not a teacher of the class

      expect(status).toBe(403);
      expect(body.error).toBe("AccessDeniedError");
      expect(body.message).toBe("Teacher is not a part of this class.");
      expect(body.joinRequests).toBeUndefined();
    });
  });
});

async function createJoinCodeAndCheckExistence(
  user: User & { token: string },
  classroom: Class,
): Promise<JoinRequest | null> {
  const { status, body } = await request(app)
    .post("/join-request/student")
    .set("Authorization", `Bearer ${user.token}`)
    .send({
      joinCode: classroom.code,
    });

  expect(status).toBe(201);
  expect(body).toHaveProperty("joinRequest");

  // check if the join request is stored in the database
  const joinRequest: JoinRequest | null = await prisma.joinRequest.findFirst({
    where: {
      studentId: user.id,
      classId: classroom.id,
      status: JoinRequestStatus.PENDING,
    },
  });
  expect(body.joinRequest).toEqual(joinRequest);

  return joinRequest;
}

async function verifyJoinRequestUpdated(
  body: any,
  joinRequest: JoinRequest,
  newStatus: JoinRequestStatus,
): Promise<void> {
  // verify that the join request was updated
  const updatedJoinRequest: JoinRequest | null =
    await prisma.joinRequest.findUnique({
      where: {
        requestId: joinRequest.requestId,
      },
    });
  expect(updatedJoinRequest).not.toBeNull();
  expect(updatedJoinRequest).toStrictEqual(body.joinRequest);
  expect(updatedJoinRequest!.status).toBe(newStatus);
}

async function verifyStudentNotAddedToClass(
  classroom: Class,
  student: User,
): Promise<void> {
  const classStudent: ClassStudent | null =
    await prisma.classStudent.findUnique({
      where: {
        studentId_classId: {
          studentId: student.id,
          classId: classroom.id,
        },
      },
    });
  expect(classStudent).toBeNull();
}

async function verifyStudentAddedToClass(
  classroom: Class,
  student: User,
): Promise<void> {
  const classStudent: ClassStudent | null =
    await prisma.classStudent.findUnique({
      where: {
        studentId_classId: {
          studentId: student.id,
          classId: classroom.id,
        },
      },
    });
  expect(classStudent).not.toBeNull();
}

async function verifyJoinRequestNotUpdatedStudentNotAdded(
  joinRequest: JoinRequest,
  studentUser1: User,
  classroom: Class,
): Promise<void> {
  // verify that the join request was not updated
  const dbJoinRequest: JoinRequest | null = await prisma.joinRequest.findUnique(
    {
      where: {
        requestId: joinRequest.requestId,
      },
    },
  );
  expect(dbJoinRequest).not.toBeNull();
  expect(dbJoinRequest).toStrictEqual(joinRequest);
  // verify that the student was not added to the class
  const classStudent: ClassStudent | null =
    await prisma.classStudent.findUnique({
      where: {
        studentId_classId: {
          studentId: studentUser1.id,
          classId: classroom.id,
        },
      },
    });
  expect(classStudent).toBeNull();
}

function expectBodyToHaveListOfJoinRequest(body: any): void {
  expect(body).toHaveProperty("joinRequests");
  expect(body.joinRequests).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        requestId: expect.any(Number),
        studentId: expect.any(Number),
        classId: expect.any(Number),
        status: "PENDING",
        student: expect.objectContaining({
          email: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
        }),
      }),
    ]),
  );
}
