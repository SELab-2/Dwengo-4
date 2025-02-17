const express = require("express");
const { registerStudent, loginStudent } = require("../../controllers/student/studentAuthController");

const router = express.Router();

// Registreren van een leerling
router.post("/register", registerStudent);

// Inloggen van een leerling
router.post("/login", loginStudent);

module.exports = router;
