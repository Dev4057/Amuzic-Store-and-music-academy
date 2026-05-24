import { z } from 'zod'

export const CreateDemoBookingSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  email: z.string().email().optional().or(z.literal('')),
  course_interest: z.enum(['keyboard', 'guitar', 'drums', 'vocals', 'unsure']).optional(),
  preferred_date: z.string().optional(),
  preferred_time: z.string().optional(),
  student_type: z.enum(['child', 'adult', 'senior']).optional(),
  message: z.string().max(500).optional(),
})

export type CreateDemoBookingInput = z.infer<typeof CreateDemoBookingSchema>
