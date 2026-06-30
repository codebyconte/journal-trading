'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ChevronLeft, ChevronRight, Save, RefreshCw, AlertTriangle,
  BookOpen, Calendar, PenLine, RotateCcw, CheckCircle2,
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageShell } from '@/components/ui/PageShell'
import { Button } from '@/components/catalyst/button'
import { MoodIcon } from '@/components/ui/TradingIcons'
import { DayTradeReview } from '@/components/journal/DayTradeReview'
import { ReflectionPrompts } from '@/components/journal/ReflectionPrompts'
import { QuickAudit } from '@/components/journal/QuickAudit'
import { PatternInsights } from '@/components/journal/PatternInsights'
import { MonthlyLossAnalysis } from '@/components/journal/MonthlyLossAnalysis'
import type { JournalEntry, Trade } from '@/lib/types'
import {
  parseJournalContent,
  serializeJournalContent,
  getJournalPreview,
  getTradesForDay,
  summarizeDay,
  getMonthlyCrossReviewForMonth,
  detectPatterns,
  analyzeMonthlyLosses,
  normalizeMood,
  WEEKLY_PROMPTS,
  type JournalStorage,
  type PromptId,
  type AuditKey,
} from '@/lib/journal'
import { cn, toDateOnlyString } from '@/lib/utils'
import { saveJournalEntry } from '@/app/actions/journal'

const MOOD_LEVELS = [
  { score: 1, label: 'Critique', sub: 'Pas de trade' },
  { score: 2, label: 'Dégradé', sub: 'Pas de trade' },
  { score: 3, label: 'Neutre', sub: 'Trading possible' },
  { score: 4, label: 'Bon', sub: 'Trading normal' },
  { score: 5, label: 'Optimal', sub: 'Confiance totale' },
] as const

const moodDotColor = (score: number) => {
  if (score <= 2) return 'bg-loss'
  if (score === 3) return 'bg-neutral'
  return 'bg-profit'
}

