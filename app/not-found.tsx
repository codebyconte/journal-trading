import Link from 'next/link'
import { BarChart3 } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 p-6">
      <BarChart3 size={40} className="text-accent opacity-80" />
      <h2 className="text-xl font-bold text-text-primary">Page introuvable</h2>
      <p className="text-sm text-text-secondary">La ressource demandée n&apos;existe pas.</p>
      <Link
        href="/"
        className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
      >
        Retour au dashboard
      </Link>
    </div>
  )
}
