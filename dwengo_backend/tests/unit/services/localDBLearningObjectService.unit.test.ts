import { describe, it, expect, beforeEach, vi } from "vitest";
import * as service from "../../../services/localDBLearningObjectService";
import prisma from "../../../config/prisma";
import { LearningObject } from "@prisma/client";

// Mocks
vi.mock("../../../config/prisma", () => ({
  default: {
    learningObject: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

const mockObject: LearningObject = {
  id: "abc123",
  uuid: "uuid-123",
  hruid: "obj-hruid",
  version: 1,
  language: "nl",
  title: "Titel",
  description: "Beschrijving",
  contentType: "video",
  keywords: ["coding"],
  targetAges: [12, 14],
  teacherExclusive: false,
  skosConcepts: ["concept"],
  copyright: "Dwengo",
  licence: "MIT",
  difficulty: 2,
  estimatedTime: 30,
  available: true,
  contentLocation: "/videos/abc",
  createdAt: new Date("2023-01-01"),
  updatedAt: new Date("2023-01-02"),
};

describe("localDBLearningObjectService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // === getLocalLearningObjects ===
  describe("getLocalLearningObjects", () => {
    it("geeft alle objecten voor teacher", async () => {
      vi.mocked(prisma.learningObject.findMany).mockResolvedValue([mockObject]);
      const result = await service.getLocalLearningObjects(true);
      expect(result[0].origin).toBe("local");
      expect(prisma.learningObject.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: "desc" },
      });
    });

    it("filtert op exclusiviteit voor niet-teachers", async () => {
      vi.mocked(prisma.learningObject.findMany).mockResolvedValue([mockObject]);
      const result = await service.getLocalLearningObjects(false);
      expect(result).toHaveLength(1);
      expect(prisma.learningObject.findMany).toHaveBeenCalledWith({
        where: { teacherExclusive: false, available: true },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  // === getLocalLearningObjectById ===
  describe("getLocalLearningObjectById", () => {
    it("retourneert object als teacher", async () => {
      vi.mocked(prisma.learningObject.findUnique).mockResolvedValue(mockObject);
      const result = await service.getLocalLearningObjectById("abc123", true);
      expect(result?.id).toBe("abc123");
    });

    it("retourneert null als object niet bestaat", async () => {
      vi.mocked(prisma.learningObject.findUnique).mockResolvedValue(null);
      const result = await service.getLocalLearningObjectById("niet-bestaat", false);
      expect(result).toBeNull();
    });

    it("weigert toegang voor student als object niet beschikbaar is", async () => {
      vi.mocked(prisma.learningObject.findUnique).mockResolvedValue({
        ...mockObject,
        teacherExclusive: true,
        available: false,
      });
      const result = await service.getLocalLearningObjectById("abc123", false);
      expect(result).toBeNull();
    });
  });

  // === searchLocalLearningObjects ===
  describe("searchLocalLearningObjects", () => {
    it("zoekt zonder restrictie als teacher", async () => {
      vi.mocked(prisma.learningObject.findMany).mockResolvedValue([mockObject]);
      const result = await service.searchLocalLearningObjects(true, "Titel");
      expect(result[0].title).toBe("Titel");
      expect(prisma.learningObject.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: "Titel", mode: "insensitive" } },
            { description: { contains: "Titel", mode: "insensitive" } },
            { keywords: { has: "Titel" } },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
    });

    it("voegt AND toe bij student", async () => {
      vi.mocked(prisma.learningObject.findMany).mockResolvedValue([mockObject]);
      const result = await service.searchLocalLearningObjects(false, "code");
      expect(result.length).toBe(1);
      expect(prisma.learningObject.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: "code", mode: "insensitive" } },
            { description: { contains: "code", mode: "insensitive" } },
            { keywords: { has: "code" } },
          ],
          AND: [{ teacherExclusive: false }, { available: true }],
        },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  // === getLocalLearningObjectByHruidLangVersion ===
  describe("getLocalLearningObjectByHruidLangVersion", () => {
    it("haalt object op met combinatie hruid/language/version", async () => {
      vi.mocked(prisma.learningObject.findUnique).mockResolvedValue(mockObject);
      const result = await service.getLocalLearningObjectByHruidLangVersion(
        "obj-hruid",
        "nl",
        1,
        true
      );
      expect(result?.uuid).toBe("uuid-123");
    });

    it("retourneert null als object niet bestaat", async () => {
      vi.mocked(prisma.learningObject.findUnique).mockResolvedValue(null);
      const result = await service.getLocalLearningObjectByHruidLangVersion("missing", "en", 99, false);
      expect(result).toBeNull();
    });

    it("filtert niet-toegankelijke objecten weg voor niet-teachers", async () => {
      vi.mocked(prisma.learningObject.findUnique).mockResolvedValue({
        ...mockObject,
        teacherExclusive: true,
        available: false,
      });
      const result = await service.getLocalLearningObjectByHruidLangVersion(
        "secret",
        "nl",
        1,
        false
      );
      expect(result).toBeNull();
    });
  });
});
