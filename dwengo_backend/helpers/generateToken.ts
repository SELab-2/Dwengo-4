// Functie om een JWT-token te genereren
import jwt from "jsonwebtoken";
import { InternalServerError } from "../errors/errors";

export const generateToken: (id: number | string) => string = (id: number | string): string => {
    if (!process.env.JWT_SECRET) {
        throw new InternalServerError("JWT_SECRET is not defined in the evironment variables.");
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};