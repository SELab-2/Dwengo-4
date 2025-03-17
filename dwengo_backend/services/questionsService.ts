
import {
  PrismaClient,
  Question,
  QuestionType,
  QuestionSpecific,
  QuestionGeneral,
  QuestionMessage,
} from "@prisma/client";
import  ReferenceValidationService  from "./referenceValidationService";

const prisma = new PrismaClient();

export default class QuestionService {
  /**
   * -----------------------------------------------------
   *  HELPER: Create the base question + initial message
   * -----------------------------------------------------
   */
  private static async createQuestionAndMessage(
    assignmentId: number,
    teamId: number,
    studentId: number,
    title: string,
    text: string,
    type: QuestionType
  ): Promise<Question> {
    // 1) Controleer of assignment en team bestaan
    //    (en dat de studentId in de team zit, e.d.)
    await Promise.all([
      prisma.assignment.findUniqueOrThrow({ where: { id: assignmentId } }),
      prisma.team.findFirstOrThrow({
        where: { id: teamId, students: { some: { userId: studentId } } },
      }),
    ]);

    // 2) Maak question + eerste message in een transactie
    return prisma.$transaction(async (tx) => {
      const question = await tx.question.create({
        data: {
          assignmentId,
          teamId,
          title,
          type,
        },
      });
      await tx.questionMessage.create({
        data: {
          questionId: question.id,
          userId: studentId,
          text,
        },
      });
      return question;
    });
  }

  /**
   * -----------------------------------------------------
   *  CREATE: QUESTION SPECIFIC (leerobject)
   * -----------------------------------------------------
   *  We verwachten in de controller een body met:
   *    assignmentId, title, text, teamId, studentId,
   *    isExternal (bool), 
   *    - Als isExternal=true: dwengoHruid, dwengoLanguage, dwengoVersion
   *    - Als isExternal=false: localLearningObjectId
   *    (optioneel) learningPathId (ter controle dat assignment bij path hoort)
   */
  static async createQuestionSpecific(
    assignmentId: number,
    title: string,
    text: string,
    teamId: number,
    studentId: number,
    type: QuestionType,

    // Belangrijkste velden voor extern / lokaal:
    isExternal: boolean,
    dwengoHruid?: string,
    dwengoLanguage?: string,
    dwengoVersion?: number,
    localLearningObjectId?: string,

    // Als je nog logic hebt om assignment vs path te matchen:
    learningPathId?: string
  ): Promise<QuestionSpecific> {
    // 1) Assignment check
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    // (optionele check of assignment.pathRef == learningPathId)
    if (learningPathId && assignment.pathRef !== learningPathId) {
      throw new Error("Assignment not linked to this learningPathId");
    }

    // 2) Maak eerst basis question + message
    const question = await this.createQuestionAndMessage(
      assignmentId,
      teamId,
      studentId,
      title,
      text,
      type
    );

    // 3) Valideer object, afhankelijk van isExternal
    //    -> roep ReferenceValidationService aan
    if (isExternal) {
      // Dwengo-leerobject
      if (!dwengoHruid || !dwengoLanguage || typeof dwengoVersion !== "number") {
        throw new Error(
          "Missing Dwengo leerobject fields: dwengoHruid, dwengoLanguage, dwengoVersion"
        );
      }
      await ReferenceValidationService.validateDwengoLearningObject(
        dwengoHruid,
        dwengoLanguage,
        dwengoVersion
      );
    } else {
      // Lokaal
      if (!localLearningObjectId) {
        throw new Error("Missing localLearningObjectId for local object");
      }
      await ReferenceValidationService.validateLocalLearningObject(
        localLearningObjectId
      );
    }

    // 4) questionSpecific aanmaken
    const questionSpec = await prisma.questionSpecific.create({
      data: {
        questionId: question.id,
        isExternal,
        ...(isExternal
          ? {
              dwengoHruid,
              dwengoLanguage,
              dwengoVersion,
            }
          : {
              localLearningObjectId,
            }),
      },
    });

    return questionSpec;
  }

  /**
   * -----------------------------------------------------
   *  CREATE: QUESTION GENERAL (leerpad)
   * -----------------------------------------------------
   *  - local path -> validateLocalLearningPath
   *  - external path -> validateDwengoLearningPath (hruid+language?)
   *  In DB: we slaan 'pathRef' (string) en 'isExternal' op in questionGeneral.
   */
  static async createQuestionGeneral(
    assignmentId: number,
    title: string,
    text: string,
    teamId: number,
    studentId: number,
    type: QuestionType,
    pathRef: string,    // hier komt ofwel localID, ofwel Dwengo-hruid
    isExternal: boolean,
    dwengoLanguage?: string
  ): Promise<QuestionGeneral> {
    // 1) Assignment check
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    // 2) Basis question + message
    const question = await this.createQuestionAndMessage(
      assignmentId,
      teamId,
      studentId,
      title,
      text,
      type
    );

    // 3) Validatie (dwengo vs local)
    if (isExternal) {
      // We gaan ervan uit dat pathRef = Dwengo-hruid, en dwengoLanguage is meegegeven
      if (!dwengoLanguage) {
        throw new Error("Missing dwengoLanguage for external path");
      }
      await ReferenceValidationService.validateDwengoLearningPath(
        pathRef,
        dwengoLanguage
      );
    } else {
      // Lokale leerpad-check (pathRef = local ID)
      await ReferenceValidationService.validateLocalLearningPath(pathRef);
    }

    // 4) questionGeneral opslaan
    const questionGen = await prisma.questionGeneral.create({
      data: {
        questionId: question.id,
        pathRef: pathRef,   // string
        isExternal: isExternal,
      },
    });

    return questionGen;
  }

