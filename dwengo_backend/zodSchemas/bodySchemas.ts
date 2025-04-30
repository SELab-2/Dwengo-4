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

export const localLearningObjectBodySchema = z.object({
  title: z.string(),
  description: z.string(),
  contentType: z.string(),
  keywords: z.array(z.string()).optional(),
  targetAges: z.array(z.number()).optional(),
  teacherExclusive: z.boolean().optional(),
  skosConcepts: z.array(z.string()).optional(),
  copyright: z.string().optional(),
  licence: z.string().optional(),
  difficulty: z.number().optional(),
  estimatedTime: z.number().optional(),
  available: z.boolean().optional(),
  contentLocation: z.string().optional(),
});

// For updates (partial):
export const partialLocalLearningObjectBodySchema =
  localLearningObjectBodySchema.partial();
