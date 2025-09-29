import { z } from "zod";

export const registerUserSchema = z.object({
    fullname: z.string().min(1, "fullname wajib").transform(s => s.trim()),
    email: z.email().transform(s => s.toLowerCase()),
    password: z.string().min(8, "password minimal 8 karakter"),
    username: z.string().min(4).max(32)
        .regex(/^[a-zA-Z0-9_.-]+$/, "username hanya huruf/angka/._-"),
    major_id: z.coerce.number().int().positive(),
}).strict();
