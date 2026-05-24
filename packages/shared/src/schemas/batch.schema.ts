import { z } from 'zod'

export const CreateBatchSchema = z.object({
  name: z.string().min(2).max(100),
  course_id: z.string().uuid(),
  teacher_id: z.string().uuid().optional(),
  schedule_days: z
    .array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']))
    .min(1),
  schedule_time: z.string().regex(/^\d{2}:\d{2}$/),
  duration_minutes: z.number().int().min(30).max(120).default(45),
  max_students: z.number().int().min(1).max(30).default(8),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

export const UpdateBatchSchema = CreateBatchSchema.partial()

export type CreateBatchInput = z.infer<typeof CreateBatchSchema>
export type UpdateBatchInput = z.infer<typeof UpdateBatchSchema>
