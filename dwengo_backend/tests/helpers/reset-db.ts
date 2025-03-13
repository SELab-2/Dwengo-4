import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function resetDb() {
    await prisma.$transaction([
        prisma.studentProgress.deleteMany(),
        prisma.questionGeneral.deleteMany(),
        prisma.questionSpecific.deleteMany(),
        prisma.feedback.deleteMany(),
        prisma.classStudent.deleteMany(),
        prisma.teamAssignment.deleteMany(),
        prisma.classAssignment.deleteMany(),
        prisma.invite.deleteMany(),
        prisma.classTeacher.deleteMany(),
        prisma.joinRequest.deleteMany(),
        prisma.learningPathTransition.deleteMany(),
        prisma.multipleChoiceOption.deleteMany(),
        prisma.educationalGoal.deleteMany(),
        prisma.submission.deleteMany(),
        prisma.evaluationQuestion.deleteMany(),
        prisma.returnValue.deleteMany(),
        prisma.learningObjectProgress.deleteMany(),
        prisma.questionMessage.deleteMany(),
        prisma.question.deleteMany(),
        prisma.learningPathNode.deleteMany(),
        prisma.evaluation.deleteMany(),
        prisma.assignment.deleteMany(),
        prisma.team.deleteMany(),
        prisma.learningObject.deleteMany(),
        prisma.learningPath.deleteMany(),
        prisma.class.deleteMany(),
        prisma.student.deleteMany(),
        prisma.teacher.deleteMany(),
        prisma.admin.deleteMany(),
        prisma.user.deleteMany()
    ])
};
