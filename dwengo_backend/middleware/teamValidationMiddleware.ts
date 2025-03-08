import { Response, NextFunction } from 'express';
import {AuthenticatedRequest, TeamDivision} from "../interfaces/extendedTypeInterfaces";
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

export const makeTeamsParamValid = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const { teams } = req.body;

    // Check if 'teams' is an array
    if (!Array.isArray(teams)) {
        res.status(400).json({ error: "'teams' must be an array." });
        return;
    }

    // Create an array to hold the valid TeamDivision objects
    const validatedTeams: TeamDivision[] = [];

    // Validate and convert each team object
    for (const team of teams) {
        // Check if the team object contains the correct properties (teamName and studentIds)
        if (typeof team !== 'object' || !team.hasOwnProperty('teamName') || !team.hasOwnProperty('studentIds')) {
            res.status(400).json({ error: "Each team must have a 'teamName' and 'studentIds'." });
            return;
        }

        // Validate 'teamName' property
        if (typeof team.teamName !== 'string' || team.teamName.trim() === '') {
            res.status(400).json({ error: "Each team must have a valid 'teamName' (non-empty string)." });
            return;
        }

        // Validate 'studentIds' property (should be an array of numbers)
        if (!Array.isArray(team.studentIds)) {
            res.status(400).json({ error: "Each team must have 'studentIds' as an array." });
            return;
        }

        // Convert studentIds to numbers
        const studentIds: number[] = team.studentIds.map((id: any): number => Number(id));  // Convert all values to numbers

        // Check if any studentId is invalid
        if (studentIds.some((id: number): boolean => isNaN(id))) {
            res.status(400).json({ error: "Each team must have valid 'studentIds' as an array of numbers." });
            return;
        }

        // Create a valid TeamDivision object
        const validTeam: TeamDivision = {
            teamName: team.teamName.trim(),  // Ensure no extra spaces
            studentIds: studentIds,          // Correctly typed as an array of numbers
        };

        validatedTeams.push(validTeam);  // Add the valid team to the array
    }

    // Attach the validated and converted teams to the request object for the next middleware/controller
    req.body.teams = validatedTeams;

    next();
});