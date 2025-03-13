-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- CreateEnum
CREATE TYPE "EvaluationType" AS ENUM ('OPEN', 'MULTIPLE');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('TEXT_PLAIN', 'TEXT_MARKDOWN', 'IMAGE_IMAGE_BLOCK', 'IMAGE_IMAGE', 'AUDO_MPEG', 'VIDEO', 'EVAL_MULTIPLE_CHOICE', 'EVAL_OPEN_QUESTION');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SPECIFIC', 'GENERAL', 'ADDITIONAL');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "Class" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "JoinRequest" (
    "studentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "status" "JoinRequestStatus" NOT NULL,

    CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("studentId","classId")
);

-- CreateTable
CREATE TABLE "Invite" (
    "inviteId" SERIAL NOT NULL,
    "otherTeacherId" INTEGER NOT NULL,
    "classTeacherId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "status" "JoinRequestStatus" NOT NULL,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("inviteId")
);

-- CreateTable
CREATE TABLE "LearningPath" (
    "id" TEXT NOT NULL,
    "hruid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "num_nodes" INTEGER,
    "num_nodes_left" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" INTEGER NOT NULL,

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPathNode" (
    "nodeId" TEXT NOT NULL,
    "learningPathId" TEXT NOT NULL,
    "learningObjectId" TEXT NOT NULL,
    "start_node" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningPathNode_pkey" PRIMARY KEY ("nodeId")
);

-- CreateTable
CREATE TABLE "LearningPathTransition" (
    "transitionId" TEXT NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT true,
    "condition" TEXT,
    "nodeId" TEXT NOT NULL,
    "nextNodeId" TEXT,

    CONSTRAINT "LearningPathTransition_pkey" PRIMARY KEY ("transitionId")
);

-- CreateTable
CREATE TABLE "LearningObject" (
    "id" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "hruid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "language" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "estimatedTime" INTEGER NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetAges" INTEGER[],
    "teacherExclusive" BOOLEAN NOT NULL,
    "skosConcepts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "copyright" TEXT NOT NULL DEFAULT 'CC BY Dwengo',
    "licence" TEXT NOT NULL DEFAULT 'dwengo',
    "difficulty" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "contentLocation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" INTEGER NOT NULL,

    CONSTRAINT "LearningObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationalGoal" (
    "id" TEXT NOT NULL,
    "learningObjectId" TEXT NOT NULL,
    "source" TEXT,
    "goalId" TEXT,

    CONSTRAINT "EducationalGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnValue" (
    "id" SERIAL NOT NULL,
    "learningObjectId" TEXT NOT NULL,
    "callbackUrl" TEXT NOT NULL,
    "callbackSchema" JSONB NOT NULL,

    CONSTRAINT "ReturnValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "nrOfQuestions" INTEGER NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "evaluationType" "EvaluationType" NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "SpecificQuestion" (
    "questionId" INTEGER NOT NULL,
    "learningObjectId" TEXT NOT NULL,

    CONSTRAINT "SpecificQuestion_pkey" PRIMARY KEY ("questionId","learningObjectId")
);

-- CreateTable
CREATE TABLE "GeneralQuestion" (
    "questionId" INTEGER NOT NULL,
    "learningPathId" TEXT NOT NULL,

    CONSTRAINT "GeneralQuestion_pkey" PRIMARY KEY ("questionId","learningPathId")
);

-- CreateTable
CREATE TABLE "AdditionalQuestion" (
    "questionId" INTEGER NOT NULL,
    "answerId" INTEGER NOT NULL,

    CONSTRAINT "AdditionalQuestion_pkey" PRIMARY KEY ("questionId","answerId")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" SERIAL NOT NULL,
    "learningPathId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassAssignment" (
    "classId" INTEGER NOT NULL,
    "assignmentId" INTEGER NOT NULL,

    CONSTRAINT "ClassAssignment_pkey" PRIMARY KEY ("classId","assignmentId")
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
    "assignmentId" INTEGER NOT NULL,

    CONSTRAINT "TeamAssignment_pkey" PRIMARY KEY ("teamId","assignmentId")
);

-- CreateTable
CREATE TABLE "Submission" (
    "submissionId" SERIAL NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "submitted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("submissionId")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "submissionId" INTEGER NOT NULL,
    "teacherId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("submissionId","teacherId")
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

-- CreateTable
CREATE TABLE "_StudentToTeam" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StudentToTeam_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Class_code_key" ON "Class"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPath_hruid_key" ON "LearningPath"("hruid");

-- CreateIndex
CREATE UNIQUE INDEX "LearningObject_uuid_key" ON "LearningObject"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "LearningObject_hruid_key" ON "LearningObject"("hruid");

-- CreateIndex
CREATE UNIQUE INDEX "ReturnValue_learningObjectId_key" ON "ReturnValue"("learningObjectId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationQuestion_evaluationId_questionId_key" ON "EvaluationQuestion"("evaluationId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecificQuestion_questionId_key" ON "SpecificQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneralQuestion_questionId_key" ON "GeneralQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AdditionalQuestion_questionId_key" ON "AdditionalQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_submissionId_key" ON "Feedback"("submissionId");

-- CreateIndex
CREATE INDEX "_StudentToTeam_B_index" ON "_StudentToTeam"("B");

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
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_otherTeacherId_fkey" FOREIGN KEY ("otherTeacherId") REFERENCES "Teacher"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_classTeacherId_classId_fkey" FOREIGN KEY ("classTeacherId", "classId") REFERENCES "ClassTeacher"("teacherId", "classId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPath" ADD CONSTRAINT "LearningPath_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Teacher"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathNode" ADD CONSTRAINT "LearningPathNode_learningObjectId_fkey" FOREIGN KEY ("learningObjectId") REFERENCES "LearningObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathNode" ADD CONSTRAINT "LearningPathNode_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathTransition" ADD CONSTRAINT "LearningPathTransition_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "LearningPathNode"("nodeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathTransition" ADD CONSTRAINT "LearningPathTransition_nextNodeId_fkey" FOREIGN KEY ("nextNodeId") REFERENCES "LearningPathNode"("nodeId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningObject" ADD CONSTRAINT "LearningObject_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Teacher"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "SpecificQuestion" ADD CONSTRAINT "SpecificQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecificQuestion" ADD CONSTRAINT "SpecificQuestion_learningObjectId_fkey" FOREIGN KEY ("learningObjectId") REFERENCES "LearningObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralQuestion" ADD CONSTRAINT "GeneralQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralQuestion" ADD CONSTRAINT "GeneralQuestion_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdditionalQuestion" ADD CONSTRAINT "AdditionalQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdditionalQuestion" ADD CONSTRAINT "AdditionalQuestion_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_learningPathId_fkey" FOREIGN KEY ("learningPathId") REFERENCES "LearningPath"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAssignment" ADD CONSTRAINT "ClassAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassAssignment" ADD CONSTRAINT "ClassAssignment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAssignment" ADD CONSTRAINT "TeamAssignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamAssignment" ADD CONSTRAINT "TeamAssignment_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("submissionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningObjectProgress" ADD CONSTRAINT "LearningObjectProgress_learningObjectId_fkey" FOREIGN KEY ("learningObjectId") REFERENCES "LearningObject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProgress" ADD CONSTRAINT "StudentProgress_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "LearningObjectProgress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentToTeam" ADD CONSTRAINT "_StudentToTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "Student"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentToTeam" ADD CONSTRAINT "_StudentToTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