  /**
   * -----------------------------------------------------
   *  Overige CREATE, GET, UPDATE, DELETE methodes
   * -----------------------------------------------------
   */

  // Een extra message bij een vraag aanmaken
  static async createQuestionMessage(
    questionId: number,
    text: string,
    userId: number
  ): Promise<QuestionMessage> {
    if (!text || !userId) {
      throw new Error("Invalid input");
    }

    // check of user in het team of teacher van die team
    const question = await prisma.question.findUniqueOrThrow({
      where: { id: questionId },
      include: {
        team: {
          include: {
            students: true,
            class: { include: { ClassTeacher: true } },
          },
        },
      },
    });

    const isUserInTeam = question.team.students.some(
      (student) => student.userId === userId
    );
    const isUserTeacher = question.team.class.ClassTeacher.some(
      (teacher) => teacher.teacherId === userId
    );
    if (!isUserInTeam && !isUserTeacher) {
      throw new Error("User is not in team or not a teacher of this question");
    }

    return prisma.questionMessage.create({
      data: {
        questionId,
        userId,
        text,
      },
    });
  }

  // Titel van een vraag bijwerken
  static async updateQuestion(questionId: number, title: string): Promise<Question> {
    if (!title) {
      throw new Error("Invalid input (title is required)");
    }
    await prisma.question.findUniqueOrThrow({ where: { id: questionId } });
    return prisma.question.update({
      where: { id: questionId },
      data: { title },
    });
  }

  // Een message in een vraag updaten
  static async updateQuestionMessage(
    questionId: number,
    questionMessageId: number,
    text: string,
    userId: number
  ): Promise<QuestionMessage> {
    if (!userId || !text) {
      throw new Error("Invalid input");
    }
    // check of message met (id, questionId, userId) bestaat
    await prisma.questionMessage.findUniqueOrThrow({
      where: {
        // je kunt in Prisma 4.8 nog geen multi-col key direct meegeven,
        // dus doe:
        id: questionMessageId,
      },
    });
    // (optioneel: checken of userId klopt)
    return prisma.questionMessage.update({
      where: { id: questionMessageId },
      data: { text },
    });
  }

  // GET: alle vragen van een team
  static async getQuestionsTeam(teamId: number): Promise<Question[]> {
    await prisma.team.findUniqueOrThrow({ where: { id: teamId } });
    return prisma.question.findMany({
      where: { teamId },
    });
  }

  // GET: alle vragen in een klas
  static async getQuestionsClass(classId: number): Promise<Question[]> {
    await prisma.class.findUniqueOrThrow({ where: { id: classId } });
    return prisma.question.findMany({
      where: { team: { classId } },
    });
  }

  // GET: alle vragen in een assignment en klas
  static async getQuestionsAssignment(
    assignmentId: number,
    classId: number
  ): Promise<Question[]> {
    await prisma.assignment.findUniqueOrThrow({ where: { id: assignmentId } });
    await prisma.class.findUniqueOrThrow({ where: { id: classId } });
    return prisma.question.findMany({
      where: {
        assignmentId,
        team: { classId },
      },
    });
  }

  // GET: één vraag
  static async getQuestion(questionId: number): Promise<Question> {
    return prisma.question.findUniqueOrThrow({ where: { id: questionId } });
  }

  // GET: alle messages in een vraag
  static async getQuestionMessages(questionId: number): Promise<QuestionMessage[]> {
    await prisma.question.findUniqueOrThrow({ where: { id: questionId } });
    return prisma.questionMessage.findMany({ where: { questionId } });
  }

  // DELETE: een vraag
  static async deleteQuestion(questionId: number): Promise<Question> {
    await prisma.question.findUniqueOrThrow({ where: { id: questionId } });
    return prisma.question.delete({ where: { id: questionId } });
  }

  // DELETE: een bericht in een vraag
  static async deleteQuestionMessage(
    questionId: number,
    questionMessageId: number
  ): Promise<QuestionMessage> {
    // optioneel: check of user mag deleten, etc.
    return prisma.questionMessage.delete({
      where: { id: questionMessageId },
    });
  }
}
