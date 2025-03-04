import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async () => {
  await prisma.$transaction([
    prisma.learningObjectProgress.deleteMany(),
    prisma.studentProgress.deleteMany(),
    prisma.submissionFeedback.deleteMany(),
    prisma.teacherFeedback.deleteMany(),
    prisma.teamSubmission.deleteMany(),
    prisma.evaluationSubmission.deleteMany(),
    prisma.teamAssignment.deleteMany(),
    prisma.team.deleteMany(),
    prisma.classAssignment.deleteMany(),
    prisma.assignment.deleteMany(),
    prisma.questionAnswer.deleteMany(),
    prisma.teacherAnswer.deleteMany(),
    prisma.studentQuestion.deleteMany(),
    prisma.multipleChoiceOption.deleteMany(),
    prisma.evaluationQuestion.deleteMany(),
    prisma.evaluation.deleteMany(),
    prisma.returnValue.deleteMany(),
    prisma.learningObject.deleteMany(),
    prisma.learningPathNode.deleteMany(),
    prisma.learningPath.deleteMany(),
    prisma.invite.deleteMany(),
    prisma.joinRequest.deleteMany(),
    prisma.classTeacher.deleteMany(),
    prisma.classStudent.deleteMany(),
    prisma.class.deleteMany(),
    prisma.student.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.admin.deleteMany(),
    prisma.user.deleteMany()
  ])
}
