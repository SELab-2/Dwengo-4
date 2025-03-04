import {Feedback, PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export default class FeedbackService {
    static async getAllFeedback(): Promise<Feedback[]>  {
        return prisma.feedback.findMany();
    }

}