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

export const titleBodySchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const textBodySchema = z.object({
  text: z.string().min(1, "Text is required"),
});

export const nodeMetadataSchema = z.object({
  isExternal: z.boolean(),
  localLearningObjectId: z.string().optional(),
  dwengoHruid: z.string().optional(),
  dwengoLanguage: z.string().optional(),
  dwengoVersion: z.number().optional(),
  start_node: z.boolean().optional(),
});

export const otherTeacherEmailBodySchema = z.object({
  otherTeacherEmail: z.string().email(),
});
