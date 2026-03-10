import React from 'react';

// ─── Close Button ─────────────────────────────────────────────────────────────
export function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="modal-close" onClick={onClick} aria-label="Close">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    </button>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────
interface ModalShellProps {
  title: string; subtitle?: string;
  onClose: () => void;
  maxWidth?: number;
  children: React.ReactNode;
}
export function ModalShell({ title, subtitle, onClose, maxWidth = 520, children }: ModalShellProps) {
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle && <p style={{ fontSize:'.78rem', color:'var(--ink-4)', marginTop:3 }}>{subtitle}</p>}
          </div>
          <CloseBtn onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="toast">
      <span className="toast-dot" />
      {message}
    </div>
  );
}

// ─── Skeleton Rows ────────────────────────────────────────────────────────────
export function SkeletonRows({ count = 3, height = 72 }: { count?: number; height?: number }) {
  return (
    <div className="loading-rows">
      {Array.from({ length: count }).map((_,i) => (
        <div key={i} className="skeleton" style={{ height, animationDelay:`${i*.08}s` }} />
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({
  icon, title, desc, action,
}: { icon: string; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
      {action}
    </div>
  );
}

// ─── Status Pill ──────────────────────────────────────────────────────────────
export function StatusPill({ isToday, upcoming }: { isToday: boolean; upcoming: boolean }) {
  if (isToday) return <span className="pill pill-today">● Today</span>;
  if (upcoming) return <span className="pill pill-upcoming">Upcoming</span>;
  return <span className="pill pill-past">Past</span>;
}

// ─── Alert Banner ─────────────────────────────────────────────────────────────
export function AlertBanner({
  type, message, onRetry,
}: { type: 'warn' | 'error'; message: string; onRetry?: () => void }) {
  return (
    <div className={`alert alert-${type === 'warn' ? 'warn' : 'error'}`}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M7 4v3M7 9.5h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
      {message}
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
export function SectionCard({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="report-card">
      <div className="report-card-head">
        <h3>{title}{count !== undefined ? ` (${count})` : ''}</h3>
      </div>
      {children}
    </div>
  );
}
