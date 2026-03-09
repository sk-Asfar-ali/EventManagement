import React from 'react';

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="ud-toast">
      <span className="ud-toast-dot" />
      {message}
    </div>
  );
}

// ─── Skeleton Rows ────────────────────────────────────────────────────────────
export function SkeletonRows({ count = 3, height = 80 }: { count?: number; height?: number }) {
  return (
    <div className="ud-loading-rows">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ud-skeleton" style={{ height, animationDelay: `${i * .1}s` }} />
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, desc }: { icon: string; title: string; desc?: string }) {
  return (
    <div className="ud-empty">
      <div className="ud-empty-icon">{icon}</div>
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHead({
  title, desc, right,
}: { title: string; desc?: string; right?: React.ReactNode }) {
  return (
    <div className="sec-head" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
      <div>
        <h2>{title}</h2>
        {desc && <p>{desc}</p>}
      </div>
      {right}
    </div>
  );
}

// ─── Status Pill ──────────────────────────────────────────────────────────────
export function StatusPill({ status }: { status: 'REGISTERED' | 'NOT_REGISTERED' | 'CLOSED' | string }) {
  const map: Record<string, [string, string]> = {
    REGISTERED:     ['ud-pill ud-pill-reg',    'Registered'],
    NOT_REGISTERED: ['ud-pill ud-pill-open',   'Open'],
    CLOSED:         ['ud-pill ud-pill-closed',  'Closed'],
    CANCELLED:      ['ud-pill ud-pill-cancelled','Cancelled'],
  };
  const [cls, label] = map[status] ?? ['ud-pill ud-pill-closed', status];
  return <span className={cls}>{label}</span>;
}
