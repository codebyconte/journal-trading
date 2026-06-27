'use client'

import { Award, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/catalyst/button'
import { Description, Field, Label } from '@/components/catalyst/fieldset'
import { Input } from '@/components/catalyst/input'
import { Textarea } from '@/components/catalyst/textarea'
import {
  PTJ_BIASES,
  type PostTradeAnalysis,
  type HistoricalImpact,
  type RuleDecision,
  hasPostTradeContent,
} from '@/lib/post-trade'

type CloseType = 'TP' | 'SL' | 'MANUAL' | ''

interface Props {
  data: PostTradeAnalysis
  onChange: (patch: Partial<PostTradeAnalysis>) => void
  effectiveCloseType: CloseType | string
  isLoss: boolean
}

export function PostTradePTJForm({ data, onChange, effectiveCloseType, isLoss }: Props) {
  const set = (patch: Partial<PostTradeAnalysis>) => onChange(patch)

  return (
    <div className="space-y-5">
      {isLoss && (
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-2.5 text-sm text-amber-200">
          <strong className="text-amber-100">Trade perdant</strong> — prends 5 minutes pour les 5 questions PTJ.
          Une perte avec protocole respecté = donnée normale, pas une erreur.
        </div>
      )}

      {/* Type de clôture */}
      <Field>
        <Label>Type de clôture</Label>
        <div className="flex flex-wrap gap-2">
          {([
            { value: 'TP' as const, label: 'Take Profit', color: 'emerald' as const },
            { value: 'SL' as const, label: 'Stop Loss', color: 'red' as const },
            { value: 'MANUAL' as const, label: 'Manuelle', color: 'amber' as const },
          ]).map((opt) => (
            <Button
              key={opt.value}
              type="button"
              onClick={() => set({ closeType: data.closeType === opt.value ? undefined : opt.value })}
              {...(data.closeType === opt.value || (!data.closeType && effectiveCloseType === opt.value)
                ? { color: opt.color }
                : { outline: true as const })}
              className="text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>
        {(data.closeType === 'MANUAL' || effectiveCloseType === 'MANUAL') && (
          <Input
            type="text"
            placeholder="Pourquoi la clôture manuelle ?"
            value={data.manualReason ?? ''}
            onChange={(e) => set({ manualReason: e.target.value })}
          />
        )}
      </Field>

      {/* Q1 */}
      <Field>
        <Label>Q1 · Le setup était-il valide à l&apos;entrée ?</Label>
        <Description>Indépendamment du résultat — protocole 100 % ou non ?</Description>
        <div className="flex gap-2">
          {[
            { val: true, label: 'Oui — protocole OK', color: 'emerald' as const },
            { val: false, label: 'Non — invalide', color: 'red' as const },
          ].map((opt) => (
            <Button
              key={String(opt.val)}
              type="button"
              onClick={() => set({ setupValid: data.setupValid === opt.val ? null : opt.val })}
              {...(data.setupValid === opt.val ? { color: opt.color } : { outline: true as const })}
              className="flex-1 text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>
        {data.setupValid === false && (
          <Input
            placeholder="Raison : ex. entrée avant clôture 4H, confluence 6/8…"
            value={data.setupInvalidReason ?? ''}
            onChange={(e) => set({ setupInvalidReason: e.target.value })}
          />
        )}
      </Field>

      {/* Q2 */}
      <Field>
        <Label>Q2 · Quelle règle ai-je violée ?</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          <Button
            type="button"
            onClick={() => set({ noRuleViolated: !data.noRuleViolated, ruleViolated: '', psychReason: '', bias: '' })}
            {...(data.noRuleViolated ? { color: 'emerald' as const } : { outline: true as const })}
            className="text-xs"
          >
            Aucune — perte normale
          </Button>
        </div>
        {!data.noRuleViolated && (
          <div className="space-y-2">
            <Input
              placeholder="Règle violée : ex. SL élargi, pas de check Coinglass…"
              value={data.ruleViolated ?? ''}
              onChange={(e) => set({ ruleViolated: e.target.value, noRuleViolated: false })}
            />
            <Input
              placeholder="Raison psychologique : impatience, FOMO, revenge…"
              value={data.psychReason ?? ''}
              onChange={(e) => set({ psychReason: e.target.value })}
            />
            <div className="flex flex-wrap gap-1.5">
              {PTJ_BIASES.map((b) => (
                <Button
                  key={b}
                  type="button"
                  onClick={() => set({ bias: data.bias === b ? '' : b })}
                  {...(data.bias === b ? { color: 'amber' as const } : { outline: true as const })}
                  className="text-xs"
                >
                  {b}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Field>

      {/* Q3 */}
      <Field>
        <Label>Q3 · Ce que le marché m&apos;a appris</Label>
        <div className="space-y-2">
          <Input
            placeholder="Signal manqué ou ignoré"
            value={data.missedSignal ?? ''}
            onChange={(e) => set({ missedSignal: e.target.value })}
          />
          <Input
            placeholder="Contexte qui avait changé (macro, Coinglass, structure…)"
            value={data.contextChanged ?? ''}
            onChange={(e) => set({ contextChanged: e.target.value })}
          />
          <Input
            placeholder="Outil qui aurait pu prévenir"
            value={data.preventiveTool ?? ''}
            onChange={(e) => set({ preventiveTool: e.target.value })}
          />
        </div>
      </Field>

      {/* Q4 */}
      <Field>
        <Label>Q4 · Nouvelle règle candidate (précise et testable)</Label>
        <Description>Style Ray Dalio — pas &quot;être plus attentif&quot;, une condition mesurable.</Description>
        <Textarea
          placeholder="Ex : Si Whale Ratio > 0.88 à l'entrée → taille 0.5% max même si 7/8 confluences"
          value={data.candidateRule ?? ''}
          onChange={(e) => set({ candidateRule: e.target.value })}
          rows={2}
          resizable={false}
        />
        <Input
          className="mt-2"
          placeholder="Condition d'application"
          value={data.ruleCondition ?? ''}
          onChange={(e) => set({ ruleCondition: e.target.value })}
        />
      </Field>

      {/* Q5 */}
      <Field>
        <Label>Q5 · Validation sur l&apos;historique (10-20 trades similaires)</Label>
        <Description>Cette règle aurait-elle amélioré tes trades passés ? Évite l&apos;over-fitting.</Description>
        <div className="flex flex-wrap gap-2 mb-2">
          {([
            { val: 'yes' as HistoricalImpact, label: 'Oui' },
            { val: 'no' as HistoricalImpact, label: 'Non' },
            { val: 'neutral' as HistoricalImpact, label: 'Neutre' },
          ]).map((opt) => (
            <Button
              key={opt.val}
              type="button"
              onClick={() => set({ historicalImpact: data.historicalImpact === opt.val ? '' : opt.val })}
              {...(data.historicalImpact === opt.val ? { color: 'indigo' as const } : { outline: true as const })}
              className="text-xs"
            >
              Impact : {opt.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            { val: 'adopt' as RuleDecision, label: 'Adopter', color: 'emerald' as const },
            { val: 'test' as RuleDecision, label: 'Tester', color: 'amber' as const },
            { val: 'reject' as RuleDecision, label: 'Rejeter', color: 'red' as const },
          ]).map((opt) => (
            <Button
              key={opt.val}
              type="button"
              onClick={() => set({ ruleDecision: data.ruleDecision === opt.val ? '' : opt.val })}
              {...(data.ruleDecision === opt.val ? { color: opt.color } : { outline: true as const })}
              className="text-xs"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </Field>

      {/* Gestion + émotion */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <Label>50% fermé @ 3R ?</Label>
          <div className="flex gap-2">
            {[
              { val: true, label: 'OUI', color: 'emerald' as const },
              { val: false, label: 'NON', color: 'red' as const },
            ].map((opt) => (
              <Button
                key={String(opt.val)}
                type="button"
                onClick={() => set({ partialTpAt3R: data.partialTpAt3R === opt.val ? null : opt.val })}
                {...(data.partialTpAt3R === opt.val ? { color: opt.color } : { outline: true as const })}
                className="flex-1 text-xs"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </Field>
        <Field>
          <Label>Trailing EMA 20 (50% restants) ?</Label>
          <div className="flex gap-2">
            {[
              { val: true, label: 'OUI', color: 'emerald' as const },
              { val: false, label: 'NON', color: 'red' as const },
            ].map((opt) => (
              <Button
                key={String(opt.val)}
                type="button"
                onClick={() => set({ trailingExitUsed: data.trailingExitUsed === opt.val ? null : opt.val })}
                {...(data.trailingExitUsed === opt.val ? { color: opt.color } : { outline: true as const })}
                className="flex-1 text-xs"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </Field>
        <Field>
          <Label>SL déplacé (adverse) ?</Label>
          <div className="flex gap-2">
            {[
              { val: false, label: 'NON ✓', color: 'emerald' as const },
              { val: true, label: 'OUI ✗', color: 'red' as const },
            ].map((opt) => (
              <Button
                key={String(opt.val)}
                type="button"
                onClick={() => set({ slWasMoved: data.slWasMoved === opt.val ? null : opt.val })}
                {...(data.slWasMoved === opt.val ? { color: opt.color } : { outline: true as const })}
                className="flex-1 text-xs"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </Field>
        <Field>
          <Label>Émotion pendant le trade (1-5)</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <Button
                key={n}
                type="button"
                onClick={() => set({ emotionDuring: data.emotionDuring === n ? null : n })}
                {...(data.emotionDuring === n ? { color: 'indigo' as const } : { outline: true as const })}
                className="flex-1 px-1 text-xs font-mono"
              >
                {n}
              </Button>
            ))}
          </div>
        </Field>
      </div>

      <Field>
        <Label>Corrélation émotion / résultat</Label>
        <Input
          placeholder="Ex : stress à 2/5 → fermeture prématurée du trailing"
          value={data.emotionCorrelation ?? ''}
          onChange={(e) => set({ emotionCorrelation: e.target.value })}
        />
      </Field>

      <Field>
        <Label className="flex items-center gap-2">
          <Award size={14} className="text-indigo-400" />
          Leçon en une phrase
        </Label>
        <Textarea
          placeholder="Une seule leçon actionnable pour le prochain trade"
          value={data.mainLesson ?? ''}
          onChange={(e) => set({ mainLesson: e.target.value })}
          rows={2}
          resizable={false}
        />
      </Field>

      {data.slWasMoved === true && (
        <div className="flex items-start gap-2 rounded-lg ring-1 ring-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          SL déplacé = violation règle d&apos;acier. Documente en Q2 et revois le protocole.
        </div>
      )}
    </div>
  )
}

export { hasPostTradeContent }
