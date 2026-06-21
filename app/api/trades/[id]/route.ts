import { NextResponse } from 'next/server'
import { deleteTrade, openTrade, cancelTrade } from '@/app/actions/trades'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

type RouteParams = { id: string }

export async function GET(
  _req: Request,
  context: { params: RouteParams | Promise<RouteParams> },
) {
  try {
    const { id } = await Promise.resolve(context.params)
    const trade = await prisma.trade.findUnique({ where: { id } })
    if (!trade) return NextResponse.json({ error: 'Trade non trouvé' }, { status: 404 })
    return NextResponse.json(trade)
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  context: { params: RouteParams | Promise<RouteParams> },
) {
  try {
    const { id } = await Promise.resolve(context.params)
    const body = await req.json()
    const trade = await prisma.trade.update({
      where: { id },
      data: {
        ...body,
        datetime: body.datetime ? new Date(body.datetime) : undefined,
        openedAt: body.openedAt ? new Date(body.openedAt) : undefined,
        closedAt: body.closedAt ? new Date(body.closedAt) : undefined,
      },
    })
    return NextResponse.json(trade)
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  context: { params: RouteParams | Promise<RouteParams> },
) {
  const { id } = await Promise.resolve(context.params)
  const result = await deleteTrade(id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
