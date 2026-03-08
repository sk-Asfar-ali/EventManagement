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

type Tab = 'events' | 'attendees' | 'analytics';

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
  const [toast, setToast]       = useState('');

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(''),3000); };

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try { setEvents(await api.get('/events/organizer/my')); }
    catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadEvents(); }, []);

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
    events:'My Events', attendees:'Attendees', analytics:'Analytics',
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
                    return (
                      <div className="org-event-row" key={ev.id} style={{animationDelay:`${i*.05}s`}}>
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
                          Attendees
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
                Click "Attendees" on any event to view registrations. Select an event below to manage attendees.
              </p>
              {loading ? (
                <div className="loading-rows">{[1,2].map(i=><div key={i} className="skeleton" style={{height:60}}/>)}</div>
              ) : events.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <h3>No events yet</h3>
                  <p>Create an event first to manage attendees</p>
                </div>
              ) : (
                <div className="events-table-wrap">
                  <div className="events-table-head"><h3>Select Event</h3></div>
                  {events.map(ev=>(
                    <div className="org-event-row" key={ev.id} style={{cursor:'pointer'}} onClick={()=>openAttendees(ev)}>
                      <div>
                        <div className="org-event-name">{ev.title}</div>
                        <div className="org-event-meta"><span>{fmtDate(ev.eventDate)}</span></div>
                      </div>
                      <button className="btn btn-teal btn-sm">View Attendees →</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── ANALYTICS TAB ── */}
          {tab === 'analytics' && (
            <>
              <div className="stats-row">
                {[
                  ['Total Events Created', totalEvents, 'All time'],
                  ['Upcoming Events', upcomingEvents, 'Still ahead'],
                  ['Past Events', pastEvents, 'Completed'],
                  ['Completion Rate', totalEvents > 0 ? `${Math.round(pastEvents/totalEvents*100)}%` : '—', 'Past / total'],
                ].map(([label,val,sub],i)=>(
                  <div className="stat-card" key={label as string} style={{animationDelay:`${i*.08}s`}}>
                    <div className="stat-label">{label}</div>
                    <div className="stat-value">{val}</div>
                    <div className="stat-sub">{sub}</div>
                  </div>
                ))}
              </div>

              {/* Events breakdown */}
              <div className="events-table-wrap" style={{marginTop:0}}>
                <div className="events-table-head"><h3>Events Breakdown</h3></div>
                {events.length === 0 ? (
                  <div className="empty-state" style={{padding:'32px 0'}}>
                    <p>No event data yet</p>
                  </div>
                ) : events.map(ev=>{
                  const upcoming = new Date(ev.eventDate) > new Date();
                  const closingPassed = new Date(ev.registrationClosingDate) < new Date();
                  return (
                    <div className="org-event-row" key={ev.id}>
                      <div>
                        <div className="org-event-name">{ev.title}</div>
                        <div className="org-event-meta">
                          <span>{fmtDate(ev.eventDate)}</span>
                          <span>Reg closes: {fmtDate(ev.registrationClosingDate)}</span>
                          <span>{ev.durationInHours}h</span>
                        </div>
                      </div>
                      <span className={`event-status-pill ${upcoming?closingPassed?'pill-open':'pill-reg':'pill-closed'}`}>
                        {!upcoming ? 'Past' : closingPassed ? 'Reg Closed' : 'Open'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
