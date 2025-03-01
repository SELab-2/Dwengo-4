const express = require("express");
const { protectStudent } = require("../../middleware/studentAuthMiddleware");
const { joinClassroom } = require("../../controllers/student/studentClassController");

const router = express.Router();

// Alleen studenten mogen deze route gebruiken
router.post("/join", protectStudent, joinClassroom);

module.exports = router;
