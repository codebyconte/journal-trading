import { NextResponse } from 'next/server'
import { closeTrade } from '@/app/actions/trades'

export const dynamic = 'force-dynamic'

type RouteParams = { id: string }

export async function POST(
  req: Request,
  context: { params: RouteParams | Promise<RouteParams> },
) {
  try {
    const { id } = await Promise.resolve(context.params)
    const body = await req.json()
    const exit = parseFloat(body.exitPrice)
    const result = await closeTrade(
      id,
      exit,
      body.mae ? parseFloat(body.mae) : null,
      body.mfe ? parseFloat(body.mfe) : null,
    )
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
