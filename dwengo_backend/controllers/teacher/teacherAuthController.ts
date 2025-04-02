import { Teacher, User } from "@prisma/client";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import UserService from "../../services/userService";
import TeacherService from "../../services/teacherService";
import { generateToken } from "../../helpers/generateToken";

interface LoginTeacherBody {
  email: string;
  password: string;
}

// @desc    Inloggen van een leerkracht
// @route   POST /auth/teacher/login
// @access  Public
export const loginTeacher = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as LoginTeacherBody;

    // Basisvalidatie voor e-mail
    if (!/\S+@\S+\.\S+/.test(email)) {
      res.status(400);
      throw new Error("Voer een geldig e-mailadres in");
    }

    // Zoek eerst de gebruiker
    const user: User = await UserService.findUserByEmail(email);
    if (!user || user.role !== "TEACHER") {
      res.status(401);
      throw new Error("Ongeldige gebruiker");
    }

    // Haal het gekoppelde Teacher-record op
    // Hier geen type aan proberen geven, zorgt enkel voor problemen
    const teacher: Teacher & { user: User } =
      await TeacherService.findTeacherById(user.id);

    if (!teacher.user) {
      res.status(401);
      throw new Error("Ongeldige gebruiker");
    }

    // Vergelijk het opgegeven wachtwoord met de opgeslagen hash
    const passwordMatches: boolean = await bcrypt.compare(
      password,
      teacher.user.password
    );
    if (!passwordMatches) {
      res.status(401);
      throw new Error("Ongeldig wachtwoord");
    }

    res.json({
      message: "Succesvol ingelogd",
      firstName: user.firstName,
      lastName: user.lastName,
      token: generateToken(teacher.userId),
    });
  }
);
