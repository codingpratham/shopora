import zod from "zod";

export const updateUserSchema = zod.object({
    address: zod.string().min(1, "Address is required"),
    phoneNumber: zod.number().min(10, "Phone number must be at least 10 digits long").max(15, "Phone number must be at most 15 digits long"),
})

export type UpdateUserInput = zod.infer<typeof updateUserSchema>;
