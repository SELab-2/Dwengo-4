import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

// Functie om een JWT-token te genereren
const generateToken = (id: number | string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is niet gedefinieerd in de omgevingsvariabelen");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

interface RegisterTeacherBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// @desc    Registreer een nieuwe leerkracht
// @route   POST /teacher/auth/register
// @access  Public
export const registerTeacher = asyncHandler(async (req: Request, res: Response) => {
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
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(400);
    throw new Error("Gebruiker bestaat al");
  }

  // Hash het wachtwoord
  const hashedPassword = await bcrypt.hash(password, 10);

  // Maak eerst een User-record aan met role "TEACHER"
  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "TEACHER",
    },
  });

  // Maak vervolgens het gekoppelde Teacher-record
  await prisma.teacher.create({
    data: {
      userId: newUser.id,
    },
  });

  res.status(201).json({ message: "Leerkracht succesvol geregistreerd" });
});

interface LoginTeacherBody {
  email: string;
  password: string;
}

// @desc    Inloggen van een leerkracht
// @route   POST /teacher/auth/login
// @access  Public
export const loginTeacher = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginTeacherBody;

  // Basisvalidatie voor e-mail
  if (!/\S+@\S+\.\S+/.test(email)) {
    res.status(400);
    throw new Error("Voer een geldig e-mailadres in");
  }

  // Zoek eerst de gebruiker
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "TEACHER") {
    res.status(401);
    throw new Error("Ongeldige gebruiker");
  }

  // Haal het gekoppelde Teacher-record op
  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    include: { user: true },
  });

  if (!teacher || !teacher.user) {
    res.status(401);
    throw new Error("Ongeldige gebruiker");
  }

  // Vergelijk het opgegeven wachtwoord met de opgeslagen hash
  const passwordMatches = await bcrypt.compare(password, teacher.user.password);
  if (!passwordMatches) {
    res.status(401);
    throw new Error("Ongeldig wachtwoord");
  }

  res.json({
    message: "Succesvol ingelogd",
    token: generateToken(teacher.userId),
  });
});
