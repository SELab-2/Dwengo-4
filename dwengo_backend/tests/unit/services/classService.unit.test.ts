import { beforeEach, describe, expect, it, vi } from "vitest";
import ClassService, { ClassWithLinks } from "../../../services/classService";
import prisma from "../../../config/prisma"; // auto-mocked
import {
  AccessDeniedError,
  BadRequestError,
  NotFoundError,
} from "../../../errors/errors";
import { Class, ClassStudent } from "@prisma/client";

// stub handlePrismaTransaction zodat createClass onze mocks direct aanroept
vi.mock("../../../errors/errorFunctions", async () => {
  const actual = await vi.importActual("../../../errors/errorFunctions");
  return {
    ...actual,
    handlePrismaTransaction: vi.fn((prismaClient, callback: any) =>
      callback(prismaClient),
    ),
  };
});
vi.mock("../../../config/prisma");

describe("ClassService", () => {
  const now = new Date();
  const mockClass: Class = {
    id: 1,
    name: "Science",
    code: "abc123",
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createClass", () => {
    it("maakt een klas aan en koppelt een leerkracht", async () => {
      (prisma.class.create as vi.Mock).mockResolvedValue(mockClass);
      (prisma.classTeacher.create as vi.Mock).mockResolvedValue({});

      const result = await ClassService.createClass("Science", 1);

      expect(prisma.class.create).toHaveBeenCalledWith({
        data: { name: "Science", code: expect.any(String) },
      });
      expect(prisma.classTeacher.create).toHaveBeenCalledWith({
        data: { teacherId: 1, classId: mockClass.id },
      });
      expect(result).toEqual(mockClass);
    });
  });

  describe("deleteClass", () => {
    it("verwijdert klas als teacher rechten heeft", async () => {
      (prisma.class.findUnique as vi.Mock).mockResolvedValue(mockClass);
      (prisma.class.delete as vi.Mock).mockResolvedValue(mockClass);
      vi.spyOn(ClassService, "isTeacherOfClass").mockResolvedValue();

      const res = await ClassService.deleteClass(1, 1);
      expect(res).toEqual(mockClass);
    });

    it("gooit NotFoundError bij onbekende klas", async () => {
      (prisma.class.findUnique as vi.Mock).mockResolvedValue(null);
      await expect(ClassService.deleteClass(1, 1)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("gooit AccessDeniedError bij geen rechten", async () => {
      (prisma.class.findUnique as vi.Mock).mockResolvedValue(mockClass);
      vi.spyOn(ClassService, "isTeacherOfClass").mockRejectedValue(
        new AccessDeniedError("not allowed"),
      );
      await expect(ClassService.deleteClass(1, 2)).rejects.toThrow(
        AccessDeniedError,
      );
    });
  });

  describe("getClassesByTeacher", () => {
    it("geeft alle klassen van een teacher terug", async () => {
      (prisma.class.findMany as vi.Mock).mockResolvedValue([mockClass]);
      const res = await ClassService.getClassesByTeacher(1);
      expect(res).toEqual([mockClass]);
    });
  });

  describe("getClassesByStudent", () => {
    it("geeft alle klassen van student", async () => {
      (prisma.class.findMany as vi.Mock).mockResolvedValue([mockClass]);
      const res = await ClassService.getClassesByStudent(1);
      expect(res).toEqual([mockClass]);
    });
  });

  describe("leaveClassAsStudent", () => {
    it("verwijdert student uit klas", async () => {
      const rel = { studentId: 1, classId: 1 };
      (prisma.classStudent.findUnique as vi.Mock).mockResolvedValue(rel);
      (prisma.classStudent.delete as vi.Mock).mockResolvedValue(rel);

      const result = await ClassService.leaveClassAsStudent(1, 1);
      expect(result).toEqual(rel);
    });

    it("gooit error als student niet in klas zit", async () => {
      (prisma.classStudent.findUnique as vi.Mock).mockResolvedValue(null);
      await expect(ClassService.leaveClassAsStudent(1, 1)).rejects.toThrow(
        BadRequestError,
      );
    });
  });

  describe("updateClass", () => {
    it("update klas naam na controle teacher", async () => {
      (prisma.class.findUnique as vi.Mock).mockResolvedValue(mockClass);
      vi.spyOn(ClassService, "isTeacherOfClass").mockResolvedValue();
      (prisma.class.update as vi.Mock).mockResolvedValue({
        ...mockClass,
        name: "Wiskunde",
      });

      const res = await ClassService.updateClass(1, 1, "Wiskunde");
      expect(res.name).toBe("Wiskunde");
    });
  });

  describe("getJoinCode", () => {
    it("geeft joincode als teacher rechten heeft", async () => {
      (prisma.class.findUnique as vi.Mock).mockResolvedValue({
        code: "abcdef",
      });
      vi.spyOn(ClassService, "isTeacherOfClass").mockResolvedValue();
      const res = await ClassService.getJoinCode(1, 1);
      expect(res).toBe("abcdef");
    });

    it("gooit NotFoundError bij onbekende klas", async () => {
      (prisma.class.findUnique as vi.Mock).mockResolvedValue(null);
      await expect(ClassService.getJoinCode(99, 1)).rejects.toThrow(
        NotFoundError,
      );
    });

    it("gooit AccessDeniedError bij geen rechten", async () => {
      (prisma.class.findUnique as vi.Mock).mockResolvedValue({
        code: "abcdef",
      });
      vi.spyOn(ClassService, "isTeacherOfClass").mockRejectedValue(
        new AccessDeniedError("no"),
      );
      await expect(ClassService.getJoinCode(1, 2)).rejects.toThrow(
        AccessDeniedError,
      );
    });
  });

  describe("generateUniqueCode", () => {
    it("genereert unieke code", async () => {
      (prisma.class.findUnique as vi.Mock).mockResolvedValue(null);
      const code = await ClassService.generateUniqueCode();
      expect(code).toHaveLength(8);
    });
  });

  describe("getClassByJoinCode", () => {
    it("gooit error als join code ontbreekt", async () => {
      await expect(ClassService.getClassByJoinCode("")).rejects.toThrow(
        BadRequestError,
      );
    });

    it("geeft klas terug als join code geldig is", async () => {
      (prisma.class.findUnique as vi.Mock).mockResolvedValue({
        ...mockClass,
        classLinks: [],
      });
      const res = await ClassService.getClassByJoinCode("abc123");
      expect(res.code).toBe("abc123");
    });
  });

  describe("isStudentInClass", () => {
    it("laat niets vallen als student in klas zit", () => {
      const classroom: ClassWithLinks = {
        ...mockClass,
        classLinks: [{ studentId: 1, classId: 1 }],
      };
      expect(() => ClassService.isStudentInClass(classroom, 1)).not.toThrow();
    });

    it("gooit AccessDeniedError als student niet in klas zit", () => {
      const classroom: ClassWithLinks = {
        ...mockClass,
        classLinks: [{ studentId: 99, classId: 1 }],
      };
      expect(() => ClassService.isStudentInClass(classroom, 1)).toThrow(
        AccessDeniedError,
      );
    });
  });

  describe("leaveClassAsStudent (alias removeStudentFromClass)", () => {
    it("verwijdert student uit klas", async () => {
      const deletionResult: ClassStudent = {
        studentId: 1,
        classId: 1,
      };
      (prisma.classStudent.findUnique as vi.Mock).mockResolvedValue(
        deletionResult,
      );
      (prisma.classStudent.delete as vi.Mock).mockResolvedValue(deletionResult);

      // call the existing leaveClassAsStudent
      const res = await ClassService.leaveClassAsStudent(1, 1);
      expect(res.studentId).toBe(1);
    });
  });
});
