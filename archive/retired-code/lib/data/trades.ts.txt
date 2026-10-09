import { cache } from 'react'
import { prisma } from '@/lib/db'
import { serializeTrade } from '@/lib/data/serialize'
import type { Trade } from '@/lib/types'

export interface GetTradesOptions {
  status?: string
  asset?: string
  direction?: string
  limit?: number
  offset?: number
}

export const getTrades = cache(async (options: GetTradesOptions = {}): Promise<{ trades: Trade[]; total: number }> => {
  const { status, asset, direction, limit = 100, offset = 0 } = options

  const where: Record<string, unknown> = {}
  if (status && status !== 'ALL') where.status = status
  if (asset) where.asset = { contains: asset }
  if (direction) where.direction = direction

  const [rows, total] = await Promise.all([
    prisma.trade.findMany({
      where,
      orderBy:
        status === 'CLOSED'
          ? [{ closedAt: 'desc' }, { datetime: 'desc' }]
          : { datetime: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.trade.count({ where }),
  ])

  return { trades: rows.map(serializeTrade), total }
})
