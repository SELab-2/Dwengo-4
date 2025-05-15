import { z } from "zod";

// either a draft node that has to be created, or an existin node that'll have to be updated
const nodeSchema = z
  .object({
    draftId: z.number().optional(),
    nodeId: z.string().optional(),
    dwengoHruid: z.string().nullable().optional(),
    dwengoLanguage: z.string().nullable().optional(),
    dwengoVersion: z.number().nullable().optional(),
    localLearningObjectId: z.string().nullable().optional(),
    isExternal: z.boolean(),
  })
  .refine((data) => (data.draftId ? !data.nodeId : !!data.nodeId), {
    message: "Each node must have either draftId or nodeId, but not both.",
    path: ["draftId", "nodeId"],
  })
  .refine(
    (data) =>
      data.dwengoHruid &&
      data.dwengoLanguage &&
      data.dwengoVersion &&
      !data.localLearningObjectId
        ? true
        : !(data.dwengoHruid || data.dwengoLanguage || data.dwengoVersion) &&
          !!data.localLearningObjectId,
    {
      message:
        "Each node must have either dwengoHruid, dwengoLanguage, and dwengoVersion, or localLearningObjectId, but not both.",
      path: [
        "dwengoHruid",
        "dwengoLanguage",
        "dwengoVersion",
        "localLearningObjectId",
      ],
    },
  );

export const createLocalLearningPathSchema = z.object({
  title: z.string().min(1, "Title is required"),
  language: z.string().min(1, "Language is required"),
  description: z.string().optional(),
  image: z.string().nullable().optional(),
  nodes: z.array(nodeSchema).optional(),
});

export const updateLocalLearningPathSchema = createLocalLearningPathSchema.partial();
