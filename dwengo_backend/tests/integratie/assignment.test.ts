import { beforeEach, describe, expect, it } from "vitest";
import { Assignment, Teacher, User } from "@prisma/client";
import app from "../../index";
import { createTeacher } from "../helpers/testDataCreation";
import request from "supertest";
import prisma from "../helpers/prisma";

const getAuthHeaders = (
  user: User & { token: string },
): { Authorization: string } => ({
  Authorization: `Bearer ${user.token}`,
});

describe("Assignment test", (): void => {
  let teacherUser1: User & { teacher: Teacher; token: string };

  beforeEach(async (): Promise<void> => {
    teacherUser1 = await createTeacher("Bob", "Boons", "bob.boons@gmail.com");
  });

  describe("[GET] /assignment/:assignmentId", (): void => {
    const nonExistentId = 123;
    it("should return 404 when the assignment isn't found", async (): Promise<void> => {
      const { status, body } = await request(app)
        .get(`/api/assignment/${nonExistentId}`)
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
  });
});
