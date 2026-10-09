'use client'

import { useState } from 'react'
import { ChevronDown, BookOpen, CheckCircle2 } from 'lucide-react'
import { Field, Label } from '@/components/catalyst/fieldset'
import { Textarea } from '@/components/catalyst/textarea'
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
    <div className="rounded-xl overflow-hidden shadow-xs ring-1 ring-white/10">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-zinc-900/80 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-indigo-400" />
          <div>
            <p className="text-sm font-bold text-white">Réflexion post-session</p>
            <p className="text-xs text-zinc-500">7 questions guidées · Cliquer pour répondre</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'rounded-full px-2.5 py-1 text-xs font-bold',
            answeredCount >= 5 ? 'bg-emerald-500/10 text-emerald-400' : answeredCount >= 3 ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-zinc-500',
          )}>
            {answeredCount}/7
          </span>
        </div>
      </div>

      <div className="divide-y divide-white/10">
        {POST_SESSION_PROMPTS.map((prompt, index) => {
          const isOpen = openId === prompt.id
          const answered = !!prompts[prompt.id]?.trim()

          return (
            <div key={prompt.id} className={cn(isOpen && 'bg-zinc-900/50')}>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : prompt.id)}
                className="flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-white/5 transition-colors"
              >
                <span className={cn(
                  'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  answered ? 'bg-profit/20 text-emerald-400' : 'bg-white/5 text-zinc-500',
                )}>
                  {answered ? <CheckCircle2 size={14} /> : index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold uppercase tracking-wide text-indigo-400">{prompt.category}</span>
                    {answered && <span className="text-xs text-emerald-400">Répondu</span>}
                  </div>
                  <p className="text-sm font-semibold text-white mt-0.5">{prompt.question}</p>
                  {!isOpen && prompts[prompt.id]?.trim() && (
                    <p className="text-sm text-zinc-500 mt-1 line-clamp-1">{prompts[prompt.id]}</p>
                  )}
                </div>
                <ChevronDown
                  size={18}
                  className={cn('text-zinc-500 flex-shrink-0 transition-transform mt-1', isOpen && 'rotate-180')}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pl-14 space-y-3">
                  <p className="text-sm text-zinc-400 leading-relaxed italic border-l-2 border-indigo-500/40 pl-3">
                    {prompt.hint}
                  </p>
                  <Field>
                    <Label className="sr-only">{prompt.question}</Label>
                    <Textarea
                      value={prompts[prompt.id] ?? ''}
                      onChange={(e) => onChange(prompt.id, e.target.value)}
                      placeholder={prompt.placeholder}
                      rows={4}
                      resizable={false}
                    />
                  </Field>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
