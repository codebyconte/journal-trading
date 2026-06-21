'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/app/actions/trades'

export async function saveJournalEntry(input: {
  date: string
  content: string
  mood: number
}): Promise<ActionResult> {
  try {
    await prisma.journalEntry.upsert({
      where: { date: new Date(input.date) },
      update: { content: input.content, mood: input.mood },
      create: {
        date: new Date(input.date),
        content: input.content,
        mood: input.mood,
      },
    })
    revalidatePath('/journal')
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de la sauvegarde du journal' }
  }
}
