// src/services/class.service.js
import { Class, ClassTeacher, QuestionConversation, PrismaClient, Student, QuestionHead, QuestionType, QuestionSpecific, QuestionGeneral } from "@prisma/client";

const prisma = new PrismaClient();

export default class QuestionService {

    static async createQuestion(assignmentId: number, text: string, teamId: number, studentId: number, type: QuestionType): Promise<QuestionHead> {
        //check if input is valid
        if (!text || !teamId || !studentId || !type) {
            throw new Error("Invalid input");
        }
        //is student in team
        if (!await prisma.team.findFirst({ where: { id: teamId, students: { some: { userId: studentId } } } })) {
            throw new Error("Student is not in team");
        }

        //check if team has this assignment
        if (!await prisma.teamAssignment.findFirst({ where: { teamId: teamId, assignmentId: assignmentId } })) {
            throw new Error("Assignment not found in team");
        }

        const question = await prisma.questionHead.create({
            data: {
                assignmentId,
                teamId,
                type
            }
        });

        const QuestionConversation = await prisma.questionConversation.create({
            data: {
                questionId: question.id,
                userId: studentId,
                text: text
            }
        });

        return question;
    }

    static async createQuestionConversation(questionId: number, text: string, userId: number): Promise<QuestionConversation> {
        //check if input is valid
        if (!text || !userId) {
            throw new Error("Invalid input");
        }

        //check if user is in team or teacher in the questionHead
        const questionHead = await prisma.questionHead.findUnique({
            where: { id: questionId },
            include: {
                team: {
                    include: {
                        students: true,
                        class: { include: { ClassTeacher: true } }
                    }
                }
            }

        });

        if (!questionHead) {
            throw new Error("Question not found");
        }
        const isUserInTeam = questionHead.team.students.some(student => student.userId === userId);
        const isUserTeacher = questionHead.team.class.ClassTeacher.some(teacher => teacher.teacherId === userId);
        if (!isUserInTeam && !isUserTeacher) {
            throw new Error("User is not in team or not a teacher of the questionHead");
        }

        const question = await prisma.questionConversation.create({
            data: {
                questionId,
                userId,
                text
            }
        });
        return question;
    }

    //update questionConversation by id, userId and questionId
    static async updateQuestionConversation(questionId: number, questionConversationId: number, text: string, userId: number): Promise<QuestionConversation> {
        //check if input is valid
        if (!userId || !text) {
            throw new Error("Invalid input");
        }

        //Valid edit of questionConversation by id, userId and questionId
        if (!await prisma.questionConversation.findUnique({ where: { id: questionConversationId, userId: userId, questionId: questionId } })) {
            throw new Error("Question not found or user is not the author of the question");
        }

        const question = await prisma.questionConversation.update({
            where: { id: questionConversationId },
            data: {
                text
            }
        });
        return question;
    }

    static async createQuestionSpecific(assignmentId: number, learningPathId: number, text: string, teamId: number, studentId: number,
        type: QuestionType, learningObjectId: string): Promise<QuestionSpecific> {
        if (!await prisma.learningObject.findUnique({ where: { id: learningObjectId } })) {
            throw new Error("Learning object not found");
        }

        if (!await prisma.assignment.findUnique({ where: { id: assignmentId } })) {
            throw new Error("Assignment not found");
        }
        //get learning path id from learning object
        const learningPathIdDb = (await prisma.learningPathNode.findFirst({
            where: {
                nodeId: parseInt(learningObjectId)
            },
            include: {
                learningPath: true  // Dit haalt de gekoppelde LearningPath op
            }
        }))?.learningPath?.id ?? null;
        //check if learning path exists
        if (!learningPathId || learningPathId !== learningPathIdDb) {
            throw new Error("Learning path not found");
        }
        //check if learning path is in assignment
        if (!await prisma.assignment.findFirst({ where: { id: assignmentId, learningPathId: learningPathId } })) {
            throw new Error("Learning path not found in assignment");
        }

        //transaction: rollbacks the changes if one of the queries fails
        return prisma.$transaction(async (prisma) => {
            const question = await this.createQuestion(assignmentId, text, teamId, studentId, type);
            const questionGeneral = await prisma.questionSpecific.create({
                data: {
                    questionId: question.id,
                    learningObjectId
                }
            });
            return questionGeneral;
        });
    }

