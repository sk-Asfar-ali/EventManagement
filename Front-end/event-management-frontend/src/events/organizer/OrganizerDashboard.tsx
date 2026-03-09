import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import './OrganizerDashboard.css';

/* ─── Types ──────────────────────────────────── */
interface OrgEvent {
  id: number; title: string; description: string;
  venue: string; eventDate: string;
  registrationClosingDate: string; durationInHours: number;
  registrations?: Registration[];
}
interface Registration { registrationId:number; status:string; user: { id:number; name:string; email:string; }; }

interface AttendanceUser {
  userId: number;
  name: string;
  email: string;
  isPresent: boolean | string;
  attendanceId?: number;
}
interface AttendanceSummary {
  eventId: number;
  totalRegistered: number;
  totalPresent: number;
  totalAbsent: number;
  users: AttendanceUser[];
}

/* ─── Reports Types ──────────────────────────── */
interface ReportEventCard {
  id: number; title: string; venue: string; eventDate: string;
  totalRegistrations: number; presentCount: number; attendanceRate: number;
}
interface ReportDashboard {
  dashboard: { totalEvents: number; totalRegistrations: number; totalPresent: number; upcomingEvents: number; };
  events: ReportEventCard[];
}
interface TrendPoint { date: string; count: string; }
interface ReportEventDetail {
  event: { id:number; title:string; venue:string; eventDate:string; durationInHours:number; };
  stats: { totalRegistered:number; totalCancelled:number; totalPresent:number; totalAbsent:number; attendanceRate:number; };
  registrationTrend: TrendPoint[];
  attendanceBreakdown: { present:number; absent:number; };
  reports: { id:number; content:string; driveLink?:string; createdAt:string; user:{ name:string; email:string; }; }[];
}

type Tab = 'events' | 'attendees' | 'analytics' | 'reports';

interface EventFormData {
  title: string; description: string; venue: string;
  eventDate: string; registrationClosingDate: string; durationInHours: number;
}

const EMPTY_FORM: EventFormData = {
  title:'', description:'', venue:'',
  eventDate:'', registrationClosingDate:'', durationInHours:1,
};

/* ─── Helpers ────────────────────────────────── */
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
}
function toLocalDatetimeValue(d: string) {
  // convert ISO to datetime-local input format
  try { return new Date(d).toISOString().slice(0,16); } catch { return ''; }
}

