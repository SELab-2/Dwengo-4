const asyncHandler = require("express-async-handler");
import * as classService from "../../services/classService";

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
  const classroom = await classService.getClassByJoinCode(joinCode);
  if (!classroom) {
    res.status(404);
    throw new Error("Klas niet gevonden");
  }

  // Check if the student is already in the class
  if (classService.isStudentInClass(classroom, studentId)) {
    res.status(400);
    throw new Error("Je bent al lid van deze klas");
  }

  // Add the student to the class using the service
  await classService.addStudentToClass(classroom.id, studentId);

  res.json({ message: "Succesvol toegetreden tot de klas" });
});

module.exports = {
  joinClassroom
};
