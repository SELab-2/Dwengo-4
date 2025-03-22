// middleware/questionsAuthMiddleware.ts
import { NextFunction, Response } from "express";
import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";
import { NotFoundError, AccesDeniedError } from "../errors/errors";

const prisma = new PrismaClient();

/**
 * authorizeQuestion:
 *  - Check of question bestaat
 *  - Check of de user in het team zit (student) of teacher van die klas is
 */
export const authorizeQuestion = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { questionId } = req.params;
    const user = req.user;
    if (!user) {
      throw new AccesDeniedError("Not logged in");
    }

    const question = await prisma.question.findUnique({
      where: { id: Number(questionId) },
      include: {
        team: {
          include: {
            students: true,
            class: {
              include: {
                ClassTeacher: true
              }
            }
          }
        }
      }
    });
    if (!question) {
      throw new NotFoundError("Question not found");
    }

    // is user in team (if user is student)?
    const isStudentInTeam = question.team.students.some(s => s.userId === user.id);
    // is user teacher in that class?
    const isTeacherInClass = question.team.class.ClassTeacher.some(ct => ct.teacherId === user.id);

    // Extra: is admin?
    const isAdmin = user.role === "ADMIN";

    if (!isStudentInTeam && !isTeacherInClass && !isAdmin) {
      throw new AccesDeniedError("No access to question");
    }

    next();
  }
);

/**
 * authorizeOwnerOfQuestionMessage:
 *  - Check of message bestaat
 *  - Check of userId van de message = user.id
 *    (of dat de user teacher is? Hangt af van policy)
 */
export const authorizeOwnerOfQuestionMessage = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { questionMessageId } = req.params;
    const user = req.user;
    if (!user) {
      throw new AccesDeniedError("Not logged in");
    }

    const message = await prisma.questionMessage.findUnique({
      where: { id: Number(questionMessageId) }
    });
    if (!message) {
      throw new NotFoundError("QuestionMessage not found");
    }

    if (message.userId !== user.id && user.role !== "ADMIN") {
      // of check isTeacherInClass, etc. -> beslis eigen policy
      throw new AccesDeniedError("User not allowed to edit/delete this message");
    }

    next();
  }
);
