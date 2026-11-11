import { z } from "zod";

export const generatePlanSchema = z.object({
  target_gpa: z
    .number()
    .min(0)
    .max(4)
    .describe("Target GPA (e.g. 3.5)"),
  preferred_semesters: z
    .number()
    .min(1)
    .max(20)
    .describe("Number of semesters to spread the courses over"),
  completed_course_ids: z
    .array(z.string())
    .describe("IDs of the courses already completed"),
  note: z.string().max(500).optional(),
});

export type GeneratePlanInput = z.infer<typeof generatePlanSchema>;
