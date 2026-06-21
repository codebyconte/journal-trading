'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0b0f] p-6 text-[#F8FAFC]">
        <AlertTriangle size={36} className="text-[#F87171]" />
        <h2 className="text-xl font-bold">Erreur critique</h2>
        <p className="max-w-md text-center text-sm text-[#94A3B8]">
          {error.message || 'Une erreur inattendue s&apos;est produite.'}
        </p>
        <button type="button" onClick={reset} className="flex items-center gap-2 rounded-xl bg-[#6366f1] px-4 py-2 text-sm font-semibold text-white">
          <RefreshCw size={14} />
          Réessayer
        </button>
      </body>
    </html>
  )
}
