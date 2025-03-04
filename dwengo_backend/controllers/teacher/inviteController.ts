import { NextFunction, Response } from "express";
import asyncHandler from 'express-async-handler';
import { Invite } from "@prisma/client";
import inviteService from "../../services/inviteService";
import { AuthenticatedRequest } from "../../middleware/teacherAuthMiddleware";

/**
 * Create an invite for a teacher to join a class
 * @route POST /teacher/classes/:classId/invite
 * @param classId - id of the class to which the teacher is invited
 * @returns invite - the created invite
 */
export const createInvite = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const { otherTeacherId, classId }: { otherTeacherId: number, classId: number } = req.body;
    const classTeacherId: number = req.body.user?.id as number;  // teacherAuthMiddleware ensures that req.user is defined

    const invite: Invite = await inviteService.createInvite(classTeacherId, otherTeacherId, classId);
    res.status(201).json({ invite });
}); 

