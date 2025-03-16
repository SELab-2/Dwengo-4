import { beforeAll, describe, test, expect } from "vitest";
import request from "supertest";
import app from "../index";
import prisma from "./helpers/prisma";

describe("Authentication API Tests", () => {
  beforeAll(async () => {
    await prisma.$transaction([
      prisma.joinRequest.deleteMany(),
      prisma.classStudent.deleteMany(),
      prisma.classTeacher.deleteMany(),
      prisma.class.deleteMany(),
      prisma.student.deleteMany(),
      prisma.teacher.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  });

  describe("Student Registration & Login", () => {
    test("1. Should register a new student", async () => {
      const response = await request(app)
        .post("/student/auth/register")
        .send({
          firstName: "Jan",
          lastName: "Jansen",
          email: "student1@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
    });

    test("2. Should login with registered student credentials", async () => {
      const response = await request(app)
        .post("/student/auth/login")
        .send({
          email: "student1@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
    });

    test("3. Should fail login with non-registered email", async () => {
      const response = await request(app)
        .post("/student/auth/login")
        .send({
          email: "nietbestaande@student.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(401);
    });

    test("4. Should fail login with correct email but wrong password", async () => {
      const response = await request(app)
        .post("/student/auth/login")
        .send({
          email: "student1@example.com",
          password: "wrongpassword",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(401);
      // Uncomment when you want to test specific error messages
      // expect(response.body).toHaveProperty("error");
      // expect(response.body.error).toContain("Ongeldig wachtwoord");
    });
  });

  describe("Teacher Registration & Login", () => {
    test("5. Should register a new teacher", async () => {
      const response = await request(app)
        .post("/teacher/auth/register")
        .send({
          firstName: "Piet",
          lastName: "Pietersen",
          email: "teacher1@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(201);
    });

    test("6. Should login with registered teacher credentials", async () => {
      const response = await request(app)
        .post("/teacher/auth/login")
        .send({
          email: "teacher1@example.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(200);
    });

    test("7. Should fail login with non-registered email", async () => {
      const response = await request(app)
        .post("/teacher/auth/login")
        .send({
          email: "nietbestaande@teacher.com",
          password: "password123",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(401);
      // Uncomment when you want to test specific error messages
      // expect(response.body).toHaveProperty("error");
      // expect(response.body.error).toContain("Ongeldige gebruiker");
    });

    test("8. Should fail login with correct email but wrong password", async () => {
      const response = await request(app)
        .post("/teacher/auth/login")
        .send({
          email: "teacher1@example.com",
          password: "wrongpassword",
        })
        .set("Content-Type", "application/json");

      expect(response.status).toBe(401);
      // Uncomment when you want to test specific error messages
      // expect(response.body).toHaveProperty("error");
      // expect(response.body.error).toContain("Ongeldig wachtwoord");
    });
  });
});
