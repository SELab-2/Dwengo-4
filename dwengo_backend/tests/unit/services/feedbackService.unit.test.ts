import { describe, it, expect, vi, beforeEach } from "vitest";
import FeedbackService from "../../../services/feedbackService";
import prisma from "../../../config/prisma";
import {
  AccessDeniedError,
  ForbiddenActionError,
} from "../../../errors/errors";
import { Feedback, Assignment, Teacher } from "@prisma/client";

vi.mock("../../../config/prisma");

describe("FeedbackService", () => {
  const unauthorizedMsg =
    "Teacher should teach this class to perform this action.";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // === hasAssignmentRights ===
  describe("hasAssignmentRights", () => {
    it("returns true when teacher has rights", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 1,
      });

      const result = await FeedbackService.hasAssignmentRights(10, 1);
      expect(result).toBe(true);
    });

    it("throws AccessDeniedError when teacher has no rights", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(FeedbackService.hasAssignmentRights(10, 1)).rejects.toThrow(
        AccessDeniedError,
      );
    });
  });

  // === hasSubmissionRights ===
  describe("hasSubmissionRights", () => {
    it("returns true when teacher has rights on submission", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 1,
      });

      const result = await FeedbackService.hasSubmissionRights(1, 99);
      expect(result).toBe(true);
    });

    it("throws AccessDeniedError when teacher has no rights on submission", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(FeedbackService.hasSubmissionRights(1, 99)).rejects.toThrow(
        AccessDeniedError,
      );
    });
  });

  // === getAllFeedbackForEvaluation ===
  describe("getAllFeedbackForEvaluation", () => {
    it("returns feedback list when rights are OK", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 1,
      });
      (prisma.feedback.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
        { id: 1 } as Feedback,
        { id: 2 } as Feedback,
      ]);

      const result = await FeedbackService.getAllFeedbackForEvaluation(
        10,
        "ev123",
        1,
      );
      expect(result).toHaveLength(2);
    });

    it("throws AccessDeniedError when rights are insufficient", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(
        FeedbackService.getAllFeedbackForEvaluation(1, "ev123", 1),
      ).rejects.toThrow(unauthorizedMsg);
    });
  });

  // === createFeedback ===
  describe("createFeedback", () => {
    it("creates feedback when all conditions are met", async () => {
      // First call to hasSubmissionRights
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ userId: 1 } as Teacher)
        .mockResolvedValueOnce(null); // for the deadline query

      // No future deadline
      (
        prisma.assignment.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      (prisma.feedback.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
        description: "Top",
      } as Feedback);

      const result = await FeedbackService.createFeedback(5, 1, "Top");
      expect(result).toEqual({ id: 1, description: "Top" });
    });

    it("throws AccessDeniedError when teacher has no rights", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(
        FeedbackService.createFeedback(5, 1, "Nope"),
      ).rejects.toThrow(unauthorizedMsg);
    });

    it("throws ForbiddenActionError when deadline is in the future", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 1,
      } as Teacher);
      (
        prisma.assignment.findFirst as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        id: 99,
      } as Assignment);

      await expect(
        FeedbackService.createFeedback(5, 1, "Nice"),
      ).rejects.toThrow(ForbiddenActionError);
    });
  });

  // === getFeedbackForSubmission ===
  describe("getFeedbackForSubmission", () => {
    it("returns feedback when rights are OK", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 1,
      } as Teacher);
      (
        prisma.feedback.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        id: 1,
        submissionId: 5,
      } as Feedback);

      const result = await FeedbackService.getFeedbackForSubmission(5, 1);
      expect(result).toEqual({ id: 1, submissionId: 5 });
    });

    it("throws AccessDeniedError when rights are insufficient", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(
        FeedbackService.getFeedbackForSubmission(5, 1),
      ).rejects.toThrow(unauthorizedMsg);
    });
  });

  // === updateFeedbackForSubmission ===
  describe("updateFeedbackForSubmission", () => {
    it("updates feedback when rights are OK", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 1,
      } as Teacher);
      // existence check must pass
      (
        prisma.feedback.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        id: 1,
        submissionId: 5,
        description: "Old",
      } as Feedback);
      (prisma.feedback.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 1,
        description: "Updated",
      } as Feedback);

      const result = await FeedbackService.updateFeedbackForSubmission(
        5,
        "Updated",
        1,
      );
      expect(result).toEqual({ id: 1, description: "Updated" });
    });

    it("throws AccessDeniedError when rights are insufficient", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(
        FeedbackService.updateFeedbackForSubmission(5, "x", 1),
      ).rejects.toThrow(unauthorizedMsg);
    });
  });

  // === deleteFeedbackForSubmission ===
  describe("deleteFeedbackForSubmission", () => {
    it("deletes feedback when rights are OK", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: 1,
      } as Teacher);
      // existence check must pass
      (
        prisma.feedback.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        id: 99,
        submissionId: 5,
        description: "Anything",
      } as Feedback);
      (prisma.feedback.delete as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 99,
      } as Feedback);

      const result = await FeedbackService.deleteFeedbackForSubmission(5, 1);
      expect(result).toEqual({ id: 99 });
    });

    it("throws AccessDeniedError when rights are insufficient", async () => {
      (prisma.teacher.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(
        FeedbackService.deleteFeedbackForSubmission(5, 1),
      ).rejects.toThrow(unauthorizedMsg);
    });
  });
});
