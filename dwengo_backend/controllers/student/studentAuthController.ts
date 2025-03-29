import { Student, User } from "@prisma/client";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { generateToken } from "../../helpers/generateToken";
import UserService from "../../services/userService";
import StudentService from "../../services/studentService";

interface LoginStudentBody {
  email: string;
  password: string;
}

// @desc    Inloggen van een leerling
// @route   POST /auth/student/login
// @access  Public
export const loginStudent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as LoginStudentBody;

    // Basisvalidatie voor e-mail
    if (!/\S+@\S+\.\S+/.test(email)) {
      res.status(400);
      throw new Error("Voer een geldig e-mailadres in");
    }
    // Basisvalidatie voor e-mail
    if (!/\S+@\S+\.\S+/.test(email)) {
      res.status(400);
      throw new Error("Voer een geldig e-mailadres in");
    }

    // Zoek eerst de gebruiker
    const user: User = await UserService.findUserByEmail(email);
    if (!user || user.role !== "STUDENT") {
      res.status(401);
      throw new Error("Ongeldige gebruiker");
    }

    // Haal het gekoppelde Student-record op
    // Hier geen type aan proberen koppelen, zorgt enkel voor problemen
    const student: Student & { user: User } =
      await StudentService.findStudentById(user.id);

    if (!student || !student.user) {
      res.status(401);
      throw new Error("Ongeldige gebruiker");
    }

    // Vergelijk het opgegeven wachtwoord met de opgeslagen hash
    const passwordMatches: boolean = await bcrypt.compare(
      password,
      student.user.password
    );
    if (!passwordMatches) {
      res.status(401);
      throw new Error("Ongeldig wachtwoord");
    }

    res.json({
      message: "Succesvol ingelogd",
      firstName: user.firstName,
      lastName: user.lastName,
      token: generateToken(student.userId),
    });
  }
);
