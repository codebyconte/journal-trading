'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Image from 'next/image'
import { Calculator, X, CheckCircle2, AlertCircle, Camera, AlertTriangle, TrendingUp, TrendingDown, Shield, Target } from 'lucide-react'
import { cn, calculateUnits, calculatePlannedRR, calculateStopLossFromATR, estimateLiquidationPrice, formatNumber, isStopLossSaferThanLiquidation, validateTradePrices } from '@/lib/utils'
import {
  isCoinglassApplicable,
  getConfluenceTone,
  getConfluenceMax,
  formatConfluenceScore,
  getEffectiveRiskPercent,
  getMissingConfluenceKeys,
  getDirectionRegimeBlock,
  CONFLUENCE_KEY_LABELS,
  getProtocolViolations,
  MIN_PLANNED_RR,
  ATR_SL_MULTIPLIER,
  normalizeMarketRegime,
} from '@/lib/analytics'
import { createTrade } from '@/app/actions/trades'
import { CalloutBanner } from '@/components/ui/SystemState'
import { Button } from '@/components/catalyst/button'
import { Badge } from '@/components/catalyst/badge'
import { Field, FieldGroup, Label, Description } from '@/components/catalyst/fieldset'
import { Input } from '@/components/catalyst/input'
import { Select } from '@/components/catalyst/select'
import { Textarea } from '@/components/catalyst/textarea'
import { Checkbox, CheckboxField, CheckboxGroup } from '@/components/catalyst/checkbox'
import { TRADE_SETUPS, MARKET_CONDITIONS, SESSION_TIMES, PRESET_ASSETS, type TradeDirection } from '@/lib/types'

interface Props {
  currentCapital: number
  riskPercent: number
  openTradeCount?: number
  onSuccess: () => void
}

