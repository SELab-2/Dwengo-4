import { z } from "zod";

export const titleAndLanguageBodySchema = z.object({
  title: z.string().min(1, "Title is required"),
  language: z.string().min(1, "Language is required"),
});

export const joinRequestBodySchema = z.object({
  action: z.enum(["approve", "deny"]),
});

export const inviteActionBodySchema = z.object({
  action: z.enum(["accept", "decline"]),
});
