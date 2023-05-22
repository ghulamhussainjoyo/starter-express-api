import { z } from 'zod'


export const createMeetingSchema = z.object({
    crmID: z.string({ required_error: "crmID is missing" }),
    poc_name: z.string({ required_error: "poc name is missing" }),
    panel_names: z.string({ required_error: "panel names is missing" }),
    poc_contact: z.string({ required_error: "poc contact is missing" }),
    venue_address: z.string({ required_error: "venue address is missing" }),
})

export type createMeetingSchemaType = z.infer<typeof createMeetingSchema>;  