const express = require("express");
const { registerTeacher, loginTeacher } = require("../../controllers/teacher/teacherAuthController");

const router = express.Router();

// Route voor registratie van een leerkracht
router.post("/register", registerTeacher);

// Route voor inloggen van een leerkracht
router.post("/login", loginTeacher);

module.exports = router;
