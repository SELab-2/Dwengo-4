import {Role, User} from '@prisma/client';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import * as userService from "../../services/userService";
import * as teacherService from "../../services/teacherService";
import { generateToken } from "../../helpers/generateToken";

interface RegisterTeacherBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// @desc    Registreer een nieuwe leerkracht
// @route   POST /teacher/auth/register
// @access  Public
export const registerTeacher = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, password } = req.body as RegisterTeacherBody;

  // Controleer of alle velden ingevuld zijn
  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error("Vul alle velden in");
  }

  // Basisvalidatie voor e-mail
  if (!/\S+@\S+\.\S+/.test(email)) {
    res.status(400);
    throw new Error("Voer een geldig e-mailadres in");
  }

  // Controleer of het wachtwoord lang genoeg is
  if (password.length < 6) {
    res.status(400);
    throw new Error("Het wachtwoord moet minstens 6 karakters lang zijn");
  }

  // Controleer of er al een gebruiker bestaat met dit e-mailadres
  const existingUser: User | null = await userService.findUser(email);

  if (existingUser) {
    res.status(400);
    throw new Error("Gebruiker bestaat al");
  }

  // Hash het wachtwoord
  const hashedPassword: string = await bcrypt.hash(password, 10);

  // Maak eerst een User-record aan met role "TEACHER"
  await userService.createUser(
      firstName, lastName, email, hashedPassword, Role.TEACHER
  );

  res.status(201).json({ message: "Leerkracht succesvol geregistreerd" });
});

interface LoginTeacherBody {
  email: string;
  password: string;
}

// @desc    Inloggen van een leerkracht
// @route   POST /teacher/auth/login
// @access  Public
export const loginTeacher = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginTeacherBody;

  // Basisvalidatie voor e-mail
  if (!/\S+@\S+\.\S+/.test(email)) {
    res.status(400);
    throw new Error("Voer een geldig e-mailadres in");
  }

  // Zoek eerst de gebruiker
  const user: User = await userService.findUserByEmail(email);
  if (!user || user.role !== "TEACHER") {
    res.status(401);
    throw new Error("Ongeldige gebruiker");
  }

  // Haal het gekoppelde Teacher-record op
  // Hier geen type aan proberen geven, zorgt enkel voor problemen
  const teacher: any = await teacherService.findTeacherById(user.id, {user: true});

  if (!teacher.user) {
    res.status(401);
    throw new Error("Ongeldige gebruiker");
  }

  // Vergelijk het opgegeven wachtwoord met de opgeslagen hash
  const passwordMatches: boolean = await bcrypt.compare(password, teacher.user.password);
  if (!passwordMatches) {
    res.status(401);
    throw new Error("Ongeldig wachtwoord");
  }

  res.json({
    message: "Succesvol ingelogd",
    token: generateToken(teacher.userId),
  });
});
