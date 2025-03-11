// src/services/class.service.js
import { Class, ClassTeacher, QuestionMessage, PrismaClient, Student, Question, QuestionType, QuestionSpecific, QuestionGeneral } from "@prisma/client";

const prisma = new PrismaClient();

export default class QuestionService {

    static async createQuestion(assignmentId: number, title: string, text: string, teamId: number, studentId: number, type: QuestionType): Promise<Question> {
        //check if input is valid
        if (!text || !teamId || !studentId || !type || !title) {
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
        const question = await prisma.question.findUnique({
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

        if (!question) {
            throw new Error("Question not found");
        }
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
        if (!await prisma.question.findUnique({ where: { id: questionId } })) {
            throw new Error("Question not found or user is not in the team of the question");
        }

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
        if (!await prisma.questionMessage.findUnique({ where: { id: questionMessageId, userId: userId, questionId: questionId } })) {
            throw new Error("Question message not found or user is not the author of the question message");
        }

        const question = await prisma.questionMessage.update({
            where: { id: questionMessageId },
            data: {
                text
            }
        });
        return question;
    }

    static async createQuestionSpecific(assignmentId: number, title: string, learningPathId: number, text: string, teamId: number, studentId: number,
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

        if (!await prisma.team.findUnique({ where: { id: teamId } })) {
            throw new Error("Team not found");
        }


        const questions = await prisma.question.findMany({
            where: {
                teamId: teamId
            }
        });

        return questions;
    }

    //get questions from same class
    static async getQuestionsClass(classId: number): Promise<Question[]> {

        if (!await prisma.class.findUnique({ where: { id: classId } })) {
            throw new Error("Class not found");
        }

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
            prisma.assignment.findUnique({ where: { id: assignmentId } }),
            prisma.class.findUnique({ where: { id: classId } }),
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
        const question = await prisma.question.findUnique({
            where: { id: questionId }
        });

        if (!question) {
            throw new Error("Question not found");
        }


        return question;
    }

    //get questions from same Question
    static async getQuestionMessages(questionId: number): Promise<QuestionMessage[]> {
        if (!await prisma.question.findUnique({ where: { id: questionId } })) {
            throw new Error("Question not found");
        }
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
        if (!await prisma.question.findUnique({ where: { id: questionId } })) {
            throw new Error("Question not found");
        }
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