import { Response } from "express";
import asyncHandler from 'express-async-handler';
import { Invite } from "@prisma/client";
import inviteService from "../../services/inviteService";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";

/**
 * Create an invite for a teacher to join a class
 * @route POST /teacher/classes/:classId/invites
 * @param classId - id of the class to which the teacher is getting invited
 * returns the created invite in the response body
 */
export const createInvite = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const classId: number = parseInt(req.params.classId);
    const { otherTeacherEmail }: { otherTeacherEmail: string } = req.body;
    const classTeacherId: number = getUserFromAuthRequest(req).id;
  
    const invite: Invite = await inviteService.createInvite(classTeacherId, otherTeacherEmail, classId);
    res.status(201).json({ invite });
  });



/**
 * Get all pending invites for a class
 * @route GET /teacher/classes/:classId/invites
 * @param classId - id of the class for which the invites are fetched
 * returns a list of all invites for the class in the response body
 */
export const getPendingInvitesForClass = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const classId: number = parseInt(req.params.classId);
    const classTeacherId: number = getUserFromAuthRequest(req).id;

    const invites: Invite[] = await inviteService.getPendingInvitesForClass(classTeacherId, classId);
    res.status(200).json({ invites });
});


/**
 * Get all pending invites for a teacher
 * @route GET /teacher/classes/invites
 * returns a list of all invites for the teacher in the response body
 */
export const getPendingInvitesForTeacher = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const teacherId: number = getUserFromAuthRequest(req).id;

    const invites: Invite[] = await inviteService.getPendingInvitesForTeacher(teacherId);
    res.status(200).json({ invites });
});


/**
 * Update the status of an invite
 * @route PATCH /teacher/classes/invites/:inviteId
 * @param inviteId - id of the invite to be updated
 * returns the updated invite in the response body
 */
export const updateInviteStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const inviteId: number = parseInt(req.params.inviteId);
    const { action }: { action: string } = req.body;
    const teacherId: number = getUserFromAuthRequest(req).id;

    if (action == "accept") {
        const invite: Invite = await inviteService.acceptInviteAndJoinClass(teacherId, inviteId);
        res.status(200).json({ invite });
    } else { // action == "decline" (ensured by validation middleware)
        const invite: Invite = await inviteService.declineInvite(teacherId, inviteId);
        res.status(200).json({ invite });
    } 
});


/**
 * Delete an invite
 * @route DELETE /teacher/classes/:classId/invites/:inviteId
 * @param classId - id of the class for which the invite is deleted 
 * @param inviteId - id of the invite to be deleted
 * returns the deleted invite in the response body
 * 
 * Any teacher of the class can delete the invite (not just the teacher who created the invite).
 */
export const deleteInvite = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const inviteId: number = parseInt(req.params.inviteId);
    const classId: number = parseInt(req.params.classId);
    const classTeacherId: number = getUserFromAuthRequest(req).id;

    const invite: Invite = await inviteService.deleteInvite(classTeacherId, inviteId, classId);
    res.status(200).json({ invite: invite, message: "invite was succesfully deleted" });
});
