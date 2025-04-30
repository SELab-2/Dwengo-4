import { z } from "zod";

export const classIdParamsSchema = z.object({
  classId: z.coerce.number().int().positive(),
});
