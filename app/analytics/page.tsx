import { AnalyticsClient } from '@/components/analytics/AnalyticsClient'
import { getAnalyticsData } from '@/lib/data/analytics'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()
  return <AnalyticsClient data={data} />
}
