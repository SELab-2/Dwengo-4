import { it, describe, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../index";
import prisma from "./helpers/prisma";

describe("Authentication API Tests", () => {
    describe("[POST] /student/auth/register", () => {
        it("1. Should register a new student", async () => {
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

            // verify user was created
            const user = await prisma.user.findUnique({ where: { email: "student1@example.com" } })
            expect(user).toBeDefined();
            expect(user!.role).toBe("STUDENT");
            expect(user!.email).toBe("student1@example.com");
            expect(user!.firstName).toBe("Jan");
            expect(user!.lastName).toBe("Jansen");

            // verify student was created
            const student = await prisma.student.findUnique({ where: { userId: user!.id } });
            expect(student).toBeDefined();
        });

        // TODO: extra tests voor bv. als je een ongeldige mail invult, als het wachtwoord niet lang genoeg is, 
        // als er al een gebruiker bestaat met die email, 
        // check dat email bv ook uppercase mag zijn (moet zelfde gedragen als lowercase)
    });

    describe("[POST] /student/auth/login", () => {
        beforeEach(async () => {
            // register a student
            await request(app)
                .post("/student/auth/register")
                .send({
                    firstName: "Jan",
                    lastName: "Jansen",
                    email: "student1@example.com",
                    password: "password123",
                })
                .set("Content-Type", "application/json");
        });
        it("2. Should login with registered student credentials", async () => {
            // test logging in
            const response = await request(app)
                .post("/student/auth/login")
                .send({
                    email: "student1@example.com",
                    password: "password123",
                })
                .set("Content-Type", "application/json");

            expect(response.status).toBe(200);
        });
        it("3. Should fail login with non-registered email", async () => {
            const response = await request(app)
                .post("/student/auth/login")
                .send({
                    email: "nietbestaande@student.com",
                    password: "password123",
                })
                .set("Content-Type", "application/json");

            expect(response.status).toBe(401);
        });
        it("4. Should fail login with correct email but wrong password", async () => {
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

    describe("[POST] /teacher/auth/register", () => {
        it("5. Should register a new teacher", async () => {
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

            // verify user was created
            const user = await prisma.user.findUnique({ where: { email: "teacher1@example.com" } })
            expect(user).toBeDefined();
            expect(user!.role).toBe("TEACHER");
            expect(user!.email).toBe("teacher1@example.com");
            expect(user!.firstName).toBe("Piet");
            expect(user!.lastName).toBe("Pietersen");

            // verify teacher was created
            const teacher = await prisma.teacher.findUnique({ where: { userId: user!.id } });
            expect(teacher).toBeDefined();
        });

        // again, some extra tests where registration fails needed

    });

    describe("[POST] /teacher/auth/login", () => {
        beforeEach(async () => {
            // register a teacher
            await request(app)
                .post("/teacher/auth/register")
                .send({
                    firstName: "Piet",
                    lastName: "Pietersen",
                    email: "teacher1@example.com",
                    password: "password123",
                });
        });
        it("6. Should login with registered teacher credentials", async () => {
            const response = await request(app)
                .post("/teacher/auth/login")
                .send({
                    email: "teacher1@example.com",
                    password: "password123",
                })
                .set("Content-Type", "application/json");

            expect(response.status).toBe(200);
        });
        it("7. Should fail login with non-registered email", async () => {
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
        it("8. Should fail login with correct email but wrong password", async () => {
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
