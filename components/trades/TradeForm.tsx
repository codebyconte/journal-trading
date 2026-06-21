'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Calculator, Upload, X, CheckCircle2, AlertCircle, Camera, AlertTriangle, TrendingUp, TrendingDown, Shield, Target } from 'lucide-react'
import { cn, calculateUnits, calculatePlannedRR, formatNumber } from '@/lib/utils'
import { createTrade } from '@/app/actions/trades'
import { TRADE_SETUPS, MARKET_CONDITIONS, SESSION_TIMES, PRESET_ASSETS, type TradeDirection } from '@/lib/types'

interface Props {
  currentCapital: number
  riskPercent: number
  onSuccess: () => void
}

const CHECKLIST_LONG = [
  {
    key: 'checkEMA',
    label: 'Ruban EMA validé — prix sur EMA 50 ou 200 par le dessus + bougie 4H confirmée (fermée)',
    desc: 'Bull market : EMA 20 > 50 > 100 > 200 toutes haussières. N\'entrer qu\'au retest par le dessus (support), jamais en No Man\'s Land.',
    required: true,
  },
  {
    key: 'checkRSI',
    label: 'RSI < 60 (long) — divergence haussière vérifiée sur 4H',
    desc: 'Divergence haussière = prix nouveau creux + RSI creux moins profond. RSI > 65 au moment d\'entrer = surachat, R/R dégradé. Précision 68% BTC 4H 2020-2024.',
    required: true,
  },
  {
    key: 'checkVolume',
    label: 'Volume Profile POC identifié + volume de rebond > 120% de la moyenne',
    desc: 'FRVP depuis dernier ATH/ATL. POC valide seulement s\'il coïncide avec une EMA (double confluence). OBV monte ou accumulation cachée (OBV monte + prix stagne).',
    required: true,
  },
  {
    key: 'checkLiquid',
    label: 'CryptoQuant long : Whale Ratio < 0.85 + Funding Rate < 0.03% + Exchange Reserve en baisse',
    desc: 'Whale Ratio < 0.85 (pas de distribution), Funding Rate entre -0.01% et +0.03% (pas de sur-leverage), Exchange Reserve baissière, SSR bas = 3/3 confluence long. Si Funding Rate > 0.05% → 73% de correction dans 72h (CryptoQuant 2024) = pas de long.',
    required: true,
  },
  {
    key: 'checkUnlocks',
    label: 'Arkham Intel : aucune alerte gouvernement / whale hostile dans les 4 dernières heures',
    desc: 'Gouvernement ≥ $50M vers exchange = pas de long ce jour. CEX Deposit ≥ $20M = vérifier Whale Ratio avant de conclure. Aucune alerte adverse = continue.',
    required: true,
  },
  {
    key: 'checkTVL',
    label: 'Macro OK — pas d\'événement rouge Forex Factory dans les 24h + DXY/QQQ favorables',
    desc: 'FOMC / CPI dans les 24h = pas de trade. QQQ au-dessus EMA 200 + DXY faible = conditions favorables. QQQ sous EMA 200 = taille réduite 30%.',
    required: true,
  },
] as const

