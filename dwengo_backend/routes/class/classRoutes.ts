import { Router } from "express";
import studentClassRoutes from "./studentClassRoutes";
import teacherClassRoutes from "./teacherClassRoutes";

const router = Router();
router.use("/", studentClassRoutes);
router.use("/", teacherClassRoutes);

export default router;
