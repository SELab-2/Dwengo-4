import { z } from "zod";

export const createClassBodySchema = z.object({
  name: z
    .string({
      required_error: "Vul een geldige klasnaam in",
      invalid_type_error: "Vul een geldige klasnaam in",
    })
    .trim()
    .min(1, { message: "Vul een geldige klasnaam in" }),
});

export const deleteClassParamSchema = z.object({
  classId: z.coerce
    .number({ message: "classId should be a number" })
    .int({ message: "classId should be an integer" })
    .positive({ message: "classId should be a positive integer" }),
});

export const getClassStudentParamSchema = deleteClassParamSchema;

export const getJoinLinkParamSchema = deleteClassParamSchema;

export const patchJoinLinkParamSchema = deleteClassParamSchema;

export const getClassroomParamSchema = deleteClassParamSchema;
