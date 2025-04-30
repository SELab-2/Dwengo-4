import { z } from "zod";

const allowedSortFields = ["deadline", "createdAt", "updatedAt"] as const;

export const studentAssignmentsQuerySchema = z.object({
  sort: z
    .string()
    .optional()
    .transform((val) => {
      const rawFields = val?.split(",") ?? [];
      const filtered = rawFields.filter((field) =>
        allowedSortFields.includes(field as any),
      );
      return filtered.length > 0 ? filtered : ["deadline"];
    }),
  order: z.enum(["asc", "desc"]).default("asc"),
  limit: z
    .string()
    .optional()
    .transform((val) => Number(val ?? "5"))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Limit must be a number greater than 0",
    }),
});
