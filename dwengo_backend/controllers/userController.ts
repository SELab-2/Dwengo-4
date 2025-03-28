import asyncHandler from "express-async-handler";
import { Role, User } from "@prisma/client";
import UserService from "../services/userService";
import bcrypt from "bcryptjs";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";
import { Response } from "express";
import { z, ZodIssue } from "zod";

const RegisterUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerUser = async (
  req: AuthenticatedRequest,
  res: Response,
  role: Role,
): Promise<void> => {
  // Validate the request body
  try {
    // This will throw if the body doesn't match the RegisterUserSchema
    RegisterUserSchema.parse(req.body);
  } catch (error) {
    // If the error is a ZodError
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: error.errors
          .map((err: ZodIssue): string => err.message)
          .join(", "),
      });
      return;
    } else {
      // This shouldn't happen
      res.status(500).json({ message: "An unexpected error occurred" });
      return;
    }
  }

  const { firstName, lastName, email, password } = req.body;

  // Controleer of gebruiker al bestaat
  const existingUser: User | null = await UserService.findUser(email);
  if (existingUser) {
    res.status(400);
    throw new Error("Gebruiker bestaat al");
  }

  // Hash het wachtwoord
  const hashedPassword: string = await bcrypt.hash(password, 10);

  // Maak de gebruiker aan met de juiste rol
  await UserService.createUser(
    firstName,
    lastName,
    email,
    hashedPassword,
    role,
  );

  res.status(201).json({
    message: `${
      role === Role.TEACHER ? "Leerkracht" : "Leerling"
    } succesvol geregistreerd`,
  });
};

// @desc    Registreer een nieuwe leerling
// @route   POST /teacher/auth/register
// @access  Public
export const registerTeacher = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await registerUser(req, res, Role.TEACHER);
  },
);

// @desc    Registreer een nieuwe leerling
// @route   POST /student/auth/register
// @access  Public
export const registerStudent = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    await registerUser(req, res, Role.STUDENT);
  },
);
