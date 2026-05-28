import { z } from 'zod'

export const CreateTeacherSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email({ message: 'Valid email required for login invite' }),
  specializations: z.array(z.string()).default([]),
  bio: z.string().optional(),
  joining_date: z.string().optional(),
})

export const UpdateTeacherSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  specializations: z.array(z.string()).optional(),
  bio: z.string().optional(),
  joining_date: z.string().optional(),
  is_active: z.boolean().optional(),
})

export type CreateTeacherInput = z.infer<typeof CreateTeacherSchema>
export type UpdateTeacherInput = z.infer<typeof UpdateTeacherSchema>
