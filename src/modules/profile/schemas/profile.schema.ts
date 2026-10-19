import { z } from "zod";

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Tên tối thiểu 2 ký tự").optional(),
  phone: z
    .string()
    .regex(/^0[0-9]{9}$/, "Số điện thoại không hợp lệ")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(200, "Giới thiệu tối đa 200 ký tự").optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
