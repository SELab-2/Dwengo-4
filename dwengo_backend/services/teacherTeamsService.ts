import { PrismaClient, Student, Team } from "@prisma/client";
import {
  IdentifiableTeamDivision,
  TeamDivision,
} from "../interfaces/extendedTypeInterfaces";

import prisma from "../config/prisma";
import {
  handlePrismaQuery,
  handlePrismaTransaction,
  handleQueryWithExistenceCheck,
} from "../errors/errorFunctions";
import { BadRequestError } from "../errors/errors";
type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * This function assumes that the division of a group of people into teams has already been done
 * and is specified as a "TeamDivision" interface.
 * This function assumes the assignment has already been linked to a Class.
 * **/
export const createTeamsInAssignment = async (
  assignmentId: number,
  classId: number,
  teams: TeamDivision[],
  // createTeamsInAssignment moet eigenlijk altijd een transactie gebruiken
  // omdat er in een for loop teams worden aangemaakt, dit mag nooit in het midden van de lus onderbroken worden
  tx: PrismaTransactionClient,
): Promise<Team[]> => {
  await handleQueryWithExistenceCheck(
    () =>
      tx.classAssignment.findUnique({
        where: {
          classId_assignmentId: {
            classId: classId,
            assignmentId: assignmentId,
          },
        },
      }),
    "This assignment has not been assigned to this class yet.",
  );

  const createdTeams: Team[] = [];

  // Create teams in the database
  for (const team of teams) {
    const newTeam: Team = await createTeam(team.teamName, classId, tx);
    await assignStudentsToTeam(newTeam.id, team.studentIds, tx);
    await giveAssignmentToTeam(newTeam.id, assignmentId, tx);

    createdTeams.push(newTeam);
  }

  return createdTeams;
};

// Helper function for createTeamsInAssignment
// This function creates a Team with a given teamname
async function createTeam(
  teamName: string,
  classId: number,
  tx?: PrismaTransactionClient,
): Promise<Team> {
  return (tx ?? prisma).team.create({
    data: {
      teamname: teamName,
      classId: classId,
    },
  });
}

// Helper function for createTeamsInAssignment
// This function assigns an Assignment to a Team
async function giveAssignmentToTeam(
  teamId: number,
  assignmentId: number,
  tx?: PrismaTransactionClient,
): Promise<Team> {
  return (tx ?? prisma).team.update({
    where: { id: teamId },
    data: {
      teamAssignment: {
        // Update if it already exists, create if it does not exist
        upsert: {
          create: { assignmentId },
          update: { assignmentId },
        },
      },
    },
  });
}

// Helper function for createTeamsInAssignment
// This function updates the list of students in a Team
async function assignStudentsToTeam(
  teamId: number,
  studentIds: number[],
  tx?: PrismaTransactionClient,
): Promise<void> {
  tx = tx ?? prisma;
  for (const studentId of studentIds) {
    // Ga eerst na of deze student en dit team zelfs bestaan
    const student: Student | null = await tx.student.findUnique({
      where: { userId: studentId },
    });
    const team: Team | null = await tx.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new BadRequestError("This team does not exist.");
    }

    if (student && team) {
      await tx.team.update({
        where: { id: teamId },
        data: {
          students: {
            connect: { userId: studentId },
          },
        },
      });
    }
  }
}

//* Zoals ik het zie kan een leerkracht eerst deze functie lokaal gebruiken om een teamindeling te maken.
// Als deze hier dan mee akkoord gaat kan de leerkracht het resultaat van deze functie geven aan
// createTeamsInAssignment. Want createTeamsInAssignment verwacht al een geldige indeling, daar wordt ook
// door middleware op gecontroleerd.

/*async function randomlyDivideClassIntoTeams(
  teamSize: number,
  classId: number,
): Promise<TeamDivision[]> {
  const students: ClassStudent[] = await handleQueryWithExistenceCheck(
    () =>
      prisma.classStudent.findMany({
        where: { classId: classId },
      }),
    `There are no students in this class.`,
  );

  const studentIds: number[] = students.map(
    (st: ClassStudent): number => st.studentId,
  );

  //   // Shuffle the list of studentIds using Lodash
  //   const shuffledStudents: number[] = _.shuffle(studentIds);

  //   const teams: TeamDivision[] = [];

  //   for (let i: number = 0; i < shuffledStudents.length; i += teamSize) {
  //     teams.push({
  //       teamName: `Team ${i + 1}`,
  //       // Select "teamSize" amount of students via slicing
  //       studentIds: shuffledStudents.slice(i, i + teamSize),
  //     });
  //   }

  return teams;
}*/