const BBW_CHECK = {
  key: 'checkBBW' as const,
  label: 'BBW au-dessus de sa moyenne 20 bougies — tendance active (pas de compression)',
  desc: 'Bollinger Band Width > moyenne 20 bougies = trend following autorisé. En dessous = marché latéral → cash ou taille 0.5% max (R5).',
  required: true,
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
  BBW_CHECK,
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
  {
    key: 'checkCoinglass',
    label: 'Coinglass long : Funding Rate < 0.08% + Long/Short < 65/35 + chemin TP dégagé + OI CME stable',
    desc: 'Funding Rate > 0.08% = excès de longs, 73% de correction dans 72h → pas de long. Long/Short > 65% longs = trop de monde dans le même sens = signal contrarian. Vérifie que la Liquidation Heatmap ne montre pas de zone dense entre entrée et TP. OI CME stable ou en hausse = institutionnels constructifs.',
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
  BBW_CHECK,
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
  {
    key: 'checkCoinglass',
    label: 'Coinglass short : Funding Rate > 0.08% + Long/Short > 65/35 + zones de liquidation longs sous le prix',
    desc: 'Funding Rate > 0.08% = excès de longs qui vont se faire liquider → force vendeuse mécanique. Long/Short > 65% de longs = majorité dans le même sens = contrarian favorable au short. La Liquidation Heatmap doit montrer des zones de liquidation de longs entre le prix actuel et ton TP (aimant baissier). OI CME en baisse = institutionnels baissiers.',
    required: true,
  },
] as const

type ChecklistKey = (typeof CHECKLIST_LONG)[number]['key']

export function TradeForm({ currentCapital, riskPercent, openTradeCount = 0, onSuccess }: Props) {
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
    atr: '',
  })

  const [checklist, setChecklist] = useState<Record<ChecklistKey, boolean>>({
    checkEMA: false,
    checkRSI: false,
    checkVolume: false,
    checkBBW: false,
    checkLiquid: false,
    checkUnlocks: false,
    checkTVL: false,
    checkCoinglass: false,
  })

  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [protocolOverride, setProtocolOverride] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [customRiskPercent, setCustomRiskPercent] = useState('')

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
      const riskCtx = {
        ...checklist,
        asset: form.asset || '',
        direction: form.direction,
        marketCondition: form.marketCondition || null,
      }
      const protocolRisk = getEffectiveRiskPercent(riskPercent, riskCtx)
      let riskForCalc: number
      if (protocolOverride) {
        const custom = parseFloat(customRiskPercent)
        riskForCalc = !isNaN(custom) && custom > 0 ? custom : riskPercent
      } else {
        riskForCalc = protocolRisk ?? riskPercent
      }
      const { units, riskAmount } = calculateUnits(
        currentCapital,
        riskForCalc,
        entry,
        sl,
        form.direction,
      )
      const plannedRR =
        !isNaN(tp) && tp > 0
          ? calculatePlannedRR(entry, sl, tp, form.direction)
          : 0

      setAutoCalc({ units, riskAmount, plannedRR, riskPercent: riskForCalc })

      // Auto-remplir les unités si pas encore modifiées
      setForm((prev) => ({
        ...prev,
        units: units > 0 ? formatNumber(units, 4) : prev.units,
      }))
    }
  }, [form.entryPrice, form.stopLoss, form.takeProfit, form.direction, form.asset, form.marketCondition, currentCapital, riskPercent, checklist, protocolOverride, customRiskPercent])

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

  // Coinglass s'applique uniquement aux crypto perpetuels (pas aux indices SPX/QQQ)
  const isCryptoAsset = !form.asset || isCoinglassApplicable(form.asset)

  const confluenceTrade = useMemo(
    () => ({
      ...checklist,
      asset: form.asset || '',
      direction: form.direction,
      marketCondition: form.marketCondition || null,
    }),
    [checklist, form.asset, form.direction, form.marketCondition],
  )

  const confluenceMax = getConfluenceMax(form.asset || '')
  const confluenceTone = getConfluenceTone(confluenceTrade)
  const confluenceLabel = formatConfluenceScore(confluenceTrade)
  const effectiveRiskPercent = getEffectiveRiskPercent(riskPercent, confluenceTrade)
  const missingConfluenceKeys = getMissingConfluenceKeys(confluenceTrade)
  const regimeBlock = getDirectionRegimeBlock(confluenceTrade)
  const marketRegime = normalizeMarketRegime(form.marketCondition)

  const canSubmitConfluence = confluenceTone !== 'low' && effectiveRiskPercent !== null && !regimeBlock

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!protocolOverride) {
      if (regimeBlock) {
        setError(regimeBlock)
        return
      }
      if (!canSubmitConfluence || effectiveRiskPercent === null) {
        setError(
          `Confluence ou régime insuffisant (${confluenceLabel}) — minimum ${confluenceMax - 1}/${confluenceMax} pour taille réduite (0.5%). Active le mode journal honnête si tu veux quand même enregistrer.`,
        )
        return
      }
      if (confluenceTone === 'partial') {
        const missingLabels = missingConfluenceKeys.map((k) => CONFLUENCE_KEY_LABELS[k]).join(', ')
        if (
          !confirm(
            `Confluence ${confluenceLabel} — taille réduite à ${effectiveRiskPercent}% (protocole : ${confluenceMax - 1}/${confluenceMax} = 0.5%).\n\nConfluence manquante : ${missingLabels}\n\nContinuer avec la taille réduite ?`,
          )
        ) {
          return
        }
      }
      if (parseInt(form.emotionScore) <= 2) {
        setError('État émotionnel ≤ 2/5 — pas de trade selon le protocole. Active le mode journal honnête si tu veux quand même enregistrer.')
        return
      }
    } else {
      if (!overrideReason.trim() || overrideReason.trim().length < 10) {
        setError('Mode journal honnête : explique pourquoi tu violates le protocole (minimum 10 caractères).')
        return
      }
      const violations = getProtocolViolations(
        {
          ...checklist,
          asset: form.asset || '',
          riskPercent: autoCalc.riskPercent,
          plannedRR: autoCalc.plannedRR,
          emotionScore: parseInt(form.emotionScore),
          direction: form.direction,
          marketCondition: form.marketCondition || null,
          protocolOverride: false,
        },
        riskPercent,
      )
      if (
        !confirm(
          `⚠️ MODE JOURNAL HONNÊTE\n\nTu enregistres un trade HORS protocole :\n${violations.map((v) => `• ${v.label}`).join('\n')}\n\nRaison : ${overrideReason.trim()}\n\nCe trade sera marqué en ROUGE dans tout le journal pour analyse. Continuer ?`,
        )
      ) {
        return
      }
    }
    // Invalidations : avertissement non-bloquant (recommandé mais pas obligatoire)
    if (!form.invalidations.trim()) {
      if (!confirm('Aucune raison d\'invalidation renseignée.\n\nVan Tharp recommande d\'identifier 3 scénarios "j\'ai tort" avant chaque trade. Continuer sans ?')) return
    }

    const entry = parseFloat(form.entryPrice)
    const sl = parseFloat(form.stopLoss)
    const tp = parseFloat(form.takeProfit)
    const priceError = validateTradePrices(entry, sl, tp, form.direction)
    if (priceError) {
      setError(priceError)
      return
    }

    const levierSubmit = parseInt(form.levier) || 1
    const liqPrice = estimateLiquidationPrice(entry, form.direction, levierSubmit)
    if (liqPrice != null && !isStopLossSaferThanLiquidation(entry, sl, liqPrice, form.direction)) {
      setError(
        `Levier ${levierSubmit}x trop élevé : liquidation estimée à $${formatNumber(liqPrice, 2)} — plus proche de l'entrée que ton SL. Réduis le levier (protocole : liquidation ≥ 2× l'écart SL).`,
      )
      return
    }

    if (autoCalc.plannedRR > 0 && autoCalc.plannedRR < MIN_PLANNED_RR) {
      if (protocolOverride) {
        if (!confirm(`R/R planifié = 1:${autoCalc.plannedRR.toFixed(1)} — minimum protocole 1:${MIN_PLANNED_RR}. Enregistrer quand même en mode journal honnête ?`)) return
      } else {
        setError(`R/R planifié = 1:${autoCalc.plannedRR.toFixed(1)} — minimum protocole 1:${MIN_PLANNED_RR}. Ajuste ton Take Profit (bouton TP @ 3R).`)
        return
      }
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

      const partialPrefix =
        confluenceTone === 'partial' && !protocolOverride
          ? `[Taille réduite] Confluence ${confluenceLabel} — risque ${effectiveRiskPercent}% (protocole ${confluenceMax - 1}/${confluenceMax})\n`
          : ''
      const overridePrefix = protocolOverride
        ? `[⚠️ VIOLATION PROTOCOLE] ${overrideReason.trim()}\n`
        : ''
      const notesWithInvalidations = `${overridePrefix}${partialPrefix}${form.notes ? form.notes + '\n\n' : ''}[Invalidation]\n${form.invalidations}`

      const submitRiskPercent = protocolOverride ? autoCalc.riskPercent : (effectiveRiskPercent ?? autoCalc.riskPercent)

      const result = await createTrade({
        ...form,
        notes: notesWithInvalidations,
        ...checklist,
        units: autoCalc.units || parseFloat(form.units),
        riskAmount: autoCalc.riskAmount,
        riskPercent: submitRiskPercent,
        protocolOverride,
        overrideReason: protocolOverride ? overrideReason.trim() : null,
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

  const applyTakeProfitR = (multiplier: number) => {
    const entry = parseFloat(form.entryPrice)
    const sl = parseFloat(form.stopLoss)
    if (isNaN(entry) || isNaN(sl)) return
    const risk = form.direction === 'LONG' ? entry - sl : sl - entry
    if (risk <= 0) return
    const tp = form.direction === 'LONG' ? entry + risk * multiplier : entry - risk * multiplier
    setForm((prev) => ({ ...prev, takeProfit: tp.toFixed(4) }))
  }

  const applyStopLossFromATR = () => {
    const entry = parseFloat(form.entryPrice)
    const atr = parseFloat(form.atr)
    if (isNaN(entry) || isNaN(atr)) return
    const sl = calculateStopLossFromATR(entry, atr, form.direction, ATR_SL_MULTIPLIER)
    if (sl == null) return
    setForm((prev) => ({ ...prev, stopLoss: sl.toFixed(4) }))
  }

  const levierNum = parseInt(form.levier) || 1
  const entryNum = parseFloat(form.entryPrice || '0')
  const slNum = parseFloat(form.stopLoss || '0')
  const positionValue = autoCalc.units * entryNum
  const marginRequired = levierNum > 0 ? positionValue / levierNum : 0
  const marginPct = currentCapital > 0 ? (marginRequired / currentCapital) * 100 : 0
  const liquidationPrice =
    entryNum > 0 && levierNum > 0
      ? estimateLiquidationPrice(entryNum, form.direction, levierNum)
      : null
  const slSaferThanLiq =
    liquidationPrice != null && slNum > 0
      ? isStopLossSaferThanLiquidation(entryNum, slNum, liquidationPrice, form.direction)
      : true
  const priceValidationError =
    entryNum > 0 && slNum > 0
      ? validateTradePrices(entryNum, slNum, parseFloat(form.takeProfit || '0'), form.direction)
      : null

  const canSubmit =
    (openTradeCount === 0 || protocolOverride) &&
    (protocolOverride || (canSubmitConfluence && effectiveRiskPercent !== null && parseInt(form.emotionScore) >= 3)) &&
    !priceValidationError &&
    slSaferThanLiq &&
    autoCalc.units > 0 &&
    (!protocolOverride || overrideReason.trim().length >= 10)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {openTradeCount > 0 && !protocolOverride && (
        <CalloutBanner tone="amber" icon={<AlertTriangle data-slot="icon" className="size-5 text-amber-400" aria-hidden="true" />}>
          <span className="font-semibold text-amber-200">Un trade est déjà actif ({openTradeCount})</span>
          <p className="mt-1 text-sm">R14 : un seul actif à la fois. Clôture ou annule le trade existant avant d&apos;en ouvrir un nouveau.</p>
        </CalloutBanner>
      )}

      <CalloutBanner
        tone="indigo"
        icon={<Shield data-slot="icon" className="size-5 text-indigo-400" aria-hidden="true" />}
      >
        <span className="font-semibold text-white">Swing 4H — Ordre Limite uniquement.</span>{' '}
        MTF aligné (Weekly→Daily→4H) · Bougie 4H fermée · SL ATR×1.5 · TP 50%@3R + trailing EMA 20 · Levier 2-5x max.
      </CalloutBanner>

      {/* Row 1: Date, Actif, Direction, Ordre */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Field>
          <Label>Date / Heure</Label>
          <Input
            type="datetime-local"
            value={form.datetime}
            onChange={(e) => setForm({ ...form, datetime: e.target.value })}
            required
          />
        </Field>
        <Field>
          <Label>Actif</Label>
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            {PRESET_ASSETS.map((a) => (
              <Button
                key={a}
                type="button"
                {...(form.asset === a ? { color: 'indigo' as const } : { plain: true as const })}
                onClick={() => setForm({ ...form, asset: a })}
                className="px-2 py-0.5 font-mono text-sm"
              >
                {a}
              </Button>
            ))}
          </div>
          <Input
            type="text"
            placeholder="ou saisir manuellement..."
            value={form.asset}
            onChange={(e) => setForm({ ...form, asset: e.target.value.toUpperCase() })}
            required
          />
        </Field>
        <Field>
          <Label>Direction</Label>
          <div className="flex gap-2">
            {(['LONG', 'SHORT'] as const).map((dir) => (
              <Button
                key={dir}
                type="button"
                onClick={() => setForm({ ...form, direction: dir })}
                {...(form.direction === dir
                  ? dir === 'LONG'
                    ? { color: 'emerald' as const }
                    : { color: 'red' as const }
                  : { outline: true as const })}
                className="flex-1"
              >
                <span className="inline-flex items-center gap-1.5">
                  {dir === 'LONG' ? <TrendingUp data-slot="icon" className="size-4" /> : <TrendingDown data-slot="icon" className="size-4" />}
                  {dir}
                </span>
              </Button>
            ))}
          </div>
        </Field>
        <Field>
          <Label>Type d&apos;ordre</Label>
          <div className="flex gap-2">
            {(['LIMITE', 'STOP'] as const).map((type) => (
              <Button
                key={type}
                type="button"
                onClick={() => setForm({ ...form, orderType: type })}
                {...(form.orderType === type ? { color: 'indigo' as const } : { outline: true as const })}
                className="flex-1"
              >
                {type}
              </Button>
            ))}
          </div>
        </Field>
      </div>

      {/* Row 2: Prix */}
      <div className="grid grid-cols-3 gap-4">
        <Field>
          <Label>Prix d&apos;entrée ($)</Label>
          <Input
            type="number"
            step="any"
            placeholder="0.00"
            value={form.entryPrice}
            onChange={(e) => setForm({ ...form, entryPrice: e.target.value })}
            required
          />
        </Field>
        <Field>
          <Label>Stop Loss ($)</Label>
          <Input
            type="number"
            step="any"
            placeholder="0.00"
            value={form.stopLoss}
            onChange={(e) => setForm({ ...form, stopLoss: e.target.value })}
            required
          />
        </Field>
        <Field>
          <Label>Take Profit ($)</Label>
          <Input
            type="number"
            step="any"
            placeholder="0.00"
            value={form.takeProfit}
            onChange={(e) => setForm({ ...form, takeProfit: e.target.value })}
            required
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[
              { r: MIN_PLANNED_RR, label: `TP @ ${MIN_PLANNED_RR}R (protocole)` },
            ].map(({ r, label }) => (
              <Button
                key={r}
                type="button"
                outline
                onClick={() => applyTakeProfitR(r)}
                disabled={!form.entryPrice || !form.stopLoss}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        </Field>
      </div>

      {/* ATR — Stop Loss dynamique */}
      <Field>
        <Label>ATR 14 (4H) — Stop Loss dynamique</Label>
        <Description>
          Saisis l&apos;ATR depuis TradingView. SL = entrée ± (ATR × {ATR_SL_MULTIPLIER}). Taille = (capital × risque%) ÷ (ATR × {ATR_SL_MULTIPLIER}).
        </Description>
        <div className="flex max-w-lg flex-wrap gap-2">
          <Input
            type="number"
            step="any"
            placeholder="Ex: 800"
            value={form.atr}
            onChange={(e) => setForm({ ...form, atr: e.target.value })}
            className="max-w-[140px] font-mono"
          />
          <Button
            type="button"
            outline
            onClick={applyStopLossFromATR}
            disabled={!form.entryPrice || !form.atr}
            className="text-sm"
          >
            Calculer SL @ ATR×{ATR_SL_MULTIPLIER}
          </Button>
        </div>
      </Field>

      {/* Levier — avant le calculateur pour que la marge soit à jour */}
      <Field>
        <Label>Levier Hyperliquid — marge isolée (protocole : 2-3x, max 5x)</Label>
        <div className="flex max-w-md gap-2">
          {['1', '2', '3', '5'].map((lev) => (
            <Button
              key={lev}
              type="button"
              onClick={() => setForm({ ...form, levier: lev })}
              {...(form.levier === lev ? { color: 'indigo' as const } : { outline: true as const })}
              className="flex-1 font-mono"
            >
              {lev}x
            </Button>
          ))}
        </div>
        <Description>
          La taille de position est fixée par le risque ({riskPercent}% du capital = perte max au SL), pas par le levier.
          Ex. avec {formatNumber(currentCapital, 0)}$ de capital et {riskPercent}% de risque, tu perds max {formatNumber(currentCapital * riskPercent / 100, 2)}$ si le SL est touché — même si la position notionnelle vaut bien plus (levier).
        </Description>
      </Field>

      {priceValidationError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={16} />
          {priceValidationError}
        </div>
      )}

      {/* Auto-calculateur */}
      {autoCalc.units > 0 && (
        <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-indigo-400">
            <Calculator size={14} />
            Calculateur de position automatique
          </div>
          <p className="text-xs text-zinc-500 font-mono leading-relaxed">
            Formule : Risque {autoCalc.riskPercent}% = ${formatNumber(autoCalc.riskAmount, 2)} ÷ distance SL ({formatNumber(Math.abs(entryNum - slNum), 2)}$) = {formatNumber(autoCalc.units, 4)} unités × ${formatNumber(entryNum, 2)} = ${formatNumber(positionValue, 2)} notionnel
            {confluenceTone === 'partial' && (
              <span className="text-amber-400"> · Taille réduite ({confluenceLabel})</span>
            )}
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            <div>
              <p className="text-sm text-zinc-500">Unités (taille coin)</p>
              <p className="font-mono text-lg font-bold text-white">
                {formatNumber(autoCalc.units, 4)}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">
                Perte max au SL ({autoCalc.riskPercent}%)
                {confluenceTone === 'partial' && <span className="text-amber-400"> — réduit</span>}
              </p>
              <p className="font-mono text-lg font-bold text-red-400">
                ${formatNumber(autoCalc.riskAmount, 2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">R/R Planifié</p>
              <p
                className={cn(
                  'font-mono text-lg font-bold',
                  autoCalc.plannedRR >= MIN_PLANNED_RR ? 'text-emerald-400' : 'text-red-400',
                )}
              >
                {autoCalc.plannedRR > 0 ? `1:${autoCalc.plannedRR.toFixed(1)}` : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Distance SL</p>
              <p className="font-mono text-lg font-bold text-zinc-400">
                {entryNum > 0 && slNum > 0
                  ? `${Math.abs((entryNum - slNum) / entryNum * 100).toFixed(2)}%`
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Notionnel (exposition)</p>
              <p className="font-mono text-lg font-bold text-white">
                ${formatNumber(positionValue, 2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Marge requise ({levierNum}x)</p>
              <p className={cn('font-mono text-lg font-bold', marginPct > 25 ? 'text-red-400' : 'text-indigo-400')}>
                ${formatNumber(marginRequired, 2)}
              </p>
              <p className={cn('text-xs', marginPct > 25 ? 'text-red-400' : 'text-zinc-500')}>
                {marginPct.toFixed(1)}% du capital
              </p>
            </div>
            {liquidationPrice != null && (
              <div>
                <p className="text-sm text-zinc-500">Liquidation estimée</p>
                <p className={cn('font-mono text-lg font-bold', slSaferThanLiq ? 'text-zinc-400' : 'text-red-400')}>
                  ${formatNumber(liquidationPrice, 2)}
                </p>
                <p className={cn('text-xs', slSaferThanLiq ? 'text-emerald-400' : 'text-red-400')}>
                  {slSaferThanLiq ? 'SL avant liquidation ✓' : 'Levier trop élevé ✗'}
                </p>
              </div>
            )}
          </div>
          {!slSaferThanLiq && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle size={12} />
              Réduis le levier : la liquidation serait touchée avant ton Stop Loss (règle Hyperliquid du protocole).
            </div>
          )}
          {marginPct > 25 && slSaferThanLiq && (
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <AlertCircle size={12} />
              Marge {'>'} 25% du capital — augmente le levier ou réduis la distance SL si possible.
            </div>
          )}
          {autoCalc.plannedRR > 0 && autoCalc.plannedRR < MIN_PLANNED_RR && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle size={12} />
              R/R insuffisant — minimum 1:{MIN_PLANNED_RR}. Utilise le bouton TP @ {MIN_PLANNED_RR}R (50% position @ 3R + 50% trailing EMA 20).
            </div>
          )}
        </div>
      )}

      {/* Contexte */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Field>
          <Label>Setup</Label>
          <Select
            value={form.setup}
            onChange={(e) => setForm({ ...form, setup: e.target.value })}
          >
            <option value="">— Sélectionner —</option>
            {TRADE_SETUPS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label>Condition de marché (régime)</Label>
          <Select
            value={form.marketCondition}
            onChange={(e) => setForm({ ...form, marketCondition: e.target.value })}
          >
            <option value="">— Sélectionner —</option>
            {MARKET_CONDITIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </Select>
          {marketRegime === 'BULL' && form.direction === 'SHORT' && (
            <Description className="text-amber-400">
              Short en bull : exception stricte — minimum {confluenceMax - 3}/{confluenceMax} confluences, max 0.5% sauf {confluenceMax}/{confluenceMax}.
            </Description>
          )}
          {marketRegime === 'BEAR' && form.direction === 'LONG' && (
            <Description className="text-red-400">
              Long interdit en bear market (R11) — privilégier shorts ou cash.
            </Description>
          )}
          {marketRegime === 'LATERAL' && (
            <Description className="text-amber-400">
              Marché latéral — cash recommandé ou taille max 0.5%.
            </Description>
          )}
        </Field>
        <Field>
          <Label>Session</Label>
          <Select
            value={form.sessionTime}
            onChange={(e) => setForm({ ...form, sessionTime: e.target.value })}
          >
            <option value="">— Sélectionner —</option>
            {SESSION_TIMES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </Field>
      </div>

      {/* État émotionnel — échelle protocole 1-5 */}
      <Field>
        <Label>Règle Zéro — État émotionnel (protocole exige ≥ 3/5)</Label>
        <div className="grid grid-cols-5 gap-2">
          {[
            { score: '1', label: '1/5', desc: 'Anxieux / Stressé / En colère', color: 'red' as const },
            { score: '2', label: '2/5', desc: 'Fatigué / Biais émotionnel', color: 'red' as const },
            { score: '3', label: '3/5', desc: 'Neutre / Calme', color: 'amber' as const },
            { score: '4', label: '4/5', desc: 'Concentré / Lucide', color: 'emerald' as const },
            { score: '5', label: '5/5', desc: 'Optimal / Reposé', color: 'emerald' as const },
          ].map((e) => (
            <Button
              key={e.score}
              type="button"
              onClick={() => setForm({ ...form, emotionScore: e.score })}
              {...(form.emotionScore === e.score ? { color: e.color } : { outline: true as const })}
              className="h-auto flex-col p-2 text-center"
            >
              <span className="text-sm font-bold">{e.label}</span>
              <span className="mt-0.5 text-sm leading-tight font-normal">{e.desc}</span>
            </Button>
          ))}
        </div>
        {parseInt(form.emotionScore) <= 2 && (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            <AlertCircle size={14} />
            Protocole : état émotionnel ≤ 2/5 → pas de trade aujourd&apos;hui. Données Edgewonk (2024) : win rate 23% inférieur en état anxieux.
          </div>
        )}
      </Field>

      {/* Checklist protocole 7 niveaux */}
      <Field>
        <div className="mb-2 flex items-center justify-between">
          <Label>
            Checklist Protocole —{' '}
            {isCryptoAsset
              ? `${confluenceMax}/${confluenceMax} = 1% · ${confluenceMax - 1}/${confluenceMax} = 0.5%`
              : `${confluenceMax}/${confluenceMax} = 1% · ${confluenceMax - 1}/${confluenceMax} = 0.5% (Coinglass N/A)`}
          </Label>
          <Badge
            color={
              confluenceTone === 'full' ? 'emerald' : confluenceTone === 'partial' ? 'amber' : 'red'
            }
          >
            {confluenceLabel} validés
          </Badge>
        </div>
        <CheckboxGroup className="divide-y divide-white/10 overflow-hidden rounded-xl bg-zinc-900/80 ring-1 ring-white/10">
          {activeChecklist.map((item, idx) => {
            const isNotApplicable = item.key === 'checkCoinglass' && !isCryptoAsset
            return (
            <CheckboxField
              key={item.key}
              className={cn(
                'px-3 py-3 transition-colors hover:bg-white/5',
                checklist[item.key] && 'bg-emerald-500/10',
                isNotApplicable && 'opacity-40',
              )}
            >
              <Checkbox
                color="emerald"
                checked={checklist[item.key]}
                disabled={isNotApplicable}
                onChange={(checked) =>
                  setChecklist({ ...checklist, [item.key]: checked })
                }
              />
              <Label>
                <span className="inline-flex w-full items-start gap-2">
                  <span className="text-sm font-mono text-zinc-500">0{idx + 1}</span>
                  <span className={cn('min-w-0 flex-1 text-sm font-medium', checklist[item.key] ? 'text-white' : isNotApplicable ? 'text-zinc-600 line-through' : 'text-zinc-400')}>
                    {item.label}
                    {isNotApplicable && <span className="ml-2 text-xs font-normal text-zinc-600 no-underline">(non applicable aux indices)</span>}
                  </span>
                  {isNotApplicable ? null : checklist[item.key] ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400 opacity-60" />
                  )}
                </span>
              </Label>
              <Description>{item.desc}</Description>
            </CheckboxField>
            )
          })}
        </CheckboxGroup>
        {confluenceTone === 'partial' && (
          <CalloutBanner tone="amber" icon={<AlertTriangle data-slot="icon" className="size-5 text-amber-400" aria-hidden="true" />}>
            <span className="font-semibold text-white">Taille réduite — {confluenceLabel}</span>
            <p className="mt-1">
              Une confluence manque ({missingConfluenceKeys.map((k) => CONFLUENCE_KEY_LABELS[k]).join(', ')}).
              Risque automatiquement réduit à <strong className="text-amber-300">{effectiveRiskPercent}%</strong> au lieu de {riskPercent}%.
              Confirmation requise à l&apos;enregistrement.
            </p>
          </CalloutBanner>
        )}
        {confluenceTone === 'low' && (
          <p className="mt-2 flex items-center gap-2 text-sm text-red-400">
            <Target size={14} />
            Confluence insuffisante ({confluenceLabel}) — minimum {confluenceMax - 1}/{confluenceMax} pour taille réduite. Pas de trade.
          </p>
        )}
        {confluenceTone === 'full' && (
          <p className="mt-2 flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 size={14} />
            Confluence complète ({confluenceLabel}) — taille normale {riskPercent}%.
          </p>
        )}
      </Field>

      {/* 3 raisons d'invalidation — fortement recommandé */}
      <Field>
        <Label>
          3 Raisons d&apos;Invalidation{' '}
          <span className="font-normal normal-case tracking-normal text-amber-400">— recommandé (Van Tharp)</span>
        </Label>
        <Description>
          Avant d&apos;entrer, identifie 3 scénarios qui prouvent que tu as tort.
          Ex : &quot;1. Si la bougie 4H clôture sous l&apos;EMA 50. 2. Si le Whale Ratio passe {'>'} 0.90. 3. Si le volume est inférieur à la moyenne.&quot; Si vide, une confirmation sera demandée.
        </Description>
        <Textarea
          resizable={false}
          placeholder={'1. Si...\n2. Si...\n3. Si...'}
          value={form.invalidations}
          onChange={(e) => setForm({ ...form, invalidations: e.target.value })}
          rows={3}
          className="font-mono text-sm"
        />
        {!form.invalidations.trim() && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-400">
            <AlertTriangle size={12} />
            Recommandé : liste 3 raisons d&apos;invalidation pour objectiver ton analyse.
          </p>
        )}
      </Field>

      {/* Notes */}
      <Field>
        <Label>Notes & Observations</Label>
        <Textarea
          resizable={false}
          placeholder="Contexte, observations, état d'esprit..."
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
        />
      </Field>

      {/* Mode journal honnête — violation protocole */}
      <CheckboxField className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-4">
        <Checkbox
          color="red"
          checked={protocolOverride}
          onChange={(checked) => setProtocolOverride(checked)}
        />
        <Label>
          <span className="font-semibold text-red-300">Mode journal honnête — enregistrer malgré violation du protocole</span>
        </Label>
        <Description>
          Active si tu n&apos;as pas respecté les règles (confluence insuffisante, émotion basse, risque &gt; 1%, etc.)
          mais que tu veux quand même documenter le trade pour analyse long terme. Le trade sera marqué en rouge partout.
        </Description>
      </CheckboxField>
      {protocolOverride && (
          <div className="mt-3 space-y-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
            <CalloutBanner
              tone="red"
              icon={<AlertTriangle data-slot="icon" className="size-5 text-red-400" aria-hidden="true" />}
            >
              <span className="font-bold text-red-200">⚠️ VIOLATION DU PROTOCOLE ASSUMÉE</span>
              <p className="mt-1 text-sm">
                Ce trade sera compté séparément dans tes analytics. Tu pourras voir si tu gagnes ou perds quand tu ne respectes pas tes règles.
              </p>
            </CalloutBanner>
            <Field>
              <Label>Pourquoi tu violates le protocole ? (obligatoire)</Label>
              <Textarea
                resizable={false}
                placeholder="Ex : FOMO sur le breakout, j'ai mis 2% au lieu de 1%, confluence seulement 4/7..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                rows={2}
                className="border-red-500/30"
              />
            </Field>
            <Field>
              <Label>Risque personnalisé (%) — optionnel</Label>
              <Description>
                Laisse vide pour utiliser {riskPercent}% de base. Renseigne si tu as mis plus (ex. 2%) ou moins que le protocole.
              </Description>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                placeholder={String(riskPercent)}
                value={customRiskPercent}
                onChange={(e) => setCustomRiskPercent(e.target.value)}
                className="max-w-xs"
              />
            </Field>
          </div>
        )}

      {/* Screenshot */}
      <Field>
        <Label>Capture d&apos;écran TradingView</Label>
        <div
          className={cn(
            'relative rounded-xl ring-1 ring-white/10 transition-[box-shadow] hover:ring-indigo-500/50',
            screenshotPreview && 'ring-indigo-500/30',
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
                className="max-h-64 w-full rounded-xl object-contain"
              />
              <Button
                type="button"
                plain
                onClick={() => { setScreenshot(null); setScreenshotPreview(null) }}
                className="absolute right-2 top-2 rounded-full !p-1 text-zinc-500 hover:text-red-400"
                aria-label="Supprimer la capture"
              >
                <X data-slot="icon" className="size-3.5" />
              </Button>
            </div>
          ) : (
            <div
              className="flex cursor-pointer flex-col items-center justify-center gap-2 py-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={24} className="text-zinc-500" />
              <p className="text-sm text-zinc-400">
                Glisse, colle (Ctrl+V) ou clique pour uploader
              </p>
              <p className="text-sm text-zinc-500">PNG, JPG, WEBP</p>
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
      </Field>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !canSubmit}
        color={protocolOverride ? 'red' : 'indigo'}
        className="w-full"
      >
        {loading ? (
          'Enregistrement...'
        ) : canSubmit ? (
          <>
            {protocolOverride ? (
              <>
                <AlertTriangle data-slot="icon" className="size-4" aria-hidden="true" />
                Enregistrer (VIOLATION — journal honnête)
              </>
            ) : (
              <>
                <CheckCircle2 data-slot="icon" className="size-4" aria-hidden="true" />
                {confluenceTone === 'partial'
                  ? `Enregistrer (${confluenceLabel} — taille ${effectiveRiskPercent}%)`
                  : `Enregistrer le Trade (${confluenceLabel} — ${riskPercent}%)`}
              </>
            )}
          </>
        ) : (
          <>
            <AlertTriangle data-slot="icon" className="size-4" aria-hidden="true" />
            {protocolOverride && overrideReason.trim().length < 10
              ? 'Explique la violation du protocole (min. 10 caractères)'
              : !protocolOverride && !canSubmitConfluence
              ? `Protocole incomplet — min. ${confluenceMax - 1}/${confluenceMax} ou mode journal honnête`
              : !protocolOverride && parseInt(form.emotionScore) <= 2
                ? 'État émotionnel ≤ 2/5 — mode journal honnête disponible'
                : priceValidationError
                  ? 'Prix SL/TP invalides'
                  : !slSaferThanLiq
                    ? 'Levier trop élevé — liquidation avant SL'
                    : 'Remplis entrée + SL pour calculer la taille'}
          </>
        )}
      </Button>
    </form>
  )
}
