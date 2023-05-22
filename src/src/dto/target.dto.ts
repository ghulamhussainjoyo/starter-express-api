import { z } from 'zod'

export const createTargetShema = z.object({
    target: z.number({ required_error: "taget is missing" }),
    userID: z.string({ required_error: "userID is missing" }),
})

export const updateTargetSchema = z.object({
    target: z.number({ required_error: "taget is missing" }),
})


export type createTargetDto = z.infer<typeof createTargetShema>
export type updateTargetDto = z.infer<typeof updateTargetSchema>