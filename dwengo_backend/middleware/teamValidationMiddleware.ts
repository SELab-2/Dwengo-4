import { Response, NextFunction } from 'express';
import {AuthenticatedRequest, IdentifiableTeamDivision, TeamDivision} from "../interfaces/extendedTypeInterfaces";
import asyncHandler from 'express-async-handler';

export const makeAssignmentIdParamValid = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const assignmentId: number = Number(req.params.assignmentId);

    if (isNaN(assignmentId)) {
        res.status(400).json({ error: "Invalid assignment ID. It must be a number." });
        return;
    }

    next();
});

export const makeTeamIdParamValid = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const teamIdNumber: number = Number(req.params.teamId);

    if (isNaN(teamIdNumber)) {
        res.status(400).json({ error: "Invalid team ID. It must be a number." });
        return;
    }

    next();
});

const validateTeamCommonFields = (team: any): TeamDivision | null => {
    if (typeof team !== 'object' || !team.hasOwnProperty('teamName') || !team.hasOwnProperty('studentIds')) {
        return null;
    }

    if (typeof team.teamName !== 'string' || team.teamName.trim() === '') {
        return null;
    }

    if (!Array.isArray(team.studentIds)) {
        return null;
    }

    const studentIds: number[] = team.studentIds.map((id: any): number => Number(id)); // Convert all values to numbers
    if (studentIds.some((id: number): boolean => isNaN(id))) {
        return null;
    }

    return {
        teamName: team.teamName.trim(),  // Ensure no extra spaces
        studentIds
    };
};

// Common validation function since IdentifiableTeamDivision extends TeamDivision
const validateTeams = (
    teams: any[],
    createValidTeam: (team: any) => TeamDivision | IdentifiableTeamDivision
): TeamDivision[] | IdentifiableTeamDivision[] | null => {
    const validatedTeams: (TeamDivision | IdentifiableTeamDivision)[] = [];

    for (const team of teams) {
        const validFields: TeamDivision | null = validateTeamCommonFields(team);

        if (!validFields) {
            return null;  // Return error if any team is invalid
        }

        const validTeam: TeamDivision | IdentifiableTeamDivision = createValidTeam(validFields);
        validatedTeams.push(validTeam);
    }

    return validatedTeams;
};

export const ensureTeamsParamValidTeamDivision = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const { teams } = req.body;

    if (!Array.isArray(teams)) {
        res.status(400).json({ error: "'teams' must be an array." });
        return;
    }

    const validatedTeams: TeamDivision[] | IdentifiableTeamDivision[] | null = validateTeams(teams, (team: any): TeamDivision => ({
        teamName: team.teamName,
        studentIds: team.studentIds
    }));

    if (!validatedTeams) {
        res.status(400).json({ error: "Invalid team structure or student IDs." });
        return;
    }

    req.body.teams = validatedTeams;
    next();
});

export const ensureTeamParamValidIdentifiableTeamDivision = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const { teams } = req.body;

    if (!Array.isArray(teams)) {
        res.status(400).json({ error: "'teams' must be an array." });
        return;
    }

    // Loop through teams to validate id and create valid objects
    const validatedTeams: IdentifiableTeamDivision[] | null = [];

    for (const team of teams) {
        const validFields: TeamDivision | null = validateTeamCommonFields(team);

        if (!validFields) {
            res.status(400).json({ error: "Invalid team structure or student IDs." });
            return;
        }

        // Check if 'id' is a valid number for IdentifiableTeamDivision
        if (typeof team.id !== 'number' || isNaN(team.id)) {
            res.status(400).json({ error: "Each team must have a valid 'id' as a number." });
            return;
        }

        // Create the IdentifiableTeamDivision object after validating the 'id'
        const validTeam: IdentifiableTeamDivision = {
            teamName: team.teamName,
            studentIds: team.studentIds,
            id: team.id, // Now safe to include 'id' as it's validated
        };

        validatedTeams.push(validTeam);
    }

    req.body.teams = validatedTeams;
    next();
});

