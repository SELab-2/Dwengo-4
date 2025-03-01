import { Request, Response } from "express";
import * as joinRequestService from "../../services/joinRequestService";

export const createJoinRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentId, classCode } = req.body;
        const joinRequest = await joinRequestService.createJoinRequest(studentId, classCode);
        res.status(201).json(joinRequest);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const approveJoinRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { classId, studentId } = req.params;
        // Convert the classId and studentId from string to number
        const classIdNumber = Number(classId);
        const studentIdNumber = Number(studentId);
        await joinRequestService.approveRequestAndAddStudentToClass(studentIdNumber, classIdNumber);
        res.status(200).json({ message: "Join request approved." });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const denyJoinRequest = async (req: Request, res: Response): Promise<void> => {
    try {
        const { classId, studentId } = req.params;
        // Convert the classId and studentId from string to number
        const classIdNumber = Number(classId);
        const studentIdNumber = Number(studentId);
        await joinRequestService.denyJoinRequest(studentIdNumber, classIdNumber);
        res.status(200).json({ message: "Join request denied." });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getJoinRequestsByClass = async (req: Request, res: Response): Promise<void> => {
    try {
        const { classId } = req.params;
        const joinRequests = await joinRequestService.getJoinRequestsByClass(parseInt(classId));
        res.status(200).json(joinRequests);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
