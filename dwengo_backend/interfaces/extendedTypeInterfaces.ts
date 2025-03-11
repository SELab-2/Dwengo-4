import { Request } from 'express';

// Uitbreiding van het Express Request-type zodat we een user-property hebben
export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
    };
}

/*
* An IdentifiableTeamDivision is the same as a TeamDivision but with a ID for the team
* The reason for these interfaces is that when you are creating a team for the first time, it does not yet have
* an ID. Meaning that when you are creating, TeamDivision is all the info you need.
* On an update however, you need to somehow find the team, which is why IdentifiableTeamDivision exists.
* */
export interface TeamDivision {
    teamName: string;         // The name of the team (e.g., "Team 1")
    studentIds: number[];     // Array of student IDs that belong to this team
}

export interface IdentifiableTeamDivision extends TeamDivision {
    teamId: number;
}