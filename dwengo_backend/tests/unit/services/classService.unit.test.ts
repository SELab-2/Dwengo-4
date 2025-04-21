import { describe, it, expect, vi, beforeEach } from "vitest";
import ClassService, { ClassWithLinks } from "../../../services/classService";
import prisma from "../../../config/prisma";
import { AccesDeniedError, BadRequestError, NotFoundError } from "../../../errors/errors";
import { Class, ClassStudent, User, Student } from "@prisma/client";

// 🔒 Mock prisma
vi.mock("../../../config/prisma", () => ({
  default: {
    class: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    classTeacher: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    classStudent: {
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe("ClassService 🧪", () => {
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
      (prisma.class.create as any).mockResolvedValue(mockClass);
      (prisma.classTeacher.create as any).mockResolvedValue({});

      const result = await ClassService.createClass("Science", 1);
      expect(result).toEqual(mockClass);
    });
  });

  describe("deleteClass", () => {
    it("verwijdert klas als teacher rechten heeft", async () => {
      vi.spyOn(ClassService, "isTeacherOfClass").mockResolvedValue(true);
      (prisma.class.findUnique as any).mockResolvedValue(mockClass);
      (prisma.class.delete as any).mockResolvedValue(mockClass);

      const res = await ClassService.deleteClass(1, 1);
      expect(res).toEqual(mockClass);
    });

    it("gooit NotFoundError bij onbekende klas", async () => {
      (prisma.class.findUnique as any).mockResolvedValue(null);
      await expect(ClassService.deleteClass(1, 1)).rejects.toThrow(NotFoundError);
    });

    it("gooit AccesDeniedError bij geen rechten", async () => {
      (prisma.class.findUnique as any).mockResolvedValue(mockClass);
      vi.spyOn(ClassService, "isTeacherOfClass").mockResolvedValue(false);
      await expect(ClassService.deleteClass(1, 2)).rejects.toThrow(AccesDeniedError);
    });
  });

  describe("getClassesByTeacher", () => {
    it("geeft alle klassen van een teacher terug", async () => {
      (prisma.class.findMany as any).mockResolvedValue([mockClass]);
      const res = await ClassService.getClassesByTeacher(1);
      expect(res).toEqual([mockClass]);
    });
  });

  describe("getClassesByStudent", () => {
    it("geeft alle klassen van student", async () => {
      (prisma.class.findMany as any).mockResolvedValue([mockClass]);
      const res = await ClassService.getClassesByStudent(1);
      expect(res).toEqual([mockClass]);
    });
  });

  describe("leaveClassAsStudent", () => {
    it("verwijdert student uit klas", async () => {
      const rel = { studentId: 1, classId: 1 };
      (prisma.classStudent.findUnique as any).mockResolvedValue(rel);
      (prisma.classStudent.delete as any).mockResolvedValue(rel);

      const result = await ClassService.leaveClassAsStudent(1, 1);
      expect(result).toEqual(rel);
    });

    it("gooit error als student niet in klas zit", async () => {
      (prisma.classStudent.findUnique as any).mockResolvedValue(null);
      await expect(ClassService.leaveClassAsStudent(1, 1)).rejects.toThrow(BadRequestError);
    });
  });

  describe("updateClass", () => {
    it("update klas naam na controle teacher", async () => {
      (prisma.class.findUnique as any).mockResolvedValue(mockClass);
      vi.spyOn(ClassService, "isTeacherOfClass").mockResolvedValue(true);
      (prisma.class.update as any).mockResolvedValue({ ...mockClass, name: "Wiskunde" });

      const res = await ClassService.updateClass(1, 1, "Wiskunde");
      expect(res.name).toBe("Wiskunde");
    });
  });

  describe("getJoinCode", () => {
    it("geeft joincode als teacher rechten heeft", async () => {
      (prisma.class.findUnique as any).mockResolvedValue({ code: "abcdef" });
      vi.spyOn(ClassService, "isTeacherOfClass").mockResolvedValue(true);
      const res = await ClassService.getJoinCode(1, 1);
      expect(res).toBe("abcdef");
    });

    it("gooit NotFoundError bij onbekende klas", async () => {
      (prisma.class.findUnique as any).mockResolvedValue(null);
      await expect(ClassService.getJoinCode(99, 1)).rejects.toThrow(NotFoundError);
    });

    it("gooit AccesDeniedError bij geen rechten", async () => {
      (prisma.class.findUnique as any).mockResolvedValue({ code: "abcdef" });
      vi.spyOn(ClassService, "isTeacherOfClass").mockResolvedValue(false);
      await expect(ClassService.getJoinCode(1, 2)).rejects.toThrow(AccesDeniedError);
    });
  });

  describe("generateUniqueCode", () => {
    it("genereert unieke code", async () => {
      (prisma.class.findUnique as any).mockResolvedValue(null);
      const code = await ClassService.generateUniqueCode();
      expect(code).toHaveLength(8);
    });
  });

  describe("getClassByJoinCode", () => {
    it("gooit error als join code ontbreekt", async () => {
      await expect(ClassService.getClassByJoinCode("")).rejects.toThrow(BadRequestError);
    });

    it("geeft klas terug als join code geldig is", async () => {
      (prisma.class.findUnique as any).mockResolvedValue({
        ...mockClass,
        classLinks: [],
      });
      const res = await ClassService.getClassByJoinCode("abc123");
      expect(res?.code).toBe("abc123");
    });
  });

  describe("isStudentInClass", () => {
    it("checkt of student al in klas zit", async () => {
      const classroom: ClassWithLinks = {
        ...mockClass,
        classLinks: [{ studentId: 1, classId: 1 }],
      };
      const result = await ClassService.isStudentInClass(classroom, 1);
      expect(result).toBe(true);
    });

    it("geeft false terug als student niet in klas", async () => {
      const classroom: ClassWithLinks = {
        ...mockClass,
        classLinks: [{ studentId: 99, classId: 1 }],
      };
      const result = await ClassService.isStudentInClass(classroom, 1);
      expect(result).toBe(false);
    });
  });

  describe("removeStudentFromClass", () => {
    it("verwijdert student uit klas", async () => {
      const deletionResult: ClassStudent = {
        studentId: 1,
        classId: 1,
      };
      (prisma.classStudent.delete as any).mockResolvedValue(deletionResult);
      const res = await ClassService.removeStudentFromClass(1, 1);
      expect(res.studentId).toBe(1);
    });
  });
});
