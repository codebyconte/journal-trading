export default function Loading() {
  return (
    <div className="flex h-[60vh] items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent motion-reduce:animate-none" aria-hidden="true" />
        <p className="text-sm text-text-muted">Chargement…</p>
      </div>
    </div>
  )
}
