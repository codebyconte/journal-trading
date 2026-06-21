'use client'

import { ReactNode } from 'react'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from '@/components/catalyst/dialog'
import { Button } from '@/components/catalyst/button'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'
  showClose?: boolean
}

const sizeMap = {
  sm: 'sm' as const,
  md: 'md' as const,
  lg: 'lg' as const,
  xl: 'xl' as const,
  '2xl': '2xl' as const,
  '3xl': '3xl' as const,
  '4xl': '4xl' as const,
  '5xl': '5xl' as const,
  full: '5xl' as const,
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'lg',
  showClose = true,
}: ModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size={sizeMap[size] ?? 'lg'}
      className={cn(size === 'full' && 'sm:max-w-6xl')}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </div>
        {showClose && (
          <Button plain onClick={onClose} aria-label="Fermer la fenêtre">
            <X data-slot="icon" className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <DialogBody className="modal-panel max-h-[75vh] overflow-y-auto">{children}</DialogBody>
      {showClose && (
        <DialogActions>
          <Button plain onClick={onClose}>
            Fermer
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}
