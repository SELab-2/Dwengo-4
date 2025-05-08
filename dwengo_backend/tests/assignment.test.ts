import { beforeEach, describe, expect, it } from "vitest";
import { Assignment, Class, Teacher, User } from "@prisma/client";
import app from "../index";
import {
  addTeacherToClass,
  createAssignment,
  createClass,
  createTeacher,
} from "./helpers/testDataCreation";
import request from "supertest";
import prisma from "./helpers/prisma";

const getAuthHeaders = (
  user: User & { token: string },
): { Authorization: string } => ({
  Authorization: `Bearer ${user.token}`,
});

describe("Assignment test", (): void => {
  let teacherUser1: User & { teacher: Teacher; token: string };
  let teacherUser2: User & { teacher: Teacher; token: string };
  let assignment1: Assignment;
  let class1: Class;
  const learningPathId = "Leerpad";
  const title = "Nieuwe taak";
  const description = "beschrijving";
  const deadline = new Date("2025-05-28");

  beforeEach(async (): Promise<void> => {
    teacherUser1 = await createTeacher("Bob", "Boons", "bob.boons@gmail.com");
    teacherUser2 = await createTeacher(
      "Kathleen",
      "Aerts",
      "alice.aerts@gmail.com",
    );

    class1 = await createClass("LAWI", "code");

    await addTeacherToClass(teacherUser2.id, class1.id);

    assignment1 = await createAssignment(
      class1.id,
      learningPathId,
      title,
      description,
      deadline,
    );
  });

  describe("[GET] /assignment/:assignmentId", (): void => {
    const nonExistentId = 123;
    it("should return 404 when the assignment isn't found", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/assignment/${nonExistentId}`)
        .set(getAuthHeaders(teacherUser1));

      expect(status).toBe(404);
      expect(body.error).toBe("NotFoundError");
      expect(body.message).toBe("Assignment not found.");

      // Verify the assignment does not actually exist in the database
      const assignment: Assignment | null = await prisma.assignment.findUnique({
        where: { id: nonExistentId },
      });
      expect(assignment).toBeNull();
    });

    it("should return the assignment when it is found", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/assignment/${assignment1.id}`)
        .set(getAuthHeaders(teacherUser1));

      expect(status).toBe(200);
      expect(body.title).toBe(title);
      expect(new Date(body.deadline)).toStrictEqual(deadline);
      expect(body.pathRef).toBe(learningPathId);
      expect(body.description).toBe(description);
    });
  });
});
