import { z } from 'zod';

export const createBranchSchema = z.object({
    name: z.string({ required_error: "branch name is missing" }),
    address: z.string({ required_error: "branch address is missing" }),
    telephone: z.string({ required_error: "branch telephone is missing" }),
    bankAccount: z.string({ required_error: "branch Bank Account name is missing" }),
    branchManager: z.string({ required_error: "branch Mnager is missing" }),
});

export const updateBranchShema = createBranchSchema.extend({
    branchID: z.string({ required_error: "branch ID is missing" })
})

export type createBranchDto = z.infer<typeof createBranchSchema>;
export type updateBranchDto = z.infer<typeof updateBranchShema>



