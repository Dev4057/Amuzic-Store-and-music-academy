import { z } from 'zod'

export const CreateTeacherSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional().or(z.literal('')),
  specializations: z.array(z.string()).default([]),
  bio: z.string().optional(),
  joining_date: z.string().optional(),
})

export const UpdateTeacherSchema = CreateTeacherSchema.partial()

export type CreateTeacherInput = z.infer<typeof CreateTeacherSchema>
export type UpdateTeacherInput = z.infer<typeof UpdateTeacherSchema>
