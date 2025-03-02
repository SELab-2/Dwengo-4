import {PrismaClient, Team} from "@prisma/client";

const prisma = new PrismaClient();

interface TeamDivision {
    teamName: string;         // The name of the team (e.g., "Team 1")
    studentIds: number[];     // Array of student IDs that belong to this team
}

/**
 * This function assumes that the division of a group of people into teams has already been done
 * and is specified as a "TeamDivision" interface
 * **/
export const createTeamsInAssignment = async (
    assignmentId: number,
    teams: TeamDivision[]
): Promise<Team[]> => {
    const createdTeams: Team[] = [];

    // Fetch class assignments and the class with its students
    const classAssignments = await prisma.classAssignment.findMany({
        where: { assignmentId: assignmentId },
        include: {
            class: {
                include: {
                    classLinks: {
                        include: {
                            student: true,
                        }
                    }
                }
            }
        }
    });

    if (classAssignments.length === 0) {
        throw new Error("Assignment not found or not linked to any class.");
    }

    const classAssignmentId = classAssignments[0].id;

    // Create teams in the database
    for (const team of teams) {
        const newTeam: Team = await createTeam(team.teamName);
        await assignStudentsToTeam(newTeam.id, team.studentIds, classAssignmentId, assignmentId);

        createdTeams.push(newTeam);
    }

    return createdTeams;
};

async function createTeam(teamName: string): Promise<Team> {
    return prisma.team.create({
        data: {
            teamname: teamName,
        }
    });
}

async function assignStudentsToTeam(teamId: number, studentIds: number[], classAssignmentId: number, assignmentId: number): Promise<void> {
    for (const studentId of studentIds) {
        const student = await prisma.student.findUnique({ where: { userId: studentId } });

        if (student) {
            await prisma.teamAssignment.create({
                data: {
                    teamId: teamId,
                    classAssignmentId: classAssignmentId,
                    memberId: student.userId,
                    assignmentId: assignmentId,
                }
            });
        }
    }
}

// Get all teams for a given assignment
export const getTeamsForAssignment = async (assignmentId: string): Promise<Team[]> => {
    const teams = await prisma.team.findMany({
        where: { assignmentId: parseInt(assignmentId) },
        include: {
            students: true // Include the students associated with the team
        }
    });

    return teams;
};

// Update teams in an assignment
export const updateTeamsForAssignment = async (assignmentId: string, teams: any[]): Promise<Team[]> => {
    const updatedTeams = [];

    for (const team of teams) {
        const updatedTeam = await prisma.team.update({
            where: { id: parseInt(team.id) },
            data: {
                teamname: team.teamname,
                students: {
                    set: team.studentIds.map((id: string) => ({ id: parseInt(id) })) // Update students
                }
            }
        });

        updatedTeams.push(updatedTeam);
    }

    return updatedTeams;
};

// Delete a team from an assignment
export const deleteTeamFromAssignment = async (assignmentId: string, teamId: string): Promise<void> => {
    await prisma.team.delete({
        where: {
            id: parseInt(teamId)
        }
    });
};
