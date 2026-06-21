import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const trade = await prisma.trade.findUnique({ where: { id: params.id } })
    if (!trade) return NextResponse.json({ error: 'Trade non trouvé' }, { status: 404 })
    return NextResponse.json(trade)
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const trade = await prisma.trade.update({
      where: { id: params.id },
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

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.trade.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
