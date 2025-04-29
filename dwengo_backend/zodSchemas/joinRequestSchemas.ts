import { z } from "zod";

/**
 * Schemas for joinRequest creation
 * @route POST /student/classes/join
 */
export const createJoinRequestBodySchema = z.object({
  joinCode: z.coerce.string({ message: "joinCode should be a string" }),
});

export const createJoinRequestQuerySchema = z.object({
  joinCode: z.coerce.string({ message: "joinCode should be a string" }),
});

/*export const createCustomJoinRequestSchema = z
  .object({
    body: createJoinRequestBodySchema,
    query: createJoinRequestQuerySchema,
  })
  .refine((data): string => data.body.joinCode || data.query.joinCode, {
    message: "joinCode must be present in either body or query",
  });

/!**
 * Schemas for joinRequest updates
 * @route PATCH /teacher/classes/:classId/join-requests/:requestId
 *!/
export const updateJoinRequestParamsSchema = z.object({
  classId: z.coerce
    .number({ message: "classId should be a number" })
    .int({ message: "classId should be an integer" })
    .positive({ message: "classId should be a positive integer" }),
  requestId: z.coerce
    .number({ message: "classId should be a number" })
    .int({ message: "classId should be an integer" })
    .positive({ message: "classId should be a positive integer" }),
});

export const updateJoinRequestBodySchema = z.object({
  action: z.enum(["approve", "deny"], {
    message: "action must be either 'approve' or 'deny'",
  }),
});

/!**
 * Schemas for joinRequest fetching
 * @route GET /teacher/classes/:classId/join-requests
 *!/
export const getJoinRequestParamsSchema = z.object({
  classId: z.coerce
    .number({ message: "classId should be a number" })
    .int({ message: "classId should be an integer" })
    .positive({ message: "classId should be a positive integer" }),
});*/
