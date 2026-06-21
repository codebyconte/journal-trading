import { cache } from 'react'
import { prisma } from '@/lib/db'
import { serializeJournalEntry } from '@/lib/data/serialize'
import type { JournalEntry } from '@/lib/types'

export const getJournalEntries = cache(async (limit = 90): Promise<JournalEntry[]> => {
  const entries = await prisma.journalEntry.findMany({
    orderBy: { date: 'desc' },
    take: limit,
  })
  return entries.map(serializeJournalEntry)
})
