import { BarChart3 } from 'lucide-react'
import { SystemState } from '@/components/ui/SystemState'
import { Button } from '@/components/catalyst/button'

export default function NotFound() {
  return (
    <SystemState
      icon={<BarChart3 className="size-8 text-indigo-400" aria-hidden="true" />}
      title="Page introuvable"
      description="La ressource demandée n'existe pas ou a été déplacée."
    >
      <Button href="/" color="indigo">
        Retour au dashboard
      </Button>
    </SystemState>
  )
}
