const express = require("express");
const { registerTeacher, loginTeacher } = require("../../controllers/teacher/teacherAuthController");

const router = express.Router();

// Registreren van een leerkracht
router.post("/register", registerTeacher);

// Inloggen van een leerkracht
router.post("/login", loginTeacher);

module.exports = router;
