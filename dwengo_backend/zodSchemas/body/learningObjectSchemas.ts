import { z } from "zod";

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

export const partialLocalLearningObjectBodySchema =
  localLearningObjectBodySchema.partial();
