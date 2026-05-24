import { z } from 'zod'

export const CreateCourseSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.enum(['keyboard', 'guitar', 'drums', 'vocals']),
  description: z.string().optional(),
  duration_months: z.number().int().positive().optional(),
  monthly_fee: z.number().positive().optional(),
  admission_fee: z.number().positive().optional(),
  syllabus_url: z.string().url().optional(),
  cover_image_url: z.string().url().optional(),
})

export const UpdateCourseSchema = CreateCourseSchema.partial()

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>
