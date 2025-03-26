import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import crypto from "crypto";
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
    const { email, password } = req.body as LoginStudentBody;

    // Basisvalidatie voor e-mail
    if (!/\S+@\S+\.\S+/.test(email)) {
        res.status(400);
        throw new Error("Voer een geldig e-mailadres in");
    }

    // Zoek eerst de gebruiker
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "STUDENT") {
        res.status(401);
        throw new Error("Ongeldige gebruiker");
    }

    // Haal het gekoppelde Student-record op
    const student = await prisma.student.findUnique({
        where: { userId: user.id },
        include: { user: true },
    });

    if (!student || !student.user) {
        res.status(401);
        throw new Error("Ongeldige gebruiker");
    }

    // Vergelijk het opgegeven wachtwoord met de opgeslagen hash
    const passwordMatches = await bcrypt.compare(password, student.user.password);
    if (!passwordMatches) {
        res.status(401);
        throw new Error("Ongeldig wachtwoord");
    }

    res.json({
        message: "Succesvol ingelogd",
        token: generateToken(student.userId),
    });
});
