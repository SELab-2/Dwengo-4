import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import crypto from "crypto";
import { UnauthorizedError } from "../../errors/errors";
const prisma = new PrismaClient();

// Functie om een JWT-token te genereren
const generateToken = (id: number | string): string => {
    if (!process.env.JWT_SECRET) {
        if (process.env.NODE_ENV === "test") {
            return crypto.randomBytes(32).toString("hex");
        } else {
            throw new Error("JWT_SECRET is niet gedefinieerd in de omgevingsvariabelen");
        }
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

interface LoginStudentBody {
    email: string;
    password: string;
}

// @desc    Inloggen van een leerling
// @route   POST /student/auth/login
// @access  Public
export const loginStudent = asyncHandler(async (req: Request, res: Response) => {
    let { email, password } = req.body as LoginStudentBody;
    email = email.toLowerCase();

    // Zoek eerst de gebruiker
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "STUDENT") {
        throw new UnauthorizedError("Invalid user");
    }

    // Haal het gekoppelde Student-record op
    const student = await prisma.student.findUnique({
        where: { userId: user.id },
        include: { user: true },
    });

    if (!student || !student.user) {
        throw new UnauthorizedError("Invalid user");
    }

    // Vergelijk het opgegeven wachtwoord met de opgeslagen hash
    const passwordMatches = await bcrypt.compare(password, student.user.password);
    if (!passwordMatches) {
        throw new UnauthorizedError("Incorrect password");
    }

    res.json({
        message: "Succesvol ingelogd",
        token: generateToken(student.userId),
    });
});
