import { z } from "zod";

export const createLocalLearningPathBodySchema = z.object({
  title: z.string().min(1, { message: "Title is required" }), // Ensures 'title' is not empty
  language: z.string().min(1, { message: "Language is required" }), // Ensures 'language' is not empty
  description: z.string().optional(), // 'description' is optional
  image: z.string().nullable().optional(), // 'image' can be a string, null, or undefined (optional)
});

export const getLocalLearningPathParamsSchema = z.object({
  pathId: z.coerce.string({
    message: "LLPath-id was missing or couldn't be converted to a string",
  }),
});

export const updateLocalLearningPathParamsSchema =
  getLocalLearningPathParamsSchema;

export const deleteLocalLearningPathParamsSchema =
  getLocalLearningPathParamsSchema;
