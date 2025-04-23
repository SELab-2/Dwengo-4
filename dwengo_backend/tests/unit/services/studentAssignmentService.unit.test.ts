import { describe, it, expect, afterEach, vi } from "vitest";
import {
  getAssignmentsForStudent,
  getAssignmentsForStudentInClass,
  isStudentInClass,
} from "../../../services/studentAssignmentService";

import prisma from "../../../config/prisma";
import { AccesDeniedError } from "../../../errors/errors";

// Gebruik de juiste mock via __mocks__/prisma
vi.mock("../../../config/prisma");

describe("studentAssignmentService", () => {
  const mockAssignments = [
    { id: 1, title: "Assignment A", createdAt: new Date() },
    { id: 2, title: "Assignment B", createdAt: new Date() },
  ];

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getAssignmentsForStudent", () => {
    it("should return assignments for a student with correct sorting and limit", async () => {
      (prisma.assignment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockAssignments);

      const result = await getAssignmentsForStudent(1, ["title"], "asc", 10);

      expect(prisma.assignment.findMany).toHaveBeenCalledWith({
        where: {
          classAssignments: {
            some: {
              class: {
                classLinks: {
                  some: { studentId: 1 },
                },
              },
            },
          },
        },
        orderBy: [{ title: "asc" }],
        take: 10,
      });

      expect(result).toEqual(mockAssignments);
    });

    it("should handle empty result gracefully", async () => {
      (prisma.assignment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const result = await getAssignmentsForStudent(99, ["createdAt"], "desc", 5);
      expect(result).toEqual([]);
    });

    it("should support multiple sort fields", async () => {
      (prisma.assignment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockAssignments);

      await getAssignmentsForStudent(1, ["createdAt", "title"], "desc", 5);

      expect(prisma.assignment.findMany).toHaveBeenCalledWith({
        where: {
          classAssignments: {
            some: {
              class: {
                classLinks: {
                  some: { studentId: 1 },
                },
              },
            },
          },
        },
        orderBy: [{ createdAt: "desc" }, { title: "desc" }],
        take: 5,
      });
    });
  });

  describe("getAssignmentsForStudentInClass", () => {
    it("should return assignments for student in specific class", async () => {
      (prisma.assignment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockAssignments);

      const result = await getAssignmentsForStudentInClass(2, 99, ["title"], "asc", 3);

      expect(prisma.assignment.findMany).toHaveBeenCalledWith({
        where: {
          classAssignments: {
            some: {
              classId: 99,
              class: {
                classLinks: {
                  some: { studentId: 2 },
                },
              },
            },
          },
        },
        orderBy: [{ title: "asc" }],
        take: 3,
      });

      expect(result).toEqual(mockAssignments);
    });

    it("should return empty array when student has no assignments in class", async () => {
      (prisma.assignment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const result = await getAssignmentsForStudentInClass(2, 12345, ["createdAt"], "desc", 2);
      expect(result).toEqual([]);
    });
  });

  describe("isStudentInClass", () => {
    it("should not throw error if student is in class", async () => {
      (prisma.classStudent.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        studentId: 5,
        classId: 88,
      });

      await expect(isStudentInClass(5, 88)).resolves.not.toThrow();
    });

    it("should throw AccesDeniedError if student is not in class", async () => {
      (prisma.classStudent.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(isStudentInClass(3, 77)).rejects.toThrow(AccesDeniedError);
    });
  });
});
