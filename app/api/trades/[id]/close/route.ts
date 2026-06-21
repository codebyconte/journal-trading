import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculatePnL, calculateRMultiple } from '@/lib/utils'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { exitPrice, mae, mfe } = body

    const trade = await prisma.trade.findUnique({ where: { id: params.id } })
    if (!trade) return NextResponse.json({ error: 'Trade non trouvé' }, { status: 404 })
    if (trade.status === 'CLOSED') {
      return NextResponse.json({ error: 'Trade déjà clôturé' }, { status: 400 })
    }

    const exit = parseFloat(exitPrice)
    if (!exit || exit <= 0) {
      return NextResponse.json({ error: 'Prix de sortie invalide' }, { status: 400 })
    }

    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
    const capitalBeforeClose = settings?.currentCapital ?? 100000
    const pnl = calculatePnL(trade.entryPrice, exit, trade.units, trade.direction as 'LONG' | 'SHORT')
    const rMultiple = calculateRMultiple(pnl, trade.riskAmount)
    const newCapital = capitalBeforeClose + pnl

    const [updatedTrade] = await prisma.$transaction([
      prisma.trade.update({
        where: { id: params.id },
        data: {
          exitPrice: exit,
          pnl,
          pnlPercent: capitalBeforeClose > 0 ? (pnl / capitalBeforeClose) * 100 : 0,
          rMultiple,
          mae: mae ? parseFloat(mae) : null,
          mfe: mfe ? parseFloat(mfe) : null,
          status: 'CLOSED',
          closedAt: new Date(),
        },
      }),
      prisma.settings.upsert({
        where: { id: 'singleton' },
        update: { currentCapital: newCapital },
        create: {
          id: 'singleton',
          initialCapital: 100000,
          currentCapital: newCapital,
          riskPercent: 1.0,
        },
      }),
    ])

    return NextResponse.json(updatedTrade)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
