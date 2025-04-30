import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import prisma from "./helpers/prisma";
import app from "../index";
import {
  Class,
  ClassAssignment,
  ClassStudent,
  ClassTeacher,
  Invite,
  JoinRequest,
  Prisma,
  Student,
  Teacher,
  User,
} from "@prisma/client";
import {
  addStudentToClass,
  addTeacherToClass,
  createClass,
  createInvite,
  createJoinRequest,
  createStudent,
  createTeacher,
} from "./helpers/testDataCreation";

const APP_URL: string = process.env.APP_URL || "http://localhost:5000";

let teacherUser1: User & { teacher: Teacher; token: string };
let classroom: Class;

let student1: User & { student: Student; token: string };
let student2: User & { student: Student; token: string };
let classroom1: Class;
let classroom2: Class;

describe("classroom tests", (): void => {
  beforeEach(async (): Promise<void> => {
    // create a teacher
    teacherUser1 = await createTeacher("Bob", "Boons", "bob.boons@gmail.com");
    // create a class
    classroom = await createClass("5A", "ABCD");

    student1 = await createStudent("Bert", "Plank", "bert.plank@gmail.com");
    student2 = await createStudent(
      "Ferdinand",
      "De Muis",
      "rip_ferdinand.de_muis@gmail.com",
    );

    classroom1 = await createClass("WEWI", "HIJM");
    classroom2 = await createClass("LAWI", "MIJN");

    await addStudentToClass(student1.id, classroom1.id);
    await addStudentToClass(student2.id, classroom1.id);
    await addStudentToClass(student1.id, classroom2.id);
  });

  describe("[GET] /class/teacher", (): void => {
    it("should respond with a `200` status code and a list of classes", async (): Promise<void> => {
      // add teacherUser1 to some classes
      await addTeacherToClass(teacherUser1.id, classroom.id);
      const classroom2: Class = await createClass("6A", "EFGH");
      await addTeacherToClass(teacherUser1.id, classroom2.id);

      // now test getting the classrooms
      const { status, body } = await request(app)
        .get("/class/teacher")
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body.classrooms).toBeDefined();
      expect(body.classrooms).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: classroom.id,
          }),
          expect.objectContaining({
            id: classroom2.id,
          }),
        ]),
      );
    });

    it("shouldn't allow a student to get the classes via the teacher route", async (): Promise<void> => {
      const studentUser: Prisma.UserGetPayload<{
        include: { student: true };
      }> & { token: string } = await createStudent(
        "Alice",
        "Anderson",
        "alan@gmail.com",
      );

      const { status, body } = await request(app)
        .get("/class/teacher")
        .set("Authorization", `Bearer ${studentUser.token}`);

      expect(body.classrooms).not.toBeDefined();
      expect(status).toBe(401);
      expect(body.error).toBe("UnauthorizedError");
      expect(body.message).toBe("Not a valid teacher.");
    });
  });

  describe("[GET] /class/student", (): void => {
    it("should respond with a `200` status code and a list of classes", async (): Promise<void> => {
      // create a student and add them to some classes
      const studentUser: Prisma.UserGetPayload<{
        include: { student: true };
      }> & { token: string } = await createStudent(
        "Alice",
        "Anderson",
        "alan@gmail.com",
      );
      await addStudentToClass(studentUser.id, classroom.id);
      const classroom2: Class = await createClass("6A", "EFGH");
      await addStudentToClass(studentUser.id, classroom2.id);

      // now test getting the classrooms
      const { status, body } = await request(app)
        .get("/class/student")
        .set("Authorization", `Bearer ${studentUser.token}`);

      expect(status).toBe(200);
      expectClassRoomArrayBody(body, classroom2);
    });

    it("shouldn't allow a teacher to get the classes via the student route", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get("/class/student")
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(body.classrooms).not.toBeDefined();
      expect(status).toBe(401);
      expect(body.error).toBe("UnauthorizedError");
      expect(body.message).toBe("Not a valid student.");
    });
  });

  describe("[POST] /class/teacher", (): void => {
    it("should respond with a `201` status code and a created class", async (): Promise<void> => {
      const { status, body } = await request(app)
        .post("/class/teacher")
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({ name: "6A" });

      expect(status).toBe(201);
      expect(body.message).toBe("Class successfully created.");
      expect(body.classroom).toBeDefined();

      // verify that class was created
      const createdClassroom: Prisma.ClassGetPayload<{
        include: { ClassTeacher: true };
      }> | null = await prisma.class.findFirst({
        where: { name: "6A" },
        include: { ClassTeacher: true },
      });

      expect(createdClassroom).toBeDefined();
      const classTeacher: ClassTeacher = createdClassroom!.ClassTeacher[0];
      expect(classTeacher.teacherId).toBe(teacherUser1.id);
    });

    it("should respond with a `400` status code and a message when no valid class name is provided", async (): Promise<void> => {
      const { status, body } = await request(app)
        .post("/class/teacher")
        .set("Authorization", `Bearer ${teacherUser1.token}`)
        .send({ name: "" });

      expect(status).toBe(400);
      expect(body.error).toBe("BadRequestError");
      expect(body.message).toBe("Class name is not valid.");
    });

    it("should not allow a student to create a class", async (): Promise<void> => {
      const studentUser: Prisma.UserGetPayload<{
        include: { student: true };
      }> & { token: string } = await createStudent(
        "Alice",
        "Anderson",
        "aaaaa@gmail.com",
      );
      const { status, body } = await request(app)
        .post("/class/teacher")
        .set("Authorization", `Bearer ${studentUser.token}`)
        .send({ name: "6A" });

      expect(status).toBe(401);
      expect(body.error).toBe("UnauthorizedError");
      expect(body.message).toBe("Not a valid teacher.");
    });
  });

  describe("[DELETE] /class/teacher/:classId", (): void => {
    it("should respond with a `204` status code", async (): Promise<void> => {
      // add teacherUser1 to class, so we can test deleting it
      await addTeacherToClass(teacherUser1.id, classroom.id);

      // also add some records related to the class, so we can test if they all get deleted when the class is deleted
      const studentUser1: Prisma.UserGetPayload<{
        include: { student: true };
      }> & { token: string } = await createStudent(
        "Alice",
        "Anderson",
        "aaaaa@gmail.com",
      );
      await addStudentToClass(studentUser1.id, classroom.id);
      await prisma.classStudent
        .findMany({ where: { classId: classroom.id } })
        .then((classStudents: ClassStudent[]): void => {
          expect(classStudents.length).toBe(1);
        });
      const studentUser2: Prisma.UserGetPayload<{
        include: { student: true };
      }> & { token: string } = await createStudent(
        "Bob",
        "Baker",
        "bobbaker@gmail.com",
      );
      await createJoinRequest(studentUser2.id, classroom.id);
      await prisma.joinRequest
        .findMany({ where: { classId: classroom.id } })
        .then((joinRequests: ClassStudent[]): void => {
          expect(joinRequests.length).toBe(1);
        });
      const teacherUser2: Prisma.UserGetPayload<{
        include: { teacher: true };
      }> & { token: string } = await createTeacher(
        "Charlie",
        "Chaplin",
        "char.ch@gmail.com",
      );
      await createInvite(teacherUser1.id, teacherUser2.id, classroom.id);
      await prisma.invite
        .findMany({ where: { classId: classroom.id } })
        .then((invites: Invite[]): void => {
          expect(invites.length).toBe(1);
        });

      // now test deleting the class
      const { status } = await request(app)
        .delete(`/class/teacher/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(204);
      // verify that class was deleted
      const deletedClass: Class | null = await prisma.class.findFirst({
        where: { id: classroom.id },
      });
      expect(deletedClass).toBeNull();

      // verify that all associated records were also deleted
      await verifyDeletionOfAllRelatedRecords();
    });

    it("should respond with a `403` status code and a message when the teacher is not associated with the class", async (): Promise<void> => {
      // try having a teacher delete a class they are not associated with
      const { status, body } = await request(app)
        .delete(`/class/teacher/${classroom.id}`)
        .set("Authorization", `Bearer ${teacherUser1.token}`); // teacherUser1 is not associated with the class

      expect(status).toBe(403);
      expect(body.error).toBe("AccessDeniedError");
      expect(body.message).toBe("Teacher is not a part of this class.");
      // verfiy that class not deleted
      await prisma.class
        .findUnique({ where: { id: classroom.id } })
        .then((classroom: Class | null): void => {
          expect(classroom).toBeDefined();
        });
    });

    it("should respond with a `404` status code when the class doesn't exist", async (): Promise<void> => {
      // try having a teacher delete a class they are not associated with
      const { status, body } = await request(app)
        .delete(`/class/teacher/1235`)
        .set("Authorization", `Bearer ${teacherUser1.token}`); // teacherUser1 is not associated with the class

      expect(status).toBe(404);
      expect(body.error).toBe("NotFoundError");
      expect(body.message).toBe("Class not found.");
    });
  });

  describe("[GET] /class/teacher/:classId/join-link", (): void => {
    it("should respond with a `200` status code and a join link", async (): Promise<void> => {
      // add teacherUser1 to class, so we can test getting the join link
      await addTeacherToClass(teacherUser1.id, classroom.id);
      let { status, body } = await request(app)
        .get(`/class/teacher/${classroom.id}/join-link`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body.joinLink).toStrictEqual(
        `${APP_URL}/join-request/student/join?joinCode=${classroom.code}`,
      );

      // also test if the join link works
      const studentUser: Prisma.UserGetPayload<{
        include: { student: true };
      }> & { token: string } = await createStudent(
        "Alice",
        "Anderson",
        "aaaaa@gmail.com",
      );
      ({ status, body } = await request(app)
        .post(`/join-request/student?joinCode=${classroom.code}`) // can't use body.joinLink here, because the APP_URL is different in the test environment
        .set("Authorization", `Bearer ${studentUser.token}`));

      expect(status).toBe(201);
      expect(body).toHaveProperty("joinRequest");
      expect(body.joinRequest).toHaveProperty("classId", classroom.id);
      expect(body.joinRequest).toHaveProperty("studentId", studentUser.id);
    });
    it("should respond with a `403` status code and a message when the teacher is not associated with the class", async (): Promise<void> => {
      // try getting the join link for a class the teacher is not associated with
      const { status, body } = await request(app)
        .get(`/class/teacher/${classroom.id}/join-link`)
        .set("Authorization", `Bearer ${teacherUser1.token}`); // teacherUser1 is not associated with the class

      expect(status).toBe(403);
      expect(body.error).toBe("AccessDeniedError");
      expect(body.message).toBe("Teacher is not a part of this class.");
      expect(body.joinLink).toBeUndefined();
    });

    it("should respond with `400` status code for invalid classId", async (): Promise<void> => {
      const { status, body } = await request(app)
        .delete("/class/teacher/not-a-number")
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(400);
      expect(body.error).toBe("BadRequestError");
      expect(body.message).toBe("invalid classId request parameter");
    });

    it("should respond with a `404` status code if the class does not exist", async (): Promise<void> => {
      // get an id that isn't used for any existing class in the database
      const maxClass: Class | null = await prisma.class.findFirst({
        orderBy: {
          id: "desc",
        },
      });
      const invalidClassId: number = (maxClass?.id ?? 0) + 1;

      const { status, body } = await request(app)
        .get(`/class/teacher/${invalidClassId}/join-link`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(404);
      expect(body.error).toBe("NotFoundError");
      expect(body.message).toBe("Class not found.");
      expect(body.joinLink).toBeUndefined();
    });
  });

  describe("[PATCH] /class/teacher/:classId/join-link", (): void => {
    it("should respond with a `200` status code and a new join link", async (): Promise<void> => {
      // add teacherUser1 to class, so we can test regenerating the join link
      await addTeacherToClass(teacherUser1.id, classroom.id);
      const { status, body } = await request(app)
        .patch(`/class/teacher/${classroom.id}/join-link`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      // verify that join code was updated in database
      const updatedClass: Class | null = await prisma.class.findUnique({
        where: { id: classroom.id },
      });
      expect(updatedClass).toBeDefined();
      expect(updatedClass!.code).not.toBe(classroom.code);
      expect(body.joinLink).toStrictEqual(
        `${APP_URL}/join-request/student/join?joinCode=${updatedClass!.code}`,
      );
    });

    it("should respond with a `403` status code and a message when the teacher is not associated with the class", async (): Promise<void> => {
      const { status, body } = await request(app)
        .patch(`/class/teacher/${classroom.id}/join-link`)
        .set("Authorization", `Bearer ${teacherUser1.token}`); // teacherUser1 is not associated with the class

      expect(status).toBe(403);
      expect(body.error).toBe("AccessDeniedError");
      expect(body.message).toBe("Teacher is not a part of this class.");
    });

    it("should respond with a `404` status code if the class does not exist", async (): Promise<void> => {
      // get an id that isn't used for any existing class in the database
      const maxClass: Class | null = await prisma.class.findFirst({
        orderBy: {
          id: "desc",
        },
      });
      const invalidClassId: number = (maxClass?.id ?? 0) + 1;

      const { status, body } = await request(app)
        .patch(`/class/teacher/${invalidClassId}/join-link`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(404);
      expect(body.error).toBe("NotFoundError");
      expect(body.message).toBe("Class not found.");
    });
  });

  describe("[GET] /class/teacher/:classId/student", (): void => {
    it("should respond with a `200` status code and a list of students", async (): Promise<void> => {
      await addTeacherToClass(teacherUser1.id, classroom.id);
      // add some students to the class
      const studentUser1: Prisma.UserGetPayload<{
        include: { student: true };
      }> & { token: string } = await createStudent(
        "Steven",
        "Mcclure",
        "velit.dui@hotmail.edu",
      );
      const studentUser2: Prisma.UserGetPayload<{
        include: { student: true };
      }> & { token: string } = await createStudent(
        "Omar",
        "Hawkins",
        "lobortis.quam@yahoo.couk",
      );
      await addStudentToClass(studentUser1.id, classroom.id);
      await addStudentToClass(studentUser2.id, classroom.id);

      // now test getting the students
      const { status, body } = await request(app)
        .get(`/class/teacher/${classroom.id}/student`)
        .set("Authorization", `Bearer ${teacherUser1.token}`); // teacherUser1 is associated with the class

      // verify the response
      expect(status).toBe(200);
      expectValidStudentArrayBody(body, studentUser1, studentUser2);
    });

    it("should respond with a `403` status code when the teacher is not associated with the class", async (): Promise<void> => {
      // try getting the students for a class the teacher is not associated with
      const { status, body } = await request(app)
        .get(`/class/teacher/${classroom.id}/student`)
        .set("Authorization", `Bearer ${teacherUser1.token}`); // teacherUser1 is not associated with the class

      expect(status).toBe(403);
      expect(body.error).toBe("AccessDeniedError");
      expect(body.message).toBe("Teacher is not a part of this class.");
      expect(body.students).toBeUndefined();
    });

    it("should respond with a `404` status code when the class does not exist", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/class/teacher/17839/student`)
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(404);
      expect(body.error).toBe("NotFoundError");
      expect(body.message).toBe("Class not found.");
    });
  });

  describe("[DELETE] /class/student/:classId", async (): Promise<void> => {
    it("should respond with a `204` status code when the student leaves the class", async (): Promise<void> => {
      const s: User & { student: Student; token: string } = await createStudent(
        "Bilbo",
        "Baggins",
        "bilbo.baggins@gmail.com",
      );
      const c: Class = await createClass("LATA", "EFGH");

      await addStudentToClass(s.id, c.id);

      // now test leaving the class
      const { status, body } = await request(app)
        .delete(`/class/student/${c.id}`)
        .set("Authorization", `Bearer ${s.token}`);
      expect(status).toBe(204);
      expect(body).toEqual({});

      const temp: ClassStudent | null = await prisma.classStudent.findUnique({
        where: {
          studentId_classId: {
            studentId: s.id,
            classId: c.id,
          },
        },
      });
      expect(temp).toBeNull();

      // Make sure user still exists
      const t: Student | null = await prisma.student.findUnique({
        where: {
          userId: s.id,
        },
      });
      expect(t).toBeDefined();
    });

    it("should respond with a `400` status code when the student is not in the class", async (): Promise<void> => {
      const s: User & { student: Student; token: string } = await createStudent(
        "Bilbo",
        "Baggins",
        "bilbo.baggins@gmail.com",
      );

      const c: Class = await createClass("LATA", "EFGH");

      const { status, body } = await request(app)
        .delete(`/class/student/${c.id}`)
        .set("Authorization", `Bearer ${s.token}`);

      expect(status).toBe(400);
      expect(body.message).toBe(
        "Student is not a part of this class and is therefore not able to leave it.",
      );
    });
  });

  describe("[GET] /class/student/:classId", async (): Promise<void> => {
    beforeEach(async (): Promise<void> => {});

    it("should respond with a `200` status code and the specified class", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/class/student/${classroom1.id}`)
        .set("Authorization", `Bearer ${student1.token}`);
      expect(status).toBe(200);
      expect(body.name).toBe(classroom1.name);
      expect(body.code).toBe(classroom1.code);
      expect(body.id).toBe(classroom1.id);
    });

    it("should return the same class for students that are in the same class", async (): Promise<void> => {
      const res = await request(app)
        .get(`/class/student/${classroom1.id}`)
        .set("Authorization", `Bearer ${student1.token}`);
      expect(res.status).toBe(200);

      const res2 = await request(app)
        .get(`/class/student/${classroom1.id}`)
        .set("Authorization", `Bearer ${student2.token}`);
      expect(res2.status).toBe(200);
      expect(res2.body).toEqual(res.body);
    });

    it("should respond with a `403` status code because the student is not a part of the class", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/class/student/${classroom2.id}`)
        .set("Authorization", `Bearer ${student2.token}`);

      expect(status).toBe(403);
      expect(body.message).toBe("Student is not a part of the given class.");
    });

    // Deze test moet later nog toegevoegd worden
    // it("should respond with a `404` status code when the class does not exist", async (): Promise<void> => {
    //   const { status, body } = await request(app)
    //     .get(`/class/student/78676`)
    //     .set("Authorization", `Bearer ${student2.token}`);

    //   expect(status).toBe(404);
    //   expect(body.error).toBe("NotFoundError");
    //   expect(body.message).toBe("Class not found.");
    // });
  });

  describe("[GET] /class/teacher/student", async (): Promise<void> => {
    it("should respond with a `200` status code and a list of classes", async (): Promise<void> => {
      // add teacherUser1 to some classes
      await addTeacherToClass(teacherUser1.id, classroom.id);

      // add a student to the classes
      await addStudentToClass(student1.id, classroom.id);

      const { status, body } = await request(app)
        .get("/class/teacher/student")
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body.classrooms).toBeDefined();
      expect(body.classrooms.length).toBe(1);
      expect(body.classrooms).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: classroom.id,
          }),
        ]),
      );
      expect(body.classrooms[0].classLinks).toBeDefined();
      expect(body.classrooms[0].classLinks[0].studentId).toBe(student1.id);
      expect(body.classrooms[0].classLinks[0].student.user).toEqual(
        expect.objectContaining({
          firstName: student1.firstName,
          lastName: student1.lastName,
          email: student1.email,
        }),
      );
    });

    it("should respond with a `200` status code and an empty list when the teacher has no classes", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get("/class/teacher/student")
        .set("Authorization", `Bearer ${teacherUser1.token}`);

      expect(status).toBe(200);
      expect(body.classrooms).toBeDefined();
      expect(body.classrooms.length).toBe(0);
      expect(body.classrooms).toEqual([]);
    });
  });
});

