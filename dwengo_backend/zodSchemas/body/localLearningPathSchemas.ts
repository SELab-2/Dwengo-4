import { z } from "zod";

/**
 * Validatie‐schema voor één node in het payload.
 * - Óf draftId (nieuw) – Óf nodeId (bestaand)
 * - Óf lokale LO – Óf externe Dwengo‐LO
 * - parentNodeId + viaOptionIndex voor branches
 * - learningObject.contentType om MC‐vragen te herkennen
 */
export const nodeSchema = z
  .object({
    // IDENTIFICATIE
    draftId:         z.number().optional(),
    nodeId:          z.string().optional(),
    parentNodeId:    z.string().nullable().optional(),
    viaOptionIndex:  z.number().nullable().optional(),

    // LEARNING OBJECT META
    learningObject: z.object({
      contentType: z.string().min(1, "contentType is required"),
    }),

    // TYPE LEARNING OBJECT
    isExternal:             z.boolean(),
    localLearningObjectId:  z.string().nullable().optional(),
    dwengoHruid:            z.string().nullable().optional(),
    dwengoLanguage:         z.string().nullable().optional(),
    dwengoVersion:          z.number().nullable().optional(),
  })
  // precies één van draftId of nodeId
  .refine(
    (d) => (d.draftId != null) !== (d.nodeId != null),
    {
      message: "Geef óf draftId óf nodeId, maar niet allebei.",
      path: ["draftId", "nodeId"],
    }
  )
  // precies één van (localLearningObjectId) of (dwengoHruid+dwengoLanguage+dwengoVersion)
  .refine(
    (d) =>
      (d.isExternal &&
        d.dwengoHruid != null &&
        d.dwengoLanguage != null &&
        d.dwengoVersion != null &&
        d.localLearningObjectId == null) ||
      (!d.isExternal &&
        d.localLearningObjectId != null &&
        d.dwengoHruid == null &&
        d.dwengoLanguage == null &&
        d.dwengoVersion == null),
    {
      message:
        "Moet óf (dwengoHruid + dwengoLanguage + dwengoVersion) zijn, óf localLearningObjectId.",
      path: [
        "isExternal",
        "localLearningObjectId",
        "dwengoHruid",
        "dwengoLanguage",
        "dwengoVersion",
      ],
    }
  )


/**
 * Schema voor create‐request. 
 * nodes array is verplicht bij creatie.
 */
export const createLocalLearningPathSchema = z.object({
  title:       z.string().min(1, "Title is required"),
  language:    z.string().min(1, "Language is required"),
  description: z.string().optional(),
  image:       z.string().nullable().optional(),
  nodes:       z.array(nodeSchema).min(1, "At least one node is required"),
});

/**
 * Schema voor update‐request: alle velden optioneel
 */
export const updateLocalLearningPathSchema = createLocalLearningPathSchema.partial();
