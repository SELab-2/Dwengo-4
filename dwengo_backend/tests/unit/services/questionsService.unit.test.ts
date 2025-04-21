import { describe, it, expect, vi, beforeEach } from "vitest";
import QuestionService from "../../../services/questionsService";
import prisma from "../../../config/prisma";
import { Role } from "@prisma/client";
import { NotFoundError, BadRequestError } from "../../../errors/errors";



vi.mock("../../../config/prisma", () => ({
  default: {
    question: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn()
    },
    questionMessage: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn()
    },
    questionSpecific: {
      create: vi.fn()
    },
    questionGeneral: {
      create: vi.fn()
    },
    assignment: {
      findUnique: vi.fn()
    },
    team: {
      findUnique: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

const mockQuestion = { id: 1, title: "Test", createdBy: 1, isPrivate: false };
const mockMessage = { id: 99, text: "Initial", userId: 1, questionId: 1 };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("QuestionService 🧪", () => {
  describe("createQuestionMessage()", () => {
    it("creates a message if input is valid", async () => {
      (prisma.question.findUnique as any).mockResolvedValue(mockQuestion);
      (prisma.questionMessage.create as any).mockResolvedValue(mockMessage);

      const result = await QuestionService.createQuestionMessage(1, 1, "Hello");
      expect(result.text).toBe("Initial");
    });

    it("throws on empty message", async () => {
      await expect(
        QuestionService.createQuestionMessage(1, 1, "  ")
      ).rejects.toThrow(BadRequestError);
    });

    it("throws if question doesn't exist", async () => {
      (prisma.question.findUnique as any).mockResolvedValue(null);

      await expect(
        QuestionService.createQuestionMessage(1, 1, "Text")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateQuestion()", () => {
    it("updates question title", async () => {
      (prisma.question.findUnique as any).mockResolvedValue(mockQuestion);
      (prisma.question.update as any).mockResolvedValue({ title: "New Title" });

      const result = await QuestionService.updateQuestion(1, "New Title");
      expect(result.title).toBe("New Title");
    });

    it("throws if new title is empty", async () => {
      await expect(
        QuestionService.updateQuestion(1, " ")
      ).rejects.toThrow(BadRequestError);
    });

    it("throws if question not found", async () => {
      (prisma.question.findUnique as any).mockResolvedValue(null);
      await expect(
        QuestionService.updateQuestion(1, "New Title")
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("getQuestion()", () => {
    it("returns question with relations", async () => {
      (prisma.question.findUnique as any).mockResolvedValue({ id: 5 });
      const result = await QuestionService.getQuestion(5);
      expect(result.id).toBe(5);
    });

    it("throws if not found", async () => {
      (prisma.question.findUnique as any).mockResolvedValue(null);
      await expect(
        QuestionService.getQuestion(999)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteQuestion()", () => {
    it("deletes question by ID", async () => {
      (prisma.question.findUnique as any).mockResolvedValue(mockQuestion);
      (prisma.question.delete as any).mockResolvedValue(mockQuestion);
      const result = await QuestionService.deleteQuestion(1);
      expect(result.id).toBe(1);
    });

    it("throws if not found", async () => {
      (prisma.question.findUnique as any).mockResolvedValue(null);
      await expect(
        QuestionService.deleteQuestion(404)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteQuestionMessage()", () => {
    it("deletes a message", async () => {
      (prisma.questionMessage.findUnique as any).mockResolvedValue(mockMessage);
      (prisma.questionMessage.delete as any).mockResolvedValue(mockMessage);
      const result = await QuestionService.deleteQuestionMessage(99);
      expect(result.id).toBe(99);
    });

    it("throws if message not found", async () => {
      (prisma.questionMessage.findUnique as any).mockResolvedValue(null);
      await expect(
        QuestionService.deleteQuestionMessage(123)
      ).rejects.toThrow(NotFoundError);
    });
  });
});
