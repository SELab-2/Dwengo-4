import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import prisma from "./helpers/prisma";
import app from "../index";
import {
  Class,
  ClassTeacher,
  Invite,
  JoinRequestStatus,
  Student,
  Teacher,
  User,
} from "@prisma/client";
import {
  addTeacherToClass,
  createClass,
  createInvite,
  createStudent,
  createTeacher,
} from "./helpers/testDataCreation";

describe("invite tests", async (): Promise<void> => {
  let teacherUser1: User & { teacher: Teacher; token: string };
  let teacherUser2: User & { teacher: Teacher; token: string };
  let classroom: Class;
  beforeEach(async (): Promise<void> => {
    // create two teachers
    teacherUser1 = await createTeacher("Bob", "Boons", "bob.boons@gmail.com");
    teacherUser2 = await createTeacher("John", "Doe", "john.doe@gmail.com");
    // create a class
    classroom = await createClass("5A", "ABCD");
  });

  async function sendInvitationToTeacherAndCheckExistence(): Promise<void> {
    const { status, body } = await request(app)
      .post(`/invite/class/${classroom.id}`)
      .set("Authorization", `Bearer ${teacherUser1.token}`)
      .send({
        otherTeacherEmail: teacherUser2.email,
      });
    expect(status).toBe(201);
    const invite: Invite | null = await prisma.invite.findFirst({
      where: {
        otherTeacherId: teacherUser2.id,
        classTeacherId: teacherUser1.id,
        classId: classroom.id,
        status: JoinRequestStatus.PENDING,
      },
    });
    expect(invite).not.toBeNull();
    expect(body.invite).toStrictEqual(invite);
  }

  describe("[POST] /invite/class/:classId", async (): Promise<void> => {
    it("should respond with a `201` status code and an invite", async (): Promise<void> => {
      // set up scenario where there's two teachers and a class, the first one being a teacher of the class
      await addTeacherToClass(teacherUser1.id, classroom.id);

      // now we can test the invite creation
      await sendInvitationToTeacherAndCheckExistence();
    });

    it("should create an invite, even when there is already a non-pending invite in the database", async (): Promise<void> => {
      // emphasis on the 'non-pending' here
      // set up scenario where teacher has rejected the invite
      await addTeacherToClass(teacherUser1.id, classroom.id);
      const invite: Invite = await createInvite(
        teacherUser1.id,
        teacherUser2.id,
        classroom.id,
      );
      await prisma.invite.update({
        where: {
          inviteId: invite.inviteId,
        },
        data: {
          status: JoinRequestStatus.DENIED,
        },
      });

      // it should be possible to send another invite
      await sendInvitationToTeacherAndCheckExistence();
    });

    it("should respond with a `404` status code when the class does not exist", async (): Promise<void> => {
      // get an id that isn't used for any existing class in the database
      const maxClass: Class | null = await prisma.class.findFirst({
        orderBy: {
          id: "desc",
        },
      });
      const invalidClassId: number = (maxClass?.id ?? 0) + 1;
      // try to create invite for non-existent class
      const { status, body } = await request(app)
        .post(`/invite/class/${invalidClassId}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({
          otherTeacherEmail: teacherUser2.email,
        });

      expect(body.message).toBe("Class not found.");
      expect(status).toBe(404);
      expect(body.error).toBe("NotFoundError");
      // verify that no invite was created
      await prisma.invite.findMany().then((invites: Invite[]): void => {
        expect(invites.length).toBe(0);
      });
    });

    it("should respond with a `403` status code when the teacher making the invite is not a teacher of the class", async (): Promise<void> => {
      // we can use the existing scenario with two valid teachers and a class, but none of them are a teacher of the class
      // try to create invite for class where teacher1 is not a teacher
      const { status, body } = await request(app)
        .post(`/invite/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({
          otherTeacherEmail: teacherUser2.email,
        });

      expect(body.message).toBe("Teacher is not a part of this class.");
      expect(status).toBe(403);
      expect(body.error).toBe("AccessDeniedError");
      // verify that no invite was created
      await prisma.invite.findMany().then((invites: Invite[]): void => {
        expect(invites.length).toBe(0);
      });
    });

    it("should respond with a `400` status code when the teacher receiving the invite is already a teacher of the class", async (): Promise<void> => {
      // set up scenario where there's two valid teachers and a class, both are teachers of the class
      await addTeacherToClass(teacherUser1.id, classroom.id);
      await addTeacherToClass(teacherUser2.id, classroom.id);

      // try to create the invite
      const { status, body } = await request(app)
        .post(`/invite/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({
          otherTeacherEmail: teacherUser2.email,
        });

      expect(body.message).toBe("Teacher is already a member of this class.");
      expect(status).toBe(400);
      expect(body.error).toBe("BadRequestError");
      // verify that no invite was created
      await prisma.invite.findMany().then((invites: Invite[]): void => {
        expect(invites.length).toBe(0);
      });
    });

    it("should respond with a `409` status code when the teacher already has a pending invite", async (): Promise<void> => {
      // set up scenario where there's two valid teachers and a class, the first one being a teacher of the class, and the second one has already received an invitation
      await addTeacherToClass(teacherUser1.id, classroom.id);
      // send a first invite
      await request(app)
        .post(`/invite/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({
          otherTeacherEmail: teacherUser2.email,
        });

      // verify an invitation was created
      await prisma.invite.findMany().then((invites: Invite[]): void => {
        expect(invites.length).toBe(1);
      });

      // try to create another invite for the same class and teacher
      const { status, body } = await request(app)
        .post(`/invite/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({
          otherTeacherEmail: teacherUser2.email,
        });
      // no new invite should have been created
      await prisma.invite.findMany().then((invites: Invite[]): void => {
        expect(invites.length).toBe(1);
      });

      expect(body.message).toBe(
        "There is already a pending invite for this teacher and class.",
      );
      expect(status).toBe(409);
      expect(body.error).toBe("ConflictError");
    });

    it("should respond with a `400` status code when request body/params are incorrect", async (): Promise<void> => {
      // try to create an invitation with an invalid body and params
      const { status, body } = await request(app)
        .post(`/invite/class/invalid_id`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({
          otherTeacherEmail: "sldk",
        });

      expect(status).toBe(400);
      expect(body.error).toBe("BadRequestError");
      expect(body.message).toBe("invalid request for invite creation");

      expect(body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "classId",
            message: expect.stringContaining("number"),
            source: "params",
          }),
        ]),
      );

      // verify no invite was created
      await prisma.invite.findMany().then((invites: Invite[]): void => {
        expect(invites.length).toBe(0);
      });
    });

    it("should respond with a `400` status code when the request body is missing", async (): Promise<void> => {
      await addTeacherToClass(teacherUser1.id, classroom.id);
      const { status: status, body: body } = await request(app)
        .post(`/invite/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({}); // empty body

      expect(status).toBe(400);
      expect(body.error).toBe("BadRequestError");
      expect(body.message).toBe("invalid request for invite creation");
      expect(body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "otherTeacherEmail",
            source: "body",
          }),
        ]),
      );

      // verify no invite was created
      await prisma.invite.findMany().then((invites: Invite[]): void => {
        expect(invites.length).toBe(0);
      });
    });

    it("should respond with a `404` status code when the teacher does not exist", async (): Promise<void> => {
      await addTeacherToClass(teacherUser1.id, classroom.id);
      const { status, body } = await request(app)
        .post(`/invite/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({
          otherTeacherEmail: "ikbestaniet@gmail.com",
        });

      expect(body.message).toBe(
        "Given email doesn't correspond to any existing teachers.",
      );
      expect(status).toBe(404);
      expect(body.error).toBe("NotFoundError");
      // verify that no invite was created
      await prisma.invite.findMany().then((invites: Invite[]): void => {
        expect(invites.length).toBe(0);
      });
    });

    it("should respond with a `401` status code when the teacher does not exist", async (): Promise<void> => {
      await addTeacherToClass(teacherUser1.id, classroom.id);

      const student: User & { student: Student; token: string } =
        await createStudent("new", "student", "newstudent@gmail.com");
      const { status, body } = await request(app)
        .post(`/invite/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({
          otherTeacherEmail: student.email,
        });

      expect(body.message).toBe(
        "User is not a teacher. Only teachers can receive invites.",
      );
      expect(status).toBe(401);
      expect(body.error).toBe("UnauthorizedError");
      // verify that no invite was created
      await prisma.invite.findMany().then((invites: Invite[]): void => {
        expect(invites.length).toBe(0);
      });
    });
  });

  describe("[GET] /invite", async (): Promise<void> => {
    it("should respond with a `200` status code and a list of invites", async (): Promise<void> => {
      // set up scenario where a teacher has received a few invites
      await addTeacherToClass(teacherUser1.id, classroom.id);
      const classroom2: Class = await createClass("6A", "EFGH");
      await addTeacherToClass(teacherUser1.id, classroom2.id);
      const invite1: Invite = await createInvite(
        teacherUser1.id,
        teacherUser2.id,
        classroom.id,
      );
      const invite2: Invite = await createInvite(
        teacherUser1.id,
        teacherUser2.id,
        classroom2.id,
      );

      const { status, body } = await request(app)
        .get("/invite")
        .set("Authorization", `Bearer ${teacherUser2.token}`);

      expect(status).toBe(200);
      expect(body.invites).toStrictEqual([invite1, invite2]);
    });
  });

  describe("[PATCH] /invite/:inviteId", async (): Promise<void> => {
    let invite: Invite;
    beforeEach(async (): Promise<void> => {
      // set up scenario with a valid pending invite
      await addTeacherToClass(teacherUser1.id, classroom.id);
      invite = await createInvite(
        teacherUser1.id,
        teacherUser2.id,
        classroom.id,
      );
    });

    it("should respond with a `200` status code and an updated invite when the action is `accept`", async (): Promise<void> => {
      // we've got a scenario with a valid pending invite, test accepting it
      const { status, body } = await request(app)
        .patch(`/invite/${invite.inviteId}`)
        .set("Authorization", `Bearer ${teacherUser2.token}`)
        .send({
          action: "accept",
        });

      expect(status).toBe(200);
      expect(body.invite.status).toBe(JoinRequestStatus.APPROVED);
      // verify that the teacher was added to the class
      const classTeacher2: ClassTeacher | null =
        await prisma.classTeacher.findFirst({
          where: {
            teacherId: teacherUser2.id,
            classId: classroom.id,
          },
        });
      expect(classTeacher2).not.toBeNull();
      expect(classTeacher2!.teacherId).toBe(teacherUser2.id);
      expect(classTeacher2!.classId).toBe(classroom.id);
    });

    it("should respond with a `200` status code and an updated invite when the action is `decline`", async (): Promise<void> => {
      // we've got a scenario with a valid pending invite, test declining it
      const { status, body } = await request(app)
        .patch(`/invite/${invite.inviteId}`)
        .set("Authorization", `Bearer ${teacherUser2.token}`)
        .send({
          action: "decline",
        });

      expect(status).toBe(200);
      expect(body.invite.status).toBe(JoinRequestStatus.DENIED);
      // verify that the teacher was not added to the class
      const classTeacher2: ClassTeacher | null =
        await prisma.classTeacher.findFirst({
          where: {
            teacherId: teacherUser2.id,
            classId: classroom.id,
          },
        });
      expect(classTeacher2).toBeNull();
    });

    it("should respond with a `400` status code when the action is neither `accept` nor `decline`", async (): Promise<void> => {
      // we've got a scenario with a valid pending invite, test invalid action
      const { status, body } = await request(app)
        .patch(`/invite/${invite.inviteId}`)
        .set("Authorization", `Bearer ${teacherUser2.token}`)
        .send({
          action: "invalid_action",
        });

      expect(status).toBe(400);
      expect(body.error).toBe("BadRequestError");
      expect(body.message).toBe("invalid request for invite update");
      expect(body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "action",
            source: "body",
          }),
        ]),
      );

      // verify that the invite was not updated
      const updatedInvite: Invite | null = await prisma.invite.findFirst({
        where: {
          inviteId: invite.inviteId,
        },
      });
      expect(updatedInvite).not.toBeNull();
      expect(updatedInvite).toStrictEqual(invite);

      // verify that the teacher was not added to the class
      const classTeacher2: ClassTeacher | null =
        await prisma.classTeacher.findFirst({
          where: {
            teacherId: teacherUser2.id,
            classId: classroom.id,
          },
        });
      expect(classTeacher2).toBeNull();
    });

    it("should respond with a `400` status code when the invite does not exist", async (): Promise<void> => {
      // delete the existing invite
      await prisma.invite.delete({
        where: {
          inviteId: invite.inviteId,
        },
      });
      // now let's try to accept the non-existent invite
      const { status, body } = await request(app)
        .patch(`/invite/${invite.inviteId}`)
        .set("Authorization", `Bearer ${teacherUser2.token}`)
        .send({
          action: "accept",
        });
      expect(status).toBe(400);
      expect(body.message).toBe("Invite is not pending or does not exist.");
      expect(body.error).toBe("BadRequestError");
      // verify that the teacher was not added to the class
      const classTeacher2: ClassTeacher | null =
        await prisma.classTeacher.findFirst({
          where: {
            teacherId: teacherUser2.id,
            classId: classroom.id,
          },
        });
      expect(classTeacher2).toBeNull();
    });

    it("should should respond with a `400` status code when the invite exists, but is not pending", async (): Promise<void> => {
      // change status of existing invite
      invite = await prisma.invite.update({
        where: {
          inviteId: invite.inviteId,
        },
        data: {
          status: JoinRequestStatus.DENIED,
        },
      });
      // now let's try to accept the invite
      const { status, body } = await request(app)
        .patch(`/invite/${invite.inviteId}`)
        .set("Authorization", `Bearer ${teacherUser2.token}`)
        .send({
          action: "accept",
        });
      expect(status).toBe(400);
      expect(body.message).toBe("Invite is not pending or does not exist.");
      expect(body.error).toBe("BadRequestError");
      // verify that the invite wasn't updated
      const checkInvite: Invite | null = await prisma.invite.findFirst({
        where: {
          inviteId: invite.inviteId,
        },
      });
      expect(checkInvite).not.toBeNull();
      expect(checkInvite!.status).toStrictEqual(invite.status);
    });

    it("should respond with a `400` status code when the inviteId param is not a positive integer", async (): Promise<void> => {
      // try to update an invitation with an invalid inviteId
      const { status, body } = await request(app)
        .patch(`/invite/invalid_id`)
        .set("Authorization", `Bearer ${teacherUser2.token}`)
        .send({
          action: "accept",
        });

      expect(status).toBe(400);
      expect(body.error).toBe("BadRequestError");
      expect(body.message).toBe("invalid request for invite update");
      expect(body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "inviteId",
            source: "params",
          }),
        ]),
      );
    });
  });

  describe("[DELETE] /invite/:inviteId/class/:classId", async (): Promise<void> => {
    let invite: Invite;
    beforeEach(async (): Promise<void> => {
      // set up scenario with a valid invite
      await addTeacherToClass(teacherUser1.id, classroom.id);
      invite = await createInvite(
        teacherUser1.id,
        teacherUser2.id,
        classroom.id,
      );
    });

    it("should respond with a `204` status code", async (): Promise<void> => {
      // test deleting the invite
      const { status } = await request(app)
        .delete(`/invite/${invite.inviteId}/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(204);
      await expectBodyToContainDeletedInviteAndVerifyInviteDeleted(invite);
    });

    it("should respond with a `403` status code when the teacher trying to delete the invite is not part of the class", async (): Promise<void> => {
      const teacherUser3: User & { teacher: Teacher; token: string } =
        await createTeacher("Jane", "Doe", "jane.doe@gmail.com");
      const { status, body } = await request(app)
        .delete(`/invite/${invite.inviteId}/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser3.token}`);

      expect(status).toBe(403);
      expect(body.error).toBe("AccessDeniedError");
      expect(body.message).toBe("Teacher is not a part of this class.");
      // verify that the invite was not deleted
      const checkInvite: Invite | null = await prisma.invite.findUnique({
        where: {
          inviteId: invite.inviteId,
        },
      });
      expect(checkInvite).toStrictEqual(invite);
    });

    it("should let another teacher of the class delete the invite, even if they didn't create the invite", async (): Promise<void> => {
      const teacherUser3: User & { teacher: Teacher; token: string } =
        await createTeacher("Jane", "Doe", "jane.doe@gmail.com");
      await addTeacherToClass(teacherUser3.id, classroom.id);
      const { status } = await request(app)
        .delete(`/invite/${invite.inviteId}/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser3.token}`); // teacher3 didn't create the invite, but is part of the class

      expect(status).toBe(204);
      await expectBodyToContainDeletedInviteAndVerifyInviteDeleted(invite);
    });

    it("should respond with a `404` status code when the invite does not exist", async (): Promise<void> => {
      // delete the existing invite
      await prisma.invite.delete({
        where: {
          inviteId: invite.inviteId,
        },
      });
      // now let's try to delete the non-existent invite using the route
      const { status, body } = await request(app)
        .delete(`/invite/${invite.inviteId}/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(404);
      expect(body.error).toBe("NotFoundError");
      expect(body.message).toBe("Invite does not exist or is not pending.");
    });

    it("should respond with a `400` status code when the params are not correct", async (): Promise<void> => {
      const { status, body } = await request(app)
        .delete(`/invite/invalid_invite_id/class/invalid_class_id`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(400);
      expect(body.error).toBe("BadRequestError");
      expect(body.message).toBe("invalid request params");
      expect(body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "classId",
            source: "params",
          }),
          expect.objectContaining({
            field: "inviteId",
            source: "params",
          }),
        ]),
      );
    });

    it("should not delete the invite if a teacher that is not part of the class tries it", async (): Promise<void> => {
      const teacherUser3: User & { teacher: Teacher; token: string } =
        await createTeacher("Jane", "Doe", "jane.doe@gmail.com");
      const { status, body } = await request(app)
        .delete(`/invite/${invite.inviteId}/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser3.token}`); // not part of the class

      expect(status).toBe(403);
      expect(body.error).toBe("AccessDeniedError");
      expect(body.message).toBe("Teacher is not a part of this class.");
      // verify that the invite was not deleted
      const checkInvite: Invite | null = await prisma.invite.findUnique({
        where: {
          inviteId: invite.inviteId,
        },
      });
      expect(checkInvite).toStrictEqual(invite);
    });
  });

  describe("[GET] /invite/class/:classId", async (): Promise<void> => {
    it("should respond with a `200` status code and a list of invites", async (): Promise<void> => {
      // set up scenario where there's some pending invites for a class
      await addTeacherToClass(teacherUser1.id, classroom.id);
      const teacherUser3: User & { teacher: Teacher } = await createTeacher(
        "Bleep",
        "Bloop",
        "bleep.bloop@gmail.com",
      );

      const invite1: Invite = await createInvite(
        teacherUser1.id,
        teacherUser2.id,
        classroom.id,
      );

      const invite2: Invite = await createInvite(
        teacherUser1.id,
        teacherUser3.id,
        classroom.id,
      );

      // test getting the invites
      const { status, body } = await request(app)
        .get(`/invite/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body.invites).toStrictEqual([invite1, invite2]);
    });

    it("should respond with a `403` status code when the teacher is not part of the class", async (): Promise<void> => {
      // try to get invites for a class where the teacher is part of the class
      const { status, body } = await request(app)
        .get(`/invite/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(403);
      expect(body.message).toBe("Teacher is not a part of this class.");
      expect(body.error).toBe("AccessDeniedError");
      expect(body.invites).toBeUndefined();
    });

    it("should respond with a `400` status code when the params are not correct", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/invite/class/invalid_class_id`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(400);
      expect(body.error).toBe("BadRequestError");
      expect(body.message).toBe("invalid request params");
      expect(body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "classId",
            source: "params",
          }),
        ]),
      );
    });
  });
});

async function expectBodyToContainDeletedInviteAndVerifyInviteDeleted(
  invite: Invite,
) {
  // verify that the invite was deleted
  const deletedInvite: Invite | null = await prisma.invite.findUnique({
    where: {
      inviteId: invite.inviteId,
    },
  });
  expect(deletedInvite).toBeNull();
}
