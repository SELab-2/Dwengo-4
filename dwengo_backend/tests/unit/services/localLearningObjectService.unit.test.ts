import { describe, it, expect, vi, beforeEach } from "vitest";
import LocalLearningObjectService, {
  LocalLearningObjectData,
} from "../../../services/localLearningObjectService";
import prisma from "../../../config/prisma";
import { ContentType, LearningObject } from "@prisma/client";

vi.mock("../../../config/prisma");

const baseData: LocalLearningObjectData = {
  title: "Intro tot AI",
  description: "Leer wat AI is",
  contentType: "text/plain" as ContentType,
  keywords: ["AI"],
  targetAges: [14],
};

const mockLearningObject: LearningObject = {
  id: "lo123",
  uuid: "uuid-lo",
  hruid: "intro-tot-ai-123456789",
  version: 1,
  language: "nl",
  title: "Intro tot AI",
  description: "Leer wat AI is",
  contentType: ContentType.TEXT_PLAIN,
  keywords: ["AI"],
  targetAges: [14],
  teacherExclusive: false,
  skosConcepts: [],
  copyright: "",
  licence: "CC BY Dwengo",
  difficulty: 1,
  estimatedTime: 0,
  available: true,
  contentLocation: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  creatorId: 42,
};

describe("LocalLearningObjectService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createLearningObject", () => {
    it("maakt een leerobject aan met standaardwaarden", async () => {
      (
        prisma.learningObject.create as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockLearningObject);

      const result = await LocalLearningObjectService.createLearningObject(
        42,
        baseData,
      );

      expect(prisma.learningObject.create).toHaveBeenCalled();
      expect(result.title).toBe("Intro tot AI");
      expect(result.language).toBe("nl");
    });
  });

  describe("getAllLearningObjectsByTeacher", () => {
    it("haalt alle leerobjecten van een teacher op", async () => {
      (
        prisma.learningObject.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([mockLearningObject]);

      const result =
        await LocalLearningObjectService.getAllLearningObjectsByTeacher(42);

      expect(result).toHaveLength(1);
      expect(prisma.learningObject.findMany).toHaveBeenCalledWith({
        where: { creatorId: 42 },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("getLearningObjectById", () => {
    it("haalt een leerobject op via id", async () => {
      (
        prisma.learningObject.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockLearningObject);

      const result =
        await LocalLearningObjectService.getLearningObjectById("lo123");

      expect(result?.id).toBe("lo123");
      expect(prisma.learningObject.findUnique).toHaveBeenCalledWith({
        where: { id: "lo123" },
      });
    });
  });

  describe("updateLearningObject", () => {
    it("update een leerobject", async () => {
      (
        prisma.learningObject.update as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        ...mockLearningObject,
        title: "Nieuwe Titel",
      });

      const result = await LocalLearningObjectService.updateLearningObject(
        "lo123",
        {
          title: "Nieuwe Titel",
        },
      );

      expect(prisma.learningObject.update).toHaveBeenCalledWith({
        where: { id: "lo123" },
        data: {
          title: "Nieuwe Titel",
          description: undefined,
          contentType: undefined,
          keywords: undefined,
          targetAges: undefined,
          teacherExclusive: undefined,
          skosConcepts: undefined,
          copyright: undefined,
          licence: undefined,
          difficulty: undefined,
          estimatedTime: undefined,
          available: undefined,
          contentLocation: undefined,
        },
      });

      expect(result.title).toBe("Nieuwe Titel");
    });
  });
});
