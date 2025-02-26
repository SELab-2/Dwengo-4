/*
  Warnings:

  - The primary key for the `Student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Student` table. All the data in the column will be lost.
  - The primary key for the `Teacher` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the `Classroom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ClassroomToStudent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('VIDEO', 'ARTICLE', 'INTERACTIVE');

-- DropForeignKey
ALTER TABLE "Classroom" DROP CONSTRAINT "Classroom_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "_ClassroomToStudent" DROP CONSTRAINT "_ClassroomToStudent_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClassroomToStudent" DROP CONSTRAINT "_ClassroomToStudent_B_fkey";

-- DropIndex
DROP INDEX "Student_email_key";

-- DropIndex
DROP INDEX "Teacher_email_key";

-- AlterTable
ALTER TABLE "Student" DROP CONSTRAINT "Student_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "id",
DROP COLUMN "password",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "Student_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "id",
DROP COLUMN "password",
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "Teacher_pkey" PRIMARY KEY ("userId");

-- DropTable
DROP TABLE "Classroom";

-- DropTable
DROP TABLE "_ClassroomToStudent";

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "naam" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "paswoord" TEXT NOT NULL,
    "actief" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Admin" (
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Class" (
    "classId" SERIAL NOT NULL,
    "naam" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("classId")
);

-- CreateTable
CREATE TABLE "LearningPath" (
    "learningPathId" SERIAL NOT NULL,
    "hruid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "nodes" JSONB NOT NULL,
    "minItems" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("learningPathId")
);

-- CreateTable
CREATE TABLE "LearningObject" (
    "learningObjectId" TEXT NOT NULL,
    "uuid" TEXT,
    "version" TEXT,
    "language" TEXT,
    "title" TEXT,
    "description" TEXT,
    "content_type" TEXT,
    "keywords" TEXT,
    "target_ages" TEXT,
    "teacher_exclusive" BOOLEAN,
    "skos_concepts" TEXT,
    "copyright" TEXT,
    "licence" TEXT,
    "difficulty" INTEGER,
    "estimated_time" INTEGER,
    "available" BOOLEAN,
    "content_location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningObject_pkey" PRIMARY KEY ("learningObjectId")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "learningObjectId" TEXT NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("learningObjectId")
);

-- CreateTable
CREATE TABLE "MultipleChoice" (
    "evaluationId" TEXT NOT NULL,

    CONSTRAINT "MultipleChoice_pkey" PRIMARY KEY ("evaluationId")
);

-- CreateTable
CREATE TABLE "OpenQuestion" (
    "evaluationId" TEXT NOT NULL,

    CONSTRAINT "OpenQuestion_pkey" PRIMARY KEY ("evaluationId")
);

-- CreateTable
CREATE TABLE "EducationalGoal" (
    "educationalGoalId" TEXT NOT NULL,
    "learningObjectId" TEXT NOT NULL,
    "source" TEXT,
    "goal_id" TEXT,

    CONSTRAINT "EducationalGoal_pkey" PRIMARY KEY ("educationalGoalId")
);

-- CreateTable
CREATE TABLE "ReturnValue" (
    "returnValueId" SERIAL NOT NULL,
    "learningObjectId" TEXT NOT NULL,
    "callback_url" TEXT,
    "callback_schema" TEXT,

    CONSTRAINT "ReturnValue_pkey" PRIMARY KEY ("returnValueId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_learningObjectId_fkey" FOREIGN KEY ("learningObjectId") REFERENCES "LearningObject"("learningObjectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultipleChoice" ADD CONSTRAINT "MultipleChoice_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("learningObjectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenQuestion" ADD CONSTRAINT "OpenQuestion_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("learningObjectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationalGoal" ADD CONSTRAINT "EducationalGoal_learningObjectId_fkey" FOREIGN KEY ("learningObjectId") REFERENCES "LearningObject"("learningObjectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnValue" ADD CONSTRAINT "ReturnValue_learningObjectId_fkey" FOREIGN KEY ("learningObjectId") REFERENCES "LearningObject"("learningObjectId") ON DELETE RESTRICT ON UPDATE CASCADE;
