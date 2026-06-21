'use client'

import { useState, useTransition } from 'react'
import { PageShell } from '@/components/ui/PageShell'
import { useRouter } from 'next/navigation'
import { Save, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/catalyst/button'
import { Field, FieldGroup, Label, Description } from '@/components/catalyst/fieldset'
import { Input } from '@/components/catalyst/input'
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

  const riskPercent = parseFloat(form.riskPercent) || 1
  const capital = parseFloat(form.currentCapital) || 100000

  return (
    <PageShell>
      <PageHeader
        title="Paramètres"
        description="Configuration du protocole de gestion du risque"
      />

      <Card>
        <CardHeader>
          <CardTitle>Capital & Risque</CardTitle>
        </CardHeader>
        <FieldGroup>
          <Field>
            <Label htmlFor="initial-capital">Capital Initial ($)</Label>
            <Description>Montant de départ. Ne change pas automatiquement.</Description>
            <Input
              id="initial-capital"
              name="initialCapital"
              type="number"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              step="any"
              value={form.initialCapital}
              onChange={(e) => setForm({ ...form, initialCapital: e.target.value })}
            />
          </Field>

          <Field>
            <Label htmlFor="current-capital">Capital Actuel ($)</Label>
            <Description>
              Mis à jour automatiquement à chaque trade clôturé. Modifie manuellement si nécessaire.
            </Description>
            <Input
              id="current-capital"
              name="currentCapital"
              type="number"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              step="any"
              value={form.currentCapital}
              onChange={(e) => setForm({ ...form, currentCapital: e.target.value })}
            />
          </Field>

          <Field>
            <Label htmlFor="risk-percent">Risque par trade (%)</Label>
            <Input
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
            />
            {riskPercent > 2 && (
              <Description className="flex items-center gap-2 text-red-500 dark:text-red-400">
                <AlertTriangle data-slot="icon" className="size-3.5 shrink-0" aria-hidden="true" />
                Risque élevé. Les meilleurs traders risquent 0.5% à 1% par trade.
              </Description>
            )}
          </Field>

          <div className="rounded-lg bg-indigo-500/5 p-4 ring-1 ring-indigo-500/20">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">Aperçu calcul</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-zinc-500">Risque par trade</p>
                <p className="font-mono font-semibold text-red-400">
                  {formatCurrency(capital * riskPercent / 100)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Après 5 pertes consécutives</p>
                <p className="font-mono font-semibold text-red-400">
                  -{formatCurrency(capital * riskPercent / 100 * 5)} ({(riskPercent * 5).toFixed(1)}%)
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Objectif +2R par trade</p>
                <p className="font-mono font-semibold text-emerald-400">
                  +{formatCurrency(capital * riskPercent / 100 * 2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Objectif +3R par trade</p>
                <p className="font-mono font-semibold text-emerald-400">
                  +{formatCurrency(capital * riskPercent / 100 * 3)}
                </p>
              </div>
            </div>
          </div>

          <Button
            type="button"
            onClick={save}
            disabled={saving || isPending}
            color={saved ? 'green' : 'indigo'}
            aria-live="polite"
          >
            {saving ? (
              <>
                <RefreshCw data-slot="icon" className="animate-spin" aria-hidden="true" /> Sauvegarde…
              </>
            ) : saved ? (
              <>
                <CheckCircle2 data-slot="icon" aria-hidden="true" /> Sauvegardé
              </>
            ) : (
              <>
                <Save data-slot="icon" aria-hidden="true" /> Sauvegarder
              </>
            )}
          </Button>
        </FieldGroup>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rappel — Règles Protocole Swing 4H</CardTitle>
        </CardHeader>
        <div className="space-y-2 text-sm">
          {[
            { rule: 'Risque max par trade', value: '1% du capital', color: 'text-emerald-400' },
            { rule: 'R/R minimum', value: '1.5R (idéal ≥ 2R)', color: 'text-amber-400' },
            { rule: 'Timeframe principal', value: '4H + confirmation 1H', color: 'text-indigo-400' },
            { rule: "Pas d'ordre Market", value: 'Limite ou Stop uniquement', color: 'text-zinc-400' },
            { rule: 'Checklist confluences', value: '5/6 obligatoires', color: 'text-zinc-400' },
            { rule: 'Stop loss', value: 'Jamais déplacer en perte', color: 'text-red-400' },
            { rule: '3 pertes consécutives', value: 'Arrêter la session', color: 'text-red-400' },
          ].map((item) => (
            <div key={item.rule} className="flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-white/5">
              <span className="text-zinc-400">{item.rule}</span>
              <span className={cn('font-semibold', item.color)}>{item.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  )
}
