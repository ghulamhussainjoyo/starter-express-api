import { string, z } from 'zod';



export const createUserSchema = z.object({
    username: string({ required_error: "Username is empty" }),
    designation: string({ required_error: "Username is empty" }),
    password: string({ required_error: "Username is empty" }),
    email: string({ required_error: "Username is empty" }),
    mobile: string({ required_error: "Username is empty" }),
    role: string({ required_error: "Username is empty" }),
    employeeID: string({ required_error: "employee id can not be empty" }),
    branchID: string({ required_error: "Branch can not be empty" }),
    moderatorID: string({ required_error: "can not be empty" }),
    branch: string({ required_error: "branch can not be empty" }),

})

export const updateUserSchema = createUserSchema.extend({
    userID: string({ required_error: "user id is missing" }),
})
export type createUserDto = z.infer<typeof createUserSchema>
export type updateUserDto = z.infer<typeof updateUserSchema>

