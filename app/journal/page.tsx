import { JournalClient } from '@/components/journal/JournalClient'
import { getJournalEntries } from '@/lib/data/journal'
import { getTrades } from '@/lib/data/trades'
import { getSettings } from '@/lib/data/settings'

export const dynamic = 'force-dynamic'

export default async function JournalPage() {
  const [entries, { trades }, settings] = await Promise.all([
    getJournalEntries(365),
    getTrades({ limit: 200 }),
    getSettings(),
  ])

  return (
    <JournalClient
      initialEntries={entries}
      initialTrades={trades}
      riskPercent={settings.riskPercent}
    />
  )
}
