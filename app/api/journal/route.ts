import { NextResponse } from 'next/server'
import { getJournalEntries } from '@/lib/data/journal'
import { saveJournalEntry } from '@/app/actions/journal'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '30')
    const entries = await getJournalEntries(limit)
    return NextResponse.json(entries)
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = await saveJournalEntry({
      date: body.date,
      content: body.content,
      mood: body.mood ? parseInt(body.mood) : 4,
    })
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
