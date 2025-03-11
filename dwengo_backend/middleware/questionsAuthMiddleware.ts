import { Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../interfaces/extendedTypeInterfaces";

const prisma = new PrismaClient();

export const authorizeStudentInTeamWithAssignment = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        if (req.user?.role !== "STUDENT") {
            res.status(403).json({ error: "Toegang geweigerd." });
            return;
        }

        const student = req.user.student;
        if (!student) {
            res.status(403).json({ error: "Studentgegevens niet gevonden." });
            return;
        }

        const assignmentId = Number(req.params.assignmentId);
        if (!assignmentId) {
            res.status(400).json({ error: "Assignment ID is vereist." });
            return;
        }

        const team = await prisma.team.findFirst({
            where: {
                students: {
                    some: {
                        userId: student.userId,
                    },
                },
                teamAssignments: {
                    some: {
                        assignmentId: assignmentId,
                    },
                },
            },
        });

        if (!team) {
            res.status(403).json({ error: "Student is niet in een team met deze opdracht." });
            return;
        }

        next();
    }
);

export const authorizeQuestion = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const { questionId } = req.params;

        if (!req.user) {
            res.status(401).json({ error: "Niet geautoriseerd." });
            return;
        }

        const question = await prisma.question.findUnique({
            where: { id: Number(questionId) },
            include: {
                team: {
                    include: {
                        students: true,
                        class: { include: { ClassTeacher: true } }
                    }
                }
            }
        });

        if (!question) {
            res.status(404).json({ error: "Vraag niet gevonden." });
            return;
        }

        const isStudentInTeam = question.team.students.some(student => student.userId === req.user?.id);
        const isTeacherInClass = question.team.class.ClassTeacher.some(teacher => teacher.teacherId === req.user?.id);

        if (req.user.role === "STUDENT" && !isStudentInTeam) {
            res.status(403).json({ error: "Toegang geweigerd. Student zit niet in het team." });
            return;
        }

        if (req.user.role === "TEACHER" && !isTeacherInClass) {
            res.status(403).json({ error: "Toegang geweigerd. Leerkracht behoort niet tot de klas van deze vraag." });
            return;
        }

        next();
    }
);

export const authorizeOwnerOfQuestionMessage = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const { questionMessageId } = req.params;

        if (!req.user) {
            res.status(401).json({ error: "Niet geautoriseerd." });
            return;
        }

        const questionMessage = await prisma.questionMessage.findUnique({
            where: { id: Number(questionMessageId) },
        });

        if (!questionMessage) {
            res.status(404).json({ error: "Vraaggesprek niet gevonden." });
            return;
        }

        if (questionMessage.userId !== req.user.id) {
            res.status(403).json({ error: "Toegang geweigerd. Gebruiker is niet de eigenaar van dit vraaggesprek." });
            return;
        }

        next();
    }
);

export const authorizeStudentInTeamThatCreatedQuestion = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const { teamId } = req.params;

        if (!req.user || req.user.role !== "STUDENT") {
            res.status(401).json({ error: "Niet geautoriseerd." });
            return;
        }

        const student = req.user.student;
        if (!student) {
            res.status(403).json({ error: "Studentgegevens niet gevonden." });
            return;
        }

        const team = await prisma.team.findUnique({
            where: { id: Number(teamId) },
            include: {
                students: true,
            },
        });

        if (!team) {
            res.status(404).json({ error: "Team niet gevonden." });
            return;
        }

        const isStudentInTeam = team.students.some(student => student.userId === req.user?.id);

        if (!isStudentInTeam) {
            res.status(403).json({ error: "Toegang geweigerd. Student is niet in dit team." });
            return;
        }
        next();
    }
);

export const authorizeTeacherOfClass = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const { classId } = req.params;

        if (!req.user || req.user.role !== "TEACHER") {
            res.status(401).json({ error: "Niet geautoriseerd." });
            return;
        }

        const classData = await prisma.class.findUnique({
            where: { id: Number(classId) },
            include: {
                ClassTeacher: true,
            },
        });

        if (!classData) {
            res.status(404).json({ error: "Klas niet gevonden." });
            return;
        }

        const isTeacherOfClass = classData.ClassTeacher.some(teacher => teacher.teacherId === req.user?.id);

        if (!isTeacherOfClass) {
            res.status(403).json({ error: "Toegang geweigerd. Leerkracht behoort niet tot deze klas." });
            return;
        }

        next();
    }
);

export const authorizeTeacherOfAssignmentClass = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const { classId } = req.params;

        if (!req.user || req.user.role !== "TEACHER") {
            res.status(401).json({ error: "Niet geautoriseerd." });
            return;
        }

        const classData = await prisma.class.findUnique({
            where: { id: Number(classId) },
            include: {
                ClassTeacher: true,
                assignments: true
            },
        });

        if (!classData) {
            res.status(404).json({ error: "Klas niet gevonden." });
            return;
        }

        const isTeacherOfClass = classData.ClassTeacher.some(teacher => teacher.teacherId === req.user?.id);
        const isAssignmentOfClass = classData.assignments.some(assignment => assignment.assignmentId === Number(req.params.assignmentId));
        if (!isTeacherOfClass) {
            res.status(403).json({ error: "Toegang geweigerd. Leerkracht behoort niet tot deze klas." });
            return;
        }

        if (!isAssignmentOfClass) {
            res.status(403).json({ error: "Toegang geweigerd. Opdracht behoort niet tot deze klas." });
            return;
        }

        next();
    }
);


