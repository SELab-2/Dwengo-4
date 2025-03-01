const express = require("express");
const {
  createClassForTeacher,
  getTeacherClasses,
  getJoinRequestsForClass,
} = require("../../controllers/teacher/teacherClassesController");
const { protectTeacher } = require("../../middleware/teacherAuthMiddleware");

const router = express.Router();

// @route   POST /teacher/classes
// @desc    Maak een nieuwe klas aan
// @access  Private (Alleen leerkrachten)
router.post("/", protectTeacher, createClassForTeacher);

// @route   GET /teacher/classes
// @desc    Haal alle klassen van een leerkracht op
// @access  Private (Alleen leerkrachten)
router.get("/", protectTeacher, getTeacherClasses);

// @route   GET /teacher/classes/:classId/join-requests
// @desc    Haal alle studenten op die een join-verzoek hebben ingediend
// @access  Private (Alleen leerkrachten)
router.get("/:classId/join-requests", protectTeacher, getJoinRequestsForClass);

module.exports = router;
