'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Save, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import type { Settings } from '@/lib/types'
import { formatCurrency, cn } from '@/lib/utils'
import { updateSettings } from '@/app/actions/settings'

interface SettingsClientProps {
  settings: Settings
}

export function SettingsClient({ settings: initialSettings }: SettingsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    initialCapital: String(initialSettings.initialCapital),
    currentCapital: String(initialSettings.currentCapital),
    riskPercent: String(initialSettings.riskPercent),
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const refresh = () => startTransition(() => router.refresh())

  const save = async () => {
    setSaving(true)
    try {
      const result = await updateSettings({
        initialCapital: parseFloat(form.initialCapital),
        currentCapital: parseFloat(form.currentCapital),
        riskPercent: parseFloat(form.riskPercent),
      })
      if (!result.success) return
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      refresh()
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full rounded-md border border-border bg-bg-surface px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40'
  const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-muted'

  const riskPercent = parseFloat(form.riskPercent) || 1
  const capital = parseFloat(form.currentCapital) || 100000

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Paramètres</h1>
        <p className="text-sm text-text-muted">Configuration du protocole de gestion du risque</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Capital & Risque</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="initial-capital" className={labelClass}>Capital Initial ($)</label>
            <input
              id="initial-capital"
              name="initialCapital"
              type="number"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              step="any"
              value={form.initialCapital}
              onChange={(e) => setForm({ ...form, initialCapital: e.target.value })}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-text-muted">Montant de départ. Ne change pas automatiquement.</p>
          </div>

          <div>
            <label htmlFor="current-capital" className={labelClass}>Capital Actuel ($)</label>
            <input
              id="current-capital"
              name="currentCapital"
              type="number"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              step="any"
              value={form.currentCapital}
              onChange={(e) => setForm({ ...form, currentCapital: e.target.value })}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-text-muted">
              Mis à jour automatiquement à chaque trade clôturé. Modifie manuellement si nécessaire.
            </p>
          </div>

          <div>
            <label htmlFor="risk-percent" className={labelClass}>Risque par trade (%)</label>
            <input
              id="risk-percent"
              name="riskPercent"
              type="number"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              step="0.1"
              min="0.1"
              max="5"
              value={form.riskPercent}
              onChange={(e) => setForm({ ...form, riskPercent: e.target.value })}
              className={inputClass}
            />
            {riskPercent > 2 && (
              <div className="mt-1.5 flex items-center gap-2 text-xs text-loss">
                <AlertTriangle size={12} />
                Risque élevé. Les meilleurs traders risquent 0.5% à 1% par trade.
              </div>
            )}
          </div>

          {/* Aperçu */}
          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent">Aperçu calcul</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-text-muted">Risque par trade</p>
                <p className="font-mono font-semibold text-loss">
                  {formatCurrency(capital * riskPercent / 100)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Après 5 pertes consécutives</p>
                <p className="font-mono font-semibold text-loss">
                  -{formatCurrency(capital * riskPercent / 100 * 5)} ({(riskPercent * 5).toFixed(1)}%)
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Objectif +2R par trade</p>
                <p className="font-mono font-semibold text-profit">
                  +{formatCurrency(capital * riskPercent / 100 * 2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Objectif +3R par trade</p>
                <p className="font-mono font-semibold text-profit">
                  +{formatCurrency(capital * riskPercent / 100 * 3)}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            aria-live="polite"
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors',
              saved ? 'bg-profit text-white' : 'bg-accent text-white hover:bg-accent/90',
            )}
          >
            {saving ? (
              <><RefreshCw size={14} className="animate-spin" aria-hidden="true" /> Sauvegarde…</>
            ) : saved ? (
              <><CheckCircle2 size={16} aria-hidden="true" /> Sauvegardé</>
            ) : (
              <><Save size={14} aria-hidden="true" /> Sauvegarder</>
            )}
          </button>
        </div>
      </Card>

      {/* Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Rappel — Règles Protocole Swing 4H</CardTitle>
        </CardHeader>
        <div className="space-y-2 text-sm">
          {[
            { rule: 'Risque max par trade',     value: '1% du capital',           color: 'text-profit' },
            { rule: 'R/R minimum',              value: '1.5R (idéal ≥ 2R)',       color: 'text-neutral' },
            { rule: 'Timeframe principal',      value: '4H + confirmation 1H',    color: 'text-accent' },
            { rule: "Pas d'ordre Market",       value: 'Limite ou Stop uniquement', color: 'text-text-secondary' },
            { rule: 'Checklist confluences',    value: '5/6 obligatoires',        color: 'text-text-secondary' },
            { rule: 'Stop loss',                value: 'Jamais déplacer en perte', color: 'text-loss' },
            { rule: '3 pertes consécutives',    value: 'Arrêter la session',      color: 'text-loss' },
          ].map((item) => (
            <div key={item.rule} className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-bg-hover transition-colors">
              <span className="text-text-secondary">{item.rule}</span>
              <span className={cn('font-semibold', item.color)}>{item.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
