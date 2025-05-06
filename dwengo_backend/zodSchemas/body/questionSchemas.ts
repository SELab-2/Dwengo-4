import { z } from "zod";

const baseQuestionSchema = z.object({
  teamId: z.coerce.number().int().positive(),
  title: z.string().min(1, "Title is required"),
  text: z.string().min(1, "Text is required"),
  isExternal: z.boolean(),
  isPrivate: z.boolean(),
  dwengoLanguage: z.string().optional(),
});

export const createQuestionSpecificBodySchema = baseQuestionSchema.extend({
  localLearningObjectId: z.string().optional(),
  dwengoHruid: z.string().optional(),
  dwengoVersion: z.coerce.number().optional(),
});

export const createQuestionGeneralBodySchema = baseQuestionSchema.extend({
  pathRef: z.string().min(1, "PathRef is required"),
});
