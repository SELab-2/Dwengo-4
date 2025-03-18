import { z } from 'zod';

export const createInviteBodySchema = z.object({
    otherTeacherId: z.number().int().positive()
});

export const createInviteParamsSchema = z.object({
    classId: z.string().refine((id) => !isNaN(parseInt(id)), {
        message: "classId should be a number",
      })
});


export const getInvitesParamsSchema = createInviteParamsSchema;

export const updateInviteBodySchema = z.object({
    action: z.enum(["accept", "decline"])
});

export const updateInviteParamsSchema = z.object({
    inviteId: z.string().refine((id) => !isNaN(parseInt(id)), {
        message: "inviteId should be a number"
    })
});


// classId and inviteId
export const deleteInviteParamsSchema = createInviteParamsSchema.merge(updateInviteParamsSchema);
