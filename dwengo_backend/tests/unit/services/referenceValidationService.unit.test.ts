import { beforeEach, describe, expect, it, vi } from "vitest";
import ReferenceValidationService from "../../../services/referenceValidationService";
import prisma from "../../../config/prisma";
import { dwengoAPI } from "../../../config/dwengoAPI";
import { BadRequestError, NotFoundError } from "../../../errors/errors";

vi.mock("../../../config/prisma");
vi.mock("../../../config/dwengoAPI", () => ({
  dwengoAPI: { get: vi.fn() },
}));

describe("ReferenceValidationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateLocalLearningObject", () => {
    it("should resolve if learning object exists", async () => {
      (
        prisma.learningObject.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ id: "abc123" });
      await expect(
        ReferenceValidationService.validateLocalLearningObject("abc123"),
      ).resolves.toBeUndefined();
    });

    it("should throw NotFoundError if learning object does not exist", async () => {
      (
        prisma.learningObject.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      await expect(
        ReferenceValidationService.validateLocalLearningObject("not-found"),
      ).rejects.toThrow(NotFoundError);
      await expect(
        ReferenceValidationService.validateLocalLearningObject("not-found"),
      ).rejects.toThrow("Local learning object not found.");
    });
  });

  describe("validateDwengoLearningObject", () => {
    it("should resolve if valid data received from Dwengo API", async () => {
      (dwengoAPI.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { title: "object title" },
      });
      await expect(
        ReferenceValidationService.validateDwengoLearningObject("abc", "nl", 1),
      ).resolves.toBeUndefined();
    });

    it("should throw network error when API returns 404", async () => {
      const error = { response: { status: 404 } };
      (dwengoAPI.get as ReturnType<typeof vi.fn>).mockRejectedValue(error);
      await expect(
        ReferenceValidationService.validateDwengoLearningObject(
          "notfound",
          "nl",
          2,
        ),
      ).rejects.toThrow(Error);
      await expect(
        ReferenceValidationService.validateDwengoLearningObject(
          "notfound",
          "nl",
          2,
        ),
      ).rejects.toThrow(
        "Could not fetch the requested learning object from the Dwengo API.",
      );
    });

    it("should throw network error for other failures", async () => {
      (dwengoAPI.get as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Connection error"),
      );
      await expect(
        ReferenceValidationService.validateDwengoLearningObject("abc", "nl", 1),
      ).rejects.toThrow(Error);
      await expect(
        ReferenceValidationService.validateDwengoLearningObject("abc", "nl", 1),
      ).rejects.toThrow(
        "Could not fetch the requested learning object from the Dwengo API.",
      );
    });

    it("should throw network error if response data is null", async () => {
      (dwengoAPI.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
      });
      await expect(
        ReferenceValidationService.validateDwengoLearningObject("abc", "nl", 1),
      ).rejects.toThrow(Error);
    });
  });

  describe("validateLocalLearningPath", () => {
    it("should resolve if learning path exists", async () => {
      (
        prisma.learningPath.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ id: "path123" });
      await expect(
        ReferenceValidationService.validateLocalLearningPath("path123"),
      ).resolves.toBeUndefined();
    });

    it("should throw NotFoundError if learning path does not exist", async () => {
      (
        prisma.learningPath.findUnique as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      await expect(
        ReferenceValidationService.validateLocalLearningPath("not-found"),
      ).rejects.toThrow(NotFoundError);
      await expect(
        ReferenceValidationService.validateLocalLearningPath("not-found"),
      ).rejects.toThrow("Learning path not found.");
    });
  });

  describe("validateDwengoLearningPath", () => {
    it("should resolve if Dwengo API returns array of results", async () => {
      (dwengoAPI.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: [{ id: 1 }],
      });
      await expect(
        ReferenceValidationService.validateDwengoLearningPath("pad123", "nl"),
      ).resolves.toBeUndefined();
    });

    it("should throw network error for API failure", async () => {
      (dwengoAPI.get as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("API failure"),
      );
      await expect(
        ReferenceValidationService.validateDwengoLearningPath("pad123", "nl"),
      ).rejects.toThrow(Error);
      await expect(
        ReferenceValidationService.validateDwengoLearningPath("pad123", "nl"),
      ).rejects.toThrow(
        "Could not fetch the requested learning path from the Dwengo API.",
      );
    });
  });

  describe("validateLearningPath wrapper", () => {
    it("should throw BadRequestError if external missing params", async () => {
      await expect(
        ReferenceValidationService.validateLearningPath(true),
      ).rejects.toThrow(BadRequestError);
      await expect(
        ReferenceValidationService.validateLearningPath(true),
      ).rejects.toThrow("Missing Dwengo leerpad references (hruid/language).");
    });

    it("should throw BadRequestError if local missing localId", async () => {
      await expect(
        ReferenceValidationService.validateLearningPath(false),
      ).rejects.toThrow(BadRequestError);
      await expect(
        ReferenceValidationService.validateLearningPath(false),
      ).rejects.toThrow("Missing localId for local learning path validation.");
    });

    it("should call external Dwengo check when params provided", async () => {
      const spy = vi
        .spyOn(ReferenceValidationService, "validateDwengoLearningPath")
        .mockResolvedValue();
      await ReferenceValidationService.validateLearningPath(
        true,
        undefined,
        "abc",
        "nl",
      );
      expect(spy).toHaveBeenCalledWith("abc", "nl");
    });

    it("should call local check when localId provided", async () => {
      const spy = vi
        .spyOn(ReferenceValidationService, "validateLocalLearningPath")
        .mockResolvedValue();
      await ReferenceValidationService.validateLearningPath(
        false,
        "localId123",
      );
      expect(spy).toHaveBeenCalledWith("localId123");
    });
  });
});
