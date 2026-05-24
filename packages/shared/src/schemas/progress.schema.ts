import { z } from 'zod'

export const CreateProgressNoteSchema = z.object({
  student_id: z.string().uuid(),
  batch_id: z.string().uuid().optional(),
  teacher_id: z.string().uuid().optional(),
  note_text: z.string().min(1),
  skill_level: z.enum(['beginner', 'elementary', 'intermediate', 'advanced']).optional(),
  class_date: z.string().optional(),
})

export const UpdateProgressNoteSchema = CreateProgressNoteSchema.partial()

export type CreateProgressNoteInput = z.infer<typeof CreateProgressNoteSchema>
export type UpdateProgressNoteInput = z.infer<typeof UpdateProgressNoteSchema>
