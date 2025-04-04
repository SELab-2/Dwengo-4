import { NextFunction, Response } from "express";
import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";
import { NotFoundError, AccesDeniedError } from "../errors/errors";

const prisma = new PrismaClient();
const accessDeniedErrorMessage = "Not logged in.";
const notFoundErrorMessage = "Question not found.";

/**
 * authorizeQuestion:
 *  - Haalt question op
 *  - Als isPrivate = true -> alleen createdBy of teacher/admin
 *  - Als isPrivate = false -> teamleden + teacher/admin
 */
export const authorizeQuestion = asyncHandler(
  async (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    const { questionId } = req.params;
    const user = req.user;
    if (!user) {
      throw new AccesDeniedError(accessDeniedErrorMessage);
    }

    const question = await prisma.question.findUnique({
      where: { id: Number(questionId) },
      include: {
        team: {
          include: {
            students: true,
            class: {
              include: {
                ClassTeacher: true,
              },
            },
          },
        },
      },
    });
    if (!question) {
      throw new NotFoundError(notFoundErrorMessage);
    }

    // check teacher
    const isTeacherInClass = question.team.class.ClassTeacher.some(
      (ct) => ct.teacherId === user.id,
    );
    // check student in team
    const isStudentInTeam = question.team.students.some(
      (s) => s.userId === user.id,
    );

    // check admin
    const isAdmin = user.role === "ADMIN";

    if (question.isPrivate) {
      // private => alleen question.createdBy of teacher/admin
      const isCreator = question.createdBy === user.id;
      if (!isCreator && !isTeacherInClass && !isAdmin) {
        throw new AccesDeniedError("Question is private: no access.");
      }
    } else {
      // not private => teamleden of teacher/admin
      if (!isStudentInTeam && !isTeacherInClass && !isAdmin) {
        throw new AccesDeniedError("No access to question.");
      }
    }

    next();
  },
);

/**
 * authorizeQuestionUpdate:
 *  - Alleen de *owner* (question.createdBy)  of *admin* mag de vraagtitel updaten.
 *  - Dit is strenger dan authorizeQuestion (zien).
 */
export const authorizeQuestionUpdate = asyncHandler(
  async (req: AuthenticatedRequest, _: Response, next: NextFunction) => {
    const { questionId } = req.params;
    const user = req.user;
    if (!user) {
      throw new AccesDeniedError(accessDeniedErrorMessage);
    }

    const question = await prisma.question.findUnique({
      where: { id: Number(questionId) },
      include: {
        team: {
          include: {
            class: {
              include: {
                ClassTeacher: true,
              },
            },
          },
        },
      },
    });
    if (!question) {
      throw new NotFoundError(notFoundErrorMessage);
    }

    // Is user the owner?
    const isOwner = question.createdBy === user.id;

    // Is user admin?
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new AccesDeniedError(
        "Only the owner of this question or an admin can update this question.",
      );
    }

    next();
  },
);

/**
 * authorizeMessageUpdate:
 *  - Alleen de eigenaar (message.userId) of admin mag de tekst updaten
 */
export const authorizeMessageUpdate = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { questionMessageId } = req.params;
    const user = req.user;
    if (!user) {
      throw new AccesDeniedError(accessDeniedErrorMessage);
    }

    const message = await prisma.questionMessage.findUnique({
      where: { id: Number(questionMessageId) },
    });
    if (!message) {
      throw new NotFoundError(notFoundErrorMessage);
    }

    const isOwner = message.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      throw new AccesDeniedError(
        "Only the owner of the message or an admin can update this message",
      );
    }

    // OK
    next();
  },
);

/**
 * authorizeMessageDelete:
 *  - De eigenaar (student/teacher), *teacher in klas*, of admin mag deleten
 */
export const authorizeMessageDelete = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { questionId, questionMessageId } = req.params;
    const user = req.user;
    if (!user) {
      throw new AccesDeniedError(accessDeniedErrorMessage);
    }

    // 1) Vind de message
    const message = await prisma.questionMessage.findUnique({
      where: { id: Number(questionMessageId) },
    });
    if (!message) {
      throw new NotFoundError("QuestionMessage not found.");
    }

    // 2) Ben je de owner?
    if (message.userId === user.id) {
      return next();
    }

    // 3) of ben je teacher in de bijbehorende class? of admin?
    const question = await prisma.question.findUnique({
      where: { id: Number(questionId) },
      include: {
        team: {
          include: {
            class: {
              include: {
                ClassTeacher: true,
              },
            },
          },
        },
      },
    });
    if (!question) {
      throw new NotFoundError("Question not found for this message.");
    }

    const isTeacherInClass = question.team.class.ClassTeacher.some(
      (ct) => ct.teacherId === user.id,
    );
    const isAdmin = user.role === "ADMIN";

    if (!isTeacherInClass && !isAdmin) {
      throw new AccesDeniedError(
        "Only the owner, the teacher of this class, or an admin can delete this message",
      );
    }

    next();
  },
);
