// src/services/class.service.js
import { Class, ClassTeacher, QuestionMessage, PrismaClient, Student, Question, QuestionType, QuestionSpecific, QuestionGeneral } from "@prisma/client";

const prisma = new PrismaClient();

export default class QuestionService {

    static async createQuestion(assignmentId: number, title: string, text: string, teamId: number, studentId: number, type: QuestionType): Promise<Question> {
        //check if input is valid
        if (!text || !teamId || !studentId || !type || !title) {
            throw new Error("Invalid input");
        }

        await Promise.all([
            prisma.assignment.findUniqueOrThrow({ where: { id: assignmentId } }),
            prisma.team.findFirstOrThrow({ where: { id: teamId, students: { some: { userId: studentId } } } })
        ]);

        return prisma.$transaction(async (prisma) => {
            const question = await prisma.question.create({
                data: {
                    assignmentId,
                    teamId,
                    title,
                    type
                }
            });

            await prisma.questionMessage.create({
                data: {
                    questionId: question.id,
                    userId: studentId,
                    text: text
                }
            });
            return question;
        });
    }

    static async createQuestionMessage(questionId: number, text: string, userId: number): Promise<QuestionMessage> {
        //check if input is valid
        if (!text || !userId) {
            throw new Error("Invalid input");
        }

        //check if user is in team or teacher in the question
        const question = await prisma.question.findUniqueOrThrow({
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

        const isUserInTeam = question.team.students.some(student => student.userId === userId);
        const isUserTeacher = question.team.class.ClassTeacher.some(teacher => teacher.teacherId === userId);
        if (!isUserInTeam && !isUserTeacher) {
            throw new Error("User is not in team or not a teacher of the question");
        }

        const questionConv = await prisma.questionMessage.create({
            data: {
                questionId,
                userId,
                text
            }
        });
        return questionConv;
    }

    //update question by id, userId and questionId
    static async updateQuestion(questionId: number, title: string): Promise<Question> {
        //check if input is valid
        if (!title) {
            throw new Error("Invalid input");
        }

        //Valid edit of question by id, userId and questionId
        await prisma.question.findUniqueOrThrow({ where: { id: questionId } })

        const question = await prisma.question.update({
            where: { id: questionId },
            data: {
                title
            }
        });
        return question;
    }

    //update questionMessage  by id, userId and questionId
    static async updateQuestionMessage(questionId: number, questionMessageId: number, text: string, userId: number): Promise<QuestionMessage> {
        //check if input is valid
        if (!userId || !text) {
            throw new Error("Invalid input");
        }

        //Valid edit of questionMessage  by id, userId and questionId
        await prisma.questionMessage.findUniqueOrThrow({ where: { id: questionMessageId, userId: userId, questionId: questionId } });

        const question = await prisma.questionMessage.update({
            where: { id: questionMessageId },
            data: {
                text
            }
        });
        return question;
    }

    static async createQuestionSpecific(assignmentId: number, title: string, learningPathId: string, text: string, teamId: number, studentId: number,
        type: QuestionType, learningObjectId: string): Promise<QuestionSpecific> {

        //checks if learning object, assignment, learning path exist
        const [, , learningPathNode,] = await Promise.all([
            prisma.learningObject.findUniqueOrThrow({ where: { id: learningObjectId } }),
            prisma.assignment.findUniqueOrThrow({ where: { id: assignmentId } }),
            prisma.learningPathNode.findFirstOrThrow({ where: { learningPathId: learningPathId, learningObjectId: learningObjectId } }),
            prisma.assignment.findFirstOrThrow({ where: { id: assignmentId, learningPathId: learningPathId } })
        ]);

        const learningPathIdDb = learningPathNode?.learningPathId ?? null;

        //check if learning path exists
        if (learningPathId !== learningPathIdDb) {
            throw new Error("Learning path not found");
        }

        //transaction: rollbacks the changes if one of the queries fails
        return prisma.$transaction(async (prisma) => {
            const question = await this.createQuestion(assignmentId, title, text, teamId, studentId, type);
            const questionGeneral = await prisma.questionSpecific.create({
                data: {
                    questionId: question.id,
                    learningObjectId
                }
            });
            return questionGeneral;
        });
    }

    static async createQuestionGeneral(assignmentId: number, title: string, text: string, teamId: number,
        studentId: number, type: QuestionType, learningPathId: string):
        Promise<QuestionGeneral> {

        //checks if assignment, learning path exist
        await prisma.assignment.findFirstOrThrow({ where: { id: assignmentId, learningPathId: learningPathId } })


        //transaction: rollbacks the changes if one of the queries fails
        return prisma.$transaction(async (prisma) => {
            const question = await this.createQuestion(assignmentId, title, text, teamId, studentId, type);
            const questionGeneral = await prisma.questionGeneral.create({
                data: {
                    questionId: question.id,
                    learningPathId
                }
            });
            return questionGeneral;
        });
    }

    //gets all questions from a team
    static async getQuestionsTeam(teamId: number): Promise<Question[]> {

        await prisma.team.findUniqueOrThrow({ where: { id: teamId } })


        const questions = await prisma.question.findMany({
            where: {
                teamId: teamId
            }
        });

        return questions;
    }

    //get questions from same class
    static async getQuestionsClass(classId: number): Promise<Question[]> {

        await prisma.class.findUniqueOrThrow({ where: { id: classId } })

        const questions = await prisma.question.findMany({
            where: {
                team: {
                    classId: classId
                }
            }
        });

        return questions;
    }

    //get questions from same assignment in a class
    static async getQuestionsAssignment(assignmentId: number, classId: number): Promise<Question[]> {
        //check if assignment, class and teacher exist
        const [assignment, classEntity] = await Promise.all([
            prisma.assignment.findUniqueOrThrow({ where: { id: assignmentId } }),
            prisma.class.findUniqueOrThrow({ where: { id: classId } }),
        ]);

        if (!assignment) {
            throw new Error("Assignment not found");
        }

        if (!classEntity) {
            throw new Error("Class not found");
        }


        const questions = await prisma.question.findMany({
            where: {
                assignmentId: assignmentId,
                team: {
                    classId: classId
                }
            }
        });

        return questions;
    }

    //get speficif question by id
    static async getQuestion(questionId: number): Promise<Question> {
        const question = await prisma.question.findUniqueOrThrow({
            where: { id: questionId }
        });

        return question;
    }

    //get questions from same Question
    static async getQuestionMessages(questionId: number): Promise<QuestionMessage[]> {
        await prisma.question.findUniqueOrThrow({ where: { id: questionId } })

        const questionConv = await prisma.questionMessage.findMany({
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
    static async deleteQuestion(questionId: number): Promise<Question> {
        await prisma.question.findUniqueOrThrow({ where: { id: questionId } })
        // Then delete the question head
        const question = await prisma.question.delete({
            where: { id: questionId }
        });

        return question;
    }

    static async deleteQuestionMessage(questionId: number, questionMessageId: number): Promise<QuestionMessage> {
        const question = await prisma.questionMessage.delete({
            where: { id: questionMessageId, questionId: questionId }
        });
        return question;
    }

}