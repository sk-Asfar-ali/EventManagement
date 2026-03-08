import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import './UserDashboard.css';

/* ─── Types ─────────────────────────────────── */
interface EventItem {
  id: number; title: string; description: string;
  eventDate: string; venue?: string;
  registrationClosingDate?: string; durationInHours?: number;
  status: 'REGISTERED' | 'NOT_REGISTERED' | 'CLOSED';
  canCancel: boolean;
}
interface Booking { id: number; event: { id:number; title:string; venue?:string; eventDate:string; }; status: string; }
interface Notif  { id: number; message: string; isRead: boolean; createdAt: string; event?: {id:number}; }

type Tab = 'browse' | 'bookings' | 'profile' | 'notifications';

/* ─── Helpers ────────────────────────────────── */
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}
function fmtDay(d: string)  { return new Date(d).toLocaleDateString('en-IN', { day:'2-digit' }); }
function fmtMon(d: string)  { return new Date(d).toLocaleDateString('en-IN', { month:'short' }); }
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff/60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

/* ─── Sub-components ──────────────────────────── */
function NavBtn({ tab, active, label, icon, badge, onClick }:
  { tab:Tab; active:Tab; label:string; icon:React.ReactNode; badge?:number; onClick:(t:Tab)=>void }) {
  return (
    <button className={`ud-nav-btn ${active===tab?'active':''}`} onClick={()=>onClick(tab)}>
      {icon}<span>{label}</span>
      {!!badge && <span className="notif-badge"/>}
    </button>
  );
}

