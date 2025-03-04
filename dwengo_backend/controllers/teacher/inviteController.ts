import { Response } from "express";
import inviteService from "../../services/inviteService";
import { Invite } from "@prisma/client";
import asyncHandler from 'express-async-handler';
import { AuthenticatedRequest } from "../../middleware/teacherAuthMiddleware";

export const createInvite = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { otherTeacherId, classId }: { otherTeacherId: number, classId: number } = req.body;
    const classTeacherId: number = req.body.user?.id as number;  // teacherAuthMiddleware ensures that req.user is defined

    const invite: Invite = await inviteService.createInvite(classTeacherId, otherTeacherId, classId);
    res.status(201).json({ invite });
}); 

