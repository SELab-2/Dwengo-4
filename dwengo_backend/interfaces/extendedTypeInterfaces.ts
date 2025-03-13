import { Role, Student, Teacher } from '@prisma/client';
import { Request } from 'express';


export interface AuthenticatedUser {
    id: number;
    role?: Role;
    teacher?: Teacher;
    student?: Student;
    email: string;
}

// Uitbreiding van het Express Request-type zodat we een user-property hebben
export interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}