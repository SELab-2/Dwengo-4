import {Role, User} from '@prisma/client';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import {generateToken} from "../../helpers/generateToken";
import {UserController} from "../user/userController";
import {StudentController} from "./studentController";

interface RegisterStudentBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const userController = new UserController();
const studentController = new StudentController();

// @desc    Registreer een nieuwe leerling
// @route   POST /student/auth/register
// @access  Public
export const registerStudent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, password } = req.body as RegisterStudentBody;

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
  const existingUser: User = await userController.findUserByEmail(email);
  if (existingUser) {
    res.status(400);
    throw new Error("Gebruiker bestaat al");
  }

  // Hash het wachtwoord
  const hashedPassword: string = await bcrypt.hash(password, 10);

  // Maak eerst een User-record aan met role "STUDENT"
  await userController.createUser(
      firstName, lastName, email, hashedPassword, Role.STUDENT
  )

  res.status(201).json({ message: "Leerling succesvol geregistreerd" });
});

interface LoginStudentBody {
  email: string;
  password: string;
}

// @desc    Inloggen van een leerling
// @route   POST /student/auth/login
// @access  Public
export const loginStudent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginStudentBody;

  // Basisvalidatie voor e-mail
  if (!/\S+@\S+\.\S+/.test(email)) {
    res.status(400);
    throw new Error("Voer een geldig e-mailadres in");
  }

  // Zoek eerst de gebruiker
  const user: User = await userController.findUserByEmail(email);
  if (!user || user.role !== "STUDENT") {
    res.status(401);
    throw new Error("Ongeldige gebruiker");
  }

  // Haal het gekoppelde Student-record op
  // Hier geen type aan proberen koppelen, zorgt enkel voor problemen
  const student: any = await studentController.findStudentById(user.id, {user: true});

  if (!student || !student.user) {
    res.status(401);
    throw new Error("Ongeldige gebruiker");
  }

  // Vergelijk het opgegeven wachtwoord met de opgeslagen hash
  const passwordMatches: boolean = await bcrypt.compare(password, student.user.password);
  if (!passwordMatches) {
    res.status(401);
    throw new Error("Ongeldig wachtwoord");
  }

  res.json({
    message: "Succesvol ingelogd",
    token: generateToken(student.userId),
  });
});
