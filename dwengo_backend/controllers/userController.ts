import asyncHandler from "express-async-handler";
import { Role, User } from "@prisma/client";
import UserService from "../services/userService";
import bcrypt from "bcryptjs";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";
import { Response } from "express";
import { ConflictError } from "../errors/errors";

const registerUser = async (
    req: AuthenticatedRequest,
    res: Response,
    role: Role
): Promise<void> => {
    const { firstName, lastName, email, password } = req.body;

    // Controleer of er al een gebruiker bestaat met dit e-mailadres
    const existingUser: User | null = await UserService.findUser(email);
    if (existingUser) {
        throw new ConflictError("Email is already in use");
    }

    // Hash het wachtwoord
    const hashedPassword: string = await bcrypt.hash(password, 10);

    // Maak de gebruiker aan met de juiste rol
    await UserService.createUser(firstName, lastName, email.toLowerCase(), hashedPassword, role);

    res.status(201).json({
        message: `${role === Role.TEACHER ? "Leerkracht" : "Leerling"} succesvol geregistreerd`,
    });
};

// @desc    Registreer een nieuwe leerling
// @route   POST /teacher/auth/register
// @access  Public
export const registerTeacher = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        await registerUser(req, res, Role.TEACHER);
    }
);

// @desc    Registreer een nieuwe leerling
// @route   POST /student/auth/register
// @access  Public
export const registerStudent = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
        await registerUser(req, res, Role.STUDENT);
    }
);