// Does the same as "randomlyDivideClassIntoTeams" but sorts the students alphabetically
/*async function divideClassIntoAlphabeticalTeams(
  teamSize: number,
  classId: number,
): Promise<TeamDivision[]> {
  // This lets TypeScript know what is happening when assigning types to the variables in the sort function
  interface StudentWithUser extends Student {
    user: User;
  }

  // First fetch all the students in the given class
  const students: (Student & { user: User })[] = await handlePrismaQuery(() =>
    prisma.student.findMany({
      where: {
        classes: {
          some: {
            classId: classId,
          },
        },
      },
      include: { user: true },
    }),
  );

  // Check if the class is not empty
  if (students.length === 0) {
    throw new NotFoundError(`There are no students in this class.`);
  }

  // Sort students alphabetically by name
  const sortedStudents: StudentWithUser[] = students.sort(
    (a: StudentWithUser, b: StudentWithUser): number => {
      // Sort alphabetically based on the user's last name
      const lastNameComparison: number = a.user.lastName.localeCompare(
        b.user.lastName,
      );

      // If last names are the same, compare by first name
      return lastNameComparison !== 0
        ? lastNameComparison
        : a.user.firstName.localeCompare(b.user.firstName);
    },
  );

  // Extract sorted student IDs
  const studentIds: number[] = sortedStudents.map(
    (st: Student): number => st.userId,
  );

  //   const teams: TeamDivision[] = [];

  //   for (let i: number = 0; i < studentIds.length; i += teamSize) {
  //     teams.push({
  //       teamName: `Team ${Math.floor(i / teamSize) + 1}`,
  //       // Select "teamSize" amount of students via slicing
  //       studentIds: studentIds.slice(i, i + teamSize),
  //     });
  //   }

  return teams;
}*/

// Check if the students exists or not
const validateStudentIds = async (studentIds: number[]): Promise<void> => {
  // Fetch all valid students from the database
  const validStudents: Student[] = await handlePrismaQuery(() =>
    prisma.student.findMany({
      where: { userId: { in: studentIds } },
      select: { userId: true },
    }),
  );

  // Extract the StudentIds
  const validStudentIds = new Set(
    validStudents.map((student: Student): number => student.userId),
  );

  // Check if all the given StudentIds where found in the Database
  const invalidStudentIds: number[] = studentIds.filter(
    (studentId: number): boolean => !validStudentIds.has(studentId),
  );

  // If any ID was not found, this means that it isn't part of our Database and is therefore invalid
  if (invalidStudentIds.length > 0) {
    throw new BadRequestError("There are invalid students in the request.");
  }
};

// Update the given list of teams that have a given assignment
export const updateTeamsForAssignment = async (
  assignmentId: number,
  teams: IdentifiableTeamDivision[],
): Promise<Team[]> => {
  return await handlePrismaTransaction(prisma, async (tx) => {
    const updatedTeams: Team[] = [];
    for (const team of teams) {
      // Check if the team exists
      await handleQueryWithExistenceCheck(
        () => tx.team.findUnique({ where: { id: team.teamId } }),
        "Some of the teams do not exist.",
      );

      // Validate students before updating
      await validateStudentIds(team.studentIds);

      // Update team name and students
      const updatedTeam: Team = await handlePrismaQuery(() =>
        tx.team.update({
          where: { id: team.teamId },
          data: {
            teamname: team.teamName,
            students: {
              // The set operation removes all existing students from the team and replaces them with the new list of students (team.studentIds).
              set: team.studentIds.map(
                (studentId: number): { userId: number } => ({
                  userId: studentId,
                }),
              ),
            },
            teamAssignment: {
              connectOrCreate: {
                where: {
                  teamId_assignmentId: { teamId: team.teamId, assignmentId },
                },
                create: { assignmentId: assignmentId },
              },
            },
          },
        }),
      );

      updatedTeams.push(updatedTeam);
    }

    return updatedTeams;
  });
};

// Get all teams for a given assignment
export const getTeamsThatHaveAssignment = async (
  assignmentId: number,
): Promise<Team[]> => {
  return await handlePrismaQuery(() =>
    prisma.team.findMany({
      where: {
        teamAssignment: {
          assignmentId: assignmentId,
        },
      },
    }),
  );
};

// Delete a team from an assignment
// The TeamAssignment record will be deleted is either the team or assignment are deleted because of onDelete: Cascade
export const deleteTeam = async (teamId: number): Promise<void> => {
  await handlePrismaQuery(() =>
    prisma.team.delete({
      where: {
        id: teamId,
      },
    }),
  );
};
