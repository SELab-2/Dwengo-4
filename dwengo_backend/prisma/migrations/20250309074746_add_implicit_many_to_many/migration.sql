/*
  Warnings:

  - You are about to drop the `TeamStudent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TeamStudent" DROP CONSTRAINT "TeamStudent_studentId_fkey";

-- DropForeignKey
ALTER TABLE "TeamStudent" DROP CONSTRAINT "TeamStudent_teamId_fkey";

-- DropTable
DROP TABLE "TeamStudent";
