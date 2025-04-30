import { z } from "zod";

export const limitQuerySchema = z.object({
  limit: z.coerce.number().int().positive().default(5),
});
