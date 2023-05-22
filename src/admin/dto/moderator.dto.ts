import { string, z } from 'zod';



export const createModeratorSchema = z.object({
    username: string({ required_error: "Username is empty" }),
    designation: string({ required_error: "Username is empty" }),
    password: string({ required_error: "Username is empty" }),
    email: string({ required_error: "Username is empty" }),
    mobile: string({ required_error: "Username is empty" }),
    role: string({ required_error: "Username is empty" }),
    employeeID: string({ required_error: "employee id can not be empty" }),
    branch: string({ required_error: "branch can not be empty" })

})

export const updateModeratorSchema = createModeratorSchema.extend({
    userID: string({ required_error: "user id is missing" }),
})
export type createModeratorDto = z.infer<typeof createModeratorSchema>
export type updateModeratorDto = z.infer<typeof updateModeratorSchema>

