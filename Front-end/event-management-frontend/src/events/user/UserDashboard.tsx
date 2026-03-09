import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';

import { type EventItem, type Booking, type Notif, type AttendanceRecord, type Tab, userInitials } from './utils/helpers';
import { Toast, SectionHead } from './components/UI';
import { Topbar } from './components/Topbar';
import { BrowseTab } from './components/BrowseTab';
import { BookingsTab } from './components/BookingsTab';
import { NotificationsTab } from './components/NotificationsTab';
import { ProfileTab } from './components/ProfileTab';
import { AttendanceTab } from './components/AttendanceTab';
import './UserDashboard.css';

const SECTION_META: Record<Tab, { title: string; desc: string }> = {
  browse:        { title:'Discover Events',    desc:'Browse upcoming events and register for the ones you love' },
  bookings:      { title:'My Bookings',        desc:"All events you're currently registered for" },
  notifications: { title:'Notifications',      desc:'' },
  profile:       { title:'My Profile',         desc:'Your account information' },
  attendance:    { title:'My Attendance',      desc:"Your attendance record across all events you've registered for" },
};

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const api              = useApi();
  const navigate         = useNavigate();

  const [tab, setTab]               = useState<Tab>('browse');
  const [events, setEvents]         = useState<EventItem[]>([]);
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [notifs, setNotifs]         = useState<Notif[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading]       = useState(false);
  const [actionId, setActionId]     = useState<number | null>(null);
  const [toast, setToast]           = useState('');

  const unreadCount = notifs.filter(n => !n.isRead).length;
  const initials    = userInitials(user?.name, user?.email);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ── Loaders ─────────────────────────────────────────────────────────────────
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try { setEvents(await api.get('/users/events')); }
    catch {}
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

  const loadAttendance = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try { setAttendance(await api.get(`/attendance/user/${user.id}`)); }
    catch {}
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => {
    if (tab === 'browse')        loadEvents();
    if (tab === 'bookings')      loadBookings();
    if (tab === 'notifications') loadNotifs();
    if (tab === 'attendance')    loadAttendance();
  }, [tab]);

  useEffect(() => { loadNotifs(); }, []);

  // ── Actions ──────────────────────────────────────────────────────────────────
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
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = () => notifs.filter(n => !n.isRead).forEach(n => markRead(n.id));

  const { title, desc } = SECTION_META[tab];
  const notifDesc = unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!';

  return (
    <div className="ud-shell">
      <Toast message={toast} />

      <Topbar
        tab={tab} onTabChange={setTab}
        initials={initials} unreadCount={unreadCount}
        onLogout={() => { logout(); navigate('/login'); }}
      />

      <main className="ud-main">
        <SectionHead
          title={title}
          desc={tab === 'notifications' ? notifDesc : desc}
        />

        {tab === 'browse' && (
          <BrowseTab events={events} loading={loading}
            actionId={actionId} onRegister={registerEvent} onCancel={cancelRegistration} />
        )}
        {tab === 'bookings' && (
          <BookingsTab bookings={bookings} loading={loading} onCancel={cancelRegistration} />
        )}
        {tab === 'notifications' && (
          <NotificationsTab notifs={notifs} unreadCount={unreadCount}
            onMarkRead={markRead} onMarkAllRead={markAllRead} />
        )}
        {tab === 'profile' && (
          <ProfileTab user={user ?? {}} initials={initials} />
        )}
        {tab === 'attendance' && (
          <AttendanceTab attendance={attendance} loading={loading} />
        )}
      </main>
    </div>
  );
}
