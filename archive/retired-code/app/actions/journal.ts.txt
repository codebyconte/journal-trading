'use server'

import { startOfDay, endOfDay } from 'date-fns'
import { prisma } from '@/lib/db'
import { parseDateOnlyString } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/app/actions/trades'

function normalizeJournalDay(dateInput: string | Date): Date {
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return parseDateOnlyString(dateInput)
  }
  return startOfDay(new Date(dateInput))
}

export async function saveJournalEntry(input: {
  date: string
  content: string
  mood: number
}): Promise<ActionResult> {
  try {
    const dayStart = normalizeJournalDay(input.date)
    const dayEnd = endOfDay(dayStart)

    const existing = await prisma.journalEntry.findFirst({
      where: { date: { gte: dayStart, lte: dayEnd } },
      orderBy: { date: 'asc' },
    })

    if (existing) {
      await prisma.journalEntry.update({
        where: { id: existing.id },
        data: { content: input.content, mood: input.mood, date: dayStart },
      })
    } else {
      await prisma.journalEntry.create({
        data: {
          date: dayStart,
          content: input.content,
          mood: input.mood,
        },
      })
    }

    revalidatePath('/journal')
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de la sauvegarde du journal' }
  }
}
