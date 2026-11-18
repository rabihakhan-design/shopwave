export function Loader({ label = 'Loading…' }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry, children }) {
  return (
    <div className="state error" role="alert">
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && <button className="btn" onClick={onRetry}>Try again</button>}
      {children}
    </div>
  );
}

export function EmptyState({ title, text, children }) {
  return (
    <div className="state">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}
