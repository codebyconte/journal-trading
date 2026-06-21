'use client'

import { ReactNode } from 'react'
import { Heading, Subheading } from '@/components/catalyst/heading'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, description, icon, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-start md:justify-between', className)}>
      <div>
        <Heading className="flex items-center gap-2.5">
          {icon}
          {title}
        </Heading>
        {description && (
          <Subheading className="mt-1 font-normal text-zinc-400 dark:text-zinc-300 capitalize">
            {description}
          </Subheading>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
