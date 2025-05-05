import { Router } from "express";
import studentAuthRoutes from "./studentAuthRoutes";
import teacherAuthRoutes from "./teacherAuthRoutes";

const router: Router = Router();

router.use("/student", studentAuthRoutes);
router.use("/teacher", teacherAuthRoutes);

export default router;
