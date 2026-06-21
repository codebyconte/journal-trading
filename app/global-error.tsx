'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'
import { inter } from '@/lib/fonts'
import { Button } from '@/components/catalyst/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fr" className={`dark ${inter.variable}`}>
      <body className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 p-6 font-sans text-white antialiased">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
          <AlertTriangle className="size-8 text-red-400" aria-hidden="true" />
        </div>
        <div className="max-w-md space-y-2 text-center">
          <h1 className="text-xl font-semibold">Erreur critique</h1>
          <p className="text-sm text-zinc-400">
            {error.message || "Une erreur inattendue s'est produite."}
          </p>
        </div>
        <Button color="indigo" onClick={reset}>
          <RefreshCw data-slot="icon" className="size-4" aria-hidden="true" />
          Réessayer
        </Button>
      </body>
    </html>
  )
}
