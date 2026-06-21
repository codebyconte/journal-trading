export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div
          className="size-10 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-500 motion-reduce:animate-none"
          aria-hidden="true"
        />
        <p className="text-sm/6 text-zinc-500 dark:text-zinc-400">Chargement…</p>
      </div>
    </div>
  )
}
