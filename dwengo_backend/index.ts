import express, {Request, Response, NextFunction, Express} from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorMiddleware";
import teacherAuthRoutes from "./routes/teacher/teacherAuthRoutes";
import studentAuthRoutes from "./routes/student/studentAuthRoutes";
import learningObjectRoutes from "./routes/learningObject/learningObjectRoutes";
import learningPathRoutes from "./routes/learningPath/learningPathRoutes";
import assignmentRoutes from "./routes/assignmentRoutes";
import teacherAssignmentRoutes from "./routes/teacher/teacherAssignmentRoutes";
import teacherTeamsRoutes from "./routes/teacher/teacherTeamsRoutes";

dotenv.config();

const app: Express = express();

// Stel CORS-headers in
app.use((req: Request, res: Response, next: NextFunction): void => {
  const allowedOrigins: string[] = ["https://dwengo.org", "http://localhost:3000"];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization");
  next();
});

// JSON-parser middleware
app.use(express.json());


// Routes voor Teacher (Auth)
app.use("/teacher/auth", teacherAuthRoutes);
// Routes voor Teacher (Teams)
app.use("/teacher/:assignmentId", teacherTeamsRoutes);

// Routes voor Student (Auth)
app.use("/student/auth", studentAuthRoutes)

// Routes voor de Assignments
app.use('/assignments', assignmentRoutes);

// Routes voor de aanpassingen op Assignments door teachers
app.use('/teacher/assignments', teacherAssignmentRoutes);

// Nieuwe routes voor leerobjecten
app.use("/learningObjects", learningObjectRoutes);
app.use("/learningPaths", learningPathRoutes);

// Error Handler
app.use(errorHandler);

const PORT: string | number = process.env.PORT || 5000;
app.listen(PORT, (): void => console.log(`Server draait op poort ${PORT}`));
