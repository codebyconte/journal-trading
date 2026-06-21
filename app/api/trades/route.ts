import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculatePlannedRR } from '@/lib/utils'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const asset = searchParams.get('asset')
    const direction = searchParams.get('direction')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = {}
    if (status && status !== 'ALL') where.status = status
    if (asset) where.asset = { contains: asset }
    if (direction) where.direction = direction

    const [trades, total] = await Promise.all([
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

    return NextResponse.json({ trades, total })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      datetime, asset, direction, orderType,
      entryPrice, stopLoss, takeProfit, units,
      riskAmount, riskPercent,
      checkEMA, checkRSI, checkVolume, checkLiquid, checkUnlocks, checkTVL,
      setup, marketCondition, emotionScore, sessionTime,
      notes, screenshot,
    } = body

    const plannedRR = calculatePlannedRR(
      parseFloat(entryPrice),
      parseFloat(stopLoss),
      parseFloat(takeProfit),
      direction,
    )

    const trade = await prisma.trade.create({
      data: {
        datetime: new Date(datetime),
        asset,
        direction,
        orderType,
        entryPrice: parseFloat(entryPrice),
        stopLoss: parseFloat(stopLoss),
        takeProfit: parseFloat(takeProfit),
        units: parseFloat(units),
        riskAmount: parseFloat(riskAmount),
        riskPercent: parseFloat(riskPercent),
        plannedRR,
        status: 'PENDING',
        checkEMA: !!checkEMA,
        checkRSI: !!checkRSI,
        checkVolume: !!checkVolume,
        checkLiquid: !!checkLiquid,
        checkUnlocks: !!checkUnlocks,
        checkTVL: !!checkTVL,
        setup: setup || null,
        marketCondition: marketCondition || null,
        emotionScore: emotionScore ? parseInt(emotionScore) : null,
        sessionTime: sessionTime || null,
        notes: notes || null,
        screenshot: screenshot || null,
      },
    })

    return NextResponse.json(trade, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
