import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

//! om meer testen te schrijven zou ik middleware moeten aanpassen, maar dat is mometeel met de naderende deadline gevaarlijk


vi.mock("../../../middleware/questionsAuthMiddleware", async (importOriginal) => {
  const actual = await importOriginal();

  const mockFindQuestion = vi.fn();

  return {
    ...actual as any,
    __esModule: true,
    prisma: {
      question: {
        findUnique: mockFindQuestion,
      },
      __mockFns: {
        mockFindQuestion,
      },
    },
  };
});

import {
  authorizeQuestion,
} from "../../../middleware/questionsAuthMiddleware";

import { prisma } from "../../../middleware/questionsAuthMiddleware";


const buildReq = (params = {}, user = null) =>
  ({ params, user } as any);

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

describe("🔐 authorizeQuestion", () => {
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

  it("✅ should allow access to creator", async () => {
    prisma.__mockFns.mockFindQuestion.mockResolvedValue(baseQuestion);
    const req = buildReq({ questionId: "1" }, { id: 99, role: "STUDENT" } as any);
    const res = buildRes();
    const next = vi.fn();

    await authorizeQuestion(req, res as any, next);
    expect(next).toHaveBeenCalled();
  });

  it("✅ should allow teacher in class", async () => {
    prisma.__mockFns.mockFindQuestion.mockResolvedValue(baseQuestion);
    const req = buildReq({ questionId: "1" }, { id: 3, role: "TEACHER" } as any);
    const res = buildRes();
    const next = vi.fn();

    await authorizeQuestion(req, res as any, next);
    expect(next).toHaveBeenCalled();
  });

  it("✅ should allow team member to public question", async () => {
    prisma.__mockFns.mockFindQuestion.mockResolvedValue({
      ...baseQuestion,
      isPrivate: false,
    });

    const req = buildReq({ questionId: "1" }, { id: 2, role: "STUDENT" } as any);
    const res = buildRes();
    const next = vi.fn();

    await authorizeQuestion(req, res as any, next);
    expect(next).toHaveBeenCalled();
  });
});
