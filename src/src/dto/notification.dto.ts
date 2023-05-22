import { string, z } from 'zod'


const createNotificationSchema = z.object({
    subject: string({ required_error: "title is missing" }),
    body: string({ required_error: "title is missing" }),
    userId: string({ required_error: "title is missing" }),
    createrId: string({ required_error: "title is missing" }),
    link: string({ required_error: "link is missing" }),
    // fileName: string({ required_error: "file Name required" })

})

export type createNotificationDto = z.infer<typeof createNotificationSchema>