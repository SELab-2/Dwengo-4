import { z } from "zod";

export const deleteClassParamsSchema = z.object({
  classId: z.coerce
    .number({ message: "classId should be a number" })
    .int({ message: "classId should be an integer" })
    .positive({ message: "classId should be a positive integer" }),
});

export const getJoinLinkParamSchema = deleteClassParamsSchema;

export const patchJoinLinkParamSchema = deleteClassParamsSchema;

export const getClassroomParamSchema = deleteClassParamsSchema;
