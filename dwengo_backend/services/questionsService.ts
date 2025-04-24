import {
  Question,
  QuestionGeneral,
  QuestionMessage,
  QuestionSpecific,
  QuestionType,
  Role,
} from "@prisma/client";

import referenceValidationService from "./referenceValidationService";
import { BadRequestError, NotFoundError } from "../errors/errors";
import { AuthenticatedUser } from "../interfaces/extendedTypeInterfaces";

import prisma from "../config/prisma";
import {
  handlePrismaQuery,
  handlePrismaTransaction,
} from "../errors/errorFunctions";

/**
 * Helper: bepaal of een gegeven user deze vraag mag *zien* in een overzicht.
 *
 * - Als question.isPrivate == true => enkel zichtbaar voor:
 *   (1) de maker (question.createdBy),
 *   (2) teacher(s) in de class,
 *   ((3) admin)
 * - Als question.isPrivate == false => zichtbaar voor:
 *   (1) teamleden,
 *   (2) teacher(s) in de class,
 *   ((3) admin)
 *
 * Let op: we veronderstellen dat 'question' is ingeladen met
 *  team -> { students, class -> { ClassTeacher } }.
 */
function canUserSeeQuestionInList(
  question: Question & {
    team: {
      students: { userId: number }[];
      class: {
        ClassTeacher: { teacherId: number }[];
      };
    };
  },
  user: AuthenticatedUser
): boolean {
  const isAdmin = user.role === Role.ADMIN;

  // Teacher in class?
  const isTeacherInClass = question.team.class.ClassTeacher.some(
    (ct) => ct.teacherId === user.id
  );

  // Student in team?
  const isStudentInTeam = question.team.students.some(
    (s) => s.userId === user.id
  );

  if (question.isPrivate) {
    // Private => alleen creator, teacher in class, admin
    const isCreator = question.createdBy === user.id;
    return isCreator || isTeacherInClass || isAdmin;
  } else {
    // Niet private => hele team, teacher, admin
    return isStudentInTeam || isTeacherInClass || isAdmin;
  }
}

export default class QuestionService {
  /**
   * ------------------------------------------
   * HULPFUNCTIE: maak basis Question + 1ste msg
   * ------------------------------------------
   */
  private static async createQuestionAndMessage(
    assignmentId: number,
    teamId: number,
    creatorId: number,
    title: string,
    initialMessage: string,
    type: QuestionType,
    isTeacher: boolean,
    isPrivate: boolean
  ): Promise<Question> {
    // 1) Check assignment
    const assignment = await handlePrismaQuery(() =>
      prisma.assignment.findUnique({
        where: { id: assignmentId },
      })
    );
    if (!assignment) {
      throw new NotFoundError("Assignment not found.");
    }

    // 2) Check team
    const team = await handlePrismaQuery(() =>
      prisma.team.findUnique({
        where: { id: teamId },
        include: {
          teamAssignment: true,
          students: true,
        },
      })
    );
    if (!team) {
      throw new NotFoundError("Team not found.");
    }

    // Check of team bij deze assignment hoort
    if (
      !team.teamAssignment ||
      team.teamAssignment.assignmentId !== assignmentId
    ) {
      throw new BadRequestError(
        "The specified team wasn't assigned to this assignment."
      );
    }

    // Indien student => check of hij/zij in team zit
    if (!isTeacher) {
      const studentInTeam = team.students.some((s) => s.userId === creatorId);
      if (!studentInTeam) {
        throw new BadRequestError("Student is not part of the team.");
      }
    }

    // 3) Transactie: Question + eerste message
    const newQuestion = await handlePrismaTransaction(prisma, async (tx) => {
      const q = await tx.question.create({
        data: {
          title,
          type,
          assignmentId,
          teamId,
          createdBy: creatorId,
          isPrivate,
        },
      });
      await tx.questionMessage.create({
        data: {
          questionId: q.id,
          userId: creatorId,
          text: initialMessage,
        },
      });
      return q;
    });
    return newQuestion;
  }

