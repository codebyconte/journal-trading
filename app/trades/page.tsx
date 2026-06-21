import { TradesClient } from '@/components/trades/TradesClient'
import { getTrades } from '@/lib/data/trades'
import { getSettings } from '@/lib/data/settings'

export const dynamic = 'force-dynamic'

export default async function TradesPage() {
  const [{ trades }, settings] = await Promise.all([
    getTrades({ limit: 200 }),
    getSettings(),
  ])

  return <TradesClient trades={trades} settings={settings} />
}
