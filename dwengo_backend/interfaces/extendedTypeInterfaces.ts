import { Request } from 'express';

// Uitbreiding van het Express Request-type zodat we een user-property hebben
export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
    };
}

export interface TeamDivision {
    teamName: string;         // The name of the team (e.g., "Team 1")
    studentIds: number[];     // Array of student IDs that belong to this team
}

export interface IdentifiableTeamDivision extends TeamDivision {
    id: number;
}