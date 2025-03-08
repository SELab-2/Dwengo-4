/*
  Warnings:

  - The primary key for the `ClassAssignment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ClassAssignment` table. All the data in the column will be lost.
  - The primary key for the `Invite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `teacherId` on the `Invite` table. All the data in the column will be lost.
  - The primary key for the `TeamAssignment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `classAssignmentId` on the `TeamAssignment` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `TeamAssignment` table. All the data in the column will be lost.
  - Added the required column `classTeacherId` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otherTeacherId` to the `Invite` table without a default value. This is not possible if the table is not empty.
  - Made the column `assignmentId` on table `TeamAssignment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "TeamAssignment" DROP CONSTRAINT "TeamAssignment_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "TeamAssignment" DROP CONSTRAINT "TeamAssignment_classAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "TeamAssignment" DROP CONSTRAINT "TeamAssignment_memberId_fkey";

-- DropIndex
DROP INDEX "ClassAssignment_classId_assignmentId_key";

-- DropIndex
DROP INDEX "Team_teamname_key";

-- AlterTable
ALTER TABLE "ClassAssignment" DROP CONSTRAINT "ClassAssignment_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "ClassAssignment_pkey" PRIMARY KEY ("classId", "assignmentId");

-- AlterTable
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_pkey",
DROP COLUMN "teacherId",
ADD COLUMN     "classTeacherId" INTEGER NOT NULL,
ADD COLUMN     "inviteId" SERIAL NOT NULL,
ADD COLUMN     "otherTeacherId" INTEGER NOT NULL,
ADD CONSTRAINT "Invite_pkey" PRIMARY KEY ("inviteId");

-- AlterTable
ALTER TABLE "TeamAssignment" DROP CONSTRAINT "TeamAssignment_pkey",
DROP COLUMN "classAssignmentId",
DROP COLUMN "memberId",
ALTER COLUMN "assignmentId" SET NOT NULL,
ADD CONSTRAINT "TeamAssignment_pkey" PRIMARY KEY ("teamId", "assignmentId");

-- CreateTable
CREATE TABLE "_StudentToTeam" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StudentToTeam_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_StudentToTeam_B_index" ON "_StudentToTeam"("B");

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_otherTeacherId_fkey" FOREIGN KEY ("otherTeacherId") REFERENCES "Teacher"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_classTeacherId_classId_fkey" FOREIGN KEY ("classTeacherId", "classId") REFERENCES "ClassTeacher"("teacherId", "classId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAssignment" ADD CONSTRAINT "TeamAssignment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentToTeam" ADD CONSTRAINT "_StudentToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "Student"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentToTeam" ADD CONSTRAINT "_StudentToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
