// Functie om een JWT-token te genereren
import jwt from "jsonwebtoken";

export const generateToken: (id: number | string) => string = (id: number | string): string => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is niet gedefinieerd in de omgevingsvariabelen");
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};