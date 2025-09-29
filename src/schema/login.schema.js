import z from "zod";

export const loginSchema = z.object({
    username: z.string().minLength(8),
    password: z.string().minLength(8)
});