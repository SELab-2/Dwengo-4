/*
  Warnings:

  - The primary key for the `JoinRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `JoinRequest` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `StudentQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `TeacherAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `TeacherFeedback` table. All the data in the column will be lost.
  - You are about to drop the `ClassUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `studentId` to the `JoinRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `StudentQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `TeacherAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `TeacherFeedback` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ClassUser" DROP CONSTRAINT "ClassUser_classId_fkey";

-- DropForeignKey
ALTER TABLE "ClassUser" DROP CONSTRAINT "ClassUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "JoinRequest" DROP CONSTRAINT "JoinRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "LearningObject" DROP CONSTRAINT "LearningObject_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "LearningPath" DROP CONSTRAINT "LearningPath_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "StudentProgress" DROP CONSTRAINT "StudentProgress_studentId_fkey";

-- DropForeignKey
ALTER TABLE "StudentQuestion" DROP CONSTRAINT "StudentQuestion_userId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherAnswer" DROP CONSTRAINT "TeacherAnswer_userId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherFeedback" DROP CONSTRAINT "TeacherFeedback_userId_fkey";

-- DropForeignKey
ALTER TABLE "TeamAssignment" DROP CONSTRAINT "TeamAssignment_memberId_fkey";

-- AlterTable
ALTER TABLE "JoinRequest" DROP CONSTRAINT "JoinRequest_pkey",
DROP COLUMN "userId",
ADD COLUMN     "studentId" INTEGER NOT NULL,
ADD CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("studentId", "classId");

-- AlterTable
ALTER TABLE "StudentQuestion" DROP COLUMN "userId",
ADD COLUMN     "studentId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TeacherAnswer" DROP COLUMN "userId",
ADD COLUMN     "teacherId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TeacherFeedback" DROP COLUMN "userId",
ADD COLUMN     "teacherId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ClassUser";

-- CreateTable
CREATE TABLE "Admin" (
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Student" (
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "ClassStudent" (
    "studentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "ClassStudent_pkey" PRIMARY KEY ("studentId","classId")
);

-- CreateTable
CREATE TABLE "ClassTeacher" (
    "teacherId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "ClassTeacher_pkey" PRIMARY KEY ("teacherId","classId")
);

-- CreateTable
CREATE TABLE "Invite" (
    "teacherId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "status" "JoinRequestStatus" NOT NULL,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("teacherId","classId")
);

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassStudent" ADD CONSTRAINT "ClassStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassStudent" ADD CONSTRAINT "ClassStudent_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTeacher" ADD CONSTRAINT "ClassTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTeacher" ADD CONSTRAINT "ClassTeacher_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPath" ADD CONSTRAINT "LearningPath_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Teacher"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningObject" ADD CONSTRAINT "LearningObject_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Teacher"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentQuestion" ADD CONSTRAINT "StudentQuestion_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAnswer" ADD CONSTRAINT "TeacherAnswer_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAssignment" ADD CONSTRAINT "TeamAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Student"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherFeedback" ADD CONSTRAINT "TeacherFeedback_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
