/*
  Warnings:

  - Added the required column `learningObjectId` to the `LearningPathNode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LearningPathNode" ADD COLUMN     "learningObjectId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "LearningPathNode" ADD CONSTRAINT "LearningPathNode_learningObjectId_fkey" FOREIGN KEY ("learningObjectId") REFERENCES "LearningObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