/* ─── Event Form Modal ───────────────────────── */
function EventModal({
  initial, onClose, onSave, loading,
}: { initial?: OrgEvent|null; onClose:()=>void; onSave:(data:EventFormData)=>void; loading:boolean }) {
  const [form, setForm] = useState<EventFormData>(
    initial ? {
      title: initial.title, description: initial.description,
      venue: initial.venue,
      eventDate: toLocalDatetimeValue(initial.eventDate),
      registrationClosingDate: toLocalDatetimeValue(initial.registrationClosingDate),
      durationInHours: initial.durationInHours,
    } : EMPTY_FORM
  );

  const set = (k: keyof EventFormData, v: string|number) => setForm(f => ({...f,[k]:v}));

  return (
    <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <h2>{initial ? 'Edit Event' : 'Create New Event'}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="modal-form">
          <div className="mfield">
            <label>Event Title</label>
            <input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Annual Tech Summit"/>
          </div>
          <div className="mfield">
            <label>Description</label>
            <textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Describe your event…"/>
          </div>
          <div className="mfield">
            <label>Venue</label>
            <input value={form.venue} onChange={e=>set('venue',e.target.value)} placeholder="e.g. Chennai Trade Centre"/>
          </div>
          <div className="modal-row">
            <div className="mfield">
              <label>Event Date & Time</label>
              <input type="datetime-local" value={form.eventDate} onChange={e=>set('eventDate',e.target.value)}/>
            </div>
            <div className="mfield">
              <label>Registration Closes</label>
              <input type="datetime-local" value={form.registrationClosingDate}
                onChange={e=>set('registrationClosingDate',e.target.value)}/>
            </div>
          </div>
          <div className="mfield" style={{maxWidth:160}}>
            <label>Duration (hours)</label>
            <input type="number" min={1} max={72} value={form.durationInHours}
              onChange={e=>set('durationInHours',parseInt(e.target.value)||1)}/>
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-teal" disabled={loading || !form.title || !form.eventDate}
              onClick={()=>onSave(form)}>
              {loading ? <span className="btn-spin"/> : initial ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Attendees Modal ────────────────────────── */
function AttendeesModal({ event, regs, onClose }:
  { event:OrgEvent; regs:Registration[]; onClose:()=>void }) {
  // backend already returns only REGISTERED attendees
  return (
    <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <h2>Attendees — {event.title}</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <p style={{fontSize:'.83rem',color:'var(--ink-3)',marginBottom:16}}>
          {regs.length} registered attendee{regs.length!==1?'s':''}
        </p>
        {regs.length === 0 ? (
          <div className="empty-state" style={{padding:'32px 0'}}>
            <div className="empty-state-icon">👥</div>
            <p>No registrations yet</p>
          </div>
        ) : (
          <div className="attendees-list">
            {regs.map(r=>{
              const initials = r.user.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '?';
              return (
                <div className="attendee-row" key={r.registrationId}>
                  <div className="attendee-avatar">{initials}</div>
                  <div>
                    <div className="attendee-name">{r.user.name}</div>
                    <div className="attendee-email">{r.user.email}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Attendance Modal ───────────────────────── */

// Normalise isPresent to a real boolean regardless of what the DB/driver sends
// back (MySQL raw queries return 0/1 as numbers, Buffers, or strings).
function toBoolean(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (v instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(v as any)))
    return (v as Uint8Array)[0] === 1;
  return Number(v) === 1;
}

function AttendanceModal({ event, onClose, api, showToast }:
  { event: OrgEvent; onClose: () => void; api: any; showToast: (m:string) => void }) {

  // An event is "markable" on its calendar date OR any day after it started.
  const canMark = (() => {
    const eventDay = new Date(event.eventDate);
    eventDay.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDay <= today;
  })();

  const isToday = (() => {
    const now = new Date(); const d = new Date(event.eventDate);
    return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth() && d.getDate()===now.getDate();
  })();

  const [summary, setSummary]         = useState<AttendanceSummary | null>(null);
  const [localPresent, setLocalPresent] = useState<Record<number, boolean>>({});
  const [saving, setSaving]           = useState<number | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data: AttendanceSummary = await api.get(`/attendance/event/${event.id}`);
      setSummary(data);
      // Seed local map — normalise every value to a real boolean
      const map: Record<number, boolean> = {};
      for (const u of data.users) {
        map[u.userId] = toBoolean(u.isPresent);
      }
      setLocalPresent(map);
    } catch (e: any) {
      setError(e.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  useEffect(() => { load(); }, []);

  const toggle = async (userId: number, currentValue: boolean) => {
    if (!canMark) {
      showToast('Attendance can only be marked on or after the event date');
      return;
    }
    setSaving(userId);
    const newVal = !currentValue;
    // Optimistic update so the UI feels instant
    setLocalPresent(prev => ({ ...prev, [userId]: newVal }));
    try {
      await api.post('/attendance/mark-attendance', {
        userId,
        eventId: event.id,
        isPresent: newVal,
      });
      showToast(newVal ? '✓ Marked present' : '✓ Marked absent');
      // Re-fetch to sync summary counts from server
      load();
    } catch (e: any) {
      // Roll back optimistic update on failure
      setLocalPresent(prev => ({ ...prev, [userId]: currentValue }));
      showToast(e.message || 'Failed to update attendance');
    } finally {
      setSaving(null);
    }
  };

  const presentCount = Object.values(localPresent).filter(Boolean).length;
  const totalCount   = summary?.totalRegistered ?? 0;

  return (
    <div className="modal-overlay" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="modal" style={{maxWidth: 560}}>
        <div className="modal-head">
          <div>
            <h2>Attendance — {event.title}</h2>
            <p style={{fontSize:'.8rem',color:'var(--ink-3)',marginTop:3}}>
              {fmtDate(event.eventDate)}
              {isToday && (
                <span style={{
                  marginLeft:8,background:'var(--teal-pale)',color:'var(--teal)',
                  padding:'2px 8px',borderRadius:100,fontSize:'.7rem',fontWeight:600,
                }}>Today</span>
              )}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Future event warning */}
        {!canMark && (
          <div style={{
            background:'var(--amber-pale)',border:'1px solid rgba(212,134,10,.2)',
            borderRadius:'var(--r-sm)',padding:'10px 14px',marginBottom:16,
            fontSize:'.82rem',color:'var(--amber)',display:'flex',gap:8,alignItems:'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M7 4v3M7 9.5h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            Attendance can only be marked on or after the event date.
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{
            background:'var(--ember-pale)',border:'1px solid rgba(200,75,49,.2)',
            borderRadius:'var(--r-sm)',padding:'10px 14px',marginBottom:16,
            fontSize:'.82rem',color:'var(--ember)',display:'flex',gap:8,alignItems:'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M7 4v3M7 9.5h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            {error}
            <button onClick={load} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'var(--ember)',fontWeight:600,fontSize:'.8rem'}}>Retry</button>
          </div>
        )}

        {/* Stats bar */}
        {!loading && summary && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
            {([
              ['Registered', totalCount,                              'var(--ink)'],
              ['Present',    presentCount,                           'var(--teal)'],
              ['Absent',     Math.max(totalCount - presentCount, 0), 'var(--ember)'],
            ] as [string, number, string][]).map(([label, val, color]) => (
              <div key={label} style={{
                background:'var(--cream-2)',borderRadius:'var(--r-sm)',padding:'12px',textAlign:'center',
              }}>
                <div style={{fontSize:'1.4rem',fontFamily:'var(--serif)',fontWeight:700,color}}>{val}</div>
                <div style={{fontSize:'.72rem',color:'var(--ink-3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.4px',marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="loading-rows">
            {[1,2,3].map(i=><div key={i} className="skeleton" style={{height:56,animationDelay:`${i*.08}s`}}/>)}
          </div>
        ) : !summary || summary.users.length === 0 ? (
          <div className="empty-state" style={{padding:'24px 0'}}>
            <div className="empty-state-icon">👥</div>
            <h3>No registrations</h3>
            <p>No one has registered for this event yet</p>
          </div>
        ) : (
          <div className="attendees-list">
            {summary.users.map(u => {
              const isPresent = localPresent[u.userId] ?? false;
              const isSaving  = saving === u.userId;
              const initials  = u.name?.split(' ').map((w:string)=>w[0]).join('').slice(0,2).toUpperCase() || '?';
              return (
                <div key={u.userId} className="attendee-row" style={{
                  justifyContent:'space-between',
                  borderLeft: `3px solid ${isPresent ? 'var(--teal)' : 'var(--cream-3)'}`,
                  transition:'border-color .2s',
                }}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div className="attendee-avatar" style={{
                      background: isPresent ? 'var(--teal)' : 'var(--cream-3)',
                      color: isPresent ? 'white' : 'var(--ink-3)',
                      transition:'background .2s,color .2s',
                    }}>{initials}</div>
                    <div>
                      <div className="attendee-name">{u.name}</div>
                      <div className="attendee-email">{u.email}</div>
                    </div>
                  </div>
                  <button
                    disabled={isSaving || !canMark}
                    onClick={() => toggle(u.userId, isPresent)}
                    style={{
                      padding:'7px 16px',border:'none',borderRadius:'var(--r-sm)',
                      cursor: canMark ? 'pointer' : 'not-allowed',
                      fontFamily:'var(--sans)',fontSize:'.8rem',fontWeight:600,
                      background: isPresent ? 'var(--teal-pale)' : 'var(--ember-pale)',
                      color: isPresent ? 'var(--teal)' : 'var(--ember)',
                      display:'flex',alignItems:'center',gap:6,minWidth:96,justifyContent:'center',
                      opacity: !canMark ? .45 : 1,
                      transition:'background .2s,color .2s',
                    }}
                  >
                    {isSaving ? (
                      <span style={{
                        width:14,height:14,border:'2px solid currentColor',borderTopColor:'transparent',
                        borderRadius:'50%',animation:'spin .7s linear infinite',display:'inline-block',
                      }}/>
                    ) : isPresent ? (
                      <><svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>Present</>
                    ) : (
                      <><svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>Absent</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────── */
export default function OrganizerDashboard() {
  const { user, logout } = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  const [tab, setTab]           = useState<Tab>('events');
  const [events, setEvents]     = useState<OrgEvent[]>([]);
  const [loading, setLoading]   = useState(false);
  const [formLoading, setFL]    = useState(false);
  const [showCreate, setShowCreate]   = useState(false);
  const [editEvent, setEditEvent]     = useState<OrgEvent|null>(null);
  const [attendeesEvent, setAttendeesEvent] = useState<OrgEvent|null>(null);
  const [attendeesData, setAttendeesData]   = useState<Registration[]>([]);
  const [attendanceEvent, setAttendanceEvent] = useState<OrgEvent|null>(null);
  const [toast, setToast]       = useState('');

  // Reports state
  const [reportDash, setReportDash]       = useState<ReportDashboard | null>(null);
  const [reportDetail, setReportDetail]   = useState<ReportEventDetail | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError]     = useState('');

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(''),3000); };

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try { setEvents(await api.get('/events/organizer/my')); }
    catch {}
    finally { setLoading(false); }
  }, []);

  const loadReportDashboard = useCallback(async () => {
    setReportLoading(true); setReportError(''); setReportDetail(null);
    try { setReportDash(await api.get('/organizer/reports')); }
    catch (e: any) { setReportError(e.message || 'Failed to load reports'); }
    finally { setReportLoading(false); }
  }, []);

  const loadReportDetail = useCallback(async (eventId: number) => {
    setReportLoading(true); setReportError('');
    try { setReportDetail(await api.get(`/organizer/reports/${eventId}`)); }
    catch (e: any) { setReportError(e.message || 'Failed to load event report'); }
    finally { setReportLoading(false); }
  }, []);

  useEffect(() => { loadEvents(); }, []);
  useEffect(() => { if (tab === 'reports') loadReportDashboard(); }, [tab]);

  /* Stats */
  const totalEvents      = events.length;
  const upcomingEvents   = events.filter(e => new Date(e.eventDate) > new Date()).length;
  const pastEvents       = totalEvents - upcomingEvents;

  /* Create */
  const handleCreate = async (data: EventFormData) => {
    setFL(true);
    try {
      await api.post('/events', data);
      showToast('✓ Event created!');
      setShowCreate(false);
      loadEvents();
    } catch (e:any) { showToast(e.message); }
    finally { setFL(false); }
  };

  /* Edit */
  const handleEdit = async (data: EventFormData) => {
    if (!editEvent) return;
    setFL(true);
    try {
      await api.put(`/events/${editEvent.id}`, data);
      showToast('✓ Event updated!');
      setEditEvent(null);
      loadEvents();
    } catch (e:any) { showToast(e.message); }
    finally { setFL(false); }
  };

  /* Delete */
  const handleDelete = async (id: number) => {
    if (!confirm('Delete this event? This will notify all registered users.')) return;
    try {
      await api.del(`/events/${id}`);
      showToast('Event deleted.');
      loadEvents();
    } catch (e:any) { showToast(e.message); }
  };

  /* View attendees — GET /events/:eventId/registrations */
  const openAttendees = async (ev: OrgEvent) => {
    setAttendeesEvent(ev);
    setAttendeesData([]); // clear previous while loading
    try {
      const data = await api.get(`/events/${ev.id}/registrations`);
      setAttendeesData(data || []);
    } catch {
      setAttendeesData([]);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)
    : user?.email?.[0]?.toUpperCase() || 'O';

  const tabTitles: Record<Tab,string> = {
    events:'My Events', attendees:'Attendees', analytics:'Analytics', reports:'Reports',
  };

  return (
    <div className="od-shell">
      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed',top:20,left:'50%',transform:'translateX(-50%)',
          background:'var(--teal)',color:'white',padding:'10px 20px',borderRadius:10,
          fontSize:'.85rem',fontWeight:500,zIndex:999,boxShadow:'0 4px 20px rgba(0,0,0,.15)',
          animation:'fadeIn .25s ease',fontFamily:'var(--sans)',
        }}>{toast}</div>
      )}

      {/* Modals */}
      {showCreate && (
        <EventModal onClose={()=>setShowCreate(false)} onSave={handleCreate} loading={formLoading}/>
      )}
      {editEvent && (
        <EventModal initial={editEvent} onClose={()=>setEditEvent(null)} onSave={handleEdit} loading={formLoading}/>
      )}
      {attendeesEvent && (
        <AttendeesModal event={attendeesEvent} regs={attendeesData} onClose={()=>setAttendeesEvent(null)}/>
      )}
      {attendanceEvent && (
        <AttendanceModal event={attendanceEvent} onClose={()=>setAttendanceEvent(null)} api={api} showToast={showToast}/>
      )}

      {/* Sidebar */}
      <aside className="od-sidebar">
        <div className="od-logo">
          <div className="od-logo-mark">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 16H2L10 2Z" fill="white"/>
            </svg>
          </div>
          <span className="od-logo-name">Evently</span>
        </div>

        <nav className="od-nav">
          {([
            ['events','My Events', <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 1.5v2M9.5 1.5v2M1.5 5.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>],
            ['attendees','Attendees', <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="4" r="2.25" stroke="currentColor" strokeWidth="1.3"/><path d="M1 12c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="10" cy="4.5" r="1.75" stroke="currentColor" strokeWidth="1.3"/><path d="M12 12c0-1.8-1.2-3-3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>],
            ['analytics','Analytics', <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 11.5l3.5-4 3 2.5 4-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>],
            ['reports','Reports', <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="1.5" width="10" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 5h5M4.5 7.5h5M4.5 10h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>],
          ] as [Tab,string,React.ReactNode][]).map(([t,label,icon])=>(
            <button key={t} className={`od-nav-btn ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
              {icon}{label}
            </button>
          ))}
        </nav>

        <div className="od-sidebar-footer">
          <div className="od-user-chip">
            <div className="od-user-avatar">{initials}</div>
            <span className="od-user-name">{user?.name || user?.email}</span>
          </div>
          <button className="od-sign-out" onClick={handleLogout}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M5 11.5H3a1 1 0 01-1-1v-8a1 1 0 011-1h2M8.5 9.5l3-3-3-3M11.5 6.5H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="od-content">
        <header className="od-topbar">
          <span className="od-topbar-title">{tabTitles[tab]}</span>
          <div className="od-topbar-right">
            {tab === 'events' && (
              <button className="btn btn-teal btn-sm" onClick={()=>setShowCreate(true)}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                New Event
              </button>
            )}
          </div>
        </header>

        <div className="od-main">

          {/* ── EVENTS TAB ── */}
          {tab === 'events' && (
            <>
              {/* Stats */}
              <div className="stats-row">
                {[
                  ['Total Events', totalEvents, 'All time'],
                  ['Upcoming', upcomingEvents, 'Scheduled'],
                  ['Past', pastEvents, 'Completed'],
                ].map(([label,val,sub],i)=>(
                  <div className="stat-card" key={label as string} style={{animationDelay:`${i*.08}s`}}>
                    <div className="stat-label">{label}</div>
                    <div className="stat-value">{val}</div>
                    <div className="stat-sub">{sub}</div>
                  </div>
                ))}
              </div>

              {/* Events list */}
              {loading ? (
                <div className="loading-rows">
                  {[1,2,3].map(i=><div key={i} className="skeleton" style={{height:72,animationDelay:`${i*.1}s`}}/>)}
                </div>
              ) : events.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📅</div>
                  <h3>No events yet</h3>
                  <p>Create your first event to get started</p>
                  <button className="btn btn-teal btn-sm" style={{margin:'16px auto 0',maxWidth:140}}
                    onClick={()=>setShowCreate(true)}>
                    + Create Event
                  </button>
                </div>
              ) : (
                <div className="events-table-wrap">
                  <div className="events-table-head">
                    <h3>Your Events ({events.length})</h3>
                  </div>
                  {events.map((ev, i) => {
                    const upcoming = new Date(ev.eventDate) > new Date();
                    const isToday = (() => {
                      const now = new Date(); const d = new Date(ev.eventDate);
                      return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth() && d.getDate()===now.getDate();
                    })();
                    // Markable on the event calendar day OR any day after
                    const canMark = (() => {
                      const eventDay = new Date(ev.eventDate); eventDay.setHours(0,0,0,0);
                      const today = new Date(); today.setHours(0,0,0,0);
                      return eventDay <= today;
                    })();
                    return (
                      <div className="org-event-row" key={ev.id} style={{animationDelay:`${i*.05}s`,gridTemplateColumns:'1fr auto auto auto auto'}}>
                        <div>
                          <div className="org-event-name">{ev.title}</div>
                          <div className="org-event-meta">
                            <span>
                              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                <rect x=".75" y="1.25" width="9.5" height="8.5" rx="1.25" stroke="currentColor" strokeWidth="1.1"/>
                                <path d="M3.5 1v1.5M7.5 1v1.5M.75 4.5h9.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                              </svg>
                              {fmtDate(ev.eventDate)}
                            </span>
                            {ev.venue && (
                              <span>
                                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                  <path d="M5.5 1A3 3 0 018.5 4C8.5 7 5.5 10 5.5 10S2.5 7 2.5 4A3 3 0 015.5 1z" stroke="currentColor" strokeWidth="1.1"/>
                                </svg>
                                {ev.venue}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className={`event-status-pill ${upcoming?'pill-reg':'pill-closed'}`} style={{whiteSpace:'nowrap'}}>
                          {upcoming ? 'Upcoming' : 'Past'}
                        </span>

                        <button className="btn btn-outline btn-sm" style={{whiteSpace:'nowrap'}}
                          onClick={()=>openAttendees(ev)}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="4.5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M1 10.5c0-1.933 1.567-3 3.5-3s3.5 1.067 3.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            <circle cx="9" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M10.5 10.5c0-1.5-1-2.5-2.5-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          Registrations
                        </button>

                        <button
                          className="btn btn-sm"
                          style={{
                            whiteSpace:'nowrap',
                            background: isToday ? 'var(--teal)' : canMark ? 'var(--teal-pale)' : 'var(--cream-2)',
                            color: isToday ? 'white' : canMark ? 'var(--teal)' : 'var(--ink-3)',
                            border: 'none',
                          }}
                          onClick={()=>setAttendanceEvent(ev)}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {isToday ? 'Mark Attendance' : canMark ? 'View / Edit' : 'Attendance'}
                        </button>

                        <div style={{display:'flex',gap:6}}>
                          <button className="btn btn-outline btn-sm" onClick={()=>setEditEvent(ev)}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M8.5 2L10 3.5l-7 7-1.5.5.5-1.5 7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Edit
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(ev.id)}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 3h8M4.5 3V2h3v1M5 5.5v3.5M7 5.5v3.5M3 3l.5 7.5h5L9 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── ATTENDEES TAB ── */}
          {tab === 'attendees' && (
            <>
              <p style={{color:'var(--ink-3)',fontSize:'.87rem',marginBottom:24}}>
                View registrations or manage attendance for any of your events. Attendance can be marked on the day of the event.
              </p>
              {loading ? (
                <div className="loading-rows">{[1,2,3].map(i=><div key={i} className="skeleton" style={{height:72,animationDelay:`${i*.08}s`}}/>)}</div>
              ) : events.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <h3>No events yet</h3>
                  <p>Create an event first to manage attendees</p>
                </div>
              ) : (
                <div className="events-table-wrap">
                  <div className="events-table-head"><h3>Your Events</h3></div>
                  {events.map(ev => {
                    const upcoming = new Date(ev.eventDate) > new Date();
                    const isToday = (() => {
                      const now = new Date(); const d = new Date(ev.eventDate);
                      return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth() && d.getDate()===now.getDate();
                    })();
                    const canMark = (() => {
                      const eventDay = new Date(ev.eventDate); eventDay.setHours(0,0,0,0);
                      const today = new Date(); today.setHours(0,0,0,0);
                      return eventDay <= today;
                    })();
                    return (
                      <div className="org-event-row" key={ev.id} style={{gridTemplateColumns:'1fr auto auto'}}>
                        <div>
                          <div className="org-event-name">{ev.title}</div>
                          <div className="org-event-meta">
                            <span>{fmtDate(ev.eventDate)}</span>
                            <span className={`event-status-pill ${upcoming?'pill-reg':'pill-closed'}`} style={{marginLeft:4}}>
                              {isToday ? '🟢 Today' : upcoming ? 'Upcoming' : 'Past'}
                            </span>
                          </div>
                        </div>
                        <button className="btn btn-outline btn-sm" onClick={()=>openAttendees(ev)}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <circle cx="4.5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M1 10.5c0-1.933 1.567-3 3.5-3s3.5 1.067 3.5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          Registrations
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{
                            background: isToday ? 'var(--teal)' : canMark ? 'var(--teal-pale)' : 'var(--cream-2)',
                            color: isToday ? 'white' : canMark ? 'var(--teal)' : 'var(--ink-3)',
                            border:'none',
                          }}
                          onClick={()=>setAttendanceEvent(ev)}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {isToday ? 'Mark Attendance' : canMark ? 'View / Edit' : 'Attendance'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          

          {/* ── REPORTS TAB ── */}
          {tab === 'reports' && (
            <>
              {reportDetail ? (
                /* ── EVENT DETAIL VIEW ── */
                <>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
                    <button
                      onClick={()=>{ setReportDetail(null); }}
                      style={{
                        background:'none',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',
                        padding:'7px 14px',cursor:'pointer',fontFamily:'var(--sans)',fontSize:'.82rem',
                        color:'var(--ink-3)',display:'flex',alignItems:'center',gap:6,
                        transition:'border-color .15s,color .15s',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Back to Reports
                    </button>
                    <div>
                      <h2 style={{fontFamily:'var(--serif)',fontSize:'1.3rem',fontWeight:700,color:'var(--ink)',letterSpacing:'-.4px'}}>
                        {reportDetail.event.title}
                      </h2>
                      <p style={{fontSize:'.8rem',color:'var(--ink-3)',marginTop:2}}>
                        {fmtDate(reportDetail.event.eventDate)} · {reportDetail.event.venue} · {reportDetail.event.durationInHours}h
                      </p>
                    </div>
                  </div>

                  {reportLoading ? (
                    <div className="loading-rows">{[1,2,3].map(i=><div key={i} className="skeleton" style={{height:80,animationDelay:`${i*.08}s`}}/>)}</div>
                  ) : (
                    <>
                      {/* KPI cards */}
                      <div className="stats-row" style={{marginBottom:28}}>
                        {[
                          { label:'Registered',      val: reportDetail.stats.totalRegistered,  color:'var(--ink)',   sub:'Total sign-ups' },
                          { label:'Cancelled',        val: reportDetail.stats.totalCancelled,   color:'var(--ember)', sub:'Dropped out' },
                          { label:'Present',          val: reportDetail.stats.totalPresent,     color:'var(--teal)',  sub:'Attended' },
                          { label:'Absent',           val: reportDetail.stats.totalAbsent,      color:'var(--amber)', sub:'No-show' },
                          { label:'Attendance Rate',  val: `${reportDetail.stats.attendanceRate}%`, color: reportDetail.stats.attendanceRate>=75?'var(--green)':reportDetail.stats.attendanceRate>=50?'var(--amber)':'var(--ember)', sub:'Present / registered' },
                        ].map((s,i)=>(
                          <div className="stat-card" key={s.label} style={{animationDelay:`${i*.06}s`,borderTop:`3px solid ${s.color}`}}>
                            <div className="stat-label">{s.label}</div>
                            <div className="stat-value" style={{color:s.color,fontSize:'1.8rem'}}>{s.val}</div>
                            <div className="stat-sub">{s.sub}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18,marginBottom:24}}>

                        

                        {/* Attendance Breakdown */}
                        <div style={{background:'white',border:'1px solid var(--border)',borderRadius:'var(--r)',padding:'20px 22px'}}>
                          <h3 style={{fontFamily:'var(--serif)',fontSize:'.95rem',fontWeight:700,color:'var(--ink)',marginBottom:16}}>
                            Attendance Breakdown
                          </h3>
                          {(() => {
                            const { present, absent } = reportDetail.attendanceBreakdown;
                            const total = present + absent;
                            if (total === 0) return (
                              <div style={{textAlign:'center',padding:'24px 0',color:'var(--ink-4)',fontSize:'.82rem'}}>No attendance data yet</div>
                            );
                            const presentPct = Math.round((present/total)*100);
                            const absentPct  = 100 - presentPct;
                            // SVG donut
                            const r = 40; const cx = 60; const cy = 60;
                            const circ = 2*Math.PI*r;
                            const presentDash = (presentPct/100)*circ;
                            return (
                              <div style={{display:'flex',alignItems:'center',gap:20}}>
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ember-pale)" strokeWidth="16"/>
                                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--teal)" strokeWidth="16"
                                    strokeDasharray={`${presentDash} ${circ}`}
                                    strokeDashoffset={circ/4}
                                    strokeLinecap="round"
                                    style={{transition:'stroke-dasharray .6s cubic-bezier(.4,0,.2,1)'}}
                                  />
                                  <text x={cx} y={cy-4} textAnchor="middle" style={{fontFamily:'var(--serif)',fontSize:14,fontWeight:700,fill:'var(--ink)'}}>{presentPct}%</text>
                                  <text x={cx} y={cy+14} textAnchor="middle" style={{fontFamily:'var(--sans)',fontSize:9,fill:'var(--ink-3)'}}>present</text>
                                </svg>
                                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                                  {[
                                    { label:'Present', val:present, pct:presentPct, color:'var(--teal)', bg:'var(--teal-pale)' },
                                    { label:'Absent',  val:absent,  pct:absentPct,  color:'var(--ember)',bg:'var(--ember-pale)' },
                                  ].map(s=>(
                                    <div key={s.label} style={{display:'flex',alignItems:'center',gap:8}}>
                                      <div style={{width:10,height:10,borderRadius:'50%',background:s.color,flexShrink:0}}/>
                                      <div>
                                        <div style={{fontSize:'.8rem',fontWeight:600,color:'var(--ink-2)'}}>{s.label}</div>
                                        <div style={{fontSize:'.74rem',color:'var(--ink-3)'}}>{s.val} ({s.pct}%)</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Reports submitted */}
                      <div style={{background:'white',border:'1px solid var(--border)',borderRadius:'var(--r)',overflow:'hidden'}}>
                        <div className="events-table-head">
                          <h3>Submitted Reports ({reportDetail.reports.length})</h3>
                        </div>
                        {reportDetail.reports.length === 0 ? (
                          <div className="empty-state" style={{padding:'32px 0'}}>
                            <div className="empty-state-icon">📄</div>
                            <p>No reports submitted for this event</p>
                          </div>
                        ) : (
                          <div style={{display:'flex',flexDirection:'column',gap:0}}>
                            {reportDetail.reports.map((r,i)=>(
                              <div key={r.id} style={{
                                padding:'14px 22px',borderBottom:'1px solid var(--border-2)',
                                display:'flex',alignItems:'flex-start',gap:14,
                                background: i%2===0 ? 'white' : 'var(--cream-2)',
                              }}>
                                <div className="attendee-avatar" style={{background:'var(--ink)',color:'var(--cream)',fontSize:'.75rem',flexShrink:0}}>
                                  {r.user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()||'?'}
                                </div>
                                <div style={{flex:1,minWidth:0}}>
                                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                                    <span style={{fontSize:'.84rem',fontWeight:600,color:'var(--ink-2)'}}>{r.user?.name}</span>
                                    <span style={{fontSize:'.74rem',color:'var(--ink-4)'}}>{r.user?.email}</span>
                                    <span style={{marginLeft:'auto',fontSize:'.72rem',color:'var(--ink-4)'}}>
                                      {new Date(r.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                                    </span>
                                  </div>
                                  <p style={{fontSize:'.82rem',color:'var(--ink-2)',lineHeight:1.5,margin:0}}>{r.content}</p>
                                  {r.driveLink && (
                                    <a href={r.driveLink} target="_blank" rel="noreferrer" style={{
                                      display:'inline-flex',alignItems:'center',gap:5,marginTop:6,
                                      fontSize:'.76rem',color:'var(--teal)',textDecoration:'none',fontWeight:500,
                                    }}>
                                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                        <path d="M5.5 1.5h4v4M9.5 1.5l-6 6M2 4.5H1v5.5h5.5v-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                      View Drive Link
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                /* ── REPORTS DASHBOARD VIEW ── */
                <>
                  {reportLoading ? (
                    <div className="loading-rows">{[1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:80,animationDelay:`${i*.08}s`}}/>)}</div>
                  ) : reportError ? (
                    <div style={{
                      background:'var(--ember-pale)',border:'1px solid rgba(200,75,49,.2)',
                      borderRadius:'var(--r)',padding:'20px 24px',color:'var(--ember)',
                      fontSize:'.87rem',display:'flex',alignItems:'center',gap:10,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
                        <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                      {reportError}
                      <button onClick={loadReportDashboard} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'var(--ember)',fontWeight:600,fontSize:'.8rem'}}>Retry</button>
                    </div>
                  ) : !reportDash ? null : (
                    <>
                      {/* KPI row */}
                      <div className="stats-row" style={{marginBottom:28}}>
                        {[
                          { label:'Total Events',       val: reportDash.dashboard.totalEvents,        sub:'All time',         color:'var(--ink)' },
                          { label:'Total Registrations',val: reportDash.dashboard.totalRegistrations, sub:'Active sign-ups',  color:'var(--teal)' },
                          { label:'Total Attended',     val: reportDash.dashboard.totalPresent,       sub:'Confirmed present',color:'var(--green)' },
                          { label:'Upcoming Events',    val: reportDash.dashboard.upcomingEvents,     sub:'Scheduled ahead', color:'var(--amber)' },
                        ].map((s,i)=>(
                          <div className="stat-card" key={s.label} style={{animationDelay:`${i*.07}s`,borderTop:`3px solid ${s.color}`}}>
                            <div className="stat-label">{s.label}</div>
                            <div className="stat-value" style={{color:s.color}}>{s.val}</div>
                            <div className="stat-sub">{s.sub}</div>
                          </div>
                        ))}
                      </div>

                      {/* Event cards */}
                      {reportDash.events.length === 0 ? (
                        <div className="empty-state">
                          <div className="empty-state-icon">📊</div>
                          <h3>No event data yet</h3>
                          <p>Create and run events to see reports here</p>
                        </div>
                      ) : (
                        <div className="events-table-wrap">
                          <div className="events-table-head"><h3>Event Reports ({reportDash.events.length})</h3></div>
                          {reportDash.events.map((ev,i)=>{
                            const rate = ev.attendanceRate;
                            const rateColor = rate>=75?'var(--green)':rate>=50?'var(--amber)':'var(--ember)';
                            return (
                              <div key={ev.id} className="org-event-row" style={{
                                gridTemplateColumns:'1fr auto auto auto',
                                animationDelay:`${i*.05}s`,cursor:'pointer',
                              }} onClick={()=>loadReportDetail(ev.id)}>
                                <div>
                                  <div className="org-event-name">{ev.title}</div>
                                  <div className="org-event-meta">
                                    <span>{fmtDate(ev.eventDate)}</span>
                                    {ev.venue && <span>{ev.venue}</span>}
                                  </div>
                                </div>
                                <div style={{textAlign:'center'}}>
                                  <div style={{fontSize:'.72rem',color:'var(--ink-3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:3}}>Registered</div>
                                  <div style={{fontFamily:'var(--serif)',fontSize:'1.1rem',fontWeight:700,color:'var(--ink)'}}>{ev.totalRegistrations}</div>
                                </div>
                                <div style={{textAlign:'center'}}>
                                  <div style={{fontSize:'.72rem',color:'var(--ink-3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:3}}>Present</div>
                                  <div style={{fontFamily:'var(--serif)',fontSize:'1.1rem',fontWeight:700,color:'var(--teal)'}}>{ev.presentCount}</div>
                                </div>
                                <div style={{textAlign:'center',minWidth:80}}>
                                  <div style={{fontSize:'.72rem',color:'var(--ink-3)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:5}}>Attendance</div>
                                  <div style={{height:5,background:'var(--cream-3)',borderRadius:3,overflow:'hidden',marginBottom:3}}>
                                    <div style={{height:'100%',width:`${rate}%`,background:rateColor,borderRadius:3,transition:'width .5s'}}/>
                                  </div>
                                  <div style={{fontSize:'.78rem',fontWeight:700,color:rateColor}}>{rate}%</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
