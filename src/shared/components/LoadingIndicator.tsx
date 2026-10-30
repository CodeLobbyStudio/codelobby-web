export function LoadingIndicator({ label = 'Ładowanie…' }: { label?: string }) {
  return (
    <div className="loading-indicator" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
