'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { SystemState } from '@/components/ui/SystemState'
import { Button } from '@/components/catalyst/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <SystemState
      icon={<AlertTriangle className="size-8 text-red-400" aria-hidden="true" />}
      title="Une erreur est survenue"
      description={error.message || 'Impossible de charger cette page. Réessaie ou retourne au dashboard.'}
    >
      <Button color="indigo" onClick={reset}>
        <RefreshCw data-slot="icon" className="size-4" aria-hidden="true" />
        Réessayer
      </Button>
      <Button href="/" outline>
        Retour au dashboard
      </Button>
    </SystemState>
  )
}
