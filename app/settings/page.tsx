import { SettingsClient } from '@/components/settings/SettingsClient'
import { getSettings } from '@/lib/data/settings'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const settings = await getSettings()
  return <SettingsClient settings={settings} />
}
