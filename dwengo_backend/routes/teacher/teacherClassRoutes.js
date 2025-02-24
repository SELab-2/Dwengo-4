const express = require("express");
const { protectTeacher } = require("../../middleware/teacherAuthMiddleware");
const {
    createClassroom,
    deleteClassroom,
    getJoinLink,
    regenerateJoinLink,
    getClassroomStudents
} = require("../../controllers/teacher/teacherClassController");

const router = express.Router();

// Alleen leerkrachten mogen deze routes gebruiken
router.post("/", protectTeacher, createClassroom);
router.delete("/:classId", protectTeacher, deleteClassroom);
router.get("/:classId/join-link", protectTeacher, getJoinLink);
router.post("/:classId/regenerate-join-link", protectTeacher, regenerateJoinLink);
router.get("/:classId/students", protectTeacher, getClassroomStudents);

module.exports = router;