    static async createQuestionGeneral(assignmentId: number, text: string, teamId: number,
        studentId: number, type: QuestionType, learningPathId: number):
        Promise<QuestionGeneral> {
        if (!await prisma.assignment.findUnique({ where: { id: assignmentId } })) {
            throw new Error("Assignment not found");
        }

        if (!await prisma.assignment.findFirst({ where: { id: assignmentId, learningPathId: learningPathId } })) {
            throw new Error("Learning path not found in assignment");
        }

        //transaction: rollbacks the changes if one of the queries fails
        return prisma.$transaction(async (prisma) => {
            const question = await this.createQuestion(assignmentId, text, teamId, studentId, type);
            const questionGeneral = await prisma.questionGeneral.create({
                data: {
                    questionId: question.id,
                    learningPathId
                }
            });
            return questionGeneral;
        });
    }

    //gets all questionHeads from a team
    static async getQuestionsTeam(teamId: number): Promise<QuestionHead[]> {

        if (!await prisma.team.findUnique({ where: { id: teamId } })) {
            throw new Error("Team not found");
        }


        const questions = await prisma.questionHead.findMany({
            where: {
                teamId: teamId
            }
        });

        return questions;
    }

    //get questions from same class
    static async getQuestionsClass(classId: number): Promise<QuestionHead[]> {

        if (!await prisma.class.findUnique({ where: { id: classId } })) {
            throw new Error("Class not found");
        }

        const questions = await prisma.questionHead.findMany({
            where: {
                team: {
                    classId: classId
                }
            }
        });

        return questions;
    }

    //get questions from same assignment in a class
    static async getQuestionsAssignment(assignmentId: number, classId: number): Promise<QuestionHead[]> {
        //check if assignment, class and teacher exist
        const [assignment, classEntity] = await Promise.all([
            prisma.assignment.findUnique({ where: { id: assignmentId } }),
            prisma.class.findUnique({ where: { id: classId } }),
        ]);

        if (!assignment) {
            throw new Error("Assignment not found");
        }

        if (!classEntity) {
            throw new Error("Class not found");
        }


        const questions = await prisma.questionHead.findMany({
            where: {
                assignmentId: assignmentId,
                team: {
                    classId: classId
                }
            }
        });

        return questions;
    }

    //get spefici question by id
    static async getQuestion(questionId: number): Promise<QuestionSpecific> {
        const question = await prisma.questionSpecific.findUnique({
            where: { questionId }
        });

        if (!question) {
            throw new Error("Question not found");
        }

        return question;
    }

    //get questions from same QuestionHead
    static async getQuestionConversations(questionId: number): Promise<QuestionConversation[]> {
        if (!await prisma.questionHead.findUnique({ where: { id: questionId } })) {
            throw new Error("Question not found");
        }
        const questionConv = await prisma.questionConversation.findMany({
            where: {
                questionId: questionId
            }
        });

        if (!questionConv) {
            throw new Error("Question not found");
        }

        return questionConv;
    }

    //delete question by id
    static async deleteQuestion(questionId: number): Promise<QuestionHead> {
        if (!await prisma.questionHead.findUnique({ where: { id: questionId } })) {
            throw new Error("Question not found");
        }
        // Execute deletion within a transaction
        return prisma.$transaction(async (prisma) => {
            // Delete all related question conversations first
            await prisma.questionConversation.deleteMany({
                where: { questionId: questionId }
            });
            //delete question specific or general
            await prisma.questionSpecific.deleteMany({
                where: { questionId: questionId }
            });
            await prisma.questionGeneral.deleteMany({
                where: { questionId: questionId }
            });

            // Then delete the question head
            const question = await prisma.questionHead.delete({
                where: { id: questionId }
            });

            return question;
        });
    }

    static async deleteQuestionConversation(questionId: number, questionConversationId: number): Promise<QuestionConversation> {
        const question = await prisma.questionConversation.delete({
            where: { id: questionConversationId, questionId: questionId }
        });
        return question;
    }

}