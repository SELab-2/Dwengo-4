import { Router } from "express";
import studentClassRoutes from "./studentClassRoutes";
import teacherClassRoutes from "./teacherClassRoutes";

const router = Router();
router.use("/student", studentClassRoutes);
router.use("/teacher", teacherClassRoutes);

export default router;
