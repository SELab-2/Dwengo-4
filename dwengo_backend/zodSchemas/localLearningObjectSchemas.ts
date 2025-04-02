import { z } from "zod";

export const getLocalLearningObjectParamsSchema = z.object({
  id: z.coerce.string({
    message: "LLO-id was missing or couldn't be converted to a string",
  }),
});
