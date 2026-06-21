import { NextResponse } from 'next/server'
import { getDashboardStats } from '@/lib/data/dashboard'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await getDashboardStats()
    return NextResponse.json(stats)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
