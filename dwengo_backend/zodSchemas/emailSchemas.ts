import { z } from "zod";

export const otherTeacherEmailBodySchema = z.object({
  otherTeacherEmail: z.string().email(),
});
