import { describe, it, expect, vi, beforeEach } from "vitest";
import FeedbackService from "../../../services/feedbackService";
import prisma from "../../../config/prisma";

vi.mock("../../../config/prisma");

describe("FeedbackService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // === hasAssignmentRights ===
  describe("hasAssignmentRights", () => {
    it("retourneert true als teacher rechten heeft", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 1,
      });

      const result = await FeedbackService.hasAssignmentRights(10, 1);
      expect(result).toBe(true);
    });

    it("retourneert false als teacher geen rechten heeft", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await FeedbackService.hasAssignmentRights(10, 1);
      expect(result).toBe(false);
    });
  });

  // === hasSubmissionRights ===
  describe("hasSubmissionRights", () => {
    it("retourneert true als teacher rechten heeft op submission", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 1,
      });

      const result = await FeedbackService.hasSubmissionRights(1, 99);
      expect(result).toBe(true);
    });

    it("retourneert false als teacher geen rechten heeft op submission", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await FeedbackService.hasSubmissionRights(1, 99);
      expect(result).toBe(false);
    });
  });

  // === getAllFeedbackForEvaluation ===
  describe("getAllFeedbackForEvaluation", () => {
    it("retourneert feedbacklijst als rechten ok zijn", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 1,
      });
      (prisma.feedback.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);

      const result = await FeedbackService.getAllFeedbackForEvaluation(
        10,
        "ev123",
        1,
      );
      expect(result).toHaveLength(2);
    });

    it("gooit error bij onvoldoende rechten", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(
        FeedbackService.getAllFeedbackForEvaluation(1, "ev123", 1),
      ).rejects.toThrow("The teacher is unauthorized to perform this action");
    });
  });

  // === createFeedback ===
  describe("createFeedback", () => {
    it("maakt feedback aan als alles ok is", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ userId: 1 }) // submission rechten
        .mockResolvedValueOnce(null); // geen toekomstige deadline

      (
        prisma.assignment.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      (prisma.feedback.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
        description: "Top",
      });

      const result = await FeedbackService.createFeedback(5, 1, "Top");
      expect(result).toEqual({ id: 1, description: "Top" });
    });

    it("gooit error als teacher geen rechten heeft", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(
        FeedbackService.createFeedback(5, 1, "Nope"),
      ).rejects.toThrow("The teacher is unauthorized to perform this action");
    });

    it("gooit error als deadline in toekomst ligt", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 1,
      });
      (
        prisma.assignment.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ id: 99 });

      await expect(
        FeedbackService.createFeedback(5, 1, "Nice"),
      ).rejects.toThrow("Deadline in toekomst");
    });
  });

  // === getFeedbackForSubmission ===
  describe("getFeedbackForSubmission", () => {
    it("retourneert feedback als rechten ok zijn", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 1,
      });
      (
        prisma.feedback.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        id: 1,
        submissionId: 5,
      });

      const result = await FeedbackService.getFeedbackForSubmission(5, 1);
      expect(result).toEqual({ id: 1, submissionId: 5 });
    });

    it("gooit error bij onvoldoende rechten", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(
        FeedbackService.getFeedbackForSubmission(5, 1),
      ).rejects.toThrow("The teacher is unauthorized to perform this action");
    });
  });

  // === updateFeedbackForSubmission ===
  describe("updateFeedbackForSubmission", () => {
    it("werkt bij geldige rechten", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 1,
      });
      (prisma.feedback.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
        description: "Updated",
      });

      const result = await FeedbackService.updateFeedbackForSubmission(
        5,
        "Updated",
        1,
      );
      expect(result).toEqual({ id: 1, description: "Updated" });
    });

    it("gooit error bij onvoldoende rechten", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(
        FeedbackService.updateFeedbackForSubmission(5, "x", 1),
      ).rejects.toThrow("The teacher is unauthorized to perform this action");
    });
  });

  // === deleteFeedbackForSubmission ===
  describe("deleteFeedbackForSubmission", () => {
    it("verwijdert feedback bij geldige rechten", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 1,
      });
      (prisma.feedback.delete as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 99,
      });

      const result = await FeedbackService.deleteFeedbackForSubmission(5, 1);
      expect(result).toEqual({ id: 99 });
    });

    it("gooit error bij onvoldoende rechten", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(
        FeedbackService.deleteFeedbackForSubmission(5, 1),
      ).rejects.toThrow("The teacher is unauthorized to perform this action");
    });
  });
});
