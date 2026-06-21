import { revalidatePath } from 'next/cache'

export function revalidateTradingPaths() {
  for (const path of ['/', '/trades', '/analytics', '/journal', '/settings']) {
    revalidatePath(path)
  }
}