  /**
   * CREATE SPECIFIC
   */
  static async createQuestionSpecific(
    assignmentId: number,
    teamId: number,
    creatorId: number,
    creatorRole: Role,
    title: string,
    text: string,
    isExternal: boolean,
    isPrivate: boolean,
    localLearningObjectId?: string,
    dwengoHruid?: string,
    dwengoLanguage?: string,
    dwengoVersion?: number
  ): Promise<QuestionSpecific> {
    const baseQuestion = await this.createQuestionAndMessage(
      assignmentId,
      teamId,
      creatorId,
      title,
      text,
      QuestionType.SPECIFIC,
      creatorRole === Role.TEACHER,
      isPrivate
    );

    // Validatie object
    if (isExternal) {
      if (!dwengoHruid || !dwengoLanguage || dwengoVersion == null) {
        throw new BadRequestError(
          "Dwengo mandatory fields missing: hruid, language, version."
        );
      }
      await referenceValidationService.validateDwengoLearningObject(
        dwengoHruid,
        dwengoLanguage,
        dwengoVersion
      );
    } else {
      if (!localLearningObjectId) {
        throw new BadRequestError(
          "LocalLearningObjectId is missing for local question."
        );
      }
      await referenceValidationService.validateLocalLearningObject(
        localLearningObjectId
      );
    }

    return await handlePrismaQuery(() =>
      prisma.questionSpecific.create({
        data: {
          questionId: baseQuestion.id,
          isExternal,
          localLearningObjectId: isExternal ? undefined : localLearningObjectId,
          dwengoHruid: isExternal ? dwengoHruid : undefined,
          dwengoLanguage: isExternal ? dwengoLanguage : undefined,
          dwengoVersion: isExternal ? dwengoVersion : undefined,
        },
      })
    );
  }

  /**
   * CREATE GENERAL
   */
  static async createQuestionGeneral(
    assignmentId: number,
    teamId: number,
    creatorId: number,
    creatorRole: Role,
    title: string,
    text: string,
    isExternal: boolean,
    isPrivate: boolean,
    pathRef: string,
    dwengoLanguage?: string
  ): Promise<QuestionGeneral> {
    const baseQuestion = await this.createQuestionAndMessage(
      assignmentId,
      teamId,
      creatorId,
      title,
      text,
      QuestionType.GENERAL,
      creatorRole === "TEACHER",
      isPrivate
    );

    // Validatie path
    if (isExternal) {
      if (!dwengoLanguage) {
        throw new BadRequestError(
          "Dwengo language is missing for external path question."
        );
      }
      await referenceValidationService.validateDwengoLearningPath(
        pathRef,
        dwengoLanguage
      );
    } else {
      await referenceValidationService.validateLocalLearningPath(pathRef);
    }

    return await handlePrismaQuery(() =>
      prisma.questionGeneral.create({
        data: {
          questionId: baseQuestion.id,
          pathRef,
          isExternal,
        },
      })
    );
  }

  /**
   * CREATE message
   */
  static async createQuestionMessage(
    questionId: number,
    userId: number,
    text: string
  ): Promise<QuestionMessage> {
    if (!text.trim()) {
      throw new BadRequestError("Message cannot be empty.");
    }
    const question = await handlePrismaQuery(() =>
      prisma.question.findUnique({
        where: { id: questionId },
      })
    );
    if (!question) {
      throw new NotFoundError("Question not found.");
    }

    return await handlePrismaQuery(() =>
      prisma.questionMessage.create({
        data: {
          questionId,
          userId,
          text,
        },
      })
    );
  }

  /**
   * UPDATE question (titel)
   */
  static async updateQuestion(
    questionId: number,
    newTitle: string
  ): Promise<Question> {
    if (!newTitle.trim()) {
      throw new BadRequestError("Title cannot be empty.");
    }
    const q = await handlePrismaQuery(() =>
      prisma.question.findUnique({ where: { id: questionId } })
    );
    if (!q) {
      throw new NotFoundError("Question not found.");
    }
    return await handlePrismaQuery(() =>
      prisma.question.update({
        where: { id: questionId },
        data: { title: newTitle },
      })
    );
  }

