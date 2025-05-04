// helpers/generateToken.ts

import jwt from "jsonwebtoken";
import { InternalServerError } from "../errors/errors";

/**
 * Genereert een JWT-token voor een gegeven user ID.
 * @param id User ID (number of string)
 * @returns JWT-token als string
 */
export const generateToken = (id: number | string) => {
  if (!process.env.JWT_SECRET) {
    throw new InternalServerError(
      "JWT_SECRET is not defined in the environment variables.",
    );
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
