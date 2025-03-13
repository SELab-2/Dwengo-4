import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import prisma from "./helpers/prisma";
import app from "../index";
import { Assignment, Class, LearningPath, Teacher, User } from "@prisma/client";
import {
  addTeacherToClass,
  createAssignment,
  createClass,
  createLearningPath,
  createTeacher,
  stringToDate,
} from "./helpers/testDataCreation";

describe("Tests for teacherAssignment", async () => {
  let teacher1: User & { teacher: Teacher; token: string };
  let teacher2: User & { teacher: Teacher; token: string };
  let teacher3: User & { teacher: Teacher; token: string };

  let class1: Class;
  let class2: Class;

  let class3: Class;

  let lp1: LearningPath;
  let lp2: LearningPath;
  let lp3: LearningPath;
  let lp4: LearningPath;

  let assignment1: Assignment;
  let assignment2: Assignment;
  let assignment3: Assignment;
  let assignment4: Assignment;
  let assignment5: Assignment;

  beforeEach(async () => {
    // create some classes
    class1 = await createClass("1LA", "ABCD");
    class2 = await createClass("3LAWI", "EFGH");
    class3 = await createClass("6LAWI", "IJKL");
    // create a teacher
    teacher1 = await createTeacher("Bob", "Boons", "bob.boons@gmail.com");
    teacher2 = await createTeacher("Alice", "Aerts", "alice.aerts@gmail.com");
    teacher3 = await createTeacher(
      "Charlie",
      "Ceulemans",
      "charlie.ceulemans@gmail.com"
    );
    // create some learning paths
    lp1 = await createLearningPath(
      "LP1",
      "Learning Path 1",
      teacher1.teacher.userId
    );
    lp2 = await createLearningPath(
      "LP2",
      "Learning Path 2",
      teacher2.teacher.userId
    );
    lp3 = await createLearningPath(
      "LP3",
      "Learning Path 3",
      teacher2.teacher.userId
    );
    lp4 = await createLearningPath(
      "LP4",
      "Learning Path 4",
      teacher3.teacher.userId
    );

    // Add teacher to classes
    addTeacherToClass(teacher1.id, class1.id);
    addTeacherToClass(teacher2.id, class1.id);
    addTeacherToClass(teacher3.id, class2.id);

    addTeacherToClass(teacher1.id, class3.id);
    // Create assignments
    assignment1 = await createAssignment(
      class1.id,
      lp1.id,
      new Date("2026-10-23")
    );
    assignment2 = await createAssignment(
      class1.id,
      lp2.id,
      new Date("2026-04-17")
    );
    assignment3 = await createAssignment(
      class2.id,
      lp3.id,
      new Date("2026-10-19")
    );

    assignment4 = await createAssignment(
      class2.id,
      lp4.id,
      new Date("2026-10-17")
    );
    assignment5 = await createAssignment(
      class2.id,
      lp1.id,
      new Date("2025-05-28")
    );
  });

  afterEach(async () => {
    // clear the database
    await prisma.$transaction([
      prisma.classAssignment.deleteMany(),
      prisma.assignment.deleteMany(),
      prisma.learningPath.deleteMany(),
      prisma.classTeacher.deleteMany(),
      prisma.class.deleteMany(),
      prisma.teacher.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  });

  describe("[POST] /teacher/assignments", async () => {
    it("should respond with a `201` status code and the newly created assignment", async () => {
      // class3 has no assignments
      const { status, body } = await request(app)
        .post("/teacher/assignments/")
        .set("Authorization", `Bearer ${teacher1.token}`)
        .send({
          classId: class3.id,
          learningPathId: lp1.id,
          deadline: "2026-10-23",
        });
      expect(status).toBe(201);
      expect(body.deadline).toStrictEqual(new Date("2026-10-23").toISOString());
      expect(body.learningPathId).toBe(lp1.id);
    });
    it("should respond with a `500` status code because the teacher is not a member of the class", async () => {
      // class3 has no assignments
      const { status, body } = await request(app)
        .post("/teacher/assignments/")
        .set("Authorization", `Bearer ${teacher2.token}`)
        .send({
          classId: class3.id,
          learningPathId: lp1.id,
          deadline: "2026-10-23",
        });
      expect(status).toBe(500);
      expect(body.error).toBe("Failed to create assignment");
    });
  });

  describe("[GET] /teacher/assignments/class/:classId", async () => {
    it("should respond with a `200` status code and a list of assignments for that class", async () => {
      const { status, body } = await request(app)
        .get(`/teacher/assignments/class/${class1.id}`)
        .set("Authorization", `Bearer ${teacher1.token}`);

      expect(status).toBe(200);
      expect(body).toHaveLength(2);
      stringToDate(body, 2);

      expect(body[0].id).toStrictEqual(assignment1.id);
      expect(body[0].deadline).toStrictEqual(assignment1.deadline);
      expect(body[1].id).toStrictEqual(assignment2.id);
      expect(body[1].deadline).toStrictEqual(assignment2.deadline);
    });

    it("should respond with the same assignments for teachers that are members of the same class", async () => {
      let req = await request(app)
        .get(`/teacher/assignments/class/${class1.id}`)
        .set("Authorization", `Bearer ${teacher1.token}`);

      let req2 = await request(app)
        .get(`/teacher/assignments/class/${class1.id}`)
        .set("Authorization", `Bearer ${teacher2.token}`);

      expect(req.status).toBe(200);
      expect(req2.status).toBe(200);

      expect(req.body).toHaveLength(2);
      expect(req2.body).toHaveLength(2);

      expect(req.body).toStrictEqual(req2.body);
    });

    it("should respond with an error because the teacher is not part of the class", async () => {
      const { status, body } = await request(app)
        .get(`/teacher/assignments/class/${class1.id}`)
        .set("Authorization", `Bearer ${teacher3.token}`);
      expect(status).toBe(500);
      expect(body.error).toBe("Failed to retrieve assignments");
    });
  });

  describe("[PATCH] /teacher/assignments/:assignmentId", async () => {
    it("should respond with a `200` status code and the updated assignment", async () => {
      // First create assignment for class3
      const { status, body } = await request(app)
        .post("/teacher/assignments/")
        .set("Authorization", `Bearer ${teacher1.token}`)
        .send({
          classId: class3.id,
          learningPathId: lp1.id,
          deadline: "2026-10-23",
        });

      expect(status).toBe(201);
      const assignmentId = body.id;

      let req = await request(app)
        .patch(`/teacher/assignments/${assignmentId}`)
        .set("Authorization", `Bearer ${teacher1.token}`)
        .send({
          learningPathId: lp2.id,
        });

      expect(req.status).toBe(200);
      expect(req.body.learningPathId).toBe(lp2.id);
      expect(req.body.deadline).toStrictEqual(
        new Date("2026-10-23").toISOString()
      );
      expect(req.body.updatedAt).not.toStrictEqual(body.updatedAt);
    });

    it("should respond with a `500` status code because the teacher is not a member of the class", async () => {
      // First create assignment for class3
      await request(app)
        .post("/teacher/assignments/")
        .set("Authorization", `Bearer ${teacher1.token}`)
        .send({
          classId: class3.id,
          learningPathId: lp1.id,
          deadline: "2026-10-23",
        });

      const { status, body } = await request(app)
        .patch(`/teacher/assignments/${assignment1.id}`)
        .set("Authorization", `Bearer ${teacher3.token}`)
        .send({
          learningPathId: lp2.id,
        });

      expect(status).toBe(500);
      expect(body.error).toBe("Failed to update assignment");
    });
  });
});
