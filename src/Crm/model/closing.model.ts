import { z } from 'zod'


export const createClosingSchema = z.object({
    crmID: z.string({ required_error: "crmID is missing" }),
    sales_person: z.string({ required_error: "sales_person is required" }),
    lead_person: z.string({ required_error: "lead_person is required" }),
    quote_serial: z.string({ required_error: "quote_serial is required" }),
    system_details: z.string({ required_error: "system_details is required" }),
    cheque_number: z.string({ required_error: "cheque_number is required" }),
    advance_price: z.number({ required_error: "advance_price is required" }),
})

export type createSurveySchemaType = z.infer<typeof createClosingSchema>;  