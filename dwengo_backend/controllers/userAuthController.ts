import asyncHandler from "express-async-handler";
import { Role, User } from "@prisma/client";
import UserService from "../services/userService";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";
import { Request, Response } from "express";
import { ConflictError, UnauthorizedError } from "../errors/errors";

// Functie om een JWT-token te genereren
const generateToken = (id: number | string): string => {
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === "test") {
      return crypto.randomBytes(32).toString("hex");
    } else {
      throw new Error(
        "JWT_SECRET is niet gedefinieerd in de omgevingsvariabelen",
      );
    }
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const registerUser = async (
  req: AuthenticatedRequest,
  res: Response,
  role: Role,
): Promise<void> => {
  const { firstName, lastName, email, password } = req.body;

  // Controleer of er al een gebruiker bestaat met dit e-mailadres
  const existingUser: User | null = await UserService.findUserByEmail(email);
  if (existingUser) {
    throw new ConflictError("Email is already in use");
  }

  // Hash het wachtwoord
  const hashedPassword: string = await bcrypt.hash(password, 10);

  // Maak de gebruiker aan met de juiste rol
  await UserService.createUser(
    firstName,
    lastName,
    email.toLowerCase(),
    hashedPassword,
    role,
  );

  res.status(201).json({
    message: `${role === Role.TEACHER ? "Leerkracht" : "Leerling"} succesvol geregistreerd`,
  });
};

const loginUser = async (
  req: Request,
  res: Response,
  role: Role,
): Promise<void> => {
  const { password } = req.body;
  let { email } = req.body;
  email = email.toLowerCase();

  // Zoek eerst de gebruiker
  const user = await UserService.findUserByEmail(email);
  if (!user || user.role !== role) {
    throw new UnauthorizedError("Invalid user");
  }

  // Haal het gekoppelde teacher/student record op
  let studentOrTeacherRecord;
  if (role === Role.TEACHER) {
    studentOrTeacherRecord = await UserService.findTeacherUserById(user.id);
  } else {
    studentOrTeacherRecord = await UserService.findStudentUserById(user.id);
  }

  if (!studentOrTeacherRecord || !studentOrTeacherRecord.user) {
    throw new UnauthorizedError("Invalid user");
  }

  // Vergelijk het opgegeven wachtwoord met de opgeslagen hash
  const passwordMatches = await bcrypt.compare(
    password,
    studentOrTeacherRecord.user.password,
  );
  if (!passwordMatches) {
    throw new UnauthorizedError("Incorrect password");
  }

  res.json({
    message: "Succesvol ingelogd",
    firstName: user.firstName,
    lastName: user.lastName,
    token: generateToken(studentOrTeacherRecord.userId),
  });
};

// @desc    Registreer een nieuwe leerling
// @route   POST /teacher/auth/register
// @access  Public
export const registerTeacher = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await registerUser(req, res, Role.TEACHER);
  },
);

// @desc    Inloggen van een leerkracht
// @route   POST /teacher/auth/login
// @access  Public
export const loginTeacher = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await loginUser(req, res, Role.TEACHER);
  },
);

// @desc    Registreer een nieuwe leerling
// @route   POST /student/auth/register
// @access  Public
export const registerStudent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await registerUser(req, res, Role.STUDENT);
  },
);

// @desc    Inloggen van een leerling
// @route   POST /student/auth/login
// @access  Public
export const loginStudent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await loginUser(req, res, Role.STUDENT);
  },
);
