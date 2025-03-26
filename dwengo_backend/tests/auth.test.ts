import { it, describe, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../index";
import prisma from "./helpers/prisma";
import { createStudent } from "./helpers/testDataCreation";

describe("Authentication API Tests", () => {
    describe("[POST] /student/auth/register", () => {
        it("should register a new student", async () => {
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
            const user = await prisma.user.findUnique({ where: { email: "student1@example.com" } });
            expect(user).toBeDefined();
            expect(user!.role).toBe("STUDENT");
            expect(user!.email).toBe("student1@example.com");
            expect(user!.firstName).toBe("Jan");
            expect(user!.lastName).toBe("Jansen");

            // verify student was created
            const student = await prisma.student.findUnique({ where: { userId: user!.id } });
            expect(student).toBeDefined();
        });
        it("should respond with `400` when some fields are missing", async () => {
            const response = await request(app).post("/student/auth/register").send({}); // empty body

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
                ])
            );

            // verify no user was created
            await prisma.user.findMany().then((users) => {
                expect(users).toHaveLength(0);
            });
        });
        it("should respond with `400` when email is invalid", async () => {
            const response = await request(app).post("/student/auth/register").send({
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
                ])
            );

            // verify no user was created
            await prisma.user.findMany().then((users) => {
                expect(users).toHaveLength(0);
            });
        });

        it("should respond with `400` when password is too short", async () => {
            const response = await request(app).post("/student/auth/register").send({
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
                ])
            );

            // verify no user was created
            await prisma.user.findMany().then((users) => {
                expect(users).toHaveLength(0);
            });
        });
        it("should respond with `409` when email is already in use by a student", async () => {
            // create a student with the email
            const studentUser1 = await createStudent("Jan", "Jansen", "student1@example.com");

            // test creating a new student with the same email
            const response = await request(app).post("/student/auth/register").send({
                firstName: "Bob",
                lastName: "Bobsen",
                email: studentUser1.email,
                password: "password123",
            });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe("Gebruiker bestaat al");

            // verify no additional student was created
            await prisma.user.findMany({ where: { email: studentUser1.email } }).then((users) => {
                expect(users).toHaveLength(1);
            });
        });
        it("should respond with `400` when email is already in use by a teacher", async () => {});

        it("should accept uppercase emails", async () => {});
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
            const user = await prisma.user.findUnique({ where: { email: "teacher1@example.com" } });
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
            await request(app).post("/teacher/auth/register").send({
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
