import { z } from 'zod'

export const CreateOrderSchema = z.object({
  customer_name: z.string().min(2),
  customer_phone: z.string().regex(/^[6-9]\d{9}$/),
  customer_email: z.string().email().optional().or(z.literal('')),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        name: z.string(),
        price: z.number().positive(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
  total_amount: z.number().positive(),
  payment_mode: z.enum(['cash', 'upi', 'bank_transfer']).optional(),
  notes: z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
