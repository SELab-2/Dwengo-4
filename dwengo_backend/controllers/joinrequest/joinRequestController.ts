import { Request, Response } from "express";
import joinRequestService from "../../services/joinRequestService";
import { JoinRequest } from "@prisma/client";

// Higher-order function to handle errors and reduce duplication
const handleRequest = (handler: (req: Request, res: Response) => Promise<void>) =>
    async (req: Request, res: Response): Promise<void> => {
        try {
            await handler(req, res);
        } catch (error) {
            const message: string = error instanceof Error ? error.message : "An unknown error occurred";
            res.status(400).json({ error: message });
        }
    };

export const createJoinRequest = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { studentId, classCode }: { studentId: number; classCode: string } = req.body;
    const joinRequest: JoinRequest | undefined = await joinRequestService.createValidJoinRequest(studentId, classCode);
    res.status(201).json(joinRequest);
});

export const updateJoinRequestStatus = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { classId, studentId } = req.params;
    const { action } = req.body; // 'approve' or 'deny' from the request body

    if (!action || (action !== 'approve' && action !== 'deny')) {
        res.status(400).json({ error: "Action must be 'approve' or 'deny'" });
    }

    if (action === 'approve') {
        await joinRequestService.approveRequestAndAddStudentToClass(Number(studentId), Number(classId));
        res.status(200).json({ message: "Join request approved." });
    } else if (action === 'deny') {
        await joinRequestService.denyJoinRequest(Number(studentId), Number(classId));
        res.status(200).json({ message: "Join request denied." });
    }
});

export const getJoinRequestsByClass = handleRequest(async (req: Request, res: Response): Promise<void> => {
    const { classId } = req.params;
    const joinRequests: JoinRequest[] = await joinRequestService.getJoinRequestsByClass(Number(classId));
    res.status(200).json(joinRequests);
});

