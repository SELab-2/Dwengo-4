import express, {NextFunction, Request, Response} from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorMiddleware";
import teacherAuthRoutes from "./routes/teacher/teacherAuthRoutes";
import studentAuthRoutes from "./routes/student/studentAuthRoutes";
import learningObjectRoutes from "./routes/learningObject/learningObjectRoutes";
import QuestionRoutes from "./routes/question/questionRoutes";
import learningPathRoutes from "./routes/learningPath/learningPathRoutes";
import teacherLocalLearningObjectRoutes from "./routes/teacher/teacherLocalLearningObjectRoutes";

import assignmentRoutes from "./routes/assignmentRoutes";
import teacherAssignmentRoutes from "./routes/teacher/teacherAssignmentRoutes";
import teacherClassRoutes from "./routes/teacher/teacherClassRoutes";
import studentAssignmentRoutes from "./routes/student/studentAssignmentRoutes";
import feedbackRoutes from "./routes/teacher/feedbackRoutes";
import studentClassRoutes from "./routes/student/studentClassRoutes";
import teacherLocalLearningPathRoutes from "./routes/teacher/teacherLocalLearningPathRoutes";
import teacherLocalLearningPathNodesRoutes from "./routes/teacher/teacherLocalLearningPathNodesRoutes";


import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

dotenv.config();

const app = express();
const swaggerDocument = YAML.load('./openapi3_0.yaml');

// Stel CORS-headers in
app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = ["https://dwengo.org", "http://localhost:3000"];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Authorization"
  );
  next();
});

// JSON-parser middleware
app.use(express.json());

// Routes voor Teacher (Classes)
app.use("/teacher/classes", teacherClassRoutes);

// Routes voor student (Classes)
app.use("/student/classes", studentClassRoutes);

// Routes voor Teacher (Auth)
app.use("/teacher/auth", teacherAuthRoutes);
app.use("/teacher/learningObjects", teacherLocalLearningObjectRoutes);
app.use("/teacher/learningPaths", teacherLocalLearningPathRoutes);
app.use("/teacher/learningPaths", teacherLocalLearningPathNodesRoutes)

// Routes voor Student (Auth)
app.use("/student/auth", studentAuthRoutes);

// Routes voor de Assignments
app.use("/assignments", assignmentRoutes);

// Routes voor de aanpassingen op Assignments door teachers
app.use("/teacher/assignments", teacherAssignmentRoutes);
// Routes voor het opvragen van de Assignments door students
app.use("/student/assignments", studentAssignmentRoutes);

app.use('/teacher/feedback', feedbackRoutes);

// Nieuwe routes voor leerobjecten
app.use("/learningObjects", learningObjectRoutes);

app.use("/question", QuestionRoutes);

app.use("/learningPaths", learningPathRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error Handler
app.use(errorHandler);


if (process.env.NODE_ENV !== "test") {
  console.log(process.env.NODE_ENV);
  const PORT: string | number = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));
}

export default app;
