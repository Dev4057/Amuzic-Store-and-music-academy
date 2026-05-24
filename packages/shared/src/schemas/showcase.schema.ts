import { z } from 'zod'

export const CreateShowcaseVideoSchema = z.object({
  student_name: z.string().min(2).max(100),
  student_id: z.string().uuid().optional(),
  course: z.string().min(1),
  title: z.string().min(2).max(200),
  video_url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  duration_seconds: z.number().int().positive().optional(),
  display_order: z.number().int().min(0).default(0),
})

export const UpdateShowcaseVideoSchema = CreateShowcaseVideoSchema.partial().extend({
  is_published: z.boolean().optional(),
})

export type CreateShowcaseVideoInput = z.infer<typeof CreateShowcaseVideoSchema>
export type UpdateShowcaseVideoInput = z.infer<typeof UpdateShowcaseVideoSchema>
