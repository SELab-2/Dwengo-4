import { z } from "zod";

export const joinRequestBodySchema = z.object({
  action: z.enum(["approve", "deny"]),
});

export const inviteActionBodySchema = z.object({
  action: z.enum(["accept", "decline"]),
});
