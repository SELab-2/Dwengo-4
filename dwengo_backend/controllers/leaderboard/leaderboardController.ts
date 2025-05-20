import asyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { Response } from "express";
import prisma from "../../config/prisma";

export const getLeaderBoard = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const usersWithCounts = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        _count: {
          select: {
            QuestionMessage: true,
          },
        },
      },
    });

    const leaderboard = usersWithCounts.sort(
      (a, b) => b._count.QuestionMessage - a._count.QuestionMessage,
    );

    res.json(leaderboard);
  },
);
