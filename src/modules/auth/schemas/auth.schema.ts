import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * Field rules shared by the sign-up and the register form.
 *
 * Kept in one place so the two forms can never drift apart: the register
 * screen reuses these exact rules and only adds the fields the backend
 * `RegisterRequest` needs on top (date of birth, phone, curriculum).
 */
const accountFields = {
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  studentCode: z.string().min(6, "Invalid student ID"),
};

export const signUpSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: accountFields.email,
    password: accountFields.password,
    confirm_password: z.string(),
    student_code: accountFields.studentCode,
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "The passwords do not match",
    path: ["confirm_password"],
  });

export const updatePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Enter your current password"),
    new_password: z.string().min(8, "The new password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "The passwords do not match",
    path: ["confirm_password"],
  });

/**
 * Register form — mirrors the backend `RegisterRequest`.
 *
 * The backend (`StudentRegistrationController.RegisterRequest`) requires:
 *   fullName, email, password, dateOfBirth, studentCode, phone
 * and accepts an optional `curriculumVersionId`.
 *
 * `dateOfBirth` is sent as an ISO local date (`yyyy-MM-dd`) because the
 * backend binds it to a `LocalDate`.
 */
export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    email: accountFields.email,
    password: accountFields.password,
    confirmPassword: z.string(),
    studentCode: accountFields.studentCode,
    phone: z.string().min(8, "Số điện thoại phải có ít nhất 8 số"),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày sinh phải có định dạng YYYY-MM-DD"),
    curriculumVersionId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Forgot-password form — a single email field.
 *
 * The backend accepts any syntactically valid address and answers with the
 * same generic message, so the form only validates the shape.
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

/**
 * Reset-password form — a new password plus its confirmation.
 *
 * The backend rule is 8–72 characters with at least one letter and one
 * number (`AuthPasswordService.PASSWORD`); the same rule is mirrored here
 * so the student learns about it before the round-trip.
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .max(72, "Mật khẩu không được quá 72 ký tự")
      .regex(/[A-Za-z]/, "Mật khẩu phải có ít nhất một chữ cái")
      .regex(/\d/, "Mật khẩu phải có ít nhất một chữ số"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
