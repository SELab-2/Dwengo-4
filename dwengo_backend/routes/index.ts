import { Router } from "express";

import classRoutes from "./class/classRoutes";
import teacherInviteRoutes from "./invite/teacherInviteRoutes";
import joinRequestRoutes from "./joinRequest/joinRequestRoutes";
import teamRoutes from "./team/teamRoutes";
import authRoutes from "./authentication/authRoutes";
import assignmentRoutes from "./assignment/assignmentRoutes";
import feedbackRoutes from "./feedback/feedbackRoutes";
import learningObjectRoutes from "./learningObject/learningObjectRoutes";
import QuestionRoutes from "./question/questionRoutes";
import learningPathRoutes from "./learningPath/learningPathRoutes";
import teacherLocalLearningPathRoutes from "./teacherMadeLearningPath/teacherLocalLearningPathRoutes";
import teacherLocalLearningObjectRoutes from "./teacherMadeLearningObject/teacherLocalLearningObjectRoutes";
import teacherLocalLearningPathNodesRoutes from "./teacherMadeLearningPath/teacherLocalLearningPathNodesRoutes";
import progressRoutes from "./progress/progressRoutes";
import submissionRoutes from "./submission/submissionRoutes";
import { getLeaderBoard } from "../controllers/leaderboard/leaderboardController";

const router: Router = Router();

router.use("/class", classRoutes);
router.use("/invite", teacherInviteRoutes);
router.use("/join-request", joinRequestRoutes);
router.use("/auth", authRoutes);
router.use("/pathByTeacher", teacherLocalLearningPathRoutes);
router.use("/learningObjectByTeacher", teacherLocalLearningObjectRoutes);
router.use("/team", teamRoutes);
router.use("/assignment", assignmentRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/learningObject", learningObjectRoutes);
router.use("/question", QuestionRoutes);
router.use("/learningPath", learningPathRoutes);
router.use(
  "/learningPath/:learningPathId/node",
  teacherLocalLearningPathNodesRoutes,
);
router.use("/progress", progressRoutes);
router.use("/submission", submissionRoutes);
router.use("/leaderboard", getLeaderBoard);

export default router;