  /**
   * UPDATE message (tekst)
   */
  static async updateQuestionMessage(
    questionMessageId: number,
    newText: string
  ): Promise<QuestionMessage> {
    if (!newText.trim()) {
      throw new BadRequestError("Message cannot be empty.");
    }
    const msg = await handlePrismaQuery(() =>
      prisma.questionMessage.findUnique({
        where: { id: questionMessageId },
      })
    );
    if (!msg) {
      throw new NotFoundError("QuestionMessage not found.");
    }
    return await handlePrismaQuery(() =>
      prisma.questionMessage.update({
        where: { id: questionMessageId },
        data: { text: newText },
      })
    );
  }

  /**
   * GET één vraag (enkel 1 detail)
   * (De authorizeQuestion middleware checkt of user mag inzien.)
   */
  static async getQuestion(questionId: number): Promise<Question> {
    const question = await handlePrismaQuery(() =>
      prisma.question.findUnique({
        where: { id: questionId },
        include: {
          specific: true,
          general: true,
          questionConversation: true,
        },
      })
    );
    if (!question) {
      throw new NotFoundError("Question not found.");
    }
    return question;
  }

  /**
   * GET: alle vragen in 1 team, gefilterd op private
   *  We hebben 'user' nodig om te filteren.
   */
  static async getQuestionsForTeam(
    teamId: number,
    user: AuthenticatedUser
  ): Promise<Question[]> {
    const allQs = await handlePrismaQuery(() =>
      prisma.question.findMany({
        where: { teamId },
        include: {
          team: {
            include: {
              students: true,
              class: { include: { ClassTeacher: true } },
            },
          },
          specific: true,
          general: true,
          questionConversation: true,
        },
        orderBy: { createdAt: "desc" },
      })
    );
    return allQs.filter((q) => canUserSeeQuestionInList(q, user));
  }

  /**
   * GET: alle vragen in 1 class, gefilterd
   */
  static async getQuestionsForClass(
    classId: number,
    user: AuthenticatedUser
  ): Promise<Question[]> {
    const allQs = await handlePrismaQuery(() =>
      prisma.question.findMany({
        where: {
          team: { classId },
        },
        include: {
          team: {
            include: {
              students: true,
              class: { include: { ClassTeacher: true } },
            },
          },
          specific: true,
          general: true,
          questionConversation: true,
        },
        orderBy: { createdAt: "desc" },
      })
    );
    return allQs.filter((q) => canUserSeeQuestionInList(q, user));
  }

  /**
   * GET: alle vragen voor assignment + class, gefilterd
   */
  static async getQuestionsForAssignment(
    assignmentId: number,
    classId: number,
    user: AuthenticatedUser
  ): Promise<Question[]> {
    const allQs = await handlePrismaQuery(() =>
      prisma.question.findMany({
        where: {
          assignmentId,
          team: {
            classId,
          },
        },
        include: {
          team: {
            include: {
              students: true,
              class: { include: { ClassTeacher: true } },
            },
          },
          specific: true,
          general: true,
          questionConversation: true,
        },
        orderBy: { createdAt: "desc" },
      })
    );
    return allQs.filter((q) => canUserSeeQuestionInList(q, user));
  }

  /**
   * GET: alle messages van 1 vraag
   * (De authorizeQuestion-middleware checkt of user de vraag mag zien.)
   */
  static async getQuestionMessages(
    questionId: number
  ): Promise<QuestionMessage[]> {
    await this.getQuestion(questionId); // check existence
    return await handlePrismaQuery(() =>
      prisma.questionMessage.findMany({
        where: { questionId },
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      })
    );
  }

  /**
   * DELETE vraag (cascade messages)
   */
  static async deleteQuestion(questionId: number): Promise<Question> {
    const question = await handlePrismaQuery(() =>
      prisma.question.findUnique({
        where: { id: questionId },
      })
    );
    if (!question) {
      throw new NotFoundError("Question not found.");
    }
    return await handlePrismaQuery(() =>
      prisma.question.delete({ where: { id: questionId } })
    );
  }

  /**
   * DELETE message
   */
  static async deleteQuestionMessage(
    questionMessageId: number
  ): Promise<QuestionMessage> {
    const msg = await handlePrismaQuery(() =>
      prisma.questionMessage.findUnique({
        where: { id: questionMessageId },
      })
    );
    if (!msg) {
      throw new NotFoundError("QuestionMessage not found.");
    }
    return await handlePrismaQuery(() =>
      prisma.questionMessage.delete({ where: { id: questionMessageId } })
    );
  }
}
