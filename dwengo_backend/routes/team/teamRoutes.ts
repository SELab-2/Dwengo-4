import { Router } from "express";

import { getTeamMembers } from "../../controllers/student/studentTeamController";
import { protectAnyUser } from "../../middleware/authAnyUserMiddleware";
import teacherTeamRoutes from "./teacherTeamRoutes";
import studentTeamRoutes from "./studentTeamRoutes";

const router = Router();

router.use("/student", studentTeamRoutes);
router.use("/teacher", teacherTeamRoutes);

// Haal alle teamleden op van een specifiek team
/**
 * @route GET /team/:teamId/members
 * @description Get all team members of a specific team
 * @param teamId: number
 * @access Teacher/Student
 */
router.get("/:teamId/members", protectAnyUser, getTeamMembers);

export default router;
