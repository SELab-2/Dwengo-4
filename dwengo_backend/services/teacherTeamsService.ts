import {ClassStudent, PrismaClient, Team} from "@prisma/client";
import {TeamDivision} from "../interfaces/extendedTypeInterfaces"

const prisma = new PrismaClient();

/**
 * This function assumes that the division of a group of people into teams has already been done
 * and is specified as a "TeamDivision" interface.
 * This function assumes the assignment has already been linked to a Class.
 * **/
export const createTeamsInAssignment = async (
    assignmentId: number,
    teams: TeamDivision[]
): Promise<Team[]> => {
    const createdTeams: Team[] = [];

    // Fetch class assignments and the class with its students
    const classAssignments = await prisma.classAssignment.findMany({
        where: { assignmentId: assignmentId }
    });

    if (classAssignments.length === 0) {
        throw new Error("Assignment not found or not linked to any class.");
    }

    // Create teams in the database
    for (const team of teams) {
        const newTeam: Team = await createTeam(team.teamName);
        await assignStudentsToTeam(newTeam.id, team.studentIds);
        await giveAssignmentToTeam(newTeam.id, assignmentId);

        createdTeams.push(newTeam);
    }

    return createdTeams;
};

// Helper function for createTeamsInAssignment
async function createTeam(teamName: string): Promise<Team> {
    return prisma.team.create({
        data: {
            teamname: teamName,
        }
    });
}

// Helper function for createTeamsInAssignment
async function giveAssignmentToTeam(teamId: number, assignmentId: number): Promise<Team> {
    return prisma.team.update({
        where: { id: teamId },
        data: {
            // A new TeamAssignment record is created and linked to the Team.
            // Since teamAssignments[] in Team is a relation field, it will automatically
            // reflect this change when queried with `include: { teamAssignments: true }`.
            teamAssignments: {
                create: { assignmentId: assignmentId },
            },
        },
    });
}

// Helper function for createTeamsInAssignment
async function assignStudentsToTeam(teamId: number, studentIds: number[]): Promise<void> {
    for (const studentId of studentIds) {
        // Ga eerst na of deze student en dit team zelfs bestaan
        const student = await prisma.student.findUnique({ where: { userId: studentId } });
        const team = await prisma.team.findUnique({ where: { id: teamId } });

        if (student && team) {
            await prisma.team.update({
                where: { id: teamId },
                data: {
                    students: {
                        connect: { userId: studentId },
                    }
                }
            });
        }
    }
}

async function

async function divideClassIntoTeams(teamSize: number, classId: number): Promise<TeamDivision[]> {

    const students: ClassStudent[] = await prisma.classStudent.findMany({
        where: {classId: classId},
    });

    // Ensure that class is found and classLinks exists
    if (!students) {
        throw new Error(`No students found for ${classId}`);
    }

    const studentIds: number[] = students.map(st => st.studentId);

    return [];
}

// Update teams in an assignment
export const updateTeamsForAssignment = async (teams: any[]): Promise<Team[]> => {
    const updatedTeams: Team[] = [];

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

// Get all teams for a given assignment
export const getTeamsThatHaveAssignment = async (assignmentId: number): Promise<Team[]> => {
    return prisma.team.findMany({
        where: {
            teamAssignments: {
                some: {
                    assignmentId: assignmentId,
                }
            }
        }
    });
};

// Delete a team from an assignment
export const deleteTeamFromAssignment = async (teamId: string): Promise<void> => {
    await prisma.team.delete({
        where: {
            id: parseInt(teamId)
        }
    });
};
