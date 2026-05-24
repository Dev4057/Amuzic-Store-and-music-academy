import { z } from 'zod'

export const MarkAttendanceSchema = z.object({
  class_date: z.string(),
  attendance: z.array(
    z.object({
      student_id: z.string().uuid(),
      status: z.enum(['present', 'absent', 'late', 'cancelled']),
      notes: z.string().optional(),
    })
  ),
})

export type MarkAttendanceInput = z.infer<typeof MarkAttendanceSchema>
