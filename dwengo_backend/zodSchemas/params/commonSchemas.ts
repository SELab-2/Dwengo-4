import { z } from "zod";

export const learningObjectParamsSchema = z.object({
  hruid: z.string().min(1, "Hruid is required."),
  language: z.string().min(1, "Language is required."),
  version: z.coerce
    .number()
    .int()
    .positive("Version must be a positive number."),
});
