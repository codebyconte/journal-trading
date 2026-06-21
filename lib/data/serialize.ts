import type { Trade, JournalEntry, Settings } from '@/lib/types'
import type { Trade as PrismaTrade, JournalEntry as PrismaJournalEntry, Settings as PrismaSettings } from '@prisma/client'

export function serializeTrade(trade: PrismaTrade): Trade {
  return {
    ...trade,
    direction: trade.direction as Trade['direction'],
    orderType: trade.orderType as Trade['orderType'],
    status: trade.status as Trade['status'],
    datetime: trade.datetime.toISOString(),
    createdAt: trade.createdAt.toISOString(),
    updatedAt: trade.updatedAt.toISOString(),
    openedAt: trade.openedAt?.toISOString() ?? null,
    closedAt: trade.closedAt?.toISOString() ?? null,
  }
}

export function serializeJournalEntry(entry: PrismaJournalEntry): JournalEntry {
  return {
    id: entry.id,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
    date: entry.date.toISOString(),
    content: entry.content,
    mood: entry.mood,
  }
}

export function serializeSettings(settings: PrismaSettings): Settings {
  return {
    id: settings.id,
    initialCapital: settings.initialCapital,
    currentCapital: settings.currentCapital,
    riskPercent: settings.riskPercent,
    currency: settings.currency,
  }
}
