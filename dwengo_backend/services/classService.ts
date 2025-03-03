// src/services/class.service.js
import {Class, ClassStudent, PrismaClient, Student} from "@prisma/client";
import crypto from 'crypto';

const prisma = new PrismaClient();

export const createClass = async (name: string, teacherId: number): Promise<Class> => {
    // Generate a unique join code (e.g., an 8-digit hex string)
    const joinCode = await generateUniqueCode();

    const classroom = await prisma.class.create({
        data: {
            name: name, // name field matches the Class schema
            code: joinCode, // code field matches the Class schema
        }
    });

    // Now that you have the class id, create the ClassTeacher record
    await prisma.classTeacher.create({
        data: {
            teacherId: teacherId, // teacherId links to the teacher record
            classId: classroom.id, // Use the id of the newly created class
        }
    });

    console.log("Class and ClassTeacher created successfully:", classroom);

    return classroom;
};

// Delete a class by ID
export const deleteClass = async (classId: number, teacherId: number): Promise<Class> => {
    // Check if the teacher is associated with the class
    const isTeacher = await isTeacherOfClass(classId, teacherId);
    if (!isTeacher) {
        throw new Error("Toegang geweigerd"); // Access denied if the teacher is not associated with the class
    }

    // Start a transaction to delete related records
    return prisma.$transaction(async (prisma) => {
        // Delete class-student associations
        await prisma.classStudent.deleteMany({ where: { classId } });

        // Delete class assignments
        await prisma.classAssignment.deleteMany({ where: { classId } });

        // Delete join requests
        await prisma.joinRequest.deleteMany({ where: { classId } });

        // Delete invites
        await prisma.invite.deleteMany({ where: { classId } });

        // Delete class-teacher associations
        await prisma.classTeacher.deleteMany({ where: { classId } });

        // Finally, delete the class itself
        return prisma.class.delete({ where: { id: classId } });
    });
};


// Get all classes taught by a given teacher
export const getClassesByTeacher = async (teacherId: number): Promise<Class[]> => {
    // Fetch all classes where the teacher is assigned
    return prisma.class.findMany({
        where: {
            ClassTeacher: {
                some: {
                    teacherId: teacherId, // Filter for the given teacherId
                },
            },
        }
    });
};

// Get all classes a student is partaking in
export const getClassesByStudent = async (studentId: number): Promise<Class[]> => {
    // Fetch all classes where the student is enrolled
    return prisma.class.findMany({
        where: {
            classLinks: {
                some: {
                    studentId: studentId, // Filter for the given studentId
                },
            },
        }
    });
};

// Function to check if the requester is the teacher of the class
const isTeacherOfClass = async (classId: number, teacherId: number): Promise<boolean> => {
    const classTeacher = await prisma.classTeacher.findUnique({
        where: {
            teacherId_classId: {
                teacherId: teacherId,
                classId: classId,
            },
        },
    });
    return classTeacher !== null;
};

// Get all student from a given class
export const getStudentsByClass = async (classId: number, teacherId: number): Promise<Student[]> => {
    // Check if the teacher is associated with the class
    const isTeacher = await isTeacherOfClass(classId, teacherId);
    if (!isTeacher) {
        throw new Error("Toegang geweigerd"); // Access denied if the teacher is not associated with the class
    }

    const classWithStudents = await prisma.class.findUnique({
        where: { id: classId },
        include: {
            classLinks: {
                include: {
                    student: true, // Fetch student details from the ClassStudent relationship
                },
            },
        },
    });

    // In case no students were found
    if (!classWithStudents) return [];

    // Extract only student details
    return classWithStudents.classLinks.map((link) => link.student);
};

export const addStudentToClass = async (studentId: number, classId: number): Promise<ClassStudent> => {
    return prisma.classStudent.create({
        data: {
            studentId,
            classId,
        },
    });
};

export type ClassWithLinks = Class & { classLinks: ClassStudent[] };

// Check if student is already in the class
export const isStudentInClass = (classroom: ClassWithLinks, studentId: number): boolean => {
    return classroom.classLinks.some((link: ClassStudent) => link.studentId === studentId);
};

export const removeStudentFromClass = async (studentId: number, classId: number): Promise<ClassStudent> => {
    return prisma.classStudent.delete({
        where: {
            studentId_classId: {
                studentId,
                classId,
            },
        },
    });
};

// Return all classes
export const getAllClasses = async (): Promise<Class[]> => {
    // Returns an empty array if nothing is found
    return prisma.class.findMany();
};

// Read a class by ID
export const getClassById = async (id: number): Promise<Class | null> => {
    return prisma.class.findUnique({
        where: {id: id},
    });
};

// Give the class a new name
export const updateClassName = async (classId: number, newName: string): Promise<Class> => {
    return prisma.class.update({
        where: {id: classId},
        data: {name: newName},
    });
};

// Read a class by JoinCode
export const getClassByJoinCode = async (joinCode: string): Promise<ClassWithLinks | null> => {
    return prisma.class.findUnique({
        where: {code: joinCode},  // Search by the joinCode (which is 'code' in the schema)
        include: {
            classLinks: true,
        }
    });
};

export const getJoinCode = async (classId: number, teacherId: number): Promise<string> => {
    // Check if the teacher is associated with the class
    const isTeacher = await isTeacherOfClass(classId, teacherId);
    if (!isTeacher) {
        throw new Error("Toegang geweigerd"); // Access denied if the teacher is not associated with the class
    }

    const classroom = await prisma.class.findUnique({
        where: { id: classId },
        select: { code: true }, // Only fetch the join code
    });

    if (!classroom) {
        throw new Error("Klas niet gevonden");
    }

    return classroom.code;
};

// Function to generate a unique join code
const generateUniqueCode = async (): Promise<string> => {
    let isUnique = false;
    let newJoinCode: string = "";

    while (!isUnique) {
        // Generate new join code
        newJoinCode = crypto.randomBytes(4).toString("hex");

        // Check if the code is unique in the database
        const existingClass = await prisma.class.findUnique({
            where: { code: newJoinCode },
        });

        if (!existingClass) {
            isUnique = true;
        }
    }

    return newJoinCode;
};

// Function to regenerate the join code for a class
export const regenerateJoinCode = async (classId: number, teacherId: number): Promise<string> => {
    // Check if the teacher is associated with the class
    const isTeacher = await isTeacherOfClass(classId, teacherId);
    if (!isTeacher) {
        throw new Error("Toegang geweigerd"); // Access denied if the teacher is not associated with the class
    }

    // Generate a unique join code
    const newJoinCode = await generateUniqueCode();

    // Update class with the new join code
    const updatedClass = await prisma.class.update({
        where: { id: classId },
        data: { code: newJoinCode },
    });

    return updatedClass.code;
};
