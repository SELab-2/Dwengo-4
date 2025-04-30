import { z } from "zod";

export const registerUserBodySchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginUserBodySchema = z.object({
  email: z.string().email({ message: "Voer een geldig e-mailadres in" }), // Zod's built-in email validation
  // Password is already enforced to be long enough during registration
  password: z.string(), // Add any password validation as needed
});
