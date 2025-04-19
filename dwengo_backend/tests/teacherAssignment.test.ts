import { beforeEach, describe, expect, it } from "vitest";
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

describe("Tests for teacherAssignment", async (): Promise<void> => {
  let teacher1: User & { teacher: Teacher; token: string };
  let teacher2: User & { teacher: Teacher; token: string };
  let teacher3: User & { teacher: Teacher; token: string };

  let class1: Class;
  let class2: Class;

  let class3: Class;

  let lp1: LearningPath;
  let lp2: LearningPath;
  let lp3: LearningPath;

  let assignment1: Assignment;
  let assignment2: Assignment;
  let assignment3: Assignment;

  beforeEach(async (): Promise<void> => {
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
      "charlie.ceulemans@gmail.com",
    );
    // create some learning paths
    lp1 = await createLearningPath(
      "LP1",
      "Learning Path 1",
      teacher1.teacher.userId,
    );
    lp2 = await createLearningPath(
      "LP2",
      "Learning Path 2",
      teacher2.teacher.userId,
    );
    lp3 = await createLearningPath(
      "LP3",
      "Learning Path 3",
      teacher2.teacher.userId,
    );
    await createLearningPath("LP4", "Learning Path 4", teacher3.teacher.userId);

    // Add teacher to classes
    await addTeacherToClass(teacher1.id, class1.id);
    await addTeacherToClass(teacher2.id, class1.id);
    await addTeacherToClass(teacher2.id, class2.id);
    await addTeacherToClass(teacher3.id, class2.id);

    await addTeacherToClass(teacher1.id, class3.id);
    // Create assignments
    assignment1 = await createAssignment(
      class1.id,
      lp1.id,
      "title1",
      "description1",
      new Date("2026-10-23"),
    );
    assignment2 = await createAssignment(
      class1.id,
      lp2.id,
      "title2",
      "description2",
      new Date("2026-04-17"),
    );
    assignment3 = await createAssignment(
      class2.id,
      lp3.id,
      "title3",
      "description3",
      new Date("2026-10-19"),
    );
  });

  describe("[POST] /assignment/teacher", async (): Promise<void> => {
    it("should respond with a `201` status code and the newly created assignment", async (): Promise<void> => {
      // class3 has no assignments
      const { status, body } = await request(app)
        .post("/assignment/teacher")
        .set("Authorization", `Bearer ${teacher1.token}`)
        .send({
          classId: class3.id,
          pathRef: lp1.id,
          deadline: "2026-10-23",
          pathLanguage: "nl",
          title: "Learning Path 1",
          description: "description1",
          teamSize: 2,
        });
      expect(status).toBe(201);
      expect(body.assignment.deadline).toStrictEqual(
        new Date("2026-10-23").toISOString(),
      );
      expect(body.assignment.pathRef).toBe(lp1.id);
    });

    it("should respond with a `403` status code because the teacher is not a member of the class", async (): Promise<void> => {
      // class3 has no assignments
      const { status, body } = await request(app)
        .post("/assignment/teacher")
        .set("Authorization", `Bearer ${teacher2.token}`)
        .send({
          classId: class3.id,
          pathRef: lp1.id,
          deadline: "2026-10-23",
          pathLanguage: "nl",
          title: "Learning Path 1",
          description: "description1",
        });
      expect(status).toBe(403);
      expect(body.error).toBe("AccessDeniedError");
      expect(body.message).toBe("Teacher does not teach this class.");
    });
  });

  describe("[GET] /assignment/teacher/class/:classId", async (): Promise<void> => {
    it("should respond with a `200` status code and a list of assignments for that class", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/assignment/teacher/class/${class1.id}`)
        .set("Authorization", `Bearer ${teacher1.token}`);

      expect(status).toBe(200);
      expect(body).toHaveLength(2);
      stringToDate(body, 2);

      expect(body[0].id).toStrictEqual(assignment1.id);
      expect(body[0].deadline).toStrictEqual(assignment1.deadline);
      expect(body[1].id).toStrictEqual(assignment2.id);
      expect(body[1].deadline).toStrictEqual(assignment2.deadline);
    });

    it("should respond with the same assignments for teachers that are members of the same class", async (): Promise<void> => {
      const req = await request(app)
        .get(`/assignment/teacher/class/${class1.id}`)
        .set("Authorization", `Bearer ${teacher1.token}`);

      const req2 = await request(app)
        .get(`/assignment/teacher/class/${class1.id}`)
        .set("Authorization", `Bearer ${teacher2.token}`);

      expect(req.status).toBe(200);
      expect(req2.status).toBe(200);

      expect(req.body).toHaveLength(2);
      expect(req2.body).toHaveLength(2);

      expect(req.body).toStrictEqual(req2.body);
    });

    it("should respond with an error because the teacher is not part of the class", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/assignment/teacher/class/${class1.id}`)
        .set("Authorization", `Bearer ${teacher3.token}`);
      expect(status).toBe(403);
      expect(body.error).toBe("AccessDeniedError");
      expect(body.message).toBe("Teacher does not teach this class.");
    });
  });

  describe("[PATCH] /assignment/teacher/:assignmentId", async (): Promise<void> => {
    it("should respond with a `201` status code and the updated assignment", async (): Promise<void> => {
      // First create assignment for class3
      const { status, body } = await request(app)
        .post(`/assignment/teacher/${assignment1.id}`)
        .set("Authorization", `Bearer ${teacher1.token}`)
        .send({
          classId: class3.id,
          pathRef: lp1.id,
          deadline: "2026-10-23",
          pathLanguage: "nl",
          title: "Learning Path 1",
          description: "description1",
          teamSize: 2,
        });

      expect(status).toBe(201);
      const assignmentId: number = body.id;

      const req = await request(app)
        .patch(`/assignment/teacher/${assignmentId}`)
        .set("Authorization", `Bearer ${teacher1.token}`)
        .send({
          pathRef: lp2.id,
        });

      expect(req.status).toBe(200);
      expect(req.body.pathRef).toBe(lp2.id);
      expect(req.body.deadline).toStrictEqual(
        new Date("2026-10-23").toISOString(),
      );
      expect(req.body.updatedAt).not.toStrictEqual(body.updatedAt);
    });

    it("should respond with a `500` status code because the teacher is not a member of the class", async (): Promise<void> => {
      // First create assignment for class3
      await request(app)
        .post("/assignment/teacher")
        .set("Authorization", `Bearer ${teacher1.token}`)
        .send({
          classId: class3.id,
          learningPathId: lp1.id,
          deadline: "2026-10-23",
        });

      const { status, body } = await request(app)
        .patch(`/assignment/teacher/${assignment1.id}`)
        .set("Authorization", `Bearer ${teacher3.token}`)
        .send({
          learningPathId: lp2.id,
        });

      expect(status).toBe(500);
      expect(body.error).toBe("Failed to update assignment");
    });
  });

  describe("[DELETE] /assignment/teacher/:assignmentId", async (): Promise<void> => {
    it("should respond with a `204` status code and delete the assignment", async (): Promise<void> => {
      const { status } = await request(app)
        .delete(`/assignment/teacher/${assignment3.id}`)
        .set("Authorization", `Bearer ${teacher2.token}`);
      expect(status).toBe(204);

      // Check if assignment is actually gone from database
      const assignment: Assignment | null = await prisma.assignment.findUnique({
        where: { id: assignment3.id },
      });
      expect(assignment).toBeNull();
    });

    it("should respond with a `500` status code because the teacher is not a member of the class", async (): Promise<void> => {
      const { status, body } = await request(app)
        .delete(`/assignment/teacher/${assignment1.id}`)
        .set("Authorization", `Bearer ${teacher3.token}`);

      expect(status).toBe(500);
      expect(body.error).toBe("Failed to delete assignment");
    });
  });

  describe("[GET] /assignment/teacher", async (): Promise<void> => {
    it("should respond with a `200` status code and return all the assignments of the teacher", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/assignment/teacher`)
        .set("Authorization", `Bearer ${teacher1.token}`);

      expect(status).toBe(200);
      expect(body).toHaveLength(2);
      expect(body.map((elem: { id: number }): number => elem.id)).toContain(
        assignment1.id,
      );
      expect(body.map((elem: { id: number }): number => elem.id)).toContain(
        assignment2.id,
      );
    });
  });
});
