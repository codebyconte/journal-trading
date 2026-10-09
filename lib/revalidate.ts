import { revalidatePath } from 'next/cache'

export function revalidateTradingPaths() {
  for (const path of ['/', '/trades', '/analytics', '/journal', '/settings', '/progress', '/protocol', '/watchlist', '/risk']) {
    revalidatePath(path)
  }
}
