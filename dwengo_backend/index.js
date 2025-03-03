const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
const errorHandler = require("./middleware/errorMiddleware");

// Routes voor Teacher en Student
const teacherAuthRoutes = require("./routes/teacher/teacherAuthRoutes");
const studentAuthRoutes = require("./routes/student/studentAuthRoutes.js");

// Initialisatie
const app = express();

const bodyParser = require("body-parser");

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

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
  res.send("Hello, World yolo!");
});
// Routes voor Teacher
app.use("/teacher/auth", teacherAuthRoutes);

// Routes voor Student
app.use("/student/auth", studentAuthRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server draait op poort ${PORT}`));
