import { UnauthorizedError } from "../errors/errors";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";
import { z } from 'zod';

const AuthUserSchema = z.object({
    id: z.number(),
    email: z.string().email()
});

// since the user property in AuthenticatedRequest could be undefined, use this function to extract it safely
export function getUserFromAuthRequest(req: AuthenticatedRequest): { id: number, email: string } {
    // check that user is set
    if (!req.user) {
        throw new UnauthorizedError("Authentication required");
    }

    // check that user object has correct structure
    try {
        return AuthUserSchema.parse(req.user);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new UnauthorizedError("Invalid user object in request");
        }
        throw error;
    }
}
