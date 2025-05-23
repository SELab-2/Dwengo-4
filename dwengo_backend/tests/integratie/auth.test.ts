import { it, describe, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../index";
import prisma from "../helpers/prisma";
import { createStudent, createTeacher } from "../helpers/testDataCreation";

describe("Authentication API Tests", () => {
  describe("[POST] /auth/student/register", () => {
    it("should register a new student", async () => {
      const response = await request(app)
        .post("/api/auth/student/register")
        .send({
          firstName: "Jan",
          lastName: "Jansen",
          email: "student1@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);

      // verify user was created
      const user = await prisma.user.findUnique({
        where: { email: "student1@example.com" },
      });
      expect(user).not.toBeNull();
      expect(user!.role).toBe("STUDENT");
      expect(user!.email).toBe("student1@example.com");
      expect(user!.firstName).toBe("Jan");
      expect(user!.lastName).toBe("Jansen");

      // verify student was created
      const student = await prisma.student.findUnique({
        where: { userId: user!.id },
      });
      expect(student).not.toBeNull();
    });
    it("should respond with `400` when some fields are missing", async () => {
      const response = await request(app)
        .post("/api/auth/student/register")
        .send({}); // empty body

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "firstName",
            source: "body",
          }),
          expect.objectContaining({
            field: "lastName",
            source: "body",
          }),
          expect.objectContaining({
            field: "email",
            source: "body",
          }),
          expect.objectContaining({
            field: "password",
            source: "body",
          }),
        ]),
      );

      // verify no user was created
      await prisma.user.findMany().then((users) => {
        expect(users).toHaveLength(0);
      });
    });
    it("should respond with `400` when email is invalid", async () => {
      const response = await request(app).post("/api/auth/student/register").send({
        firstName: "Jan",
        lastName: "Jansen",
        email: "invaidemail",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            source: "body",
          }),
        ]),
      );

      // verify no user was created
      await prisma.user.findMany().then((users) => {
        expect(users).toHaveLength(0);
      });
    });
    it("should respond with `400` when password is too short", async () => {
      const response = await request(app).post("/api/auth/student/register").send({
        firstName: "Jan",
        lastName: "Jansen",
        email: "student1@example.com",
        password: "12345",
      });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "password",
            source: "body",
          }),
        ]),
      );

      // verify no user was created
      await prisma.user.findMany().then((users) => {
        expect(users).toHaveLength(0);
      });
    });
    it("should respond with `409` when email is already in use by a student", async () => {
      // create a student with the email
      const studentUser = await createStudent(
        "Jan",
        "Jansen",
        "student1@example.com",
      );

      // test creating a new student with the same email
      const response = await request(app).post("/api/auth/student/register").send({
        firstName: "Bob",
        lastName: "Bobsen",
        email: studentUser.email,
        password: "password123",
      });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe("ConflictError");
      expect(response.body.message).toBe("Email already in use.");

      // verify no additional student was created
      await prisma.user
        .findMany({ where: { email: studentUser.email } })
        .then((users) => {
          expect(users).toHaveLength(1);
        });
    });
    it("should respond with `409` when email is already in use by a teacher", async () => {
      // create a teacher with the email
      const teacherUser = await createTeacher(
        "Jan",
        "Jansen",
        "teacher1@example.com",
      );

      // test creating a new student with the same email
      const response = await request(app).post("/api/auth/student/register").send({
        firstName: "Bob",
        lastName: "Bobsen",
        email: teacherUser.email,
        password: "password123",
      });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe("ConflictError");
      expect(response.body.message).toBe("Email already in use.");

      // verify no additional user was created
      await prisma.user
        .findMany({ where: { email: teacherUser.email } })
        .then((users) => {
          expect(users).toHaveLength(1);
        });
    });
    it("should convert emails to lower case", async () => {
      // create a student with an uppercase email
      const response = await request(app).post("/api/auth/student/register").send({
        firstName: "Jan",
        lastName: "Jansen",
        email: "TEST@EXAMPLE.COM",
        password: "password123",
      });

      expect(response.status).toBe(201);
      // email should be converted to lowercase in the database
      const user = await prisma.user.findUnique({
        where: { email: "test@example.com" },
      });
      expect(user).not.toBeNull();
    });
  });

  describe("[POST] /auth/student/login", () => {
    beforeEach(async () => {
      // register a student
      await request(app)
        .post("/api/auth/student/register")
        .send({
          firstName: "Jan",
          lastName: "Jansen",
          email: "student1@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");
    });
    it("should login with registered student credentials", async () => {
      // test logging in
      const response = await request(app)
        .post("/api/auth/student/login")
        .send({
          email: "student1@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
    });
    it("should log in, even if the email is in uppercase", async () => {
      // test logging in with email in uppercase
      const response = await request(app)
        .post("/api/auth/student/login")
        .send({
          email: "StUdEnt1@eXAmpLe.COm",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
    });
    it("should fail login with non-registered email", async () => {
      const response = await request(app)
        .post("/api/auth/student/login")
        .send({
          email: "nietbestaande@student.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("NotFoundError");
      expect(response.body.message).toBe("Existing user not found.");
    });
    it("should fail login with correct email but wrong password", async () => {
      const response = await request(app)
        .post("/api/auth/student/login")
        .send({
          email: "student1@example.com",
          password: "wrongpassword",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("UnauthorizedError");
      expect(response.body.message).toBe("Incorrect password.");
    });
    it("should fail if request body is incorrect", async () => {
      const response = await request(app).post("/api/auth/student/login").send({}); // empty body

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            source: "body",
          }),
          expect.objectContaining({
            field: "password",
            source: "body",
          }),
        ]),
      );
    });
  });

  // same test cases as for student, but now for teacher routes
  describe("[POST] /auth/teacher/register", () => {
    it("should register a new teacher", async () => {
      const response = await request(app)
        .post("/api/auth/teacher/register")
        .send({
          firstName: "Piet",
          lastName: "Pietersen",
          email: "teacher1@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);

      // verify user was created
      const user = await prisma.user.findUnique({
        where: { email: "teacher1@example.com" },
      });
      expect(user).not.toBeNull();
      expect(user!.role).toBe("TEACHER");
      expect(user!.email).toBe("teacher1@example.com");
      expect(user!.firstName).toBe("Piet");
      expect(user!.lastName).toBe("Pietersen");

      // verify teacher was created
      const teacher = await prisma.teacher.findUnique({
        where: { userId: user!.id },
      });
      expect(teacher).not.toBeNull();
    });
    it("should respond with `400` when some fields are missing", async () => {
      const response = await request(app)
        .post("/api/auth/teacher/register")
        .send({}); // empty body

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "firstName",
            source: "body",
          }),
          expect.objectContaining({
            field: "lastName",
            source: "body",
          }),
          expect.objectContaining({
            field: "email",
            source: "body",
          }),
          expect.objectContaining({
            field: "password",
            source: "body",
          }),
        ]),
      );

      // verify no user was created
      await prisma.user.findMany().then((users) => {
        expect(users).toHaveLength(0);
      });
    });
    it("should respond with `400` when email is invalid", async () => {
      const response = await request(app).post("/api/auth/teacher/register").send({
        firstName: "Jan",
        lastName: "Jansen",
        email: "invaidemail",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            source: "body",
          }),
        ]),
      );

      // verify no user was created
      await prisma.user.findMany().then((users) => {
        expect(users).toHaveLength(0);
      });
    });
    it("should respond with `400` when password is too short", async () => {
      const response = await request(app).post("/api/auth/teacher/register").send({
        firstName: "Jan",
        lastName: "Jansen",
        email: "student1@example.com",
        password: "12345",
      });

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "password",
            source: "body",
          }),
        ]),
      );

      // verify no user was created
      await prisma.user.findMany().then((users) => {
        expect(users).toHaveLength(0);
      });
    });
    it("should respond with `409` when email is already in use by a student", async () => {
      // create a student with the email
      const studentUser = await createStudent(
        "Jan",
        "Jansen",
        "student1@example.com",
      );

      // test creating a new teacher with the same email
      const response = await request(app).post("/api/auth/teacher/register").send({
        firstName: "Bob",
        lastName: "Bobsen",
        email: studentUser.email,
        password: "password123",
      });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe("ConflictError");
      expect(response.body.message).toBe("Email already in use.");

      // verify no additional user was created
      await prisma.user
        .findMany({ where: { email: studentUser.email } })
        .then((users) => {
          expect(users).toHaveLength(1);
        });
    });
    it("should respond with `409` when email is already in use by a teacher", async () => {
      // create a teacher with the email
      const teacherUser = await createTeacher(
        "Jan",
        "Jansen",
        "teacher1@example.com",
      );

      // test creating a new teacher with the same email
      const response = await request(app).post("/api/auth/teacher/register").send({
        firstName: "Bob",
        lastName: "Bobsen",
        email: teacherUser.email,
        password: "password123",
      });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe("ConflictError");
      expect(response.body.message).toBe("Email already in use.");

      // verify no additional user was created
      await prisma.user
        .findMany({ where: { email: teacherUser.email } })
        .then((users) => {
          expect(users).toHaveLength(1);
        });
    });
    it("should convert emails to lowercase", async () => {
      // create a teacher with an uppercase email
      const response = await request(app).post("/api/auth/teacher/register").send({
        firstName: "Jan",
        lastName: "Jansen",
        email: "TEST@EXAMPLE.COM",
        password: "password123",
      });

      expect(response.status).toBe(201);
      // email should be converted to lowercase in the database
      const user = await prisma.user.findUnique({
        where: { email: "test@example.com" },
      });
      expect(user).not.toBeNull();
    });
  });

  describe("[POST] /auth/teacher/login", () => {
    beforeEach(async () => {
      // register a teacher
      await request(app).post("/api/auth/teacher/register").send({
        firstName: "Piet",
        lastName: "Pietersen",
        email: "teacher1@example.com",
        password: "password123",
      });
    });
    it("should login with registered teacher credentials", async () => {
      const response = await request(app)
        .post("/api/auth/teacher/login")
        .send({
          email: "teacher1@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
    });
    it("should log in, even if the email is in uppercase", async () => {
      // test logging in with email in uppercase
      const response = await request(app)
        .post("/api/auth/teacher/login")
        .send({
          email: "teACHer1@eXAMple.cOm",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
    });
    it("should fail login with non-registered email", async () => {
      const response = await request(app)
        .post("/api/auth/teacher/login")
        .send({
          email: "nietbestaande@teacher.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("NotFoundError");
      expect(response.body.message).toBe("Existing user not found.");
    });
    it("should fail login with correct email but wrong password", async () => {
      const response = await request(app)
        .post("/api/auth/teacher/login")
        .send({
          email: "teacher1@example.com",
          password: "wrongpassword",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("UnauthorizedError");
      expect(response.body.message).toBe("Incorrect password.");
    });
    it("should fail if request body is incorrect", async () => {
      const response = await request(app).post("/api/auth/teacher/login").send({}); // empty body

      expect(response.status).toBe(400);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: "email",
            source: "body",
          }),
          expect.objectContaining({
            field: "password",
            source: "body",
          }),
        ]),
      );
    });
  });
});
