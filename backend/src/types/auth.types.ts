import  zod  from "zod";

export const registerUserSchema = zod.object({
    name: zod.string().min(1, "Name is required"),
    email: zod.string().email("Invalid email address"),
    password: zod.string().min(6, "Password must be at least 6 characters long"),
    role: zod.enum(["USER", "ADMIN"])
})

export const loginUserSchema = zod.object({
    email: zod.string().email("Invalid email address"),
    password: zod.string().min(6, "Password must be at least 6 characters long"),
})

export type RegisterUserInput = zod.infer<typeof registerUserSchema>;
export type LoginUserInput = zod.infer<typeof loginUserSchema>;