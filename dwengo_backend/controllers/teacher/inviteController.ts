import { Response } from "express";
import asyncHandler from "express-async-handler";
import { Invite } from "@prisma/client";
import inviteService from "../../services/inviteService";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";

/**
 * Create an invitation for a teacher to join a class
 * @route POST /invite/class/:classId
 * @param classId - id of the class to which the teacher is getting invited
 * returns the created invite in the response body
 */
export const createInvite = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const classId: number = req.params.classId as unknown as number;
    const { otherTeacherEmail }: { otherTeacherEmail: string } = req.body;
    const classTeacherId: number = getUserFromAuthRequest(req).id;

    const invite: Invite = await inviteService.createInvite(
      classTeacherId,
      otherTeacherEmail,
      classId,
    );
    res.status(201).json({ message: "Invite successfully created.", invite });
  },
);

/**
 * Get all pending invites for a class
 * @route GET /invite/class/:classId
 * @param classId - id of the class for which the invites are fetched
 * returns a list of all invites for the class in the response body
 */
export const getPendingInvitesForClass = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const classId: number = req.params.classId as unknown as number;
    const classTeacherId: number = getUserFromAuthRequest(req).id;

    const invites: Invite[] = await inviteService.getPendingInvitesForClass(
      classTeacherId,
      classId,
    );
    res.status(200).json({ invites });
  },
);

/**
 * Get all pending invites for a teacher
 * @route GET /invite
 * returns a list of all invites for the teacher in the response body
 */
export const getPendingInvitesForTeacher = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const teacherId: number = getUserFromAuthRequest(req).id;

    const invites: Invite[] =
      await inviteService.getPendingInvitesForTeacher(teacherId);
    res.status(200).json({ invites });
  },
);

/**
 * Update the status of an invitation
 * @route PATCH /invite/:inviteId
 * @param inviteId - id of the invite to be updated
 * returns the updated invite in the response body
 */
export const updateInviteStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const inviteId: number = req.params.inviteId as unknown as number;
    const { action }: { action: string } = req.body;
    const teacherId: number = getUserFromAuthRequest(req).id;

    if (action == "accept") {
      const invite: Invite = await inviteService.acceptInviteAndJoinClass(
        teacherId,
        inviteId,
      );
      res
        .status(200)
        .json({ message: "Invite successfully accepted.", invite });
    } else {
      // action == "decline" (ensured by validation middleware)
      const invite: Invite = await inviteService.declineInvite(
        teacherId,
        inviteId,
      );
      res
        .status(200)
        .json({ message: "Invite successfully declined.", invite });
    }
  },
);

/**
 * Delete an invitation
 * @route DELETE /invite/:inviteId/class/:classId
 * @param classId - id of the class for which the invite is deleted
 * @param inviteId - id of the invite to be deleted
 * returns the deleted invite in the response body
 *
 * Any teacher of the class can delete the invite (not just the teacher who created the invite).
 */
export const deleteInvite = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const inviteId: number = req.params.inviteId as unknown as number;
    const classId: number = req.params.classId as unknown as number;
    const classTeacherId: number = getUserFromAuthRequest(req).id;

    await inviteService.deleteInvite(classTeacherId, inviteId, classId);
    res.status(204).end();
  },
);