export function JournalClient({
  initialEntries,
  initialTrades,
  riskPercent = 1,
}: {
  initialEntries: JournalEntry[]
  initialTrades: Trade[]
  riskPercent?: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [entries, setEntries] = useState(initialEntries)
  const [trades, setTrades] = useState(initialTrades)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [journal, setJournal] = useState<JournalStorage>({ v: 1, notes: '', prompts: {}, audit: {} })
  const [mood, setMood] = useState(4)
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setEntries(initialEntries)
    setTrades(initialTrades)
  }, [initialEntries, initialTrades])

  const refresh = () => startTransition(() => router.refresh())

  useEffect(() => {
    const entry = entries.find((e) => isSameDay(new Date(e.date), selectedDate))
    const parsed = parseJournalContent(entry?.content)
    const monthlyFromMonth = getMonthlyCrossReviewForMonth(entries, selectedDate)
    setJournal({
      ...parsed,
      monthlyCrossReview: {
        ...monthlyFromMonth,
        ...parsed.monthlyCrossReview,
      },
    })
    setMood(normalizeMood(entry?.mood))
  }, [selectedDate, entries])

  const dayTrades = useMemo(
    () => getTradesForDay(trades, selectedDate),
    [trades, selectedDate],
  )
  const daySummary = useMemo(() => summarizeDay(dayTrades), [dayTrades])
  const patterns = useMemo(() => {
    const recentClosed = [...trades]
      .filter((t) => t.status === 'CLOSED')
      .sort(
        (a, b) =>
          new Date(b.closedAt ?? b.datetime).getTime() -
          new Date(a.closedAt ?? a.datetime).getTime(),
      )
      .slice(0, 50)
    return detectPatterns(recentClosed, entries, riskPercent)
  }, [trades, entries, riskPercent])

  const monthlyLossInsights = useMemo(
    () => analyzeMonthlyLosses(trades.filter((t) => t.status === 'CLOSED'), 30),
    [trades],
  )

  const monthlyLossCount = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    return trades.filter((t) => {
      if (t.status !== 'CLOSED' || (t.pnl ?? 0) >= 0) return false
      return new Date(t.closedAt ?? t.datetime).getTime() >= cutoff
    }).length
  }, [trades])

  const monthEntries = useMemo(
    () => entries.filter((e) => {
      const d = new Date(e.date)
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear()
    }),
    [entries, currentMonth],
  )

  const avgMoodMonth = useMemo(() => {
    if (monthEntries.length === 0) return null
    const sum = monthEntries.reduce((s, e) => s + normalizeMood(e.mood), 0)
    return (sum / monthEntries.length).toFixed(1)
  }, [monthEntries])

  const hasContent = useMemo(() => {
    const hasNotes = journal.notes.trim().length > 0
    const hasPrompts = Object.values(journal.prompts).some((v) => v?.trim())
    const hasAudit = Object.values(journal.audit).some((v) => v === true)
    const hasWeekly = Object.values(journal.weeklyReview ?? {}).some((v) => v?.trim())
    const hasMonthly = Object.values(journal.monthlyCrossReview ?? {}).some((v) => v?.trim())
    return hasNotes || hasPrompts || hasAudit || hasWeekly || hasMonthly
  }, [journal])

  const save = async () => {
    if (!hasContent && mood === 4) return
    setSaving(true)
    setSaveError(null)
    try {
      const result = await saveJournalEntry({
        date: toDateOnlyString(selectedDate),
        content: serializeJournalContent(journal),
        mood,
      })
      if (!result.success) {
        setSaveError(result.error ?? 'Erreur lors de la sauvegarde')
        return
      }
      refresh()
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const updatePrompt = (id: PromptId, value: string) => {
    setJournal((prev) => ({
      ...prev,
      prompts: { ...prev.prompts, [id]: value },
    }))
  }

  const updateAudit = (key: AuditKey, value: boolean) => {
    setJournal((prev) => ({
      ...prev,
      audit: { ...prev.audit, [key]: value },
    }))
  }

  const updateWeeklyReview = (idx: number, value: string) => {
    setJournal((prev) => ({
      ...prev,
      weeklyReview: { ...prev.weeklyReview, [String(idx)]: value },
    }))
  }

  const updateMonthlyCrossReview = (idx: number, value: string) => {
    setJournal((prev) => ({
      ...prev,
      monthlyCrossReview: { ...prev.monthlyCrossReview, [String(idx)]: value },
    }))
  }

  const weeklyAnsweredCount = Object.values(journal.weeklyReview ?? {}).filter((v) => v?.trim()).length

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const getEntryForDay = (day: Date) =>
    entries.find((e) => isSameDay(new Date(e.date), day))

  const getDayTradeDot = (day: Date) => {
    const dayT = getTradesForDay(trades, day)
    const closed = dayT.filter((t) => t.status === 'CLOSED' && t.pnl != null)
    if (closed.length === 0) return null
    const pnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0)
    return pnl >= 0 ? 'profit' : 'loss'
  }

  return (
    <PageShell>
      <PageHeader
        title="Journal de Trading"
        description="Identifie tes défauts et bonnes conduites · Analyse automatique des trades · Réflexion structurée"
        icon={<BookOpen data-slot="icon" className="size-7 text-indigo-400" aria-hidden="true" />}
        actions={
          <>
            <div className="rounded-lg bg-zinc-950/5 px-4 py-2.5 text-center ring-1 ring-zinc-950/10 dark:bg-white/5 dark:ring-white/10">
              <p className="text-xs text-zinc-500">Entrées ce mois</p>
              <p className="text-lg font-bold text-zinc-950 dark:text-white">{monthEntries.length}</p>
            </div>
            {avgMoodMonth && (
              <div className="rounded-lg bg-zinc-950/5 px-4 py-2.5 text-center ring-1 ring-zinc-950/10 dark:bg-white/5 dark:ring-white/10">
                <p className="text-xs text-zinc-500">Humeur moyenne</p>
                <p className="text-lg font-bold text-indigo-400">{avgMoodMonth}/5</p>
              </div>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Calendrier */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-bold text-white capitalize flex items-center gap-1.5">
                <Calendar size={15} className="text-indigo-400" />
                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
              </span>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </CardHeader>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} className="text-center text-xs font-semibold text-zinc-500 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: (days[0].getDay() + 6) % 7 }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((day) => {
              const entry = getEntryForDay(day)
              const selected = isSameDay(day, selectedDate)
              const today = isToday(day)
              const tradeDot = getDayTradeDot(day)
              const moodScore = entry ? normalizeMood(entry.mood) : null

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'relative flex h-10 w-full flex-col items-center justify-center rounded-lg text-sm transition-all',
                    selected && 'bg-indigo-600 text-white font-bold shadow-md',
                    today && !selected && 'ring-2 ring-accent/50 text-indigo-400 font-semibold',
                    !selected && !today && 'text-zinc-400 hover:bg-white/5',
                  )}
                >
                  {day.getDate()}
                  <div className="absolute bottom-1 flex gap-0.5">
                    {moodScore != null && !selected && (
                      <span className={cn('h-1.5 w-1.5 rounded-full', moodDotColor(moodScore))} />
                    )}
                    {tradeDot && !selected && (
                      <span className={cn('h-1.5 w-1.5 rounded-full', tradeDot === 'profit' ? 'bg-profit' : 'bg-loss')} />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-4 border-t border-white/10 pt-3 space-y-2">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Légende</p>
            <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-profit" /> Humeur bonne</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-loss" /> Humeur dégradée</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-profit" /> Jour gagnant</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-loss" /> Jour perdant</span>
            </div>
          </div>
        </Card>

        {/* Contenu principal */}
        <div className="xl:col-span-9 space-y-5">
          <Card glow>
            <CardHeader>
              <div>
                <CardTitle className="text-lg normal-case tracking-normal text-white capitalize">
                  {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                </CardTitle>
                {isToday(selectedDate) && (
                  <span className="text-sm text-indigo-400 font-medium">Aujourd&apos;hui</span>
                )}
              </div>
              <button
                type="button"
                onClick={refresh}
                disabled={isPending}
                aria-label="Actualiser le journal"
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <RefreshCw size={16} className={isPending ? 'animate-spin' : ''} aria-hidden="true" />
              </button>
            </CardHeader>

            {/* Humeur */}
            <div className="mb-6">
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">
                État émotionnel (Règle Zéro)
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {MOOD_LEVELS.map(({ score, label, sub }) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setMood(score)}
                    className={cn(
                      'rounded-xl border p-3 text-center transition-all',
                      mood === score
                        ? score <= 2 ? 'border-red-500 bg-red-500/10 ring-2 ring-loss/30'
                          : score === 3 ? 'border-amber-500 bg-amber-500/10 ring-2 ring-neutral/30'
                          : 'border-emerald-500 bg-emerald-500/10 ring-2 ring-profit/30'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5',
                    )}
                  >
                    <div className="flex justify-center mb-1.5">
                      <MoodIcon score={score} size={22} />
                    </div>
                    <p className="text-sm font-bold text-white">{score}/5</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>
                  </button>
                ))}
              </div>
              {mood <= 2 && (
                <p className="mt-3 flex items-start gap-2 text-sm text-red-400 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <AlertTriangle size={18} className="flex-shrink-0" />
                  Protocole : état ≤ 2/5 → pas de trade. Documente pourquoi tu te sens ainsi — c&apos;est une donnée précieuse pour tes patterns.
                </p>
              )}
            </div>

            {/* Trades du jour + analyse auto */}
            <DayTradeReview trades={dayTrades} summary={daySummary} riskPercent={riskPercent} />
          </Card>

          {/* Audit rapide */}
          <QuickAudit audit={journal.audit} onChange={updateAudit} />

          {/* Prompts structurés */}
          <ReflectionPrompts prompts={journal.prompts} onChange={updatePrompt} />

          {/* Notes libres */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PenLine size={18} className="text-indigo-400" />
                <CardTitle className="text-base normal-case tracking-normal text-white">
                  Notes libres & observations
                </CardTitle>
              </div>
            </CardHeader>
            <textarea
              placeholder="Observations marché, idées pour demain, contexte macro du jour…"
              value={journal.notes}
              onChange={(e) => setJournal((prev) => ({ ...prev, notes: e.target.value }))}
              rows={5}
              className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-white placeholder-text-muted resize-none focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm text-zinc-500">
                  {Object.values(journal.prompts).filter((v) => v?.trim()).length}/7 prompts ·{' '}
                  {Object.values(journal.audit).filter(Boolean).length} alertes audit
                </p>
                {saveError && (
                  <p className="text-sm text-red-400">{saveError}</p>
                )}
              </div>
              <Button
                onClick={save}
                disabled={saving || (!hasContent && mood === 4)}
                color={savedFlash ? 'green' : 'indigo'}
              >
                <Save data-slot="icon" className="size-4" aria-hidden="true" />
                {saving ? 'Sauvegarde…' : savedFlash ? 'Enregistré ✓' : 'Sauvegarder la session'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Bas de page */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PatternInsights patterns={patterns} />

        <MonthlyLossAnalysis
          insights={monthlyLossInsights}
          lossCount={monthlyLossCount}
          monthlyReview={journal.monthlyCrossReview ?? {}}
          onUpdateReview={updateMonthlyCrossReview}
        />

        {/* Revue hebdomadaire interactive */}
        <Card variant="accent">
          <CardHeader>
            <div>
              <CardTitle className="text-base normal-case tracking-normal text-white">
                Revue hebdomadaire
              </CardTitle>
              <span className="text-xs text-zinc-500">Dimanche · 20-30 min</span>
            </div>
            <span className={cn(
              'rounded-full px-2.5 py-1 text-xs font-bold',
              weeklyAnsweredCount >= 6 ? 'bg-emerald-500/10 text-emerald-400' :
              weeklyAnsweredCount >= 3 ? 'bg-amber-500/10 text-amber-400' :
              'bg-white/5 text-zinc-500',
            )}>
              {weeklyAnsweredCount}/{WEEKLY_PROMPTS.length}
            </span>
          </CardHeader>
          <p className="text-sm text-zinc-400 mb-4">
            78% des traders profitables font une revue structurée. Réponds honnêtement — une seule amélioration concrète pour la semaine suivante. <span className="text-zinc-500">(Tout optionnel — sauvegardé avec le reste du journal)</span>
          </p>
          <div className="space-y-3">
            {WEEKLY_PROMPTS.map(({ q, hint }, i) => {
              const answer = (journal.weeklyReview ?? {})[String(i)] ?? ''
              const answered = !!answer.trim()
              return (
                <div key={i} className={cn(
                  'rounded-xl border bg-zinc-900/80 transition-colors',
                  answered ? 'border-indigo-500/25' : 'border-white/10',
                )}>
                  <div className="flex items-start gap-3 px-4 pt-3 pb-2">
                    <span className={cn(
                      'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      answered ? 'bg-profit/20 text-emerald-400' : 'bg-indigo-500/15 text-indigo-400',
                    )}>
                      {answered ? <CheckCircle2 size={13} /> : i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{q}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 italic">{hint}</p>
                    </div>
                  </div>
                  <div className="px-4 pb-3 pl-13">
                    <textarea
                      value={answer}
                      onChange={(e) => updateWeeklyReview(i, e.target.value)}
                      placeholder="Ta réponse…"
                      rows={2}
                      aria-label={q}
                      className="w-full resize-none rounded-lg border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder-text-muted focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-accent/30"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Entrées récentes */}
        {entries.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base normal-case tracking-normal text-white">
                Entrées récentes
              </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              {entries.slice(0, 9).map((entry) => {
                const preview = getJournalPreview(entry.content)
                const moodScore = normalizeMood(entry.mood)
                const dayT = getTradesForDay(trades, new Date(entry.date))
                const summary = summarizeDay(dayT)

                return (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedDate(new Date(entry.date))}
                    className="rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-left hover:border-indigo-500/40 hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white capitalize">
                        {format(new Date(entry.date), 'EEE d MMM', { locale: fr })}
                      </span>
                      <div className="flex items-center gap-2">
                        <MoodIcon score={moodScore} size={16} />
                        <span className="text-xs text-zinc-500">{moodScore}/5</span>
                      </div>
                    </div>
                    {summary.total > 0 && (
                      <p className={cn('text-xs font-semibold mb-1', summary.pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {summary.total} trade(s) · {summary.pnl >= 0 ? '+' : ''}{summary.pnl.toFixed(0)}$
                      </p>
                    )}
                    <p className="text-sm text-zinc-500 line-clamp-2">{preview || 'Pas de notes'}</p>
                  </button>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </PageShell>
  )
}
