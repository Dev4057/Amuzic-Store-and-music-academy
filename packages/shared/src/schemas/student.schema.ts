import { z } from 'zod'

export const CreateStudentSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional().or(z.literal('')),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_phone: z.string().optional(),
  student_type: z.enum(['child', 'adult', 'senior']),
  notes: z.string().optional(),
})

export const UpdateStudentSchema = CreateStudentSchema.partial()

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>
export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>
