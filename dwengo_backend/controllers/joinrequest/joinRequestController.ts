import { Request, Response } from "express";
import joinRequestService from "../../services/joinRequestService";
import { JoinRequest } from "@prisma/client";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { AppError } from "../../errors/errors";

// Higher-order function to handle errors and reduce duplication
const handleRequest = (handler: (req: Request, res: Response) => Promise<void>) =>
    async (req: Request, res: Response): Promise<void> => {
        try {
            await handler(req, res);
        } catch (error) {
            const message: string = error instanceof Error ? error.message : "An unknown error occurred";
            res.status(error instanceof AppError ? error.statusCode : 400).json({ error: message });
        }
    };


/**
 * @route POST /student/classes/join
 */
export const createJoinRequest = handleRequest(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { classCode }: {classCode: string } = req.body;
    const studentId: number = req.user!.id as number;
    const joinRequest: JoinRequest | undefined = await joinRequestService.createValidJoinRequest(studentId, classCode);
    res.status(201).json({ joinRequest });
});

/**
 * @route PATCH /teacher/classes/:classId/join-requests/:requestId
 */
export const updateJoinRequestStatus = handleRequest(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const classId: number = parseInt(req.params.classId);
    const requestId: number = parseInt(req.params.requestId);
    const { action }: { action: string } = req.body; // 'approve' or 'deny' from the request body
    const teacherId: number = req.user!.id as number;

    if (!action || (action !== 'approve' && action !== 'deny')) {
        res.status(400).json({ error: "Action must be 'approve' or 'deny'" });
    }

    if (action === 'approve') {
        const joinRequest: JoinRequest = await joinRequestService.approveRequestAndAddStudentToClass(requestId, teacherId, classId);
        res.status(200).json({ joinRequest, message: "Join request approved." });
    } else if (action === 'deny') {
        const joinRequest: JoinRequest = await joinRequestService.denyJoinRequest(requestId, teacherId, classId);
        res.status(200).json({ joinRequest, message: "Join request denied." });
    }
});

/**
 * @route GET /teacher/classes/:classId/join-requests
 */
export const getJoinRequestsByClass = handleRequest(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const classId: number = parseInt(req.params.classId);
    const teacherId: number = req.user!.id as number;
    const joinRequests: JoinRequest[] = await joinRequestService.getJoinRequestsByClass(teacherId, classId);
    res.status(200).json(joinRequests);
});

