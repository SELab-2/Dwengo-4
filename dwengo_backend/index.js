const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const errorHandler = require("./middleware/errorMiddleware");

// Routes voor Teacher
const teacherAuthRoutes = require("./routes/teacher/teacherAuthRoutes");
const teacherClassesRoutes = require("./routes/teacher/teacherClassesRoutes");

// Routes voor students
const studentAuthRoutes = require("./routes/student/studentAuthRoutes.js");

// Initialisatie
const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,Content-Type,Authorization"
  );
  next();
});

// Middleware
app.use(express.json()); // Parse JSON-requests

// Hello World route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.get("/login", (req, res) => {
  res.send("Hello, World 3!");
});

// Routes voor Teacher

app.use("/teacher/auth", teacherAuthRoutes);
app.use("/teacher/classes", teacherClassesRoutes);

// Routes voor Student
app.use("/student/auth", studentAuthRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));
