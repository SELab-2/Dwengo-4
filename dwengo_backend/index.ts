import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errorMiddleware";
import teacherAuthRoutes from "./routes/teacher/teacherAuthRoutes";
import studentAuthRoutes from "./routes/student/studentAuthRoutes";
import learningObjectRoutes from "./routes/learningObject/learningObjectRoutes";
// import learningPathRoutes from "./routes/learningPath/learningPathRoutes"; // Uncomment indien beschikbaar

dotenv.config();

const app = express();

// Stel CORS-headers in
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Authorization");
  next();
});

// JSON-parser middleware
app.use(express.json());


// Routes voor Teacher (Auth)
app.use("/teacher/auth", teacherAuthRoutes);

// Routes voor Student (Auth)
app.use("/student/auth", studentAuthRoutes)

// Routes voor leerobjecten
app.use("/learningObjects", learningObjectRoutes);
// app.use("/learningPaths", learningPathRoutes); // Uncomment indien beschikbaar

// Error handling middleware
app.use(errorHandler);

const PORT: string | number = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));
