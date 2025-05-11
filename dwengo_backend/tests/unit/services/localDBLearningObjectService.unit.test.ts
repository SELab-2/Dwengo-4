import { describe, it, expect, beforeEach, vi } from "vitest";
import * as service from "../../../services/localDBLearningObjectService";
import prisma from "../../../config/prisma";
import { LearningObject } from "@prisma/client";
import {
  AccessDeniedError,
  UnavailableError,
  NotFoundError,
} from "../../../errors/errors";

vi.mock("../../../config/prisma");

type LO = LearningObject;
const mockObject: LO = {
  id: "abc123",
  uuid: "uuid-123",
  hruid: "obj-hruid",
  version: 1,
  language: "nl",
  title: "Titel",
  description: "Beschrijving",
  contentType: "video" as any,
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

  describe("getLocalLearningObjects", () => {
    it("geeft alle objecten voor teacher", async () => {
      (
        prisma.learningObject.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([mockObject]);

      const result = await service.getLocalLearningObjects(true);
      expect(result[0].origin).toBe("local");
      expect(prisma.learningObject.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: "desc" },
      });
    });

    it("filtert op exclusiviteit voor niet-teachers", async () => {
      (
        prisma.learningObject.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([mockObject]);

      const result = await service.getLocalLearningObjects(false);
      expect(result).toHaveLength(1);
      expect(prisma.learningObject.findMany).toHaveBeenCalledWith({
        where: { teacherExclusive: false, available: true },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("getLocalLearningObjectById", () => {
    it("retourneert object als teacher", async () => {
      (
        prisma.learningObject.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockObject);
      const result = await service.getLocalLearningObjectById("abc123", true);
      expect(result.id).toBe("abc123");
    });

    it("gooit NotFoundError als object niet bestaat", async () => {
      (
        prisma.learningObject.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      await expect(
        service.getLocalLearningObjectById("niet-bestaat", false),
      ).rejects.toThrow(NotFoundError);
    });

    it("weigert toegang voor student als object is teacherExclusive", async () => {
      (
        prisma.learningObject.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ ...mockObject, teacherExclusive: true });
      await expect(
        service.getLocalLearningObjectById("abc123", false),
      ).rejects.toThrow(AccessDeniedError);
    });

    it("gooit UnavailableError als object niet beschikbaar is voor student", async () => {
      (
        prisma.learningObject.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ ...mockObject, available: false });
      await expect(
        service.getLocalLearningObjectById("abc123", false),
      ).rejects.toThrow(UnavailableError);
    });
  });

  describe("searchLocalLearningObjects", () => {
    it("zoekt zonder restrictie als teacher", async () => {
      (
        prisma.learningObject.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([mockObject]);
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
      (
        prisma.learningObject.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([mockObject]);
      await service.searchLocalLearningObjects(false, "code");
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

  describe("getLocalLearningObjectByHruidLangVersion", () => {
    it("haalt object op met combinatie hruid/language/version als teacher", async () => {
      (
        prisma.learningObject.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockObject);
      const result = await service.getLocalLearningObjectByHruidLangVersion(
        "obj-hruid",
        "nl",
        1,
        true,
      );
      expect(result.uuid).toBe("uuid-123");
    });

    it("gooit NotFoundError als object niet bestaat", async () => {
      (
        prisma.learningObject.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      await expect(
        service.getLocalLearningObjectByHruidLangVersion(
          "missing",
          "en",
          99,
          false,
        ),
      ).rejects.toThrow(NotFoundError);
    });

    it("weigert toegang voor student als object is teacherExclusive", async () => {
      (
        prisma.learningObject.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ ...mockObject, teacherExclusive: true });
      await expect(
        service.getLocalLearningObjectByHruidLangVersion(
          "secret",
          "nl",
          1,
          false,
        ),
      ).rejects.toThrow(AccessDeniedError);
    });

    it("gooit UnavailableError als object niet beschikbaar is voor student", async () => {
      (
        prisma.learningObject.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ ...mockObject, available: false });
      await expect(
        service.getLocalLearningObjectByHruidLangVersion(
          "secret",
          "nl",
          1,
          false,
        ),
      ).rejects.toThrow(UnavailableError);
    });
  });
});
