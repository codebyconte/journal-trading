'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ChevronLeft, ChevronRight, Save, RefreshCw, AlertTriangle,
  BookOpen, Calendar, PenLine,
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { MoodIcon } from '@/components/ui/TradingIcons'
import { DayTradeReview } from '@/components/journal/DayTradeReview'
import { ReflectionPrompts } from '@/components/journal/ReflectionPrompts'
import { QuickAudit } from '@/components/journal/QuickAudit'
import { PatternInsights } from '@/components/journal/PatternInsights'
import type { JournalEntry, Trade } from '@/lib/types'
import {
  parseJournalContent,
  serializeJournalContent,
  getJournalPreview,
  getTradesForDay,
  summarizeDay,
  detectPatterns,
  normalizeMood,
  WEEKLY_PROMPTS,
  type JournalStorage,
  type PromptId,
  type AuditKey,
} from '@/lib/journal'
import { cn } from '@/lib/utils'
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
}: {
  initialEntries: JournalEntry[]
  initialTrades: Trade[]
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

  useEffect(() => {
    setEntries(initialEntries)
    setTrades(initialTrades)
  }, [initialEntries, initialTrades])

  const refresh = () => startTransition(() => router.refresh())

  useEffect(() => {
    const entry = entries.find((e) => isSameDay(new Date(e.date), selectedDate))
    const parsed = parseJournalContent(entry?.content)
    setJournal(parsed)
    setMood(normalizeMood(entry?.mood))
  }, [selectedDate, entries])

  const dayTrades = useMemo(
    () => getTradesForDay(trades, selectedDate),
    [trades, selectedDate],
  )
  const daySummary = useMemo(() => summarizeDay(dayTrades), [dayTrades])
  const patterns = useMemo(
    () => detectPatterns(trades.filter((t) => t.status === 'CLOSED').slice(0, 50), entries),
    [trades, entries],
  )

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
    return hasNotes || hasPrompts || hasAudit
  }, [journal])

  const save = async () => {
    if (!hasContent && mood === 4) return
    setSaving(true)
    try {
      const result = await saveJournalEntry({
        date: selectedDate.toISOString(),
        content: serializeJournalContent(journal),
        mood,
      })
      if (!result.success) return
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
    <div className="p-6 space-y-6 animate-fade-in max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BookOpen size={26} className="text-accent" />
            Journal de Trading
          </h1>
          <p className="text-base text-text-secondary mt-1">
            Identifie tes défauts et bonnes conduites · Analyse automatique des trades · Réflexion structurée
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border border-border bg-bg-card px-4 py-2.5 text-center">
            <p className="text-xs text-text-muted">Entrées ce mois</p>
            <p className="text-lg font-bold text-text-primary">{monthEntries.length}</p>
          </div>
          {avgMoodMonth && (
            <div className="rounded-xl border border-border bg-bg-card px-4 py-2.5 text-center">
              <p className="text-xs text-text-muted">Humeur moyenne</p>
              <p className="text-lg font-bold text-accent">{avgMoodMonth}/5</p>
            </div>
          )}
          <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-2.5 text-sm text-text-secondary max-w-xs">
            <span className="font-semibold text-accent">Steenbarger (2007)</span> : journal + analyse = progression 3× plus rapide
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Calendrier */}
        <Card className="xl:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="rounded-lg p-1.5 text-text-muted hover:bg-bg-hover hover:text-text-primary"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-bold text-text-primary capitalize flex items-center gap-1.5">
                <Calendar size={15} className="text-accent" />
                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
              </span>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="rounded-lg p-1.5 text-text-muted hover:bg-bg-hover hover:text-text-primary"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </CardHeader>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
              <div key={i} className="text-center text-xs font-semibold text-text-muted py-1">{d}</div>
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
                    selected && 'bg-accent text-white font-bold shadow-md',
                    today && !selected && 'ring-2 ring-accent/50 text-accent font-semibold',
                    !selected && !today && 'text-text-secondary hover:bg-bg-hover',
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

          <div className="mt-4 border-t border-border pt-3 space-y-2">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Légende</p>
            <div className="flex flex-wrap gap-3 text-xs text-text-muted">
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
                <CardTitle className="text-lg normal-case tracking-normal text-text-primary capitalize">
                  {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                </CardTitle>
                {isToday(selectedDate) && (
                  <span className="text-sm text-accent font-medium">Aujourd&apos;hui</span>
                )}
              </div>
              <button
                type="button"
                onClick={refresh}
                disabled={isPending}
                aria-label="Actualiser le journal"
                className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <RefreshCw size={16} className={isPending ? 'animate-spin' : ''} aria-hidden="true" />
              </button>
            </CardHeader>

            {/* Humeur */}
            <div className="mb-6">
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-text-secondary">
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
                        ? score <= 2 ? 'border-loss bg-loss-dim ring-2 ring-loss/30'
                          : score === 3 ? 'border-neutral bg-neutral-dim ring-2 ring-neutral/30'
                          : 'border-profit bg-profit-dim ring-2 ring-profit/30'
                        : 'border-border hover:border-border-strong hover:bg-bg-hover',
                    )}
                  >
                    <div className="flex justify-center mb-1.5">
                      <MoodIcon score={score} size={22} />
                    </div>
                    <p className="text-sm font-bold text-text-primary">{score}/5</p>
                    <p className="text-xs text-text-secondary mt-0.5">{label}</p>
                    <p className="text-xs text-text-muted mt-0.5">{sub}</p>
                  </button>
                ))}
              </div>
              {mood <= 2 && (
                <p className="mt-3 flex items-start gap-2 text-sm text-loss rounded-xl border border-loss/30 bg-loss-dim px-4 py-3">
                  <AlertTriangle size={18} className="flex-shrink-0" />
                  Protocole : état ≤ 2/5 → pas de trade. Documente pourquoi tu te sens ainsi — c&apos;est une donnée précieuse pour tes patterns.
                </p>
              )}
            </div>

            {/* Trades du jour + analyse auto */}
            <DayTradeReview trades={dayTrades} summary={daySummary} />
          </Card>

          {/* Audit rapide */}
          <QuickAudit audit={journal.audit} onChange={updateAudit} />

          {/* Prompts structurés */}
          <ReflectionPrompts prompts={journal.prompts} onChange={updatePrompt} />

          {/* Notes libres */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PenLine size={18} className="text-accent" />
                <CardTitle className="text-base normal-case tracking-normal text-text-primary">
                  Notes libres & observations
                </CardTitle>
              </div>
            </CardHeader>
            <textarea
              placeholder="Observations marché, idées pour demain, contexte macro du jour…"
              value={journal.notes}
              onChange={(e) => setJournal((prev) => ({ ...prev, notes: e.target.value }))}
              rows={5}
              className="w-full rounded-xl border border-border bg-bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted resize-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-text-muted">
                {Object.values(journal.prompts).filter((v) => v?.trim()).length}/7 prompts ·{' '}
                {Object.values(journal.audit).filter(Boolean).length} alertes audit
              </p>
              <button
                onClick={save}
                disabled={saving || (!hasContent && mood === 4)}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all',
                  savedFlash
                    ? 'bg-profit text-white'
                    : 'bg-accent text-white hover:bg-accent/90 disabled:opacity-50',
                )}
              >
                <Save size={16} />
                {saving ? 'Sauvegarde…' : savedFlash ? 'Enregistré ✓' : 'Sauvegarder la session'}
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Bas de page */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PatternInsights patterns={patterns} />

        {/* Revue hebdomadaire */}
        <Card variant="accent">
          <CardHeader>
            <CardTitle className="text-base normal-case tracking-normal text-text-primary">
              Revue hebdomadaire
            </CardTitle>
            <span className="text-xs text-text-muted">Dimanche · 20-30 min</span>
          </CardHeader>
          <p className="text-sm text-text-secondary mb-4">
            78% des traders profitables font une revue structurée. Réponds honnêtement — une seule amélioration concrète pour la semaine suivante.
          </p>
          <div className="space-y-3">
            {WEEKLY_PROMPTS.map(({ q, hint }, i) => (
              <div key={i} className="rounded-xl border border-border bg-bg-surface px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{q}</p>
                    <p className="text-xs text-text-muted mt-1 italic">{hint}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Entrées récentes */}
        {entries.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base normal-case tracking-normal text-text-primary">
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
                    className="rounded-xl border border-border bg-bg-surface px-4 py-3 text-left hover:border-accent/40 hover:bg-bg-hover transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-text-primary capitalize">
                        {format(new Date(entry.date), 'EEE d MMM', { locale: fr })}
                      </span>
                      <div className="flex items-center gap-2">
                        <MoodIcon score={moodScore} size={16} />
                        <span className="text-xs text-text-muted">{moodScore}/5</span>
                      </div>
                    </div>
                    {summary.total > 0 && (
                      <p className={cn('text-xs font-semibold mb-1', summary.pnl >= 0 ? 'text-profit' : 'text-loss')}>
                        {summary.total} trade(s) · {summary.pnl >= 0 ? '+' : ''}{summary.pnl.toFixed(0)}$
                      </p>
                    )}
                    <p className="text-sm text-text-muted line-clamp-2">{preview || 'Pas de notes'}</p>
                  </button>
                )
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
