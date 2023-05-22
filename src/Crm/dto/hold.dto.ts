import { string, z } from 'zod'

export const holdSchema = z.object({
    userID: string({ required_error: "userID is missing" }),
    prev_status: string({ required_error: "Prev Status is missing" }),
    status: string({ required_error: "Status is missing" }),
})


export type holdDto = z.infer<typeof holdSchema>