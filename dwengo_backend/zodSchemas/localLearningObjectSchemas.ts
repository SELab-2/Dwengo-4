import { z } from "zod";

export const ContentType = {
  TEXT_PLAIN: "TEXT_PLAIN",
  TEXT_MARKDOWN: "TEXT_MARKDOWN",
  IMAGE_IMAGE_BLOCK: "IMAGE_IMAGE_BLOCK",
  IMAGE_IMAGE: "IMAGE_IMAGE",
  AUDIO_MPEG: "AUDIO_MPEG",
  VIDEO: "VIDEO",
  EVAL_MULTIPLE_CHOICE: "EVAL_MULTIPLE_CHOICE",
  EVAL_OPEN_QUESTION: "EVAL_OPEN_QUESTION",
} as const;

export const ContentTypeSchema = z.enum([
  ContentType.TEXT_PLAIN,
  ContentType.TEXT_MARKDOWN,
  ContentType.IMAGE_IMAGE_BLOCK,
  ContentType.IMAGE_IMAGE,
  ContentType.AUDIO_MPEG,
  ContentType.VIDEO,
  ContentType.EVAL_MULTIPLE_CHOICE,
  ContentType.EVAL_OPEN_QUESTION,
]);

export const LocalLearningObjectBodySchema = z.object({
  title: z.string(),
  description: z.string(),
  contentType: ContentTypeSchema,
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

// Optional inferred type
export type LocalLearningObjectData = z.infer<
  typeof LocalLearningObjectBodySchema
>;

export const getLocalLearningObjectParamsSchema = z.object({
  id: z.coerce.string({
    message: "LLO-id was missing or couldn't be converted to a string",
  }),
});

export const updateLocalLearningObjectBodySchema =
  LocalLearningObjectBodySchema.partial();

export const updateLocalLearningObjectParamSchema =
  getLocalLearningObjectParamsSchema;

export const deleteLocalLearningObjectParamSchema =
  getLocalLearningObjectParamsSchema;
