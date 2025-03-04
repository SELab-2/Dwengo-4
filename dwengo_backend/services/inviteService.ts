import { Invite, JoinRequestStatus, Class, PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import classService from "./classService";
import { AccesDeniedError, BadRequestError, ConflictError, NotFoundError } from "../errors/errors";

const prisma = new PrismaClient();

export default class inviteService {
    
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

        // check if the teacher to be added is not already a member of the class
        const isAlreadyTeacher: boolean = await classService.isTeacherOfClass(classId, otherTeacherId);
        if (isAlreadyTeacher) {
            throw new BadRequestError("Leerkracht is al lid van de klas");
        }

        // create the invite (question: should we maybe add a field to the Invite model for the classTeacherId so the
        // other teacher can see who sent them the invite?)
        try {
            return await prisma.invite.create({
                data: {
                    teacherId: otherTeacherId,
                    classId,
                    status: JoinRequestStatus.PENDING,
                },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictError("Er bestaat al een uitnodiging voor deze leerkracht en klas.");
            }
            throw error;
        }
    }

}

