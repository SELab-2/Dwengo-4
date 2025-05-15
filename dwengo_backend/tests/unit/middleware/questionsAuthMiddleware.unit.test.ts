import { afterEach, describe, expect, it, vi } from "vitest";
import prisma from "../../../config/prisma";
import { authorizeQuestion } from "../../../middleware/authMiddleware/questionsAuthMiddleware";

vi.mock("../../../config/prisma");

const buildReq = (params = {}, user = null) => ({ params, user }) as any;

const buildRes = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  return res;
};

afterEach(() => {
  vi.clearAllMocks();
});

describe(" authorizeQuestion", () => {
  const baseQuestion = {
    id: 1,
    isPrivate: true,
    createdBy: 99,
    team: {
      students: [{ userId: 2 }],
      class: {
        ClassTeacher: [{ teacherId: 3 }],
      },
    },
  };

  it(" should allow access to creator", async () => {
    (prisma.question.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      baseQuestion,
    );
    const req = buildReq({ questionId: "1" }, { id: 99, role: "STUDENT" });
    const res = buildRes();
    const next = vi.fn();

    await authorizeQuestion(req, res as any, next);
    expect(next).toHaveBeenCalled();
  });

  it(" should allow teacher in class", async () => {
    (prisma.question.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      baseQuestion,
    );
    const req = buildReq({ questionId: "1" }, { id: 3, role: "TEACHER" });
    const res = buildRes();
    const next = vi.fn();

    await authorizeQuestion(req, res as any, next);
    expect(next).toHaveBeenCalled();
  });

  it(" should allow team member to public question", async () => {
    (prisma.question.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...baseQuestion,
      isPrivate: false,
    });

    const req = buildReq({ questionId: "1" }, { id: 2, role: "STUDENT" });
    const res = buildRes();
    const next = vi.fn();

    await authorizeQuestion(req, res as any, next);
    expect(next).toHaveBeenCalled();
  });
});
