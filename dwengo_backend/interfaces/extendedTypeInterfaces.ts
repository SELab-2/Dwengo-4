import { Request } from 'express';

// Uitbreiding van het Express Request-type zodat we een user-property hebben
export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
    };
}