function expectClassRoomArrayBody(body: any, classroom2: Class): void {
  expect(body.classrooms).toBeDefined();
  expect(body.classrooms).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: classroom.id,
      }),
      expect.objectContaining({
        id: classroom2.id,
      }),
    ]),
  );
}

function expectValidStudentArrayBody(
  body: any,
  studentUser1: User,
  studentUser2: User,
): void {
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
    ]),
  );
}

async function verifyDeletionOfAllRelatedRecords(): Promise<void> {
  await prisma.classTeacher
    .findMany({ where: { classId: classroom.id } })
    .then((classTeachers: ClassTeacher[]): void => {
      expect(classTeachers.length).toBe(0);
    });
  await prisma.classStudent
    .findMany({ where: { classId: classroom.id } })
    .then((classStudents: ClassStudent[]): void => {
      expect(classStudents.length).toBe(0);
    });
  await prisma.invite
    .findMany({ where: { classId: classroom.id } })
    .then((invites: Invite[]): void => {
      expect(invites.length).toBe(0);
    });
  await prisma.joinRequest
    .findMany({ where: { classId: classroom.id } })
    .then((joinRequests: JoinRequest[]): void => {
      expect(joinRequests.length).toBe(0);
    });
  await prisma.classAssignment
    .findMany({ where: { classId: classroom.id } })
    .then((classAssignments: ClassAssignment[]): void => {
      expect(classAssignments.length).toBe(0);
    });
}
