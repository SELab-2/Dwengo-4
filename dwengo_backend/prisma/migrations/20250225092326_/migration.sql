/*
  Warnings:

  - The primary key for the `Class` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `classId` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `naam` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Class` table. All the data in the column will be lost.
  - The primary key for the `EducationalGoal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `educationalGoalId` on the `EducationalGoal` table. All the data in the column will be lost.
  - You are about to drop the column `goal_id` on the `EducationalGoal` table. All the data in the column will be lost.
  - The primary key for the `Evaluation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `learningObjectId` on the `Evaluation` table. All the data in the column will be lost.
  - The primary key for the `LearningObject` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `content_location` on the `LearningObject` table. All the data in the column will be lost.
  - You are about to drop the column `content_type` on the `LearningObject` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `LearningObject` table. All the data in the column will be lost.
  - You are about to drop the column `estimated_time` on the `LearningObject` table. All the data in the column will be lost.
  - You are about to drop the column `learningObjectId` on the `LearningObject` table. All the data in the column will be lost.
  - You are about to drop the column `skos_concepts` on the `LearningObject` table. All the data in the column will be lost.
  - You are about to drop the column `target_ages` on the `LearningObject` table. All the data in the column will be lost.
  - You are about to drop the column `teacher_exclusive` on the `LearningObject` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `LearningObject` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `LearningObject` table. All the data in the column will be lost.
  - The primary key for the `LearningPath` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `LearningPath` table. All the data in the column will be lost.
  - You are about to drop the column `hruid` on the `LearningPath` table. All the data in the column will be lost.
  - You are about to drop the column `learningPathId` on the `LearningPath` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `LearningPath` table. All the data in the column will be lost.
  - The primary key for the `ReturnValue` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `callback_schema` on the `ReturnValue` table. All the data in the column will be lost.
  - You are about to drop the column `callback_url` on the `ReturnValue` table. All the data in the column will be lost.
  - You are about to drop the column `returnValueId` on the `ReturnValue` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `actief` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `naam` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `paswoord` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MultipleChoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OpenQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Teacher` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[code]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `LearningObject` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `LearningPath` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[learningObjectId]` on the table `ReturnValue` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `EducationalGoal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadline` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `evaluationType` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nrOfQuestions` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentLocation` to the `LearningObject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentType` to the `LearningObject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorId` to the `LearningObject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedTime` to the `LearningObject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `LearningObject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skosConcepts` to the `LearningObject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetAges` to the `LearningObject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherExclusive` to the `LearningObject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LearningObject` table without a default value. This is not possible if the table is not empty.
  - Made the column `version` on table `LearningObject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `language` on table `LearningObject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `title` on table `LearningObject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `description` on table `LearningObject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `keywords` on table `LearningObject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `licence` on table `LearningObject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `difficulty` on table `LearningObject` required. This step will fail if there are existing NULL values in that column.
  - Made the column `available` on table `LearningObject` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `creatorId` to the `LearningPath` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LearningPath` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `LearningPath` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `callbackSchema` to the `ReturnValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `callbackUrl` to the `ReturnValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- CreateEnum
CREATE TYPE "EvaluationType" AS ENUM ('OPEN', 'MULTIPLE');

-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_userId_fkey";

-- DropForeignKey
ALTER TABLE "EducationalGoal" DROP CONSTRAINT "EducationalGoal_learningObjectId_fkey";

-- DropForeignKey
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_learningObjectId_fkey";

-- DropForeignKey
ALTER TABLE "MultipleChoice" DROP CONSTRAINT "MultipleChoice_evaluationId_fkey";

-- DropForeignKey
ALTER TABLE "OpenQuestion" DROP CONSTRAINT "OpenQuestion_evaluationId_fkey";

-- DropForeignKey
ALTER TABLE "ReturnValue" DROP CONSTRAINT "ReturnValue_learningObjectId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_userId_fkey";

-- DropForeignKey
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_userId_fkey";

-- AlterTable
ALTER TABLE "Class" DROP CONSTRAINT "Class_pkey",
DROP COLUMN "classId",
DROP COLUMN "created_at",
DROP COLUMN "naam",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Class_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "EducationalGoal" DROP CONSTRAINT "EducationalGoal_pkey",
DROP COLUMN "educationalGoalId",
DROP COLUMN "goal_id",
ADD COLUMN     "goalId" TEXT,
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "EducationalGoal_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_pkey",
DROP COLUMN "learningObjectId",
ADD COLUMN     "deadline" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "evaluationType" "EvaluationType" NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "nrOfQuestions" INTEGER NOT NULL,
ADD CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "LearningObject" DROP CONSTRAINT "LearningObject_pkey",
DROP COLUMN "content_location",
DROP COLUMN "content_type",
DROP COLUMN "created_at",
DROP COLUMN "estimated_time",
DROP COLUMN "learningObjectId",
DROP COLUMN "skos_concepts",
DROP COLUMN "target_ages",
DROP COLUMN "teacher_exclusive",
DROP COLUMN "updated_at",
DROP COLUMN "uuid",
ADD COLUMN     "contentLocation" TEXT NOT NULL,
ADD COLUMN     "contentType" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creatorId" INTEGER NOT NULL,
ADD COLUMN     "estimatedTime" INTEGER NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "skosConcepts" TEXT NOT NULL,
ADD COLUMN     "targetAges" TEXT NOT NULL,
ADD COLUMN     "teacherExclusive" BOOLEAN NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "version" SET NOT NULL,
ALTER COLUMN "language" SET NOT NULL,
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "keywords" SET NOT NULL,
ALTER COLUMN "licence" SET NOT NULL,
ALTER COLUMN "difficulty" SET NOT NULL,
ALTER COLUMN "available" SET NOT NULL,
ADD CONSTRAINT "LearningObject_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "LearningPath" DROP CONSTRAINT "LearningPath_pkey",
DROP COLUMN "created_at",
DROP COLUMN "hruid",
DROP COLUMN "learningPathId",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creatorId" INTEGER NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ADD CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ReturnValue" DROP CONSTRAINT "ReturnValue_pkey",
DROP COLUMN "callback_schema",
DROP COLUMN "callback_url",
DROP COLUMN "returnValueId",
ADD COLUMN     "callbackSchema" JSONB NOT NULL,
ADD COLUMN     "callbackUrl" TEXT NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "ReturnValue_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "actief",
DROP COLUMN "created_at",
DROP COLUMN "naam",
DROP COLUMN "paswoord",
DROP COLUMN "updated_at",
DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "MultipleChoice";

-- DropTable
DROP TABLE "OpenQuestion";

-- DropTable
DROP TABLE "Student";

-- DropTable
DROP TABLE "Teacher";

-- DropEnum
DROP TYPE "ContentType";

-- CreateTable
CREATE TABLE "ClassUser" (
    "userId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "ClassUser_pkey" PRIMARY KEY ("userId","classId")
);

-- CreateTable
CREATE TABLE "JoinRequest" (
    "userId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "status" "JoinRequestStatus" NOT NULL,

    CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("userId","classId")
);

-- CreateTable
CREATE TABLE "LearningPathNode" (
    "learningPathId" INTEGER NOT NULL,
    "nodeId" INTEGER NOT NULL,

    CONSTRAINT "LearningPathNode_pkey" PRIMARY KEY ("learningPathId","nodeId")
);

-- CreateTable
CREATE TABLE "EvaluationQuestion" (
    "id" SERIAL NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,

    CONSTRAINT "EvaluationQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MultipleChoiceOption" (
    "id" SERIAL NOT NULL,
    "evaluationQuestionId" INTEGER NOT NULL,
    "option" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "MultipleChoiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentQuestion" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "StudentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherAnswer" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "TeacherAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionAnswer" (
    "studentQuestionId" INTEGER NOT NULL,
    "teacherAnswerId" INTEGER NOT NULL,

    CONSTRAINT "QuestionAnswer_pkey" PRIMARY KEY ("studentQuestionId","teacherAnswerId")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "learningPathId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassAssignment" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "assignmentId" INTEGER NOT NULL,

    CONSTRAINT "ClassAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "teamname" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamAssignment" (
    "teamId" INTEGER NOT NULL,
    "classAssignmentId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "assignmentId" INTEGER,

    CONSTRAINT "TeamAssignment_pkey" PRIMARY KEY ("teamId","classAssignmentId","memberId")
);

-- CreateTable
CREATE TABLE "EvaluationSubmission" (
    "id" SERIAL NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "submission" TEXT NOT NULL,
    "submitted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamSubmission" (
    "teamId" INTEGER NOT NULL,
    "submissionId" INTEGER NOT NULL,

    CONSTRAINT "TeamSubmission_pkey" PRIMARY KEY ("teamId","submissionId")
);

-- CreateTable
CREATE TABLE "TeacherFeedback" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,

    CONSTRAINT "TeacherFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionFeedback" (
    "submissionId" INTEGER NOT NULL,
    "feedbackId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionFeedback_pkey" PRIMARY KEY ("submissionId","feedbackId")
);

-- CreateTable
CREATE TABLE "LearningObjectProgress" (
    "id" SERIAL NOT NULL,
    "learningObjectId" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL,

    CONSTRAINT "LearningObjectProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProgress" (
    "studentId" INTEGER NOT NULL,
    "progressId" INTEGER NOT NULL,

    CONSTRAINT "StudentProgress_pkey" PRIMARY KEY ("studentId","progressId")
);

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationQuestion_evaluationId_questionId_key" ON "EvaluationQuestion"("evaluationId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassAssignment_classId_assignmentId_key" ON "ClassAssignment"("classId", "assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_teamname_key" ON "Team"("teamname");

-- CreateIndex
CREATE UNIQUE INDEX "Class_code_key" ON "Class"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LearningObject_title_key" ON "LearningObject"("title");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPath_title_key" ON "LearningPath"("title");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnValue_learningObjectId_key" ON "ReturnValue"("learningObjectId");

-- AddForeignKey
ALTER TABLE "ClassUser" ADD CONSTRAINT "ClassUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassUser" ADD CONSTRAINT "ClassUser_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPath" ADD CONSTRAINT "LearningPath_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathNode" ADD CONSTRAINT "LearningPathNode_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningObject" ADD CONSTRAINT "LearningObject_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationalGoal" ADD CONSTRAINT "EducationalGoal_learningObjectId_fkey" FOREIGN KEY ("learningObjectId") REFERENCES "LearningObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnValue" ADD CONSTRAINT "ReturnValue_learningObjectId_fkey" FOREIGN KEY ("learningObjectId") REFERENCES "LearningObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_id_fkey" FOREIGN KEY ("id") REFERENCES "LearningObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationQuestion" ADD CONSTRAINT "EvaluationQuestion_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultipleChoiceOption" ADD CONSTRAINT "MultipleChoiceOption_evaluationQuestionId_fkey" FOREIGN KEY ("evaluationQuestionId") REFERENCES "EvaluationQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentQuestion" ADD CONSTRAINT "StudentQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAnswer" ADD CONSTRAINT "TeacherAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_studentQuestionId_fkey" FOREIGN KEY ("studentQuestionId") REFERENCES "StudentQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_teacherAnswerId_fkey" FOREIGN KEY ("teacherAnswerId") REFERENCES "TeacherAnswer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAssignment" ADD CONSTRAINT "ClassAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAssignment" ADD CONSTRAINT "ClassAssignment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAssignment" ADD CONSTRAINT "TeamAssignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAssignment" ADD CONSTRAINT "TeamAssignment_classAssignmentId_fkey" FOREIGN KEY ("classAssignmentId") REFERENCES "ClassAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAssignment" ADD CONSTRAINT "TeamAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAssignment" ADD CONSTRAINT "TeamAssignment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationSubmission" ADD CONSTRAINT "EvaluationSubmission_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSubmission" ADD CONSTRAINT "TeamSubmission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSubmission" ADD CONSTRAINT "TeamSubmission_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "EvaluationSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherFeedback" ADD CONSTRAINT "TeacherFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionFeedback" ADD CONSTRAINT "SubmissionFeedback_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "EvaluationSubmission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionFeedback" ADD CONSTRAINT "SubmissionFeedback_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "TeacherFeedback"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningObjectProgress" ADD CONSTRAINT "LearningObjectProgress_learningObjectId_fkey" FOREIGN KEY ("learningObjectId") REFERENCES "LearningObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "LearningObjectProgress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