const CHECKLIST_SHORT = [
  {
    key: 'checkEMA',
    label: 'Ruban EMA validé — prix sous EMA 50 ou 200 + retest résistance par le dessous confirmé',
    desc: 'Bear market : EMA 20 < 50 < 100 < 200 toutes baissières. Entrée uniquement sur retest de résistance EMA par le dessous (le prix a cassé, remonte tester, rejette). Jamais en No Man\'s Land.',
    required: true,
  },
  {
    key: 'checkRSI',
    label: 'RSI > 40 (short) — divergence baissière vérifiée sur 4H',
    desc: 'Divergence régulière baissière = prix nouveau sommet + RSI sommet moins élevé. RSI < 35 au moment d\'entrer = survente, R/R dégradé, évite le short. Précision 68% BTC 4H 2020-2024.',
    required: true,
  },
  {
    key: 'checkVolume',
    label: 'Volume Profile POC comme résistance + volume de rejection > 120% de la moyenne',
    desc: 'FRVP depuis dernier ATH/ATL. POC comme résistance seulement s\'il coïncide avec une EMA. OBV en baisse ou distribution cachée (OBV descend + prix monte = vente institutionnelle).',
    required: true,
  },
  {
    key: 'checkLiquid',
    label: 'CryptoQuant short : Whale Ratio ≥ 0.85 + Funding Rate > 0.03% + Exchange Reserve montante',
    desc: 'Whale Ratio ≥ 0.85 (distribution), Funding Rate > 0.03% (longs sur-représentés = pression vendeuse mécanique imminent), Exchange Reserve montante. 3/3 = setup short validé. Si Funding Rate < -0.02% → squeeze haussier possible → évite le short.',
    required: true,
  },
  {
    key: 'checkUnlocks',
    label: 'Arkham Intel : alerte gouvernement/whale confirmée + Whale Ratio ≥ 0.85 (signal short actif)',
    desc: 'Gouvernement ≥ $50M + Whale Ratio ≥ 0.85 + structure 4H baissière (LH/LL) = signal short actionnable. CEX Deposit ≥ $20M seul sans Whale Ratio = pas de trade. La confluence est obligatoire.',
    required: true,
  },
  {
    key: 'checkTVL',
    label: 'Macro confirmée baissière — DXY fort et/ou QQQ sous EMA 200 weekly',
    desc: 'DXY au-dessus EMA 50 et montant = vent de face crypto = favorable aux shorts. QQQ sous EMA 200 = régime baissier institutionnel. FOMC / CPI dans les 24h = pas de trade même short.',
    required: true,
  },
] as const

type ChecklistKey = (typeof CHECKLIST_LONG)[number]['key']

