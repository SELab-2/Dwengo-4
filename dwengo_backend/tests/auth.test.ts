import axios from "axios";
import { beforeAll, describe, test, expect } from "vitest";

import prisma from "./helpers/prisma";

// Base URL for our API
const API_URL = "http://localhost:5000";

describe("Authentication API Tests", async () => {
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
      const response = await axios.post(
        `${API_URL}/student/auth/register`,
        {
          firstName: "Jan",
          lastName: "Jansen",
          email: "student1@example.com",
          password: "password123",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      expect(response.status).toBe(201);
    });

    test("2. Should login with registered student credentials", async () => {
      const response = await axios.post(
        `${API_URL}/student/auth/login`,
        {
          email: "student1@example.com",
          password: "password123",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      expect(response.status).toBe(200);
    });

    test("3. Should fail login with non-registered email", async () => {
      try {
        const response = await axios.post(
          `${API_URL}/student/auth/login`,
          {
            email: "nietbestaande@student.com",
            password: "password123",
          },
          { headers: { "Content-Type": "application/json" } }
        );
        // If the request does not throw, it means the status was not 401
        throw new Error(`Expected status 401 but received ${response.status}`);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          expect(error.response.status).toBe(401);
        } else {
          throw error; // Re-throw if it's not an Axios error or doesn't have a response
        }
      }
    });

    test("4. Should fail login with correct email but wrong password", async () => {
      try {
        await axios.post(
          `${API_URL}/student/auth/login`,
          {
            email: "student1@example.com",
            password: "wrongpassword",
          },
          { headers: { "Content-Type": "application/json" } }
        );
        throw new Error("Expected request to fail");
      } catch (error) {
        if (error.message === "Expected request to fail") {
          throw error;
        }
        // Check for expected error message
        //expect(error.response.data).toHaveProperty("error");
        //expect(error.response.data.error).toContain("Ongeldig wachtwoord");
      }
    });
  });

  describe("Teacher Registration & Login", () => {
    test("5. Should register a new teacher", async () => {
      const response = await axios.post(
        `${API_URL}/teacher/auth/register`,
        {
          firstName: "Piet",
          lastName: "Pietersen",
          email: "teacher1@example.com",
          password: "password123",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      expect(response.status).toBe(201);
    });

    test("6. Should login with registered teacher credentials", async () => {
      const response = await axios.post(
        `${API_URL}/teacher/auth/login`,
        {
          email: "teacher1@example.com",
          password: "password123",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      expect(response.status).toBe(200);
    });

    test("7. Should fail login with non-registered email", async () => {
      try {
        await axios.post(
          `${API_URL}/teacher/auth/login`,
          {
            email: "nietbestaande@teacher.com",
            password: "password123",
          },
          { headers: { "Content-Type": "application/json" } }
        );
        throw new Error("Expected request to fail");
      } catch (error) {
        if (error.message === "Expected request to fail") {
          throw error;
        }
        // Check for expected error message
        //expect(error.response.data).toHaveProperty("error");
        //expect(error.response.data.error).toContain("Ongeldige gebruiker");
      }
    });

    test("8. Should fail login with correct email but wrong password", async () => {
      try {
        await axios.post(
          `${API_URL}/teacher/auth/login`,
          {
            email: "teacher1@example.com",
            password: "wrongpassword",
          },
          { headers: { "Content-Type": "application/json" } }
        );
        throw new Error("Expected request to fail");
      } catch (error) {
        console.log(error);
        if (error.message === "Expected request to fail") {
          throw error;
        }
        // Check for expected error message
        //expect(error.response.data).toHaveProperty("error");
        //expect(error.response.data.error).toContain("Ongeldig wachtwoord");
      }
    });
  });
});
