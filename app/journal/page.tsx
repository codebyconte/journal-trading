import { JournalClient } from '@/components/journal/JournalClient'
import { getJournalEntries } from '@/lib/data/journal'
import { getTrades } from '@/lib/data/trades'

export const dynamic = 'force-dynamic'

export default async function JournalPage() {
  const [entries, { trades }] = await Promise.all([
    getJournalEntries(90),
    getTrades({ limit: 200 }),
  ])

  return <JournalClient initialEntries={entries} initialTrades={trades} />
}
