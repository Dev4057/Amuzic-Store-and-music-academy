import type { Request, Response } from 'express'

export async function createOrder(_req: Request, res: Response): Promise<void> {
  res.json({ message: 'not implemented' })
}

export async function getOrders(_req: Request, res: Response): Promise<void> {
  res.json({ message: 'not implemented' })
}

export async function updateOrderStatus(_req: Request, res: Response): Promise<void> {
  res.json({ message: 'not implemented' })
}
