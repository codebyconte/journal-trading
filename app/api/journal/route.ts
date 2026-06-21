import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '30')

    const entries = await prisma.journalEntry.findMany({
      orderBy: { date: 'desc' },
      take: limit,
    })
    return NextResponse.json(entries)
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { date, content, mood } = body

    const entry = await prisma.journalEntry.upsert({
      where: { date: new Date(date) },
      update: { content, mood: mood ? parseInt(mood) : null },
      create: { date: new Date(date), content, mood: mood ? parseInt(mood) : null },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
