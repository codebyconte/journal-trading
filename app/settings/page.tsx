import { SettingsClient } from '@/components/settings/SettingsClient'
import { getSettings, getCapitalAdjustments } from '@/lib/data/settings'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const [settings, adjustments] = await Promise.all([
    getSettings(),
    getCapitalAdjustments(),
  ])
  return <SettingsClient settings={settings} adjustments={adjustments} />
}
