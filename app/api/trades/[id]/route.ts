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

/** PUT désactivé — évite de clôturer/modifier PnL sans mettre à jour le capital. */
export async function PUT() {
  return NextResponse.json(
    { error: 'Modification directe interdite. Utilisez les actions serveur (clôture, annulation, etc.).' },
    { status: 405 },
  )
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
