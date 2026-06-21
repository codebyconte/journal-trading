'use client'

import { useState } from 'react'
import { ChevronDown, BookOpen, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { POST_SESSION_PROMPTS, type PromptId } from '@/lib/journal'

interface Props {
  prompts: Partial<Record<PromptId, string>>
  onChange: (id: PromptId, value: string) => void
}

export function ReflectionPrompts({ prompts, onChange }: Props) {
  const [openId, setOpenId] = useState<PromptId | null>('wellDone')

  const answeredCount = POST_SESSION_PROMPTS.filter((p) => prompts[p.id]?.trim()).length

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-bg-surface px-4 py-3.5">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-accent" />
          <div>
            <p className="text-sm font-bold text-text-primary">Réflexion post-session</p>
            <p className="text-xs text-text-muted">7 questions guidées · Cliquer pour répondre</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'rounded-full px-2.5 py-1 text-xs font-bold',
            answeredCount >= 5 ? 'bg-profit-dim text-profit' : answeredCount >= 3 ? 'bg-neutral-dim text-neutral' : 'bg-bg-hover text-text-muted',
          )}>
            {answeredCount}/7
          </span>
        </div>
      </div>

      <div className="divide-y divide-border">
        {POST_SESSION_PROMPTS.map((prompt, index) => {
          const isOpen = openId === prompt.id
          const answered = !!prompts[prompt.id]?.trim()

          return (
            <div key={prompt.id} className={cn(isOpen && 'bg-bg-surface/50')}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : prompt.id)}
                className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-bg-hover transition-colors"
              >
                <span className={cn(
                  'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  answered ? 'bg-profit/20 text-profit' : 'bg-bg-hover text-text-muted',
                )}>
                  {answered ? <CheckCircle2 size={14} /> : index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold uppercase tracking-wide text-accent">{prompt.category}</span>
                    {answered && <span className="text-xs text-profit">Répondu</span>}
                  </div>
                  <p className="text-sm font-semibold text-text-primary mt-0.5">{prompt.question}</p>
                  {!isOpen && prompts[prompt.id]?.trim() && (
                    <p className="text-sm text-text-muted mt-1 line-clamp-1">{prompts[prompt.id]}</p>
                  )}
                </div>
                <ChevronDown
                  size={18}
                  className={cn('text-text-muted flex-shrink-0 transition-transform mt-1', isOpen && 'rotate-180')}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pl-14 space-y-3">
                  <p className="text-sm text-text-secondary leading-relaxed italic border-l-2 border-accent/40 pl-3">
                    {prompt.hint}
                  </p>
                  <textarea
                    value={prompts[prompt.id] ?? ''}
                    onChange={(e) => onChange(prompt.id, e.target.value)}
                    placeholder={prompt.placeholder}
                    rows={4}
                    className="w-full rounded-lg border border-border bg-bg-card px-4 py-3 text-sm text-text-primary placeholder-text-muted resize-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
