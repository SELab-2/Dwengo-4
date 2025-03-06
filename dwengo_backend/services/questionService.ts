// src/services/class.service.js
import { Class, ClassStudent, ClassAssignment, PrismaClient, Student, Question, QuestionType, QuestionSpecific, QuestionGeneral } from "@prisma/client";

const prisma = new PrismaClient();

export default class QuestionService {

    static async createQuestion(description: string, teamId: number, studentId: number, type: QuestionType): Promise<Question> {

        //check if input is valid
        if (!description || !teamId || !studentId || !type) {
            throw new Error("Invalid input");
        }
        if (!await prisma.team.findUnique({ where: { id: teamId } })) {
            throw new Error("Team not found");
        }
        //is student in team
        if (! await prisma.team.findFirst({ where: { id: teamId, students: { some: { userId: studentId } } } })) {
            throw new Error("Student is not in team");
        }

        const question = await prisma.question.create({
            data: {
                description,
                teamId,
                type,
                studentId
            }
        });

        return question;
    }

    //can also be used for spefic and general questions because they both still use the same questionId
    static async updateQuestion(questionId: number, description: string, teamId: number, studentId: number): Promise<Question> {

        //check if input is valid
        if (!teamId || !studentId || !description) {
            throw new Error("Invalid input");
        }
        if (!await prisma.team.findUnique({ where: { id: teamId } })) {
            throw new Error("Team not found");
        }
        //is student in team
        if (! await prisma.team.findFirst({ where: { id: teamId, students: { some: { userId: studentId } } } })) {
            throw new Error("Student is not in team");
        }

        const question = await prisma.question.update({
            where: { id: questionId, studentId: studentId, teamId: teamId },
            data: {
                description
            }
        });

        return question;
    }

    //get all the questions from the same team
    static async getQuestionsTeam(teamId: number): Promise<Question[]> {
        //does team exist
        if (!await prisma.team.findUnique({ where: { id: teamId } })) {
            throw new Error("Team not found");
        }

        const quest = await prisma.question.findMany({
            where: {
                teamId: teamId
            },
            include: {
                general: true
            }
        });
        const result = await prisma.$queryRaw`
            SELECT q.*, qg.learningPathId FROM "Question" q
            JOIN "QuestionGeneral" qg ON q.id = qg.questionId
            WHERE q.teamId = ${teamId}
            AND q.createdAt = (
                SELECT MIN(q2.createdAt)
                FROM "Question" q2
                JOIN "QuestionGeneral" qg2 ON q2.id = qg2.questionId
                WHERE qg2.learningPathId = qg.learningPathId
                AND q2.teamId = ${teamId}
            )
            `;

        return quest;
    }

    static async createQuestionSpecific(description: string, teamId: number, studentId: number, type: QuestionType, learningObjectId: string): Promise<QuestionSpecific> {

        const question = await this.createQuestion(description, teamId, studentId, type);
        //does learning object exist
        if (!await prisma.learningObject.findUnique({ where: { id: learningObjectId } })) {
            throw new Error("Learning object not found");
        }

        const questionSpecific = await prisma.questionSpecific.create({
            data: {
                questionId: question.id,
                learningObjectId
            }
        });

        return questionSpecific;
    }

    static async createQuestionGeneral(description: string, teamId: number, studentId: number, type: QuestionType, learningPathId: number): Promise<QuestionGeneral> {
        const question = await this.createQuestion(description, teamId, studentId, type);
        //does learning path exist
        if (! await prisma.learningPath.findUnique({ where: { id: learningPathId } })) {
            throw new Error("Learning path not found");
        }

        const questionGeneral = await prisma.questionGeneral.create({
            data: {
                questionId: question.id,
                learningPathId
            }
        });
        return questionGeneral;
    }




}