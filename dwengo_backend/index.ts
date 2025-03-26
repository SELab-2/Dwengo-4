import express, { Request, Response, NextFunction, Express } from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorMiddleware";
import learningObjectRoutes from "./routes/learningObject/learningObjectRoutes";
import QuestionRoutes from "./routes/question/questionRoutes";
import learningPathRoutes from "./routes/learningPath/learningPathRoutes";
import teacherLocalLearningObjectRoutes from "./routes/teacher/teacherLocalLearningObjectRoutes";

import assignmentRoutes from "./routes/assignmentRoutes";
import teacherAssignmentRoutes from "./routes/teacher/teacherAssignmentRoutes";
import studentTeamRoutes from "./routes/student/studentTeamRoutes";
import progressRoutes from "./routes/progressRoutes";
import studentAssignmentRoutes from "./routes/student/studentAssignmentRoutes";
import feedbackRoutes from "./routes/teacher/feedbackRoutes";
import teacherSubmissionRoute from "./routes/teacher/teacherSubmissionRoute";
import studentSubmissionRoute from "./routes/student/studentSubmissionRoute";
import assignmentRoutes from "./routes/assignments/assignmentRoutes";
import progressRoutes from "./routes/progress/progressRoutes";
import teacherClassRoutes from "./routes/teacher/teacherClassRoutes";
import studentAssignmentRoutes from "./routes/assignments/studentAssignmentRoutes";
import feedbackRoutes from "./routes/feedback/feedbackRoutes";
import studentClassRoutes from "./routes/student/studentClassRoutes";
import submissionRoutes from "./routes/submission/submissionRoutes";
import teacherLocalLearningPathRoutes from "./routes/teacher/teacherLocalLearningPathRoutes";
import teacherLocalLearningPathNodesRoutes from "./routes/teacher/teacherLocalLearningPathNodesRoutes";

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import teacherTeamsRoutes from "./routes/teacher/teacherTeamsRoutes";
import classRoutes from "./routes/class/classRoutes";
import teacherInviteRoutes from "./routes/invite/teacherInviteRoutes";
import joinRequestRoutes from "./routes/joinRequest/joinRequestRoutes";
import teamRoutes from "./routes/team/teamRoutes";
import authRoutes from "./routes/authentication/authRoutes";
import teacherAssignmentRoutes from "./routes/assignments/teacherAssignmentRoutes";

dotenv.config();

const app: Express = express();
const swaggerDocument = YAML.load("./openapi3_0.yaml");

// Stel CORS-headers in
app.use((req: Request, res: Response, next: NextFunction): void => {
  const allowedOrigins: string[] = [
    "https://dwengo.org",
    "http://localhost:5173",
  ];
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

// Routes voor classes
app.use("/class", classRoutes);

// Routes voor invites
app.use("/invite", teacherInviteRoutes);

// Routes voor join requests
app.use("/join-request", joinRequestRoutes);

// Routes voor authentificatie
app.use("/auth", authRoutes);
app.use("/pathByTeacher", teacherLocalLearningPathRoutes);
app.use(
  "learningPath/:learningPathId/node",
  teacherLocalLearningPathNodesRoutes
);
app.use("/learningObjectByTeacher", teacherLocalLearningObjectRoutes);

// Routes voor teams
app.use("/team", teamRoutes);

// Routes voor de assignments
app.use("/assignment", assignmentRoutes);

// Routes om feedback te geven
app.use("/feedback", feedbackRoutes);

// Nieuwe routes voor leerobjecten
app.use("/learningObject", learningObjectRoutes);

app.use("/question", QuestionRoutes);

app.use("/learningPath", learningPathRoutes);

app.use("/progress", progressRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes voor indieningen
app.use("submission", submissionRoutes);

// Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  console.log(process.env.NODE_ENV);
  const PORT: string | number = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));
}

export default app;
