import { NextResponse } from 'next/server'
import { getAnalyticsData } from '@/lib/data/analytics'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await getAnalyticsData()
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
