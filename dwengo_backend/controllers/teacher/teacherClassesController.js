const { PrismaClient } = require("@prisma/client");
const asyncHandler = require("express-async-handler");
const { nanoid } = require("nanoid");

const prisma = new PrismaClient();

/**
 * Genereert een unieke code voor een klas
 */
const generateUniqueClassCode = async () => {
  let unique = false;
  let code;

  while (!unique) {
    code = nanoid(6); // Genereert een unieke 6-karaktercode
    const existingClass = await prisma.class.findUnique({ where: { code } });
    if (!existingClass) {
      unique = true;
    }
  }

  return code;
};

/**
 * @desc    Maak een klas aan voor een bepaalde leerkracht
 * @route   POST /teacher/class
 * @access  Private (Leerkracht)
 */
const createClassForTeacher = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const teacherId = req.user.userId; // Komt uit de protectTeacher middleware

  if (!name) {
    res.status(400);
    throw new Error("Naam van de klas is vereist");
  }

  const code = await generateUniqueClassCode();

  // Maak de klas aan
  const newClass = await prisma.class.create({
    data: {
      name,
      code,
      ClassTeacher: {
        create: { teacherId },
      },
    },
  });

  res.status(201).json({
    message: "Klas succesvol aangemaakt",
    class: newClass,
  });
});

/**
 * @desc    Haal alle klassen van een leerkracht op
 * @route   GET /teacher/classes
 * @access  Private (Leerkracht)
 */
const getTeacherClasses = asyncHandler(async (req, res) => {
  const teacherId = req.user.userId;

  const classes = await prisma.class.findMany({
    where: {
      ClassTeacher: {
        some: {
          teacherId,
        },
      },
    },
    include: {
      ClassTeacher: true,
    },
  });

  res.status(200).json(classes);
});

/**
 * @desc    Haal de leerlingen op die zich willen aanmelden voor een klas
 * @route   GET /teacher/class/:classId/join-requests
 * @access  Private (Leerkracht)
 */
const getJoinRequestsForClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const teacherId = req.user.userId;

  // Controleer of de leerkracht de eigenaar is van de klas
  const teacherClass = await prisma.classTeacher.findFirst({
    where: {
      classId: parseInt(classId),
      teacherId,
    },
  });

  if (!teacherClass) {
    res.status(403);
    throw new Error("Je hebt geen toegang tot deze klas");
  }

  // Haal alle pending join requests op
  const joinRequests = await prisma.joinRequest.findMany({
    where: {
      classId: parseInt(classId),
      status: "PENDING",
    },
    include: {
      student: {
        select: {
          userId: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  res.status(200).json(joinRequests);
});

module.exports = {
  createClassForTeacher,
  getTeacherClasses,
  getJoinRequestsForClass,
};
