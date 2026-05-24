import { z } from 'zod'

export const CreateFeeSchema = z.object({
  student_id: z.string().uuid(),
  batch_id: z.string().uuid().optional(),
  fee_type: z.enum(['admission', 'monthly', 'annual', 'exam', 'other']),
  amount: z.number().positive(),
  due_date: z.string(),
  month_year: z.string().optional(),
  notes: z.string().optional(),
})

export const RecordPaymentSchema = z.object({
  paid_amount: z.number().positive(),
  paid_date: z.string(),
  payment_mode: z.enum(['cash', 'upi', 'bank_transfer', 'cheque']),
  notes: z.string().optional(),
})

export type CreateFeeInput = z.infer<typeof CreateFeeSchema>
export type RecordPaymentInput = z.infer<typeof RecordPaymentSchema>
