import {ClassAssignment, ClassStudent, PrismaClient, Student, Team} from "@prisma/client";
import {IdentifiableTeamDivision, TeamDivision} from "../interfaces/extendedTypeInterfaces"
import _ from "lodash";

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
    const classAssignments: ClassAssignment[] = await prisma.classAssignment.findMany({
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
        const student: Student | null = await prisma.student.findUnique({ where: { userId: studentId } });
        const team: Team | null = await prisma.team.findUnique({ where: { id: teamId } });

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

//* Zoals ik het zie kan een leerkracht eerst deze functie lokaal gebruiken om een teamindeling te maken.
// Als deze hier dan mee akkoord gaat kan de leerkracht het resultaat van deze functie geven aan
// createTeamsInAssignment. Want createTeamsInAssignment verwacht al een geldige indeling, daar wordt ook
// door middleware op gecontroleerd.
// *//
async function divideClassIntoTeams(teamSize: number, classId: number): Promise<TeamDivision[]> {

    const students: ClassStudent[] = await prisma.classStudent.findMany({
        where: {classId: classId},
    });

    // Ensure that class is found and classLinks exists
    if (!students) {
        throw new Error(`No students found for ${classId}`);
    }

    const studentIds: number[] = students.map((st: ClassStudent): number => st.studentId);

    // Shuffle the list of studentIds using Lodash
    const shuffledStudents: number[] = _.shuffle(studentIds);

    const teams: TeamDivision[] = [];

    for (let i: number = 0; i < shuffledStudents.length; i += teamSize) {
        teams.push({
            teamName: `Team ${i+1}`,
            studentIds: shuffledStudents.slice(i, i + teamSize),
        });
    }

    return teams;
}

// Check if the students exists or not
const validateStudentIds = async (studentIds: number[]): Promise<void> => {
    // Fetch all valid students from the database
    const validStudents: Student[] = await prisma.student.findMany({
        where: { userId: { in: studentIds } },
        select: { userId: true }
    });

    const validStudentIds = new Set(validStudents.map((student: Student): number => student.userId));

    // Find any invalid students
    const invalidStudentIds: number[] = studentIds.filter((studentId: number): boolean => !validStudentIds.has(studentId));

    if (invalidStudentIds.length > 0) {
        throw new Error(`Invalid student IDs: ${invalidStudentIds.join(", ")}`);
    }
};

// Update the given list of teams that have a given assignment
export const updateTeamsForAssignment = async (
    assignmentId: number,
    teams: IdentifiableTeamDivision[]
): Promise<Team[]> => {
    const updatedTeams: Team[] = [];

    for (const team of teams) {
        // Check if the team exists
        const existingTeam: Team | null = await prisma.team.findUnique({ where: { id: team.id } });

        if (!existingTeam) {
            throw new Error(`Team with ID ${team.id} not found.`);
        }

        // Validate students before updating
        await validateStudentIds(team.studentIds);

        // Update team name and students
        const updatedTeam: Team = await prisma.team.update({
            where: { id: team.id },
            data: {
                teamname: team.teamName,
                students: {
                    // The set operation removes all existing students from the team and replaces them with the new list of students (team.studentIds).
                    set: team.studentIds.map((studentId: number): {userId: number} => ({ userId: studentId }))
                },
                teamAssignments: {
                    connectOrCreate: {
                        where: { teamId_assignmentId: {  teamId: team.id, assignmentId } },
                        create: { assignmentId: assignmentId }
                    }
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
// The TeamAssignment record will be deleted is either the team or assignment are deleted because of onDelete: Cascade
export const deleteTeam = async (teamId: number): Promise<void> => {
    await prisma.team.delete({
        where: {
            id: teamId
        }
    });
};
