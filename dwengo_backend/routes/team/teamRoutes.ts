import { Router } from "express";

import { getTeamMembers } from "../../controllers/student/studentTeamController";
import teacherTeamRoutes from "./teacherTeamRoutes";
import studentTeamRoutes from "./studentTeamRoutes";
import { protectAnyUser } from "../../middleware/authMiddleware/authAnyUserMiddleware";

const router: Router = Router();

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
