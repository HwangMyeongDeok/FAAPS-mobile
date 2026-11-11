import { z } from "zod";

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z
    .string()
    .regex(/^0[0-9]{9}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(200, "Bio must be at most 200 characters").optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
