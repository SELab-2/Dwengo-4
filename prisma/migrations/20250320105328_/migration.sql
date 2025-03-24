/*
  Warnings:

  - The values [ADDITIONAL] on the enum `QuestionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `deadline` on the `Evaluation` table. All the data in the column will be lost.
  - The primary key for the `Invite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `teacherId` on the `Invite` table. All the data in the column will be lost.
  - The primary key for the `JoinRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `AdditionalQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Answer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EvaluationSubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GeneralQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SpecificQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubmissionFeedback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeacherFeedback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamSubmission` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `deadline` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classTeacherId` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otherTeacherId` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `learningObjectId` to the `LearningPathNode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assignmentId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classId` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "QuestionType_new" AS ENUM ('SPECIFIC', 'GENERAL');
ALTER TABLE "Question" ALTER COLUMN "type" TYPE "QuestionType_new" USING ("type"::text::"QuestionType_new");
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "QuestionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "AdditionalQuestion" DROP CONSTRAINT "AdditionalQuestion_answerId_fkey";

-- DropForeignKey
ALTER TABLE "AdditionalQuestion" DROP CONSTRAINT "AdditionalQuestion_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_learningPathId_fkey";

-- DropForeignKey
ALTER TABLE "ClassAssignment" DROP CONSTRAINT "ClassAssignment_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "ClassAssignment" DROP CONSTRAINT "ClassAssignment_classId_fkey";

-- DropForeignKey
ALTER TABLE "ClassStudent" DROP CONSTRAINT "ClassStudent_classId_fkey";

-- DropForeignKey
ALTER TABLE "ClassStudent" DROP CONSTRAINT "ClassStudent_studentId_fkey";

-- DropForeignKey
ALTER TABLE "ClassTeacher" DROP CONSTRAINT "ClassTeacher_classId_fkey";

-- DropForeignKey
ALTER TABLE "ClassTeacher" DROP CONSTRAINT "ClassTeacher_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "EvaluationSubmission" DROP CONSTRAINT "EvaluationSubmission_evaluationId_fkey";

-- DropForeignKey
ALTER TABLE "GeneralQuestion" DROP CONSTRAINT "GeneralQuestion_learningObjectId_fkey";

-- DropForeignKey
ALTER TABLE "GeneralQuestion" DROP CONSTRAINT "GeneralQuestion_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_classId_fkey";

-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "JoinRequest" DROP CONSTRAINT "JoinRequest_classId_fkey";

-- DropForeignKey
ALTER TABLE "JoinRequest" DROP CONSTRAINT "JoinRequest_studentId_fkey";

-- DropForeignKey
ALTER TABLE "LearningPath" DROP CONSTRAINT "LearningPath_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "SpecificQuestion" DROP CONSTRAINT "SpecificQuestion_learningObjectId_fkey";

-- DropForeignKey
ALTER TABLE "SpecificQuestion" DROP CONSTRAINT "SpecificQuestion_questionId_fkey";

-- DropForeignKey
ALTER TABLE "SubmissionFeedback" DROP CONSTRAINT "SubmissionFeedback_feedbackId_fkey";

-- DropForeignKey
ALTER TABLE "SubmissionFeedback" DROP CONSTRAINT "SubmissionFeedback_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherFeedback" DROP CONSTRAINT "TeacherFeedback_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "TeamAssignment" DROP CONSTRAINT "TeamAssignment_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "TeamSubmission" DROP CONSTRAINT "TeamSubmission_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "TeamSubmission" DROP CONSTRAINT "TeamSubmission_teamId_fkey";

-- DropIndex
DROP INDEX "LearningObject_title_key";

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "deadline" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Evaluation" DROP COLUMN "deadline";

-- AlterTable
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_pkey",
DROP COLUMN "teacherId",
ADD COLUMN     "classTeacherId" INTEGER NOT NULL,
ADD COLUMN     "inviteId" SERIAL NOT NULL,
ADD COLUMN     "otherTeacherId" INTEGER NOT NULL,
ADD CONSTRAINT "Invite_pkey" PRIMARY KEY ("inviteId");

-- AlterTable
ALTER TABLE "JoinRequest" DROP CONSTRAINT "JoinRequest_pkey",
ADD COLUMN     "requestId" SERIAL NOT NULL,
ADD CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("requestId");

-- AlterTable
ALTER TABLE "LearningPathNode" ADD COLUMN     "learningObjectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "description",
ADD COLUMN     "assignmentId" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "classId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "AdditionalQuestion";

-- DropTable
DROP TABLE "Answer";

-- DropTable
DROP TABLE "EvaluationSubmission";

-- DropTable
DROP TABLE "GeneralQuestion";

-- DropTable
DROP TABLE "SpecificQuestion";

-- DropTable
DROP TABLE "SubmissionFeedback";

-- DropTable
DROP TABLE "TeacherFeedback";

-- DropTable
DROP TABLE "TeamSubmission";

-- CreateTable
CREATE TABLE "QuestionSpecific" (
    "questionId" INTEGER NOT NULL,
    "learningObjectId" TEXT NOT NULL,

    CONSTRAINT "QuestionSpecific_pkey" PRIMARY KEY ("questionId","learningObjectId")
);

-- CreateTable
CREATE TABLE "QuestionGeneral" (
    "questionId" INTEGER NOT NULL,
    "learningPathId" TEXT NOT NULL,

    CONSTRAINT "QuestionGeneral_pkey" PRIMARY KEY ("questionId","learningPathId")
);

-- CreateTable
CREATE TABLE "QuestionMessage" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "submissionId" SERIAL NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "submitted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignmentId" INTEGER NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("submissionId")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "submissionId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("submissionId","teacherId")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionSpecific_questionId_key" ON "QuestionSpecific"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionGeneral_questionId_key" ON "QuestionGeneral"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_submissionId_key" ON "Feedback"("submissionId");

-- AddForeignKey
ALTER TABLE "ClassStudent" ADD CONSTRAINT "ClassStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassStudent" ADD CONSTRAINT "ClassStudent_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTeacher" ADD CONSTRAINT "ClassTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTeacher" ADD CONSTRAINT "ClassTeacher_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_otherTeacherId_fkey" FOREIGN KEY ("otherTeacherId") REFERENCES "Teacher"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_classTeacherId_classId_fkey" FOREIGN KEY ("classTeacherId", "classId") REFERENCES "ClassTeacher"("teacherId", "classId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPath" ADD CONSTRAINT "LearningPath_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Teacher"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathNode" ADD CONSTRAINT "LearningPathNode_learningObjectId_fkey" FOREIGN KEY ("learningObjectId") REFERENCES "LearningObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSpecific" ADD CONSTRAINT "QuestionSpecific_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSpecific" ADD CONSTRAINT "QuestionSpecific_learningObjectId_fkey" FOREIGN KEY ("learningObjectId") REFERENCES "LearningObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionGeneral" ADD CONSTRAINT "QuestionGeneral_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionGeneral" ADD CONSTRAINT "QuestionGeneral_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionMessage" ADD CONSTRAINT "QuestionMessage_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAssignment" ADD CONSTRAINT "ClassAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAssignment" ADD CONSTRAINT "ClassAssignment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAssignment" ADD CONSTRAINT "TeamAssignment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("submissionId") ON DELETE CASCADE ON UPDATE CASCADE;
