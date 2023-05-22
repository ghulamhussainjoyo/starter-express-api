import { number, z } from 'zod'


export const createSurveySchema = z.object({
    crmID: z.string({ required_error: "crmID is missing" }).min(36).max(Infinity),
    surveyor_name: z.string({ required_error: "surveyor name is required" }),
    total_amperes: z.number({ required_error: "total_amperes is required" }),
    meter_type: z.string({ required_error: "meter type is required" }),
    gps_coordinates: z.string({ required_error: "gps coordinate is required" }),
    roof_type: z.string({ required_error: "roof type is required" }),
    system_type: z.string({ required_error: "what is system type?" }),
    solar_requirements: z.number({ required_error: "solar requirement is required?" }),
    other_survey: z.string({ required_error: "what are monthly bill amount?" }),
})



export const updateSurveySchema = z.object({
    crmID: z.string({ required_error: "crmID is missing" }).min(36).max(Infinity),
    surveyor_name: z.string({ required_error: "surveyor name is required" }),
    total_amperes: z.number({ required_error: "total_amperes is required" }),
    meter_type: z.string({ required_error: "meter type is required" }),
    gps_coordinates: z.string({ required_error: "gps coordinate is required" }),
    roof_type: z.string({ required_error: "roof type is required" }),
    system_type: z.string({ required_error: "what is system type?" }),
    solar_requirements: z.number({ required_error: "solar requirement is required?" }),
    other_survey: z.string({ required_error: "what are monthly bill amount?" }),
})

export type createSurveySchemaType = z.infer<typeof createSurveySchema>;  