import { Invite, JoinRequestStatus, Class, PrismaClient } from "@prisma/client";
import classService from "./classService";
import { AccesDeniedError, BadRequestError, ConflictError, NotFoundError } from "../errors/errors";

const prisma = new PrismaClient();

export default class inviteService {

    private static async validateInvitePending(inviteId: number, otherTeacherId: number): Promise<Invite> {
        const invite: Invite | null = await prisma.invite.findFirst({
            where: {
                inviteId,
                otherTeacherId,
                status: JoinRequestStatus.PENDING,
            }
        });
        if (!invite) {
            throw new BadRequestError("Uitnodiging is niet pending of bestaat niet");
        }
        return invite;
    }

    static async createInvite(classTeacherId: number, otherTeacherId: number, classId: number): Promise<Invite> {
        // check if class exists
        const classroom: Class | null = await classService.getClassById(classId);
        if (!classroom) {
            throw new NotFoundError("Klas niet gevonden");
        }

        // check if teacher sending the invite is a teacher of the class
        const isTeacher: boolean = await classService.isTeacherOfClass(classId, classTeacherId);
        if (!isTeacher) {
            throw new AccesDeniedError("Leerkracht is geen beheerder van de klas");
        }

        // check if there's already a pending invite for this teacher and class
        const invite: Invite | null = await prisma.invite.findFirst({
            where: {
                otherTeacherId,
                classId,
                status: JoinRequestStatus.PENDING,
            },
        });
        if (invite) {
            throw new ConflictError("Er bestaat al een pending uitnodiging voor deze leerkracht en klas");
        }

        // check if the teacher to be added is not already a member of the class
        const isAlreadyTeacher: boolean = await classService.isTeacherOfClass(classId, otherTeacherId);
        if (isAlreadyTeacher) {
            throw new BadRequestError("Leerkracht is al lid van de klas");
        }

        // create the invite
        return await prisma.invite.create({
            data: {
                otherTeacherId,
                classTeacherId,
                classId,
                status: JoinRequestStatus.PENDING,
            },
        });
    }

    static async getPendingInvitesForClass(classTeacherId: number, classId: number): Promise<Invite[]> {
        // only a teacher of the class should be able to see the invites for the class
        const isTeacher: boolean = await classService.isTeacherOfClass(classId, classTeacherId);
        if (!isTeacher) {
            throw new AccesDeniedError("Leerkracht is geen beheerder van de klas");
        }
        return await prisma.invite.findMany({
            where: {
                classId,
                status: JoinRequestStatus.PENDING
            },  
        });
    }

    static async getPendingInvitesForTeacher(teacherId: number): Promise<Invite[]> {
        return prisma.invite.findMany({
            where: {
                otherTeacherId: teacherId,
                status: JoinRequestStatus.PENDING   // i don't think a teacher would ever really need to see invites that they already accepted or declined
            },
        });
    }

    static async acceptInviteAndJoinClass(teacherId: number, inviteId: number): Promise<Invite> {
        // check if invite is pending
        let invite: Invite = await this.validateInvitePending(inviteId, teacherId);
        
        // add the teacher to the class
        await prisma.classTeacher.create({
            data: {
                teacherId,
                classId: invite.classId
            }
        });
        // change invite status
        invite = await prisma.invite.update({
            where: {
                inviteId: invite.inviteId
            },
            data: {
                status: JoinRequestStatus.APPROVED,
            },
        });
        return invite;
    }

    static async declineInvite(teacherId: number, inviteId: number): Promise<Invite> {
        // check if invite is pending
        const invite: Invite = await this.validateInvitePending(inviteId, teacherId);

        // decline the invite
        return prisma.invite.update({
            where: {
                inviteId: invite.inviteId
            },
            data: {
                status: JoinRequestStatus.DENIED,
            }
        });
    }

    static async deleteInvite(classTeacherId: number, inviteId: number, classId: number): Promise<Invite> {
        // check if teacher is a teacher of the class 
        // (any teacher of the class can delete the invite, not just the one who created the invite)
        const isTeacher: boolean = await classService.isTeacherOfClass(classId, classTeacherId);
        if (!isTeacher) {
            throw new AccesDeniedError("Leerkracht is geen beheerder van de klas");
        }

        // delete the invite
        return await prisma.invite.delete({
            where: {
                inviteId,
                classId   // added this to make sure the invite belongs to the class that was passed in the arguments
            },
        });
    }

}
