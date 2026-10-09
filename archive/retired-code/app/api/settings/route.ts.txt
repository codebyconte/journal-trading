import { NextResponse } from 'next/server'
import { getSettings } from '@/lib/data/settings'
import { updateSettings } from '@/app/actions/settings'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await getSettings()
    return NextResponse.json(settings)
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const result = await updateSettings({
      initialCapital: body.initialCapital,
      currentCapital: body.currentCapital,
      riskPercent: body.riskPercent,
    })
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    const settings = await getSettings()
    return NextResponse.json(settings)
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
