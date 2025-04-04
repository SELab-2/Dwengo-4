import { UnauthorizedError } from "../errors/errors";
import {
  AuthenticatedRequest,
  AuthenticatedUser,
} from "../interfaces/extendedTypeInterfaces";
import { z } from "zod";
import { Role } from "@prisma/client";

const RoleSchema = z.enum([Role.ADMIN, Role.TEACHER, Role.STUDENT]);

const AuthenticatedUserSchema = z.object({
  id: z.number(),
  role: RoleSchema.optional(),
  // z.any() zorgt er voor dat ik niet heel de databank opnieuw moet herdefiniëren maar dan in Zod
  teacher: z.any().optional(),
  student: z.any().optional(),
  email: z.string().email(),
});

// since the user property in AuthenticatedRequest could be undefined, use this function to extract it safely
export function getUserFromAuthRequest(
  req: AuthenticatedRequest
): AuthenticatedUser {
  // check that user is set
  if (!req.user) {
    throw new UnauthorizedError("Authentication required.");
  }

  // check that user object has correct structure
  try {
    return AuthenticatedUserSchema.parse(req.user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new UnauthorizedError("Invalid user object in request.");
    }
    throw error;
  }
}