/* ─── Main Component ─────────────────────────── */
export default function UserDashboard() {
  const { user, logout } = useAuth();
  const api = useApi();
  const navigate = useNavigate();

  const [tab, setTab]           = useState<Tab>('browse');
  const [events, setEvents]     = useState<EventItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifs, setNotifs]     = useState<Notif[]>([]);
  const [loading, setLoading]   = useState(false);
  const [actionId, setActionId] = useState<number|null>(null);
  const [toast, setToast]       = useState('');

  const unreadCount = notifs.filter(n=>!n.isRead).length;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  /* ─── Data fetchers ── */
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try { setEvents(await api.get('/users/events')); }
    catch { /* handled by useApi */ }
    finally { setLoading(false); }
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try { setBookings(await api.get('/users/events/my')); }
    catch {}
    finally { setLoading(false); }
  }, []);

  const loadNotifs = useCallback(async () => {
    try { setNotifs(await api.get('/notifications')); }
    catch {}
  }, []);

  useEffect(() => {
    if (tab === 'browse')        loadEvents();
    if (tab === 'bookings')      loadBookings();
    if (tab === 'notifications') loadNotifs();
  }, [tab]);

  /* Initial notif count badge */
  useEffect(() => { loadNotifs(); }, []);

  /* ─── Actions ── */
  const registerEvent = async (eventId: number) => {
    setActionId(eventId);
    try {
      await api.post('/users/events/register', { eventId });
      showToast('✓ Registered successfully!');
      loadEvents();
    } catch (e: any) { showToast(e.message); }
    finally { setActionId(null); }
  };

  const cancelRegistration = async (eventId: number) => {
    if (!confirm('Cancel your registration for this event?')) return;
    setActionId(eventId);
    try {
      await api.patch('/users/events/cancel', { eventId });
      showToast('Registration cancelled.');
      loadEvents(); loadBookings();
    } catch (e: any) { showToast(e.message); }
    finally { setActionId(null); }
  };

  const markRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifs(prev => prev.map(n => n.id === id ? {...n, isRead:true} : n));
    } catch {}
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  /* ─── Render ── */
  const initials = user?.name
    ? user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="ud-shell">
      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed',top:20,left:'50%',transform:'translateX(-50%)',
          background:var_teal,color:'white',padding:'10px 20px',borderRadius:10,
          fontSize:'.85rem',fontWeight:500,zIndex:999,boxShadow:'0 4px 20px rgba(0,0,0,.15)',
          animation:'fadeIn .25s ease',fontFamily:'var(--sans)',
        }}>{toast}</div>
      )}

      {/* Topbar */}
      <header className="ud-topbar">
        <div className="ud-brand">
          <div className="ud-brand-mark">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 16H2L10 2Z" fill="white"/>
            </svg>
          </div>
          <span className="ud-brand-name">Evently</span>
        </div>

        <nav className="ud-nav">
          <NavBtn tab="browse" active={tab} label="Browse" onClick={setTab} icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>}/>
          <NavBtn tab="bookings" active={tab} label="My Bookings" onClick={setTab} icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M4.5 1.5v2M9.5 1.5v2M1.5 5.5h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>}/>
          <NavBtn tab="notifications" active={tab} label="Notifications" badge={unreadCount} onClick={setTab} icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5a4 4 0 014 4v2.5l1 1.5H2l1-1.5V5.5a4 4 0 014-4zM5.5 11.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>}/>
          <NavBtn tab="profile" active={tab} label="Profile" onClick={setTab} icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M2 12.5c0-2.761 2.239-4.5 5-4.5s5 1.739 5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>}/>
        </nav>

        <div className="ud-topbar-right">
          <div className="ud-avatar">{initials}</div>
          <button className="ud-logout-btn" onClick={handleLogout}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M5 11.5H3a1 1 0 01-1-1v-8a1 1 0 011-1h2M8.5 9.5l3-3-3-3M11.5 6.5H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="ud-main">

        {/* ── BROWSE ── */}
        {tab === 'browse' && (
          <>
            <div className="sec-head">
              <h2>Discover Events</h2>
              <p>Browse all upcoming events and register for the ones you love</p>
            </div>
            {loading ? (
              <div className="loading-rows">
                {[1,2,3,4].map(i=><div key={i} className="skeleton" style={{height:220, animationDelay:`${i*.1}s`}}/>)}
              </div>
            ) : events.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🗓️</div>
                <h3>No events yet</h3>
                <p>Check back soon for upcoming events</p>
              </div>
            ) : (
              <div className="events-grid">
                {events.map((ev, i) => (
                  <div className="event-card" key={ev.id} style={{animationDelay:`${i*.06}s`}}>
                    <div className={`event-card-stripe ${ev.status==='NOT_REGISTERED'?'open':ev.status==='REGISTERED'?'reg':'closed'}`}/>
                    <div className="event-card-body">
                      <div className="event-card-meta">
                        <span className={`event-status-pill ${
                          ev.status==='REGISTERED'?'pill-reg':
                          ev.status==='CLOSED'?'pill-closed':'pill-open'}`}>
                          {ev.status==='NOT_REGISTERED'?'Open':ev.status==='REGISTERED'?'Registered':'Closed'}
                        </span>
                      </div>
                      <h3 className="event-card-title">{ev.title}</h3>
                      <p className="event-card-desc">{ev.description}</p>
                      <div className="event-card-details">
                        <div className="event-detail">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <rect x=".75" y="1.75" width="10.5" height="9" rx="1.25" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M3.5 1v1.5M8.5 1v1.5M.75 5h10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          {fmtDate(ev.eventDate)}
                        </div>
                        {ev.venue && (
                          <div className="event-detail">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M6 1a3.5 3.5 0 013.5 3.5C9.5 7.5 6 11 6 11S2.5 7.5 2.5 4.5A3.5 3.5 0 016 1z" stroke="currentColor" strokeWidth="1.2"/>
                              <circle cx="6" cy="4.5" r="1" stroke="currentColor" strokeWidth="1.2"/>
                            </svg>
                            {ev.venue}
                          </div>
                        )}
                        {ev.durationInHours && (
                          <div className="event-detail">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
                              <path d="M6 3.5v2.5l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                            {ev.durationInHours}h duration
                          </div>
                        )}
                      </div>
                      <div className="event-card-actions">
                        {ev.status === 'NOT_REGISTERED' && (
                          <button className="btn btn-primary" disabled={actionId===ev.id}
                            onClick={()=>registerEvent(ev.id)}>
                            {actionId===ev.id ? <span className="btn-spin" style={{borderTopColor:'white'}}/> : '+ Register'}
                          </button>
                        )}
                        {ev.status === 'REGISTERED' && (
                          <>
                            <span className="btn btn-outline" style={{cursor:'default',flex:'none',padding:'9px 12px'}}>
                              ✓ Registered
                            </span>
                            {ev.canCancel && (
                              <button className="btn btn-danger btn-sm" disabled={actionId===ev.id}
                                onClick={()=>cancelRegistration(ev.id)}>
                                Cancel
                              </button>
                            )}
                          </>
                        )}
                        {ev.status === 'CLOSED' && (
                          <button className="btn btn-outline" disabled>Event Closed</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── BOOKINGS ── */}
        {tab === 'bookings' && (
          <>
            <div className="sec-head">
              <h2>My Bookings</h2>
              <p>All events you're currently registered for</p>
            </div>
            {loading ? (
              <div className="loading-rows">
                {[1,2,3].map(i=><div key={i} className="skeleton" style={{height:80,animationDelay:`${i*.1}s`}}/>)}
              </div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🎟️</div>
                <h3>No bookings yet</h3>
                <p>Browse events and register to see them here</p>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map((b, i) => (
                  <div className="booking-row" key={b.id} style={{animationDelay:`${i*.06}s`}}>
                    <div className="booking-date-block">
                      <div className="booking-date-day">{fmtDay(b.event.eventDate)}</div>
                      <div className="booking-date-month">{fmtMon(b.event.eventDate)}</div>
                    </div>
                    <div className="booking-info">
                      <div className="booking-title">{b.event.title}</div>
                      {b.event.venue && (
                        <div className="booking-venue">
                          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                            <path d="M5.5 1A3 3 0 018.5 4C8.5 6.5 5.5 10 5.5 10S2.5 6.5 2.5 4A3 3 0 015.5 1z" stroke="currentColor" strokeWidth="1.1"/>
                          </svg>
                          {b.event.venue}
                        </div>
                      )}
                    </div>
                    <div className="booking-actions">
                      <span className="event-status-pill pill-reg">Registered</span>
                      <button className="btn btn-danger btn-sm" onClick={()=>cancelRegistration(b.event.id)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── NOTIFICATIONS ── */}
        {tab === 'notifications' && (
          <>
            <div className="sec-head" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <h2>Notifications</h2>
                <p>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
              </div>
              {unreadCount > 0 && (
                <button className="btn btn-outline btn-sm" onClick={()=>notifs.filter(n=>!n.isRead).forEach(n=>markRead(n.id))}>
                  Mark all read
                </button>
              )}
            </div>
            {notifs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔔</div>
                <h3>No notifications</h3>
                <p>You'll be notified about events and updates here</p>
              </div>
            ) : (
              <div className="notif-list">
                {notifs.map((n, i) => (
                  <div className={`notif-item ${!n.isRead?'unread':''}`} key={n.id} style={{animationDelay:`${i*.05}s`}}>
                    <div className={`notif-dot ${n.isRead?'read':''}`}/>
                    <div style={{flex:1}}>
                      <div className="notif-text">{n.message}</div>
                      <div className="notif-time">{timeAgo(n.createdAt)}</div>
                    </div>
                    {!n.isRead && (
                      <button className="notif-mark-btn" title="Mark as read" onClick={()=>markRead(n.id)}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── PROFILE ── */}
        {tab === 'profile' && (
          <>
            <div className="sec-head">
              <h2>My Profile</h2>
              <p>Your account information</p>
            </div>
            <div className="profile-card">
              <div className="profile-avatar-row">
                <div className="profile-avatar">{initials}</div>
                <div>
                  <div className="profile-name">{user?.name || 'User'}</div>
                  <span className="profile-role">
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <circle cx="5.5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.1"/>
                      <path d="M1.5 10c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                    </svg>
                    Attendee
                  </span>
                </div>
              </div>
              <div className="profile-fields">
                <div className="profile-field">
                  <label>Full name</label>
                  <div className="profile-field-val">{user?.name || '—'}</div>
                </div>
                <div className="profile-field">
                  <label>Email address</label>
                  <div className="profile-field-val">{user?.email}</div>
                </div>
                <div className="profile-field">
                  <label>Account role</label>
                  <div className="profile-field-val" style={{textTransform:'capitalize'}}>{user?.role}</div>
                </div>
                <div className="profile-field">
                  <label>User ID</label>
                  <div className="profile-field-val" style={{fontFamily:'monospace',fontSize:'.82rem',color:'var(--ink-3)'}}>#{user?.id}</div>
                </div>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}

// tiny helper to avoid string issues in inline style
const var_teal = 'var(--teal)';
