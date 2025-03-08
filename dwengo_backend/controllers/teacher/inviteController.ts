import { Response } from "express";
import asyncHandler from 'express-async-handler';
import { Invite } from "@prisma/client";
import inviteService from "../../services/inviteService";
import { AuthenticatedRequest } from "../../middleware/teacherAuthMiddleware";

/**
 * Create an invite for a teacher to join a class
 * @route POST /teacher/classes/:classId/invite
 * @param classId - id of the class to which the teacher is invited
 * returns the created invite in the response body
 */
export const createInvite = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { otherTeacherId, classId }: { otherTeacherId: number, classId: number } = req.body;
    const classTeacherId: number = req.body.user?.id as number;  // teacherAuthMiddleware ensures that req.user is defined

    const invite: Invite = await inviteService.createInvite(classTeacherId, otherTeacherId, classId);
    res.status(201).json({ invite });
}); 


/**
 * Get all invites for a teacher
 * @route GET /teacher/invites
 * returns a list of all invites for the teacher in the response body
 */
export const getPendingInvitesForTeacher = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const teacherId: number = req.body.user?.id as number;

    const invites: Invite[] = await inviteService.getPendingInvitesForTeacher(teacherId);
    res.status(200).json({ invites });
});


/**
 * Update the status of an invite
 * @route PATCH /teacher/classes/:classId/invite
 * @param classId - id of the class for which the invite status is updated
 * returns the updated invite in the response body
 */
export const updateInviteStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { action, classId }: { action: string, classId: number } = req.body;
    const teacherId: number = req.body.user?.id as number;

    if (action == "accept") {
        const invite: Invite = await inviteService.acceptInviteAndJoinClass(teacherId, classId);
        res.status(200).json({ invite });
    } else if (action == "decline") {
        const invite: Invite = await inviteService.declineInvite(teacherId, classId);
        res.status(200).json({ invite });
    } else {
        res.status(400).json({ error: "Action must be 'accept' or 'decline'" });
    }
});


/**
 * Delete an invite
 * @route DELETE /teacher/classes/:classId/invite/:teacherId
 * @param classId - id of the class for which the invite is deleted 
 * @param teacherId - id of the teacher for which the invite is deleted (otherTeacherId in this function)
 * returns the deleted invite in the response body
 */
export const deleteInvite = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { otherTeacherId, classId }: { otherTeacherId: number, classId: number } = req.body;
    const classTeacherId: number = req.body.user?.id as number;

    const invite: Invite = await inviteService.deleteInvite(classTeacherId, otherTeacherId, classId);
    res.status(200).json({ invite: invite, message: "invite was succesfully deleted" });
});
