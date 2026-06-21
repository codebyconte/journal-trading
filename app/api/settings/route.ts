import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    let settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
    if (!settings) {
      settings = await prisma.settings.create({
        data: { id: 'singleton', initialCapital: 100000, currentCapital: 100000, riskPercent: 1.0 },
      })
    }
    return NextResponse.json(settings)
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { initialCapital, currentCapital, riskPercent } = body

    const settings = await prisma.settings.upsert({
      where: { id: 'singleton' },
      update: { initialCapital, currentCapital, riskPercent },
      create: { id: 'singleton', initialCapital, currentCapital, riskPercent },
    })
    return NextResponse.json(settings)
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
