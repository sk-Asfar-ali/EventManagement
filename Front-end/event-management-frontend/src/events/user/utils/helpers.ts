// ─── Types ────────────────────────────────────────────────────────────────────

export interface EventItem {
  id: number; title: string; description: string;
  eventDate: string; venue?: string;
  registrationClosingDate?: string; durationInHours?: number;
  status: 'REGISTERED' | 'NOT_REGISTERED' | 'CLOSED';
  canCancel: boolean;
}

export interface Booking {
  id: number;
  event: { id: number; title: string; venue?: string; eventDate: string };
  status: string;
}

export interface Notif {
  id: number; message: string; isRead: boolean;
  createdAt: string; event?: { id: number };
}

export interface AttendanceRecord {
  eventsAttended: { eventId: number; title: string; date: string }[];
  eventsMissed: number;
  attendancePercentage: number;
}

export type Tab = 'browse' | 'bookings' | 'profile' | 'notifications' | 'attendance';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

export const fmtDay = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day:'2-digit' });

export const fmtMon = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { month:'short' });

export function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function userInitials(name?: string, email?: string) {
  if (name) return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return email?.[0]?.toUpperCase() || 'U';
}

export function attendanceColor(pct: number) {
  if (pct >= 75) return 'var(--ud-green)';
  if (pct >= 50) return 'var(--ud-amber)';
  return 'var(--ud-coral)';
}