export function TradeForm({ currentCapital, riskPercent, onSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    datetime: new Date().toISOString().slice(0, 16),
    asset: '',
    direction: 'LONG' as TradeDirection,
    orderType: 'LIMITE',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    units: '',
    levier: '3',
    setup: '',
    marketCondition: '',
    emotionScore: '4',
    sessionTime: '',
    notes: '',
    invalidations: '',
  })

  const [checklist, setChecklist] = useState<Record<ChecklistKey, boolean>>({
    checkEMA: false,
    checkRSI: false,
    checkVolume: false,
    checkLiquid: false,
    checkUnlocks: false,
    checkTVL: false,
  })

  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculs automatiques
  const [autoCalc, setAutoCalc] = useState({
    units: 0,
    riskAmount: 0,
    plannedRR: 0,
    riskPercent: riskPercent,
  })

  const recalculate = useCallback(() => {
    const entry = parseFloat(form.entryPrice)
    const sl = parseFloat(form.stopLoss)
    const tp = parseFloat(form.takeProfit)

    if (!isNaN(entry) && !isNaN(sl) && entry > 0 && sl > 0) {
      const { units, riskAmount } = calculateUnits(
        currentCapital,
        riskPercent,
        entry,
        sl,
        form.direction,
      )
      const plannedRR =
        !isNaN(tp) && tp > 0
          ? calculatePlannedRR(entry, sl, tp, form.direction)
          : 0

      setAutoCalc({ units, riskAmount, plannedRR, riskPercent })

      // Auto-remplir les unités si pas encore modifiées
      setForm((prev) => ({
        ...prev,
        units: units > 0 ? formatNumber(units, 4) : prev.units,
      }))
    }
  }, [form.entryPrice, form.stopLoss, form.takeProfit, form.direction, currentCapital, riskPercent])

  useEffect(() => {
    recalculate()
  }, [recalculate])

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    setScreenshot(file)
    const url = URL.createObjectURL(file)
    setScreenshotPreview(url)
  }

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) handleFile(file)
        break
      }
    }
  }, [])

  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  const activeChecklist = form.direction === 'SHORT' ? CHECKLIST_SHORT : CHECKLIST_LONG

  const allRequiredChecked = activeChecklist.filter((c) => c.required).every(
    (c) => checklist[c.key],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!allRequiredChecked) {
      setError('Valide les 6 confluences obligatoires avant de soumettre. C\'est le protocole.')
      return
    }
    if (!form.invalidations.trim()) {
      setError('Liste tes 3 raisons d\'invalidation (champ requis du protocole).')
      return
    }
    if (parseInt(form.emotionScore) <= 2) {
      setError('État émotionnel ≤ 2/5 — pas de trade selon le protocole. Reviens demain.')
      return
    }
    if (autoCalc.plannedRR > 0 && autoCalc.plannedRR < 2) {
      setError(`R/R planifié = 1:${autoCalc.plannedRR.toFixed(1)} — minimum protocole 1:2, idéal 1:3. Ajuste ton Take Profit.`)
      return
    }
    if (autoCalc.plannedRR > 0 && autoCalc.plannedRR < 3) {
      if (!confirm(`R/R = 1:${autoCalc.plannedRR.toFixed(1)} — protocole recommande 1:3 minimum. Continuer ?`)) return
    }

    setLoading(true)
    try {
      let screenshotUrl: string | null = null
      if (screenshot) {
        const fd = new FormData()
        fd.append('file', screenshot)
        const res = await fetch('/api/uploads', { method: 'POST', body: fd })
        const data = await res.json()
        screenshotUrl = data.url
      }

      const notesWithInvalidations = `${form.notes ? form.notes + '\n\n' : ''}[Invalidation]\n${form.invalidations}`

      const result = await createTrade({
        ...form,
        notes: notesWithInvalidations,
        ...checklist,
        units: autoCalc.units || parseFloat(form.units),
        riskAmount: autoCalc.riskAmount,
        riskPercent,
        screenshot: screenshotUrl,
        direction: form.direction as 'LONG' | 'SHORT',
        orderType: form.orderType as 'LIMITE' | 'STOP',
      })

      if (!result.success) throw new Error(result.error)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du trade')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-md border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-muted transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30'
  const labelClass = 'mb-1.5 block text-sm font-semibold uppercase tracking-wide text-text-secondary'

  const applyTakeProfitR = (multiplier: number) => {
    const entry = parseFloat(form.entryPrice)
    const sl = parseFloat(form.stopLoss)
    if (isNaN(entry) || isNaN(sl)) return
    const risk = form.direction === 'LONG' ? entry - sl : sl - entry
    if (risk <= 0) return
    const tp = form.direction === 'LONG' ? entry + risk * multiplier : entry - risk * multiplier
    setForm((prev) => ({ ...prev, takeProfit: tp.toFixed(4) }))
  }

  const levierNum = parseInt(form.levier) || 1
  const positionValue = autoCalc.units * parseFloat(form.entryPrice || '0')
  const marginRequired = levierNum > 0 ? positionValue / levierNum : 0
  const marginPct = currentCapital > 0 ? (marginRequired / currentCapital) * 100 : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Bandeau protocole */}
      <div className="flex items-start gap-3 rounded-xl border border-accent/25 bg-accent/5 px-4 py-3">
        <Shield size={18} className="text-accent flex-shrink-0 mt-0.5" />
        <div className="text-sm text-text-secondary leading-relaxed">
          <span className="font-bold text-text-primary">Swing 4H — Ordre Limite uniquement.</span>{' '}
          MTF aligné (Weekly→Daily→4H) · Bougie 4H fermée · SL+TP posés ensemble · Marge isolée · Levier 2-3x max.
        </div>
      </div>

      {/* Row 1: Date, Actif, Direction, Ordre */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <label className={labelClass}>Date / Heure</label>
          <input
            type="datetime-local"
            value={form.datetime}
            onChange={(e) => setForm({ ...form, datetime: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Actif</label>
          <div className="flex gap-1.5 flex-wrap mb-1.5">
            {PRESET_ASSETS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setForm({ ...form, asset: a })}
                className={cn(
                  'rounded px-2 py-0.5 text-sm font-mono font-semibold transition-all',
                  form.asset === a
                    ? 'bg-accent text-white'
                    : 'border border-border text-text-muted hover:border-accent/50 hover:text-text-secondary',
                )}
              >
                {a}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="ou saisir manuellement..."
            value={form.asset}
            onChange={(e) => setForm({ ...form, asset: e.target.value.toUpperCase() })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Direction</label>
          <div className="flex gap-2">
            {(['LONG', 'SHORT'] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => setForm({ ...form, direction: dir })}
                className={cn(
                  'flex-1 rounded-md border py-2 text-sm font-semibold transition-all',
                  form.direction === dir
                    ? dir === 'LONG'
                      ? 'border-profit bg-profit-dim text-profit'
                      : 'border-loss bg-loss-dim text-loss'
                    : 'border-border text-text-muted hover:border-border-strong',
                )}
              >
                <span className="inline-flex items-center gap-1.5">
                  {dir === 'LONG' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {dir}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Type d'ordre</label>
          <div className="flex gap-2">
            {(['LIMITE', 'STOP'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm({ ...form, orderType: type })}
                className={cn(
                  'flex-1 rounded-md border py-2 text-sm font-semibold transition-all',
                  form.orderType === type
                    ? 'border-accent bg-accent-dim text-accent'
                    : 'border-border text-text-muted hover:border-border-strong',
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Prix */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Prix d'entrée ($)</label>
          <input
            type="number"
            step="any"
            placeholder="0.00"
            value={form.entryPrice}
            onChange={(e) => setForm({ ...form, entryPrice: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Stop Loss ($)</label>
          <input
            type="number"
            step="any"
            placeholder="0.00"
            value={form.stopLoss}
            onChange={(e) => setForm({ ...form, stopLoss: e.target.value })}
            className={cn(inputClass, 'focus:border-loss focus:ring-loss/30')}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Take Profit ($)</label>
          <input
            type="number"
            step="any"
            placeholder="0.00"
            value={form.takeProfit}
            onChange={(e) => setForm({ ...form, takeProfit: e.target.value })}
            className={cn(inputClass, 'focus:border-profit focus:ring-profit/30')}
            required
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              { r: 2, label: 'TP @ 2R' },
              { r: 3, label: 'TP @ 3R (protocole)' },
            ].map(({ r, label }) => (
              <button
                key={r}
                type="button"
                onClick={() => applyTakeProfitR(r)}
                disabled={!form.entryPrice || !form.stopLoss}
                className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-text-secondary hover:border-accent hover:text-accent disabled:opacity-40"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-calculateur */}
      {autoCalc.units > 0 && (
        <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent">
            <Calculator size={14} />
            Calculateur de position automatique
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div>
              <p className="text-sm text-text-muted">Unités</p>
              <p className="font-mono text-lg font-bold text-text-primary">
                {formatNumber(autoCalc.units, 4)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Risque (1%)</p>
              <p className="font-mono text-lg font-bold text-loss">
                ${formatNumber(autoCalc.riskAmount, 2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">R/R Planifié</p>
              <p
                className={cn(
                  'font-mono text-lg font-bold',
                  autoCalc.plannedRR >= 3 ? 'text-profit' : autoCalc.plannedRR >= 2 ? 'text-neutral' : 'text-loss',
                )}
              >
                {autoCalc.plannedRR > 0 ? `1:${autoCalc.plannedRR.toFixed(1)}` : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Taille position</p>
              <p className="font-mono text-lg font-bold text-text-primary">
                ${formatNumber(positionValue, 2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Marge ({levierNum}x)</p>
              <p className="font-mono text-lg font-bold text-accent">
                ${formatNumber(marginRequired, 2)}
              </p>
              <p className="text-xs text-text-muted">{marginPct.toFixed(1)}% capital</p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Distance SL</p>
              <p className="font-mono text-lg font-bold text-text-secondary">
                {form.entryPrice && form.stopLoss
                  ? `${Math.abs((parseFloat(form.entryPrice) - parseFloat(form.stopLoss)) / parseFloat(form.entryPrice) * 100).toFixed(2)}%`
                  : '—'}
              </p>
            </div>
          </div>
          {autoCalc.plannedRR > 0 && autoCalc.plannedRR < 2 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-loss">
              <AlertCircle size={12} />
              R/R insuffisant — minimum 1:2, protocole exige 1:3. Utilise les boutons TP @ 2R / @ 3R.
            </div>
          )}
        </div>
      )}

      {/* Contexte */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div>
          <label className={labelClass}>Setup</label>
          <select
            value={form.setup}
            onChange={(e) => setForm({ ...form, setup: e.target.value })}
            className={inputClass}
          >
            <option value="">— Sélectionner —</option>
            {TRADE_SETUPS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Condition de marché</label>
          <select
            value={form.marketCondition}
            onChange={(e) => setForm({ ...form, marketCondition: e.target.value })}
            className={inputClass}
          >
            <option value="">— Sélectionner —</option>
            {MARKET_CONDITIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Session</label>
          <select
            value={form.sessionTime}
            onChange={(e) => setForm({ ...form, sessionTime: e.target.value })}
            className={inputClass}
          >
            <option value="">— Sélectionner —</option>
            {SESSION_TIMES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* État émotionnel — échelle protocole 1-5 */}
      <div>
        <label className={labelClass}>
          Règle Zéro — État émotionnel (protocole exige ≥ 3/5)
        </label>
        <div className="grid grid-cols-5 gap-2">
          {[
            { score: '1', label: '1/5', desc: 'Anxieux / Stressé / En colère', color: 'border-loss bg-loss-dim text-loss' },
            { score: '2', label: '2/5', desc: 'Fatigué / Biais émotionnel', color: 'border-loss/50 text-loss' },
            { score: '3', label: '3/5', desc: 'Neutre / Calme', color: 'border-neutral bg-neutral-dim text-neutral' },
            { score: '4', label: '4/5', desc: 'Concentré / Lucide', color: 'border-profit/50 text-profit' },
            { score: '5', label: '5/5', desc: 'Optimal / Reposé', color: 'border-profit bg-profit-dim text-profit' },
          ].map((e) => (
            <button
              key={e.score}
              type="button"
              onClick={() => setForm({ ...form, emotionScore: e.score })}
              className={cn(
                'rounded-md border p-2 text-center transition-all',
                form.emotionScore === e.score ? e.color : 'border-border text-text-muted hover:border-border-strong',
              )}
            >
              <p className="text-sm font-bold">{e.label}</p>
              <p className="text-sm leading-tight mt-0.5">{e.desc}</p>
            </button>
          ))}
        </div>
        {parseInt(form.emotionScore) <= 2 && (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-loss/30 bg-loss-dim px-3 py-2 text-sm text-loss">
            <AlertCircle size={14} />
            Protocole : état émotionnel ≤ 2/5 → pas de trade aujourd'hui. Données Edgewonk (2024) : win rate 23% inférieur en état anxieux.
          </div>
        )}
      </div>

      {/* Checklist protocole 7 niveaux */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={labelClass}>
            Checklist Protocole — 6 Confluences Obligatoires
          </label>
          <span className={cn('text-sm font-semibold', allRequiredChecked ? 'text-profit' : 'text-loss')}>
            {activeChecklist.filter((c) => checklist[c.key]).length}/{activeChecklist.length} validés
          </span>
        </div>
        <div className="rounded-lg border border-border bg-bg-surface divide-y divide-border">
          {activeChecklist.map((item, idx) => (
            <label
              key={item.key}
              className={cn(
                'flex cursor-pointer items-start gap-3 px-3 py-3 transition-colors hover:bg-bg-hover',
                checklist[item.key] && 'bg-profit-dim/20',
              )}
            >
              <input
                type="checkbox"
                checked={checklist[item.key]}
                onChange={(e) =>
                  setChecklist({ ...checklist, [item.key]: e.target.checked })
                }
                className="mt-1 h-4 w-4 rounded accent-profit flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-text-muted">0{idx + 1}</span>
                  <span className={cn('text-sm font-medium', checklist[item.key] ? 'text-text-primary' : 'text-text-secondary')}>
                    {item.label}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-text-muted leading-relaxed">{item.desc}</p>
              </div>
              {checklist[item.key] ? (
                <CheckCircle2 size={16} className="mt-1 flex-shrink-0 text-profit" />
              ) : (
                <AlertCircle size={14} className="mt-1 flex-shrink-0 text-loss opacity-60" />
              )}
            </label>
          ))}
        </div>
        {!allRequiredChecked && (
          <p className="mt-2 flex items-center gap-2 text-sm text-loss">
            <Target size={14} />
            Protocole non respecté — les 6 confluences sont obligatoires. Consulte /protocol si doute.
          </p>
        )}
      </div>

      {/* 3 raisons d'invalidation — obligatoire protocole */}
      <div>
        <label className={labelClass}>
          3 Raisons d'Invalidation <span className="text-loss">* obligatoire</span>
        </label>
        <p className="mb-2 text-sm text-text-muted">
          Protocole Van Tharp : avant d'entrer, identifie 3 scénarios qui prouvent que tu as tort.
          Exemple : "1. Si la bougie 4H clôture sous l'EMA 50. 2. Si le Whale Ratio passe {'>'} 0.90. 3. Si le volume est inférieur à la moyenne."
        </p>
        <textarea
          placeholder="1. Si...\n2. Si...\n3. Si..."
          value={form.invalidations}
          onChange={(e) => setForm({ ...form, invalidations: e.target.value })}
          rows={3}
          className={cn(inputClass, 'resize-none font-mono text-sm')}
          required
        />
      </div>

      {/* Levier + notes */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className={labelClass}>Levier (max 5x)</label>
          <div className="flex gap-1.5">
            {['1', '2', '3', '5'].map((lev) => (
              <button
                key={lev}
                type="button"
                onClick={() => setForm({ ...form, levier: lev })}
                className={cn(
                  'flex-1 rounded-md border py-2 text-sm font-mono font-semibold transition-all',
                  form.levier === lev
                    ? 'border-accent bg-accent-dim text-accent'
                    : 'border-border text-text-muted hover:border-border-strong',
                )}
              >
                {lev}x
              </button>
            ))}
          </div>
          {parseInt(form.levier) > 3 && (
            <p className="mt-1 text-sm text-neutral">Protocole recommande 2-3x max.</p>
          )}
        </div>
        <div className="col-span-3">
          <label className={labelClass}>Notes & Observations</label>
          <textarea
            placeholder="Contexte, observations, état d'esprit..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            className={cn(inputClass, 'resize-none')}
          />
        </div>
      </div>

      {/* Screenshot */}
      <div>
        <label className={labelClass}>Capture d'écran TradingView</label>
        <div
          className={cn(
            'relative rounded-lg border-2 border-dashed border-border transition-colors hover:border-accent/50',
            screenshotPreview && 'border-accent/30',
          )}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
        >
          {screenshotPreview ? (
            <div className="relative">
              <Image
                src={screenshotPreview}
                alt="Screenshot"
                width={800}
                height={400}
                unoptimized
                className="max-h-64 w-full rounded-lg object-contain"
              />
              <button
                type="button"
                onClick={() => { setScreenshot(null); setScreenshotPreview(null) }}
                className="absolute right-2 top-2 rounded-full bg-bg-elevated p-1 text-text-muted hover:text-loss"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center gap-2 py-8 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={24} className="text-text-muted" />
              <p className="text-sm text-text-secondary">
                Glisse, colle (Ctrl+V) ou clique pour uploader
              </p>
              <p className="text-sm text-text-muted">PNG, JPG, WEBP</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-loss/30 bg-loss-dim px-4 py-3 text-sm text-loss">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !allRequiredChecked}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-base font-semibold tracking-wide transition-all',
          allRequiredChecked && form.invalidations.trim() && parseInt(form.emotionScore) >= 3
            ? 'bg-accent text-white hover:bg-accent/90 active:scale-[0.99]'
            : 'cursor-not-allowed bg-bg-elevated text-text-muted',
        )}
      >
        {loading ? (
          'Enregistrement...'
        ) : allRequiredChecked ? (
          <>
            <CheckCircle2 size={18} />
            Enregistrer le Trade (Protocole validé)
          </>
        ) : (
          <>
            <AlertTriangle size={18} />
            Protocole incomplet
          </>
        )}
      </button>
    </form>
  )
}
