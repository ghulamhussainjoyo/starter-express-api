import { z } from 'zod'


export const createLeadSchema = z.object({
    client_name: z.string({ required_error: "client name is required" }),
    client_contact: z.string({ required_error: "client contact is required" }),
    city: z.string({ required_error: "client name is required" }),
    monthly_consumption: z.number({ required_error: "montly consumption is required" }),
    solar_requirements: z.number({ required_error: "what are solar requirements?" }),
    monthly_bill_amount: z.number({ required_error: "what are monthly bill amount?" }),
})

export const updateLeadSchema = createLeadSchema.extend({
    crmID: z.string({ required_error: "leadID is required" })
})

export type createLeadDto = z.infer<typeof createLeadSchema>;
export type updateLeadDto = z.infer<typeof updateLeadSchema>;  