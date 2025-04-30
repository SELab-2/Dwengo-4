import { z } from "zod";

export const actionBodySchema = z.object({
  action: z.enum(["accept", "decline"]),
});
