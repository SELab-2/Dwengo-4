const { PrismaClient } = require('@prisma/client');
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");

const prisma = new PrismaClient();
const APP_URL = process.env.APP_URL || "http://localhost:5000";

// Maak een nieuwe klas aan
const createClassroom = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const teacherId = req.user.id; // req.user wordt verondersteld door een auth-middleware

  if (!name) {
    res.status(400);
    throw new Error("Vul een klasnaam in");
  }

  // Genereer een unieke join-code (bijvoorbeeld een 8-cijferige hex-string)
  const joinCode = crypto.randomBytes(4).toString("hex");

  const classroom = await prisma.classroom.create({
    data: {
      name,
      joinCode,
      teacher: { connect: { id: teacherId } }
    }
  });

  res.status(201).json({ message: "Klas aangemaakt", classroom });
});

// Verwijder een klas
const deleteClassroom = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const teacherId = req.user.id;

  // Controleer of de klas bestaat en toebehoort aan de leerkracht
  const classroom = await prisma.classroom.findUnique({ where: { id: classId } });
  if (!classroom || classroom.teacherId !== teacherId) {
    res.status(403);
    throw new Error("Toegang geweigerd");
  }

  await prisma.classroom.delete({ where: { id: classId } });
  res.json({ message: "Klas verwijderd" });
});

// Haal de join-link op voor een klas
const getJoinLink = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const teacherId = req.user.id;

  const classroom = await prisma.classroom.findUnique({ where: { id: classId } });
  if (!classroom || classroom.teacherId !== teacherId) {
    res.status(403);
    throw new Error("Toegang geweigerd");
  }

  // Bouw de join-link op (bijv. http://localhost:5000/student/classes/join?joinCode=xxx)
  const joinLink = `${APP_URL}/student/classes/join?joinCode=${classroom.joinCode}`;
  res.json({ joinLink });
});

// Vernieuw (regenerate) de join-link (join-code)
const regenerateJoinLink = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const teacherId = req.user.id;

  const classroom = await prisma.classroom.findUnique({ where: { id: classId } });
  if (!classroom || classroom.teacherId !== teacherId) {
    res.status(403);
    throw new Error("Toegang geweigerd");
  }

  // Genereer een nieuwe join-code
  const newJoinCode = crypto.randomBytes(4).toString("hex");

  const updatedClassroom = await prisma.classroom.update({
    where: { id: classId },
    data: { joinCode: newJoinCode }
  });

  const joinLink = `${APP_URL}/student/classes/join?joinCode=${updatedClassroom.joinCode}`;
  res.json({ joinLink });
});

// Haal alle leerlingen op die aan een klas gekoppeld zijn
const getClassroomStudents = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const teacherId = req.user.id;

  const classroom = await prisma.classroom.findUnique({
    where: { id: classId },
    include: { students: true }
  });
  if (!classroom || classroom.teacherId !== teacherId) {
    res.status(403);
    throw new Error("Toegang geweigerd");
  }

  res.json({ students: classroom.students });
});

module.exports = {
  createClassroom,
  deleteClassroom,
  getJoinLink,
  regenerateJoinLink,
  getClassroomStudents
};
