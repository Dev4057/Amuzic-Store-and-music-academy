import { z } from 'zod'

export const CreateProductSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(100),
  description: z.string().optional(),
  category: z.enum(['keyboard', 'guitar', 'drums', 'vocals', 'accessories', 'other']),
  price: z.number().positive(),
  stock_quantity: z.number().int().min(0),
})

export const UpdateProductSchema = CreateProductSchema.partial()

export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>
