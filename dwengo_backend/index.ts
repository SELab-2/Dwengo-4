
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorMiddleware";
import teacherAuthRoutes from "./routes/teacher/teacherAuthRoutes";
import studentAuthRoutes from "./routes/student/studentAuthRoutes";
import learningObjectRoutes from "./routes/learningObject/learningObjectRoutes";

dotenv.config();

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Authorization");
  next();
});

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});
app.get("/login", (req: Request, res: Response) => {
  res.send("Hello, World 3!");
});

// Auth
app.use("/teacher/auth", teacherAuthRoutes);
app.use("/student/auth", studentAuthRoutes);

// Nieuwe routes voor leerobjecten
app.use("/learningObjects", learningObjectRoutes);

// Error Handler
app.use(errorHandler);

const PORT: string | number = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));
