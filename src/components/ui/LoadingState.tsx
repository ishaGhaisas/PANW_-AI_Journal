// Loading state component
// Displays loading spinner or indicator

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-shell)] border-t-[var(--color-accent)]"></div>
      <p className="text-sm text-[var(--color-muted)]">Loading...</p>
    </div>
  );
}
