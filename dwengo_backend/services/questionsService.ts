// services/questionService.ts
import { 
  PrismaClient, 
  Question, 
  QuestionType, 
  QuestionSpecific, 
  QuestionGeneral, 
  QuestionMessage 
} from "@prisma/client";

import referenceValidationService from "./referenceValidationService";
// Of, als jullie geen separate validatieservice willen, kan je die checks inline doen
import { NotFoundError, BadRequestError } from "../errors/errors";

const prisma = new PrismaClient();

export default class QuestionService {
  /**
   * ------------------------------------------
   * HULPFUNCTIE: maak basis Question + 1ste msg
   * ------------------------------------------
   *
   * - Checkt of assignment bestaat,
   * - Checkt of team bestaat
   * - Checkt of de student (studentId) in dat team zit
   * - Maakt Question + eerste QuestionMessage in 1 transactie
   */
  private static async createQuestionAndMessage(
    assignmentId: number,
    teamId: number,
    studentId: number,
    title: string,
    initialMessage: string,
    type: QuestionType
  ): Promise<Question> {
    // 1) Assignment check
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      throw new NotFoundError("Assignment not found.");
    }

    // 2) Team check + student erin?
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        students: {
          some: {
            userId: studentId,  // student moet in het team zitten
          },
        },
        teamAssignment: {
          assignmentId: assignmentId
        }
      },
    });
    if (!team) {
      throw new BadRequestError("Team niet gevonden of student niet in team.");
    }

    // 3) Transactie: Question + eerste message
    const question = await prisma.$transaction(async (tx) => {
      const q = await tx.question.create({
        data: {
          title,
          type,
          assignmentId,
          teamId,
        },
      });
      await tx.questionMessage.create({
        data: {
          questionId: q.id,
          userId: studentId,
          text: initialMessage,
        },
      });
      return q;
    });

    return question;
  }

  /**
   * ---------------------------------------------------
   * CREATE SPECIFIC: vraag over 1 leerobject (Dwengo/lokaal)
   * ---------------------------------------------------
   * - assignmentId, teamId, studentId, title, text
   * - isExternal => Dwengo? Dan (dwengoHruid, dwengoLanguage, dwengoVersion)
   * - anders localLearningObjectId
   */
  static async createQuestionSpecific(
    assignmentId: number,
    teamId: number,
    studentId: number,
    title: string,
    text: string,
    isExternal: boolean,
    localLearningObjectId?: string,
    dwengoHruid?: string,
    dwengoLanguage?: string,
    dwengoVersion?: number
  ): Promise<QuestionSpecific> {
    // 1) Maak basis question + initial msg
    const baseQuestion = await this.createQuestionAndMessage(
      assignmentId, 
      teamId, 
      studentId, 
      title, 
      text, 
      QuestionType.SPECIFIC
    );

    // 2) Validatie object
    if (isExternal) {
      if (!dwengoHruid || !dwengoLanguage || dwengoVersion == null) {
        throw new BadRequestError("Dwengo fields missing: hruid, language, version");
      }
      // roep external validatie (optioneel)
      await referenceValidationService.validateDwengoLearningObject(dwengoHruid, dwengoLanguage, dwengoVersion);
    } else {
      if (!localLearningObjectId) {
        throw new BadRequestError("localLearningObjectId is missing for local question");
      }
      // roep local validatie (optioneel)
      await referenceValidationService.validateLocalLearningObject(localLearningObjectId);
    }

    // 3) Maak questionSpecific
    const questionSpec = await prisma.questionSpecific.create({
      data: {
        questionId: baseQuestion.id,
        isExternal,
        localLearningObjectId: isExternal ? undefined : localLearningObjectId,
        dwengoHruid: isExternal ? dwengoHruid : undefined,
        dwengoLanguage: isExternal ? dwengoLanguage : undefined,
        dwengoVersion: isExternal ? dwengoVersion : undefined,
      },
    });

    return questionSpec;
  }

  /**
   * ---------------------------------------------------
   * CREATE GENERAL: vraag over 1 leerpad (Dwengo/lokaal)
   * ---------------------------------------------------
   * - assignmentId, teamId, studentId, title, text
   * - isExternal => Dwengo? Dan (hruid + language) in pathRef?
   * - anders => local pathId in pathRef
   */
  static async createQuestionGeneral(
    assignmentId: number,
    teamId: number,
    studentId: number,
    title: string,
    text: string,
    isExternal: boolean,
    pathRef: string,   // Dwengo-hruid of local ID
    dwengoLanguage?: string
  ): Promise<QuestionGeneral> {
    // 1) Basis question + message
    const baseQuestion = await this.createQuestionAndMessage(
      assignmentId,
      teamId,
      studentId,
      title,
      text,
      QuestionType.GENERAL
    );

    // 2) Validatie path
    if (isExternal) {
      if (!dwengoLanguage) {
        throw new BadRequestError("Dwengo language is missing for external path question");
      }
      await referenceValidationService.validateDwengoLearningPath(pathRef, dwengoLanguage);
    } else {
      // local
      await referenceValidationService.validateLocalLearningPath(pathRef);
    }

    // 3) questionGeneral
    const questionGen = await prisma.questionGeneral.create({
      data: {
        questionId: baseQuestion.id,
        pathRef,
        isExternal
      },
    });
    return questionGen;
  }

  /**
   * ---------------------------------------
   * EXTRA BERICHT: createQuestionMessage
   * ---------------------------------------
   * - men voegt reply toe aan bestaande vraag
   */
  static async createQuestionMessage(
    questionId: number,
    userId: number,
    text: string
  ): Promise<QuestionMessage> {
    if (!text.trim()) {
      throw new BadRequestError("Message cannot be empty");
    }
    // Optioneel: check of user wel in dat team of teacher van die klas (afhankelijk van policy).
    // Voor nu enkel check of question bestaat:
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) {
      throw new NotFoundError("Question not found");
    }

    const msg = await prisma.questionMessage.create({
      data: {
        questionId,
        userId,
        text,
      },
    });
    return msg;
  }

  /**
   * updateQuestion: enkel titel
   */
  static async updateQuestion(questionId: number, newTitle: string): Promise<Question> {
    if (!newTitle.trim()) {
      throw new BadRequestError("Title mag niet leeg zijn");
    }
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      throw new NotFoundError("Question not found");
    }
    const updated = await prisma.question.update({
      where: { id: questionId },
      data: { title: newTitle },
    });
    return updated;
  }

  /**
   * updateQuestionMessage
   * - We gaan ervan uit dat we elders checken of user owner is
   */
  static async updateQuestionMessage(
    questionMessageId: number,
    newText: string
  ): Promise<QuestionMessage> {
    if (!newText.trim()) {
      throw new BadRequestError("Message cannot be empty");
    }
    // check if the message exists
    const msg = await prisma.questionMessage.findUnique({
      where: { id: questionMessageId },
    });
    if (!msg) {
      throw new NotFoundError("QuestionMessage not found");
    }
    const updated = await prisma.questionMessage.update({
      where: { id: questionMessageId },
      data: { text: newText },
    });
    return updated;
  }

  /**
   * GET: 1 vraag
   */
  static async getQuestion(questionId: number): Promise<Question> {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        specific: true,
        general: true,
        questionConversation: true
      },
    });
    if (!question) {
      throw new NotFoundError("Question not found");
    }
    return question;
  }

  /**
   * GET: alle vragen in een bepaald team
   */
  static async getQuestionsForTeam(teamId: number): Promise<Question[]> {
    return prisma.question.findMany({
      where: { teamId },
      include: {
        specific: true,
        general: true,
        questionConversation: true
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * GET: alle vragen in een bepaalde klas
   *  => we zoeken questions van alle teams in classId
   */
  static async getQuestionsForClass(classId: number): Promise<Question[]> {
    // alle teams in die class
    return prisma.question.findMany({
      where: {
        team: {
          classId
        },
      },
      include: {
        specific: true,
        general: true,
        questionConversation: true
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * GET: alle vragen in een assignment (binnen een klas)
   */
  static async getQuestionsForAssignment(
    assignmentId: number,
    classId: number
  ): Promise<Question[]> {
    return prisma.question.findMany({
      where: {
        assignmentId,
        team: {
          classId
        },
      },
      include: {
        specific: true,
        general: true,
        questionConversation: true
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * GET: alle messages bij 1 vraag
   */
  static async getQuestionMessages(questionId: number): Promise<QuestionMessage[]> {
    await this.getQuestion(questionId); // check if question exists
    return prisma.questionMessage.findMany({
      where: { questionId },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * DELETE: vraag
   * - cascade delete questionMessage
   */
  static async deleteQuestion(questionId: number): Promise<Question> {
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      throw new NotFoundError("Question not found");
    }
    // cascade in prisma: questionMessage ondelete: CASCADE => messages gaan mee weg
    return prisma.question.delete({ where: { id: questionId } });
  }

  /**
   * DELETE: message
   */
  static async deleteQuestionMessage(questionMessageId: number): Promise<QuestionMessage> {
    const msg = await prisma.questionMessage.findUnique({ where: { id: questionMessageId } });
    if (!msg) {
      throw new NotFoundError("QuestionMessage not found");
    }
    return prisma.questionMessage.delete({ where: { id: questionMessageId } });
  }
}
