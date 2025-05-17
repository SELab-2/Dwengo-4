import asyncHandler from "express-async-handler";
import { Role } from "@prisma/client";
import UserService from "../services/userService";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";
import { Request, Response } from "express";
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from "../errors/errors";

// Functie om een JWT-token te genereren
const generateToken = (id: number | string, role: string): string => {
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === "test") {
      return crypto.randomBytes(32).toString("hex");
    } else {
      throw new InternalServerError(
        "JWT_SECRET is not defined in the environment variables.",
      );
    }
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const registerUser = async (
  req: AuthenticatedRequest,
  res: Response,
  role: Role,
): Promise<void> => {
  const { firstName, lastName, email, password } = req.body;
  // Controleer of er al een gebruiker bestaat met dit e-mailadres
  await UserService.emailInUse(email);

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
    message: `${role === Role.TEACHER ? "Teacher" : "Student"} successfully registered.`,
  });
};

const loginUser = async (req: Request, res: Response, role: Role): Promise<void> => {
  let email = req.body.email;
  const password = req.body.password;
  email = email.toLowerCase();

  // Zoek eerst de gebruiker
  const user = await UserService.findUserByEmail(email);
  if (user.role === Role.STUDENT && role === Role.TEACHER) {
    throw new BadRequestError("Student cannot login as teacher.");
  }
  if (user.role === Role.TEACHER && role === Role.STUDENT) {
    throw new BadRequestError("Teacher cannot login as student.");
  }

  // Haal het gekoppelde teacher/student record op
  let studentOrTeacherRecord;
  if (role === Role.TEACHER) {
    studentOrTeacherRecord = await UserService.findTeacherUserById(user.id);
  } else {
    studentOrTeacherRecord = await UserService.findStudentUserById(user.id);
  }

  // Vergelijk het opgegeven wachtwoord met de opgeslagen hash
  const passwordMatches = await bcrypt.compare(
    password,
    studentOrTeacherRecord.user.password,
  );
  if (!passwordMatches) {
    throw new UnauthorizedError("Incorrect password.");
  }

  res.json({
    message: "Successfully logged in.",
    firstName: user.firstName,
    lastName: user.lastName,
    token: generateToken(
      studentOrTeacherRecord.userId,
      studentOrTeacherRecord.user.role,
    ),
  });
};

// @desc    Registreer een nieuwe leerling
// @route   POST /auth/teacher/register
// @access  Public
export const registerTeacher = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await registerUser(req, res, Role.TEACHER);
  },
);

// @desc    Inloggen van een leerkracht
// @route   POST /auth/teacher/login
// @access  Public
export const loginTeacher = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await loginUser(req, res, Role.TEACHER);
  },
);

// @desc    Registreer een nieuwe leerling
// @route   POST /auth/student/register
// @access  Public
export const registerStudent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await registerUser(req, res, Role.STUDENT);
  },
);

// @desc    Inloggen van een leerling
// @route   POST /auth/student/login
// @access  Public
export const loginStudent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    await loginUser(req, res, Role.STUDENT);
  },
);
