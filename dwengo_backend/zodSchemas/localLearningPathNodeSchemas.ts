import { z } from "zod";

export const getLocalLearningPathNodeParamsSchema = z.object({
  pathId: z.coerce.string({
    message: "LLPath-id was missing or couldn't be converted to a string",
  }),
});

export const createNodeBodySchema = z.object({
  isExternal: z.boolean(),
  localLearningObjectId: z.string().optional(),
  dwengoHruid: z.string().optional(),
  dwengoLanguage: z.string().optional(),
  dwengoVersion: z.number().optional(),
  start_node: z.boolean().optional(),
});

export const createNodeParamSchema = getLocalLearningPathNodeParamsSchema;

export const updateNodeBodySchema = createNodeBodySchema;

export const updateNodeParamSchema = z.object({
  pathId: z.coerce.string({
    message: "LLPath-id was missing or couldn't be converted to a string",
  }),
  nodeId: z.coerce.string({
    message: "LLNode-id was missing or couldn't be converted to a string",
  }),
});

export const deleteNodeParamSchema = updateNodeParamSchema;
