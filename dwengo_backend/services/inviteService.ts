import { Invite, JoinRequestStatus, Class, PrismaClient } from "@prisma/client";
import classService from "./classService";
import { AccessDeniedError, BadRequestError, ConflictError, NotFoundError } from "../errors/errors";

const prisma = new PrismaClient();

export default class inviteService {



    private static async validateInvitePending(inviteId: number, otherTeacherId: number): Promise<Invite> {
        const invite: Invite | null = await prisma.invite.findFirst({
            where: {
                inviteId,
                otherTeacherId,
                status: JoinRequestStatus.PENDING,
            },
        });
        if (!invite) {
            throw new BadRequestError("Invite is not pending or does not exist.");
        }
        return invite;
    }

    static async createInvite(classTeacherId: number, otherTeacherEmail: string, classId: number): Promise<Invite> {
        // Check if de klas bestaat
        const classroom: Class | null = await classService.getClassById(classId);
        if (!classroom) {
            throw new NotFoundError("Klas niet gevonden");
        }

        // Check of de leerkracht die de invite verstuurt beheerder is van de klas
        await classService.isTeacherOfClass(classId, classTeacherId);

        // Zoek de leerkracht op basis van het e-mailadres
        const teacherUser = await prisma.user.findUnique({
            where: { email: otherTeacherEmail },
        });
        if (!teacherUser || teacherUser.role !== "TEACHER") {
            throw new NotFoundError("User is not a teacher. Only teachers can receive invites.");
        }
        const otherTeacherId = teacherUser.id;

        // Controleer of er al een pending invite bestaat voor deze teacher en klas
        const existingInvite: Invite | null = await prisma.invite.findFirst({
            where: {
                otherTeacherId,
                classId,
                status: JoinRequestStatus.PENDING,
            },
        });
        if (existingInvite) {
            throw new ConflictError("There is already a pending invite for this teacher and class.");
        }

        // Controleer of de teacher nog geen lid is van de klas
        await classService.ensureTeacherNotInClass(classId, otherTeacherId);

        // Maak de invite aan
        return await prisma.invite.create({
            data: {
                otherTeacherId,
                classTeacherId,
                classId,
                status: JoinRequestStatus.PENDING,
            },
        });
    }

    static async getPendingInvitesForClass(
        classTeacherId: number,
        classId: number
    ): Promise<Invite[]> {
        // Alleen een teacher van de klas mag de invites zien
        await classService.isTeacherOfClass(
            classId,
            classTeacherId
        );

        return await prisma.invite.findMany({
            where: {
                classId,
                status: JoinRequestStatus.PENDING,
            },
            include: {
                otherTeacher: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        }
                    },
                },
            },
        });
    }


    static async getPendingInvitesForTeacher(teacherId: number): Promise<Invite[]> {
        return prisma.invite.findMany({
            where: {
                otherTeacherId: teacherId,
                status: JoinRequestStatus.PENDING,
            },
            include: {
                classTeacher: {
                    select: {
                        teacher: {
                            select: {
                                user: {
                                    select: {
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },

                // de klas
                class: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    static async acceptInviteAndJoinClass(teacherId: number, inviteId: number): Promise<Invite> {
        // Check of de invite pending is
        let invite: Invite = await this.validateInvitePending(inviteId, teacherId);

        [invite] = await prisma.$transaction([
            // Accept de invite
            prisma.invite.update({
                where: {
                    inviteId: invite.inviteId,
                },
                data: {
                    status: JoinRequestStatus.APPROVED,
                },
            }),
            // Voeg de teacher toe aan de klas
            prisma.classTeacher.create({
                data: {
                    teacherId,
                    classId: invite.classId,
                },
            }),
        ]);
        return invite;
    }

    static async declineInvite(teacherId: number, inviteId: number): Promise<Invite> {
        // Check of de invite pending is
        const invite: Invite = await this.validateInvitePending(inviteId, teacherId);

        // Decline de invite
        return prisma.invite.update({
            where: {
                inviteId: invite.inviteId,
            },
            data: {
                status: JoinRequestStatus.DENIED,
            },
        });
    }

    static async deleteInvite(classTeacherId: number, inviteId: number, classId: number): Promise<Invite> {
        // Check of de teacher een teacher van de klas is
        await classService.isTeacherOfClass(classId, classTeacherId);

        // Verwijder de invite
        return await prisma.invite.delete({
            where: {
                inviteId,
                classId,
            },
        });
    }

    /**
 * Controleert of een invite bestaat voor de gegeven inviteId en classId en of de status PENDING is.
 * Werpt NotFoundError als dat niet het geval is.
 */
    static async ensureInviteExists(inviteId: number, classId: number): Promise<Invite> {
        const invite = await prisma.invite.findUnique({
            where: {
                inviteId,
                classId,
            },
        });
        if (!invite || invite.status !== JoinRequestStatus.PENDING) {
            throw new NotFoundError("Invite does not exist or is not pending.");
        }
        return invite;
    }
}