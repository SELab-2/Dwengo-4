import { z } from "zod";

export const registerBodySchema = z.object({
  firstName: z.string({ required_error: "first name required" }).nonempty(),
  lastName: z.string({ required_error: "last name required" }).nonempty(),
  email: z.string({ required_error: "email required" }).email("invalid email"),
  password: z
    .string({ required_error: "password required" })
    .min(6, "password must be at least 6 characters"),
});

export const loginBodySchema = z.object({
  email: z.string({ required_error: "email required" }).email("invalid email"),
  password: z.string({ required_error: "password required" }),
});
