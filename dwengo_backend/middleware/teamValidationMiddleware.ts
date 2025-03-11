import { Response, NextFunction } from 'express';
import {AuthenticatedRequest, IdentifiableTeamDivision, TeamDivision} from "../interfaces/extendedTypeInterfaces";
import asyncHandler from 'express-async-handler';

// Checks if the AssignmentId parameter from "/teacher/:assignmentId" is a valid Number
export const makeAssignmentIdParamValid = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const assignmentId: number = Number(req.params.assignmentId);

    if (isNaN(assignmentId)) {
        res.status(400).json({ error: "Invalid assignment ID. It must be a number." });
        return;
    }

    next();
});

// Checks if the TeamId parameter from "/teacher/:assignmentId/:teamId" is a valid Number
export const makeTeamIdParamValid = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const teamIdNumber: number = Number(req.params.teamId);

    if (isNaN(teamIdNumber)) {
        res.status(400).json({ error: "Invalid team ID. It must be a number." });
        return;
    }

    next();
});

// Check if the fields that TeamDivision and IdentifiableTeamDivision share are valid.
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

/*
* Check if the parameter teams conforms to the TeamDivision interface.
* This is nothing more than an interface specifying how a class of students gets divided into teams.
* */
export const ensureTeamsParamValidTeamDivision = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const { teams } = req.body;

    // Check if teams is an array
    if (!Array.isArray(teams)) {
        res.status(400).json({ error: "'teams' must be an array." });
        return;
    }

    const validatedTeams: TeamDivision[] = [];

    for (const team of teams) {
        // Validate that the fields that (Identifiable)TeamDivision are sharing are valid.
        const validFields: TeamDivision | null = validateTeamCommonFields(team);

        if (!validFields) {
            res.status(400).json({ error: "Invalid team structure or student IDs." });
            return;
        }

        // Create the TeamDivision
        const validTeam: TeamDivision = {
            teamName: team.teamName,
            studentIds: team.studentIds,
        };

        validatedTeams.push(validTeam);
    }

    req.body.teams = validatedTeams;
    next();
});

/*
* Check if the parameter teams conforms to the IdentifiableTeamDivision interface
* An IdentifiableTeamDivision is the same as a TeamDivision but with a ID for the team
* The reason for these interfaces is that when you are creating a team for the first time, it does not yet have
* an ID. Meaning that when you are creating, TeamDivision is all the info you need.
* On an update however, you need to somehow find the team, which is why IdentifiableTeamDivision exists.
* */
export const ensureTeamParamValidIdentifiableTeamDivision = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const { teams } = req.body;

    // Check if teams is an Array
    if (!Array.isArray(teams)) {
        res.status(400).json({ error: "'teams' must be an array." });
        return;
    }

    // Loop through teams to validate id and create valid objects
    const validatedTeams: IdentifiableTeamDivision[] = [];

    for (const team of teams) {
        // Validate that the fields that (Identifiable)TeamDivision are sharing are valid.
        const validFields: TeamDivision | null = validateTeamCommonFields(team);

        if (!validFields) {
            res.status(400).json({ error: "Invalid team structure or student IDs." });
            return;
        }

        // Extra validation since IdentifiableTeamDivision extends the TeamDivision interface
        // Check if 'id' is a valid number for IdentifiableTeamDivision
        if (typeof team.id !== 'number' || isNaN(team.id)) {
            res.status(400).json({ error: "Each team must have a valid 'id' as a number." });
            return;
        }

        // Create the IdentifiableTeamDivision object after validating the 'id'
        const validTeam: IdentifiableTeamDivision = {
            teamName: team.teamName,
            studentIds: team.studentIds,
            teamId: team.id,
        };

        validatedTeams.push(validTeam);
    }

    req.body.teams = validatedTeams;
    next();
});

