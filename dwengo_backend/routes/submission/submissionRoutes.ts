import { Router } from "express";
import studentSubmissionRoutes from "./studentSubmissionRoutes";
import teacherSubmissionRoutes from "./teacherSubmissionRoutes";

const router = Router();

router.use("/student", studentSubmissionRoutes);
router.use("/teacher", teacherSubmissionRoutes);

export default router;
