import express, { Router } from "express";
import studentProgressRoutes from "./studentProgressRoutes";
import teacherProgressRoutes from "./teacherProgressRoutes";

const router: Router = express.Router();

router.use("/student", studentProgressRoutes);
router.use("/teacher", teacherProgressRoutes);

export default router;
