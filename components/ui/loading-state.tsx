"use client";

type LoadingStateProps = {
  title: string;
  subtitle?: string;
  compact?: boolean;
};

export function LoadingState({ title, subtitle, compact = false }: LoadingStateProps) {
  return (
    <div className={`loading-state ${compact ? "compact" : ""}`}>
      <div className="spinner" aria-hidden="true" />
      <div className="loading-copy">
        <strong>{title}</strong>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </div>
  );
}
