import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import prisma from "./helpers/prisma";
import app from "../index";
import {
  Class,
  Invite,
  JoinRequestStatus,
  Teacher,
  User,
} from "@prisma/client";
import {
  addTeacherToClass,
  createClass,
  createInvite,
  createTeacher,
} from "./helpers/testDataCreation";

describe("invite tests", async () => {
  let teacherUser1: User & { teacher: Teacher; token: string };
  let teacherUser2: User & { teacher: Teacher; token: string };
  let classroom: Class;
  beforeEach(async () => {
    // create two teachers
    teacherUser1 = await createTeacher("Bob", "Boons", "bob.boons@gmail.com");
    teacherUser2 = await createTeacher("John", "Doe", "john.doe@gmail.com");
    // create a class
    classroom = await createClass("5A", "ABCD");
  });

  describe("[POST] /invite/class/:classId", async () => {
    it("should respond with a `201` status code and an invite", async () => {
      // set up scenario where there's two teachers and a class, the first one being a teacher of the class
      await addTeacherToClass(teacherUser1.id, classroom.id);

      // now we can test the invite creation
      const { status, body } = await request(app)
        .post(`/invite/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({
          otherTeacherEmail: teacherUser2.email,
        });

      expect(status).toBe(201);
      // double check that the invite was created
      const invite = await prisma.invite.findFirst({
        where: {
          otherTeacherId: teacherUser2.id,
          classTeacherId: teacherUser1.id,
          classId: classroom.id,
          status: JoinRequestStatus.PENDING,
        },
      });
      expect(invite).not.toBeNull();
      // ensure response body contains the invite as expected
      expect(body.invite).toStrictEqual(invite);
    });
    it("should create an invite, even when there is already a non-pending invite in the database", async () => {
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
      const { status, body } = await request(app)
        .post(`/invite/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({
          otherTeacherEmail: teacherUser2.email,
        });
      expect(status).toBe(201);
      const newInvite = await prisma.invite.findFirst({
        where: {
          otherTeacherId: teacherUser2.id,
          classTeacherId: teacherUser1.id,
          classId: classroom.id,
          status: JoinRequestStatus.PENDING,
        },
      });
      expect(newInvite).not.toBeNull();
      expect(body.invite).toStrictEqual(newInvite);
    });
    it("should respond with a `404` status code when the class does not exist", async () => {
      // get an id that isn't used for any existing class in the database
      const maxClass = await prisma.class.findFirst({
        orderBy: {
          id: "desc",
        },
      });
      const invalidClassId = (maxClass?.id ?? 0) + 1;
      // try to create invite for non-existent class
      const { status, body } = await request(app)
        .post(`/invite/class/${invalidClassId}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({
          otherTeacherEmail: teacherUser2.email,
        });

      expect(body.message).toBe("Klas niet gevonden");
      expect(status).toBe(404);
      // verify that no invite was created
      await prisma.invite.findMany().then((invites) => {
        expect(invites.length).toBe(0);
      });
    });
    it("should respond with a `403` status code when the teacher making the invite is not a teacher of the class", async () => {
      // we can use the existing scenarion with two valid teachers and a class, but none of them are a teacher of the class
      // try to create invite for class where teacher1 is not a teacher
      const { status, body } = await request(app)
        .post(`/invite/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({
          otherTeacherEmail: teacherUser2.email,
        });

      expect(body.message).toBe("Leerkracht is geen beheerder van de klas");
      expect(status).toBe(403);
      // verify that no invite was created
      await prisma.invite.findMany().then((invites) => {
        expect(invites.length).toBe(0);
      });
    });
    it("should respond with a `400` status code when the teacher receiving the invite is already a teacher of the class", async () => {
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

      expect(body.message).toBe("Leerkracht is al lid van de klas");
      expect(status).toBe(400);
      // verify that no invite was created
      await prisma.invite.findMany().then((invites) => {
        expect(invites.length).toBe(0);
      });
    });
    it("should respond with a `409` status code when the teacher already has a pending invite", async () => {
      // set up scenario where there's two valid teachers and a class, the first one being a teacher of the class, and the second one has already received an invite
      await addTeacherToClass(teacherUser1.id, classroom.id);
      // send a first invite
      await request(app)
        .post(`/invite/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({
          otherTeacherEmail: teacherUser2.email,
        });

      // verify an invite was created
      await prisma.invite.findMany().then((invites) => {
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
      await prisma.invite.findMany().then((invites) => {
        expect(invites.length).toBe(1);
      });

      expect(body.message).toBe(
        "Er bestaat al een pending uitnodiging voor deze leerkracht en klas",
      );
      expect(status).toBe(409);
    });
    it("should respond with a `400` status code when request body/params are incorrect", async () => {
      // try to create an invite with an invalid body and params
      const { status, body } = await request(app)
        .post(`/invite/class/invalidid`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({
          otherTeacherEmail: "sldk",
        });

      expect(status).toBe(400);
      expect(body.error).toBe(
        "Bad request due to invalid syntax or data (validation error)",
      );
      expect(body.message).toBe("invalid request for invite creation");

      expect(body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "classId",
            message: "classId should be a number",
            source: "params",
          }),
        ]),
      );

      // verify no invite was created
      await prisma.invite.findMany().then((invites) => {
        expect(invites.length).toBe(0);
      });
    });
    it("should respond with a `400` status code when the request body is missing", async () => {
      await addTeacherToClass(teacherUser1.id, classroom.id);
      const { status: status, body: body } = await request(app)
        .post(`/invite/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({}); // empty body

      expect(status).toBe(400);
      expect(body.error).toBe(
        "Bad request due to invalid syntax or data (validation error)",
      );
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
      await prisma.invite.findMany().then((invites) => {
        expect(invites.length).toBe(0);
      });
    });
  });
  describe("[GET] /invite", async () => {
    it("should respond with a `200` status code and a list of invites", async () => {
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
  describe("[PATCH] /invite/:inviteId", async () => {
    let invite: Invite;
    beforeEach(async () => {
      // set up scenario with a valid pending invite
      await addTeacherToClass(teacherUser1.id, classroom.id);
      invite = await createInvite(
        teacherUser1.id,
        teacherUser2.id,
        classroom.id,
      );
    });
    it("should respond with a `200` status code and an updated invite when the action is `accept`", async () => {
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
      const classTeacher2 = await prisma.classTeacher.findFirst({
        where: {
          teacherId: teacherUser2.id,
          classId: classroom.id,
        },
      });
      expect(classTeacher2).not.toBeNull();
      expect(classTeacher2!.teacherId).toBe(teacherUser2.id);
      expect(classTeacher2!.classId).toBe(classroom.id);
    });
    it("should respond with a `200` status code and an updated invite when the action is `decline`", async () => {
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
      const classTeacher2 = await prisma.classTeacher.findFirst({
        where: {
          teacherId: teacherUser2.id,
          classId: classroom.id,
        },
      });
      expect(classTeacher2).toBeNull();
    });
    it("should respond with a `400` status code when the action is neither `accept` nor `decline`", async () => {
      // we've got a scenario with a valid pending invite, test invalid action
      const { status, body } = await request(app)
        .patch(`/invite/${invite.inviteId}`)
        .set("Authorization", `Bearer ${teacherUser2.token}`)
        .send({
          action: "invalidaction",
        });

      expect(status).toBe(400);
      expect(body.error).toBe(
        "Bad request due to invalid syntax or data (validation error)",
      );
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
      const updatedInvite = await prisma.invite.findFirst({
        where: {
          inviteId: invite.inviteId,
        },
      });
      expect(updatedInvite).not.toBeNull();
      expect(updatedInvite).toStrictEqual(invite);

      // verify that the teacher was not added to the class
      const classTeacher2 = await prisma.classTeacher.findFirst({
        where: {
          teacherId: teacherUser2.id,
          classId: classroom.id,
        },
      });
      expect(classTeacher2).toBeNull();
    });
    it("should respond with a `400` status code when the invite does not exist", async () => {
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
      expect(body.message).toBe("Uitnodiging is niet pending of bestaat niet");
      // verify that the teacher was not added to the class
      const classTeacher2 = await prisma.classTeacher.findFirst({
        where: {
          teacherId: teacherUser2.id,
          classId: classroom.id,
        },
      });
      expect(classTeacher2).toBeNull();
    });
    it("should should respond with a `400` status code when the invite exists, but is not pending", async () => {
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
      expect(body.message).toBe("Uitnodiging is niet pending of bestaat niet");
      // verify that the invite wasn't updated
      const checkInvite: Invite | null = await prisma.invite.findFirst({
        where: {
          inviteId: invite.inviteId,
        },
      });
      expect(checkInvite).not.toBeNull();
      expect(checkInvite!.status).toStrictEqual(invite.status);
    });
    it("should respond with a `400` status code when the inviteId param is not a positive integer", async () => {
      // try to update an invite with an invalid inviteId
      const { status, body } = await request(app)
        .patch(`/invite/${"invalidid"}`)
        .set("Authorization", `Bearer ${teacherUser2.token}`)
        .send({
          action: "accept",
        });

      expect(status).toBe(400);
      expect(body.error).toBe(
        "Bad request due to invalid syntax or data (validation error)",
      );
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
  describe("[DELETE] /invite/:inviteId/class/:classId", async () => {
    let invite: Invite;
    beforeEach(async () => {
      // set up scenario with a valid invite
      await addTeacherToClass(teacherUser1.id, classroom.id);
      invite = await createInvite(
        teacherUser1.id,
        teacherUser2.id,
        classroom.id,
      );
    });
    it("should respond with a `200` status code and the deleted invite", async () => {
      // test deleting the invite
      const { status, body } = await request(app)
        .delete(`/invite/${invite.inviteId}/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body.invite).toStrictEqual(invite);
      expect(body.message).toBe("invite was succesfully deleted");
      // verify that the invite was deleted
      const deletedInvite = await prisma.invite.findUnique({
        where: {
          inviteId: invite.inviteId,
        },
      });
      expect(deletedInvite).toBeNull();
    });
    it("should respond with a `403` status code when the teacher trying to delete the invite is not part of the class", async () => {
      const teacherUser3: User & { teacher: Teacher; token: string } =
        await createTeacher("Jane", "Doe", "jane.doe@gmail.com");
      const { status, body } = await request(app)
        .delete(`/invite/${invite.inviteId}/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser3.token}`);

      expect(status).toBe(403);
      expect(body.message).toBe("Leerkracht is geen beheerder van de klas");
      // verify that the invite was not deleted
      const checkInvite = await prisma.invite.findUnique({
        where: {
          inviteId: invite.inviteId,
        },
      });
      expect(checkInvite).toStrictEqual(invite);
    });
    it("should let another teacher of the class delete the invite, even if they didn't create the invite", async () => {
      const teacherUser3: User & { teacher: Teacher; token: string } =
        await createTeacher("Jane", "Doe", "jane.doe@gmail.com");
      await addTeacherToClass(teacherUser3.id, classroom.id);
      const { status, body } = await request(app)
        .delete(`/invite/${invite.inviteId}/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser3.token}`); // teacher3 didn't create the invite, but is part of the class

      expect(status).toBe(200);
      expect(body.invite).toStrictEqual(invite);
      expect(body.message).toBe("invite was succesfully deleted");
      // verify that the invite was deleted
      const deletedInvite = await prisma.invite.findUnique({
        where: {
          inviteId: invite.inviteId,
        },
      });
      expect(deletedInvite).toBeNull();
    });
    it("should respond with a `404` status code when the invite does not exist", async () => {
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
      expect(body.error).toBe("Resource not found"); // this error message is defined in `errorMiddleware.ts`
    });
    it("should respond with a `400` status code when the params are not correct", async () => {
      const { status, body } = await request(app)
        .delete(`/invite/${"invalidinvidteid"}/class/${"invalidclassid"}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(400);
      expect(body.error).toBe(
        "Bad request due to invalid syntax or data (validation error)",
      );
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
  });
  describe("[GET] /invite/class/:classId", async () => {
    it("should respond with a `200` status code and a list of invites", async () => {
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
    it("should respond with a `403` status code when the teacher is not part of the class", async () => {
      // try to get invites for a class where the teacher is part of the class
      const { status, body } = await request(app)
        .get(`/invite/class/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(403);
      expect(body.message).toBe("Leerkracht is geen beheerder van de klas");
      expect(body.invites).toBeUndefined();
    });
    it("should respond with a `400` status code when the params are not correct", async () => {
      const { status, body } = await request(app)
        .get(`/invite/class/${"invalidclassid"}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(400);
      expect(body.error).toBe(
        "Bad request due to invalid syntax or data (validation error)",
      );
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
