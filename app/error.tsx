'use client'

import Link from 'next/link'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4 p-6">
      <AlertTriangle size={32} className="text-loss" aria-hidden="true" />
      <h2 className="text-lg font-bold text-text-primary">Une erreur est survenue</h2>
      <p className="max-w-md text-center text-sm text-text-secondary">
        {error.message || 'Impossible de charger cette page. Réessaie ou retourne au dashboard.'}
      </p>
      <button
        type="button"
        onClick={reset}
        className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <RefreshCw size={14} aria-hidden="true" />
        Réessayer
      </button>
      <Link href="/" className="text-sm text-accent hover:underline">
        Retour au dashboard
      </Link>
    </div>
  )
}
