import { Request, Response } from "express";
import joinRequestService from "../../services/joinRequestService";
import { JoinRequest } from "@prisma/client";
import { AuthenticatedRequest } from "../../interfaces/extendedTypeInterfaces";
import { AppError } from "../../errors/errors";
import { getUserFromAuthRequest } from "../../helpers/getUserFromAuthRequest";

// Higher-order function to handle errors and reduce duplication
const handleRequest =
  (handler: (_req: Request, _res: Response) => Promise<void>) =>
  async (req: Request, res: Response): Promise<void> => {
    try {
      await handler(req, res);
    } catch (error) {
      const message: string =
        error instanceof Error ? error.message : "An unknown error occurred";
      res
        .status(error instanceof AppError ? error.statusCode : 400)
        .json({ error: message });
    }
  };

/**
 * Creates a join request for a student to join a class (class code in request body)
 * @route POST /student/classes/join
 * returns the created join request in the response body
 */
export const createJoinRequest = handleRequest(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const joinCode = req.body.joinCode || (req.query.joinCode as string);
    const studentId: number = getUserFromAuthRequest(req).id;
    const joinRequest: JoinRequest | undefined =
      await joinRequestService.createValidJoinRequest(studentId, joinCode);
    res.status(201).json({ joinRequest });
  },
);

/**
 * Updates the status of a join request (approve or deny)
 * @route PATCH /teacher/classes/:classId/join-requests/:requestId
 * @param classId - id of the class for which the join request was sent
 * @param requestId - id of the join request to be updated
 * returns the updated join request in the response body
 */
export const updateJoinRequestStatus = handleRequest(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const classId: number = parseInt(req.params.classId);
    const requestId: number = parseInt(req.params.requestId);
    const { action }: { action: string } = req.body; // 'approve' or 'deny' from the request body
    const teacherId: number = getUserFromAuthRequest(req).id;

    if (!action || (action !== "approve" && action !== "deny")) {
      res.status(400).json({ error: "Action must be 'approve' or 'deny'" });
    }

    if (action === "approve") {
      const joinRequest: JoinRequest =
        await joinRequestService.approveRequestAndAddStudentToClass(
          requestId,
          teacherId,
          classId,
        );
      res.status(200).json({ joinRequest, message: "Join request approved." });
    } else if (action === "deny") {
      const joinRequest: JoinRequest = await joinRequestService.denyJoinRequest(
        requestId,
        teacherId,
        classId,
      );
      res.status(200).json({ joinRequest, message: "Join request denied." });
    }
  },
);

/**
 * @route GET /teacher/classes/:classId/join-requests
 * @param classId - id of the class for which the join requests are fetched
 * returns a list of all join requests for the class in the response body
 */
export const getJoinRequestsByClass = handleRequest(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const classId: number = parseInt(req.params.classId);
    const teacherId: number = getUserFromAuthRequest(req).id;
    const joinRequests: JoinRequest[] =
      await joinRequestService.getJoinRequestsByClass(teacherId, classId);
    res.status(200).json({ joinRequests });
  },
);
