const { PrismaClient } = require('@prisma/client');
const asyncHandler = require("express-async-handler");

const prisma = new PrismaClient();

// Een leerling joinen aan een klas via een join-code
const joinClassroom = asyncHandler(async (req, res) => {
  // De join-code kan zowel als queryparameter als in de body worden meegegeven
  const joinCode = req.query.joinCode || req.body.joinCode;
  const studentId = req.user.id;

  if (!joinCode) {
    res.status(400);
    throw new Error("Join code is vereist");
  }

  // Zoek de klas op basis van de join-code
  const classroom = await prisma.classroom.findUnique({ where: { joinCode } });
  if (!classroom) {
    res.status(404);
    throw new Error("Klas niet gevonden");
  }

  // Controleer of de leerling al lid is van de klas
  const alreadyJoined = await prisma.classroom.findFirst({
    where: {
      id: classroom.id,
      students: {
        some: { id: studentId }
      }
    }
  });

  if (alreadyJoined) {
    res.status(400);
    throw new Error("Je bent al lid van deze klas");
  }

  // Koppel de leerling aan de klas
  await prisma.classroom.update({
    where: { id: classroom.id },
    data: {
      students: {
        connect: { id: studentId }
      }
    }
  });

  res.json({ message: "Succesvol toegetreden tot de klas" });
});

module.exports = {
  joinClassroom
};
