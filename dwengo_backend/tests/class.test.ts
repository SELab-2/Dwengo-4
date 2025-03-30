import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import prisma from "./helpers/prisma";
import app from "../index";
import { Class, Teacher, User } from "@prisma/client";
import {
  addStudentToClass,
  addTeacherToClass,
  createClass,
  createInvite,
  createJoinRequest,
  createStudent,
  createTeacher,
} from "./helpers/testDataCreation";

const APP_URL = process.env.APP_URL || "http://localhost:5000";

let teacherUser1: User & { teacher: Teacher; token: string };
let classroom: Class;

describe("classroom tests", () => {
    
    beforeEach(async () => {
        // create a teacher
        teacherUser1 = await createTeacher("Bob", "Boons", "bob.boons@gmail.com");
        // create a class
        classroom = await createClass("5A", "ABCD");
    });
    describe("GET /class/teacher", () => {
        it("should respond with a `200` status code and a list of classes", async () => {
            // add teacherUser1 to some classes
            await addTeacherToClass(teacherUser1.id, classroom.id);
            const classroom2: Class = await createClass("6A", "EFGH");
            await addTeacherToClass(teacherUser1.id, classroom2.id);

            // now test getting the classes
            const { status, body } = await request(app)
                .get("/class/teacher")
                .set("Authorization", `Bearer ${teacherUser1.token}`);

        expect(status).toBe(200);
        expect(body.classes).toBeDefined();
        expect(body.classes).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: classroom.id,
            }),
            expect.objectContaining({
              id: classroom2.id,
            }),
          ])
        );
      });
      it("shouldn't allow a student to get the classes via the teacher route", async () => {
        const studentUser = await createStudent("Alice", "Anderson", "alan@gmail.com");
        const { status, body } = await request(app)
          .get("/class/teacher")
          .set("Authorization", `Bearer ${studentUser.token}`);

        expect(body.classes).not.toBeDefined();
        expect(status).toBe(401);
        expect(body.error).toBe("Leerkracht niet gevonden.");
      });
    });

    describe("GET /class/student", () => {
      it("should respond with a `200` status code and a list of classes", async () => {
        // create a student and add them to some classes
        const studentUser = await createStudent("Alice", "Anderson", "alan@gmail.com");
        await addStudentToClass(studentUser.id, classroom.id);
        const classroom2: Class = await createClass("6A", "EFGH");
        await addStudentToClass(studentUser.id, classroom2.id);

        // now test getting the classes
        const { status, body } = await request(app)
          .get("/class/student")
          .set("Authorization", `Bearer ${studentUser.token}`);

        expect(status).toBe(200);
        expect(body.classes).toBeDefined();
        expect(body.classes).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: classroom.id,
            }),
            expect.objectContaining({
              id: classroom2.id,
            }),
          ])
        );
      });
      it("shouldn't allow a teacher to get the classes via the student route", async () => {
        const { status, body } = await request(app)
          .get("/class/student")
          .set("Authorization", `Bearer ${teacherUser1.token}`);

        expect(body.classes).not.toBeDefined();
        expect(status).toBe(401);
        expect(body.error).toBe("Student niet gevonden.");
      });
    });
  });

  describe("POST /class/teacher", () => {
    it("should respond with a `201` status code and a created class", async () => {
      const { status, body } = await request(app)
        .post("/class/teacher")
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({ name: "6A" });

      expect(status).toBe(201);
      expect(body.message).toBe("Klas aangemaakt");
      expect(body.classroom).toBeDefined();
      // verify that class was created
      const createdClassroom = await prisma.class.findFirst({
        where: { name: "6A" },
        include: { ClassTeacher: true },
      });
      expect(createdClassroom).toBeDefined();
      expect(createdClassroom!.ClassTeacher[0].teacherId).toBe(teacherUser1.id);
    });
    it("should respond with a `400` status code and a message when no valid class name is provided", async () => {
      const { status, body } = await request(app)
        .post("/class/teacher")
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({ name: "" });

      expect(status).toBe(400);
      expect(body.message).toBe("Vul een geldige klasnaam in");
    });
    it("should not allow a student to create a class", async () => {
      const studentUser = await createStudent(
        "Alice",
        "Anderson",
        "aaaaa@gmail.com"
      );
      const { status, body } = await request(app)
        .post("/class/teacher")
        .set("Authorization", `Bearer ${studentUser.token}`)
        .send({ name: "6A" });

      expect(status).toBe(401);
      expect(body.error).toBe("Leerkracht niet gevonden.");
    });
  });
  describe("DELETE /class/teacher/:classId", () => {
    it("should respond with a `200` status code and a message when the class is deleted", async () => {
      // add teacherUser1 to class, so we can test deleting it
      await addTeacherToClass(teacherUser1.id, classroom.id);

      // also add some records related to the class, so we can test if they all get deleted when the class is deleted
      const studentUser1 = await createStudent(
        "Alice",
        "Anderson",
        "aaaaa@gmail.com"
      );
      await addStudentToClass(studentUser1.id, classroom.id);
      await prisma.classStudent
        .findMany({ where: { classId: classroom.id } })
        .then((classStudents) => {
          expect(classStudents.length).toBe(1);
        });
      const studentUser2 = await createStudent(
        "Bob",
        "Baker",
        "bobbaker@gmail.com"
      );
      await createJoinRequest(studentUser2.id, classroom.id);
      await prisma.joinRequest
        .findMany({ where: { classId: classroom.id } })
        .then((joinRequests) => {
          expect(joinRequests.length).toBe(1);
        });
      const teacherUser2 = await createTeacher(
        "Charlie",
        "Chaplin",
        "char.ch@gmail.com"
      );
      await createInvite(teacherUser1.id, teacherUser2.id, classroom.id);
      await prisma.invite
        .findMany({ where: { classId: classroom.id } })
        .then((invites) => {
          expect(invites.length).toBe(1);
        });

      // now test deleting the class
      const { status, body } = await request(app)
        .delete(`/class/teacher/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body.message).toBe(`Klas met id ${classroom.id} verwijderd`);
      // verify that class was deleted
      const deletedClass = await prisma.class.findFirst({
        where: { id: classroom.id },
      });
      expect(deletedClass).toBeNull();

      // verify that all associated records were also deleted
      await prisma.classTeacher
        .findMany({ where: { classId: classroom.id } })
        .then((classTeachers) => {
          expect(classTeachers.length).toBe(0);
        });
      await prisma.classStudent
        .findMany({ where: { classId: classroom.id } })
        .then((classStudents) => {
          expect(classStudents.length).toBe(0);
        });
      await prisma.invite
        .findMany({ where: { classId: classroom.id } })
        .then((invites) => {
          expect(invites.length).toBe(0);
        });
      await prisma.joinRequest
        .findMany({ where: { classId: classroom.id } })
        .then((joinRequests) => {
          expect(joinRequests.length).toBe(0);
        });
      await prisma.classAssignment
        .findMany({ where: { classId: classroom.id } })
        .then((classAssignments) => {
          expect(classAssignments.length).toBe(0);
        });
    });
    it("should respond with a `403` status code and a message when the teacher is not associated with the class", async () => {
      // try having a teacher delete a class they are not associated with
      const { status, body } = await request(app)
        .delete(`/class/teacher/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`); // teacherUser1 is not associated with the class

      expect(status).toBe(403);
      expect(body.message).toBe(
        `Acces denied: Teacher ${teacherUser1.id} is not part of class ${classroom.id}`
      );
      // verfiy that class not deleted
      await prisma.class
        .findUnique({ where: { id: classroom.id } })
        .then((classroom) => {
          expect(classroom).toBeDefined();
        });
    });
  });
  describe("GET /class/teacher/:classId/join-link", () => {
    it("should respond with a `200` status code and a join link", async () => {
      // add teacherUser1 to class, so we can test getting the join link
      await addTeacherToClass(teacherUser1.id, classroom.id);
      const { status, body } = await request(app)
        .get(`/class/teacher/${classroom.id}/join-link`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body.joinLink).toStrictEqual(
        `${APP_URL}/class/teacher/join?joinCode=${classroom.code}`
      );

      // also test if the join link works
      const studentUser = await createStudent(
        "Alice",
        "Anderson",
        "aaaaa@gmail.com"
      );
      const joinLinkResponse = await request(app)
        .post(`/class/student/join?joinCode=${classroom.code}`) // can't use body.joinLink here, because the APP_URL is different in the test environment
        .set("Authorization", `Bearer ${studentUser.token}`);

      expect(joinLinkResponse.status).toBe(201);
      expect(joinLinkResponse.body).toHaveProperty("joinRequest");
      expect(joinLinkResponse.body.joinRequest).toHaveProperty(
        "classId",
        classroom.id
      );
      expect(joinLinkResponse.body.joinRequest).toHaveProperty(
        "studentId",
        studentUser.id
      );
    });
    it("should respond with a `403` status code and a message when the teacher is not associated with the class", async () => {
      // try getting the join link for a class the teacher is not associated with
      const { status, body } = await request(app)
        .get(`/class/teacher/${classroom.id}/join-link`)
        .set("Authorization", `Bearer ${teacherUser1.token}`); // teacherUser1 is not associated with the class

      expect(status).toBe(403);
      expect(body.message).toBe(
        `Acces denied: Teacher ${teacherUser1.id} is not part of class ${classroom.id}`
      );
      expect(body.joinLink).toBeUndefined();
    });
    it("should respond with a `404` status code if the class does not exist", async () => {
      // get an id that isn't used for any existing class in the database
      const maxClass = await prisma.class.findFirst({
        orderBy: {
          id: "desc",
        },
      });
      const invalidClassId = (maxClass?.id ?? 0) + 1;

      const { status, body } = await request(app)
        .get(`/class/teacher/${invalidClassId}/join-link`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(404);
      expect(body.message).toBe(`Class with id ${invalidClassId} not found`);
      expect(body.joinLink).toBeUndefined();
    });
  });
  describe("PATCH /class/teacher/:classId/join-link", () => {
    it("should respond with a `200` status code and a new join link", async () => {
      // add teacherUser1 to class, so we can test regenerating the join link
      await addTeacherToClass(teacherUser1.id, classroom.id);
      const { status, body } = await request(app)
        .patch(`/class/teacher/${classroom.id}/join-link`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      // verify that join code was updated in database
      const updatedClass = await prisma.class.findUnique({
        where: { id: classroom.id },
      });
      expect(updatedClass).toBeDefined();
      expect(updatedClass!.code).not.toBe(classroom.code);
      expect(body.joinLink).toStrictEqual(
        `${APP_URL}/class/teacher/join?joinCode=${updatedClass!.code}`
      );
    });
    it("should respond with a `403` status code and a message when the teacher is not associated with the class", async () => {
      const { status, body } = await request(app)
        .patch(`/class/teacher/${classroom.id}/join-link`)
        .set("Authorization", `Bearer ${teacherUser1.token}`); // teacherUser1 is not associated with the class

      expect(status).toBe(403);
      expect(body.message).toBe(
        `Acces denied: Teacher ${teacherUser1.id} is not part of class ${classroom.id}`
      );
    });
    it("should respond with a `404` status code if the class does not exist", async () => {
      // get an id that isn't used for any existing class in the database
      const maxClass = await prisma.class.findFirst({
        orderBy: {
          id: "desc",
        },
      });
      const invalidClassId = (maxClass?.id ?? 0) + 1;

      const { status, body } = await request(app)
        .patch(`/class/teacher/${invalidClassId}/join-link`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(404);
      expect(body.message).toBe(`Class with id ${invalidClassId} not found`);
    });
  });
  describe("GET /class/teacher/:classId", () => {
    it("should respond with a `200` status code and a list of students", async () => {
      await addTeacherToClass(teacherUser1.id, classroom.id);
      // add some students to the class
      const studentUser1 = await createStudent(
        "Steven",
        "Mcclure",
        "velit.dui@hotmail.edu"
      );
      const studentUser2 = await createStudent(
        "Omar",
        "Hawkins",
        "lobortis.quam@yahoo.couk"
      );
      await addStudentToClass(studentUser1.id, classroom.id);
      await addStudentToClass(studentUser2.id, classroom.id);

      // now test getting the students
      const { status, body } = await request(app)
        .get(`/class/teacher/${classroom.id}/student`)
        .set("Authorization", `Bearer ${teacherUser1.token}`); // teacherUser1 is associated with the class

      // verify the response
      expect(status).toBe(200);
      expect(body.students).toBeDefined();
      expect(body.students.length).toBe(2);
      expect(body.students).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId: studentUser1.id,
            user: expect.objectContaining({
              firstName: studentUser1.firstName,
              lastName: studentUser1.lastName,
              email: studentUser1.email,
            }),
          }),
          expect.objectContaining({
            userId: studentUser2.id,
            user: expect.objectContaining({
              firstName: studentUser2.firstName,
              lastName: studentUser2.lastName,
              email: studentUser2.email,
            }),
          }),
        ])
      );
    });
    it("should respond with a `403` status code when the teacher is not associated with the class", async () => {
      // try getting the students for a class the teacher is not associated with
      const { status, body } = await request(app)
        .get(`/class/teacher/${classroom.id}/student`)
        .set("Authorization", `Bearer ${teacherUser1.token}`); // teacherUser1 is not associated with the class

      expect(status).toBe(403);
      expect(body.message).toBe(
        `Acces denied: Teacher ${teacherUser1.id} is not part of class ${classroom.id}`
      );
      expect(body.students).toBeUndefined();
    });
    it("should respond with a `404` status code when the class does not exist", async () => {
      // try getting the students for a class that doesn't exist
      const maxClass = await prisma.class.findFirst({
        orderBy: {
          id: "desc",
        },
      });
      const invalidClassId = (maxClass?.id ?? 0) + 1;

      const { status, body } = await request(app)
        .get(`/class/teacher/${invalidClassId}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(404);
      expect(body.message).toBe(`Class with id ${invalidClassId} not found`);
      expect(body.students).toBeUndefined();
    });
  });
});
