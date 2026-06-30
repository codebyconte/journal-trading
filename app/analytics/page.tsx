import { AnalyticsClient } from '@/components/analytics/AnalyticsClient'
import { getAnalyticsData } from '@/lib/data/analytics'
import { getSettings } from '@/lib/data/settings'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const [data, settings] = await Promise.all([getAnalyticsData(), getSettings()])
  return <AnalyticsClient data={data} riskPercent={settings.riskPercent} />
}
