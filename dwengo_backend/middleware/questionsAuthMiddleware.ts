import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { PrismaClient, Role, Teacher, Student, User } from "@prisma/client";

const prisma = new PrismaClient();

interface JwtPayload {
    id: number;
}

// Definieer een interface voor de geauthenticeerde gebruiker,
// met optionele velden voor teacher en student
interface AuthenticatedUser {
    id: number;
    role: Role;
    teacher?: Teacher;
    student?: Student;
}

// Breid het Express Request-type uit zodat we een getypeerde user-property hebben
interface AuthenticatedRequest extends Request {
    user?: AuthenticatedUser;
}

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

        const assignmentId = req.body.assignmentId;
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

        const questionHead = await prisma.questionHead.findUnique({
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

        if (!questionHead) {
            res.status(404).json({ error: "Vraag niet gevonden." });
            return;
        }

        const isStudentInTeam = questionHead.team.students.some(student => student.userId === req.user?.id);
        const isTeacherInClass = questionHead.team.class.ClassTeacher.some(teacher => teacher.teacherId === req.user?.id);

        if (req.user.role === "STUDENT" && !isStudentInTeam) {
            res.status(403).json({ error: "Toegang geweigerd. Student is niet in het team." });
            return;
        }

        if (req.user.role === "TEACHER" && !isTeacherInClass) {
            res.status(403).json({ error: "Toegang geweigerd. Leerkracht behoort niet tot de klas van deze vraag." });
            return;
        }

        next();
    }
);

export const authorizeOwnerOfQuestionConversation = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const { questionConversationId } = req.params;

        if (!req.user) {
            res.status(401).json({ error: "Niet geautoriseerd." });
            return;
        }

        const questionConversation = await prisma.questionConversation.findUnique({
            where: { id: Number(questionConversationId) },
        });

        if (!questionConversation) {
            res.status(404).json({ error: "Vraaggesprek niet gevonden." });
            return;
        }

        if (questionConversation.userId !== req.user.id) {
            res.status(403).json({ error: "Toegang geweigerd. Gebruiker is niet de eigenaar van dit vraaggesprek." });
            return;
        }

        next();
    }
);

export const authorizeStudentInTeamThatCreatedQuestion = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const { questionId } = req.params;

        if (!req.user || req.user.role !== "STUDENT") {
            res.status(401).json({ error: "Niet geautoriseerd." });
            return;
        }

        const questionHead = await prisma.questionHead.findUnique({
            where: { id: Number(questionId) },
            include: {
                team: {
                    include: {
                        students: true,
                    },
                },
            },
        });

        if (!questionHead) {
            res.status(404).json({ error: "Vraag niet gevonden." });
            return;
        }

        const isStudentInTeam = questionHead.team.students.some(student => student.userId === req.user?.id);

        if (!isStudentInTeam) {
            res.status(403).json({ error: "Toegang geweigerd. Student is niet in het team dat de vraag heeft gemaakt." });
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