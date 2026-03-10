// ─── Types ───────────────────────────────────────────────────────────────────

export interface OrgEvent {
  id: number; title: string; description: string;
  venue: string; eventDate: string;
  registrationClosingDate: string; durationInHours: number;
  registrations?: Registration[];
}

export interface Registration {
  registrationId: number; status: string;
  user: { id: number; name: string; email: string };
}

export interface AttendanceUser {
  userId: number; name: string; email: string;
  isPresent: boolean | string | number;
  attendanceId?: number;
}

export interface AttendanceSummary {
  eventId: number; totalRegistered: number;
  totalPresent: number; totalAbsent: number;
  users: AttendanceUser[];
}

export interface ReportEventCard {
  id: number; title: string; venue: string; eventDate: string;
  totalRegistrations: number; presentCount: number; attendanceRate: number;
}

export interface ReportDashboard {
  dashboard: {
    totalEvents: number; totalRegistrations: number;
    totalPresent: number; upcomingEvents: number;
  };
  events: ReportEventCard[];
}

export interface TrendPoint { date: string; count: string }

export interface ReportEventDetail {
  event: { id:number; title:string; venue:string; eventDate:string; durationInHours:number };
  stats: {
    totalRegistered:number; totalCancelled:number;
    totalPresent:number; totalAbsent:number; attendanceRate:number;
  };
  registrationTrend: TrendPoint[];
  attendanceBreakdown: { present:number; absent:number };
  reports: {
    id:number; content:string; driveLink?:string; createdAt:string;
    user: { name:string; email:string };
  }[];
}

export interface EventFormData {
  title: string; description: string; venue: string;
  eventDate: string; registrationClosingDate: string; durationInHours: number;
}

export type Tab = 'events' | 'attendees' | 'analytics' | 'reports';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const EMPTY_FORM: EventFormData = {
  title:'', description:'', venue:'',
  eventDate:'', registrationClosingDate:'', durationInHours:1,
};

export function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

export function toLocalDT(d: string) {
  try { return new Date(d).toISOString().slice(0,16); } catch { return ''; }
}

export function toBoolean(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (v instanceof Uint8Array) return v[0] === 1;
  return Number(v) === 1;
}

export function initials(name?: string, fallback = '?') {
  return name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || fallback;
}

export function eventStatus(ev: OrgEvent) {
  const now = new Date();
  const d   = new Date(ev.eventDate);
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth()    === now.getMonth()    &&
    d.getDate()     === now.getDate();
  const upcoming = d > now;
  return { isToday, upcoming };
}

export function canMarkAttendance(ev: OrgEvent): boolean {
  const ed = new Date(ev.eventDate); ed.setHours(0,0,0,0);
  const td = new Date();             td.setHours(0,0,0,0);
  return ed <= td;
}
