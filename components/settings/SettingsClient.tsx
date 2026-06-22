'use client'

import { useState, useTransition } from 'react'
import { PageShell } from '@/components/ui/PageShell'
import { useRouter } from 'next/navigation'
import { Save, RefreshCw, AlertTriangle, CheckCircle2, Plus, Minus, RotateCcw, Calculator } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/catalyst/button'
import { Field, FieldGroup, Label, Description } from '@/components/catalyst/fieldset'
import { Input } from '@/components/catalyst/input'
import { Textarea } from '@/components/catalyst/textarea'
import type { Settings, CapitalAdjustment } from '@/lib/types'
import { formatCurrency, cn, formatDateTime } from '@/lib/utils'
import { updateSettings, adjustCapital, recalculateCapital, resetJournal } from '@/app/actions/settings'

interface SettingsClientProps {
  settings: Settings
  adjustments: CapitalAdjustment[]
}

export function SettingsClient({ settings: initialSettings, adjustments: initialAdjustments }: SettingsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    initialCapital: String(initialSettings.initialCapital),
    currentCapital: String(initialSettings.currentCapital),
    riskPercent: String(initialSettings.riskPercent),
  })
  const [depositAmount, setDepositAmount] = useState('')
  const [depositNote, setDepositNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const refresh = () => startTransition(() => router.refresh())

  const showMessage = (msg: string) => {
    setActionMessage(msg)
    setTimeout(() => setActionMessage(null), 3000)
  }

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

  const handleDeposit = async (positive: boolean) => {
    const amount = parseFloat(depositAmount)
    if (!amount || amount <= 0) return
    const signed = positive ? amount : -amount
    const result = await adjustCapital({ amount: signed, note: depositNote || (positive ? 'Dépôt' : 'Retrait') })
    if (result.success) {
      setDepositAmount('')
      setDepositNote('')
      setForm((f) => ({
        ...f,
        currentCapital: String(parseFloat(f.currentCapital) + signed),
      }))
      showMessage(positive ? 'Dépôt enregistré' : 'Retrait enregistré')
      refresh()
    } else {
      showMessage(result.error ?? 'Erreur lors de l\'ajustement')
    }
  }

  const handleRecalculate = async () => {
    const result = await recalculateCapital()
    if (result.success && result.capital != null) {
      setForm((f) => ({ ...f, currentCapital: String(result.capital) }))
      showMessage(`Capital recalculé : ${formatCurrency(result.capital)}`)
      refresh()
    }
  }

  const handleReset = async () => {
    const capital = parseFloat(form.initialCapital) || initialSettings.initialCapital
    if (
      !confirm(
        `⚠️ RÉINITIALISATION COMPLÈTE\n\nCela va :\n• Supprimer TOUS les trades\n• Remettre le capital à ${formatCurrency(capital)}\n\nCette action est irréversible. Continuer ?`,
      )
    ) {
      return
    }
    const result = await resetJournal({ resetCapitalTo: capital, deleteAdjustments: true })
    if (result.success) {
      setForm((f) => ({ ...f, currentCapital: String(capital) }))
      showMessage('Journal réinitialisé')
      refresh()
    }
  }

  const riskPercent = parseFloat(form.riskPercent) || 1
  const capital = parseFloat(form.currentCapital) || 100000
  const initialCapital = parseFloat(form.initialCapital) || 100000

  return (
    <PageShell>
      <PageHeader
        title="Paramètres"
        description="Configuration du protocole de gestion du risque"
      />

      {actionMessage && (
        <div className={cn(
          'mb-4 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm',
          actionMessage.includes('Erreur')
            ? 'border-red-500/30 bg-red-500/10 text-red-400'
            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        )}>
          {actionMessage.includes('Erreur') ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          {actionMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Comprendre le risque 1%</CardTitle>
        </CardHeader>
        <div className="space-y-3 text-sm text-zinc-400">
          <p>
            Le <strong className="text-white">1% de risque</strong> = la <strong className="text-red-400">perte maximale si ton Stop Loss est touché</strong>, pas la taille de ta position.
          </p>
          <p>
            Exemple avec {formatCurrency(initialCapital)} de capital et {riskPercent}% de risque :
            tu perds max <strong className="text-red-400">{formatCurrency(initialCapital * riskPercent / 100)}</strong> au SL.
            Tu peux utiliser tout ton capital (ou plus avec levier) en position — tant que la distance entrée→SL × taille = cette perte max.
          </p>
          <p className="rounded-lg bg-zinc-900/80 px-3 py-2 font-mono text-xs text-zinc-300">
            Unités = ({formatCurrency(capital)} × {riskPercent}%) ÷ distance SL
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Capital & Risque</CardTitle>
        </CardHeader>
        <FieldGroup>
          <Field>
            <Label htmlFor="initial-capital">Capital Initial ($)</Label>
            <Description>Montant de départ. Ne change pas automatiquement (sauf réinitialisation).</Description>
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
              Mis à jour à chaque trade clôturé et à chaque dépôt/retrait. Modifiable manuellement si besoin.
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
          <CardTitle>Dépôt / Retrait</CardTitle>
        </CardHeader>
        <FieldGroup>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Quand tu ajoutes de l&apos;argent sur ton compte, enregistre-le ici. Le capital actuel augmente et ton risque 1% sera recalculé sur le nouveau montant.
          </p>
          <Field>
            <Label>Montant ($)</Label>
            <Input
              type="number"
              step="any"
              min="0"
              placeholder="500"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
          </Field>
          <Field>
            <Label>Note (optionnel)</Label>
            <Textarea
              resizable={false}
              rows={1}
              placeholder="Ex : virement Binance, salaire..."
              value={depositNote}
              onChange={(e) => setDepositNote(e.target.value)}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button type="button" color="green" onClick={() => handleDeposit(true)} disabled={!depositAmount}>
              <Plus data-slot="icon" aria-hidden="true" /> Dépôt
            </Button>
            <Button type="button" {...{ outline: true as const }} onClick={() => handleDeposit(false)} disabled={!depositAmount}>
              <Minus data-slot="icon" aria-hidden="true" /> Retrait
            </Button>
          </div>
          {initialAdjustments.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-xs font-semibold uppercase text-zinc-500">Historique récent</p>
              {initialAdjustments.map((adj) => (
                <div key={adj.id} className="flex justify-between text-sm text-zinc-400">
                  <span>{formatDateTime(adj.createdAt)}{adj.note ? ` — ${adj.note}` : ''}</span>
                  <span className={cn('font-mono font-semibold', adj.amount >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                    {adj.amount >= 0 ? '+' : ''}{formatCurrency(adj.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </FieldGroup>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance du journal</CardTitle>
        </CardHeader>
        <FieldGroup>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Supprimer un trade individuel : page Trades → icône poubelle (le P&amp;L est automatiquement retiré du capital si le trade était clôturé).
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" {...{ outline: true as const }} onClick={handleRecalculate}>
              <Calculator data-slot="icon" aria-hidden="true" /> Recalculer le capital
            </Button>
            <Button type="button" {...{ outline: true as const }} onClick={handleReset}>
              <RotateCcw data-slot="icon" aria-hidden="true" /> Recommencer à zéro
            </Button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Recalculer = capital initial + somme des P&amp;L clôturés + dépôts/retraits. Utile si le capital a dérivé.
          </p>
        </FieldGroup>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rappel — Règles Protocole Swing 4H</CardTitle>
        </CardHeader>
        <div className="space-y-2 text-sm">
          {[
            { rule: 'Risque max par trade', value: '1% du capital', color: 'text-emerald-400' },
            { rule: 'R/R minimum', value: '1:2 (idéal 1:3)', color: 'text-amber-400' },
            { rule: 'Timeframe principal', value: 'Weekly → Daily → 4H', color: 'text-indigo-400' },
            { rule: "Pas d'ordre Market", value: 'Limite ou Stop uniquement', color: 'text-zinc-400' },
            { rule: 'Checklist confluences', value: '7/7 (6/7 = taille 0.5%)', color: 'text-zinc-400' },
            { rule: 'Stop loss', value: 'Jamais déplacer en perte', color: 'text-red-400' },
            { rule: '3 pertes consécutives', value: 'Arrêter la session', color: 'text-red-400' },
            { rule: 'Violation des règles', value: 'Mode journal honnête (formulaire trade)', color: 'text-red-400' },
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
