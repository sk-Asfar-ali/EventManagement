import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';

import type { OrgEvent, Registration, EventFormData, ReportDashboard, ReportEventDetail, Tab } from './utils/helpers';
import { Toast } from './components/UI';
import { Sidebar } from './components/Sidebar';
import { EventModal } from './components/EventModal';
import { AttendeesModal } from './components/AttendeesModal';
import { AttendanceModal } from './components/AttendanceModal';
import { EventsTab } from './components/EventsTab';
import { AttendeesTab } from './components/AttendeesTab';
import { ReportsTab } from './components/ReportsTab';
import './OrganizerDashboard.css';

const TAB_SUBTITLES: Record<Tab, string> = {
  events: 'Manage and track your events',
  attendees: 'View registrations and mark attendance',
  reports: 'Detailed event summaries and analytics',
  analytics: ''
};

export default function OrganizerDashboard() {
  const { user, logout } = useAuth();
  const api              = useApi();
  const navigate         = useNavigate();

  const [tab, setTab]               = useState<Tab>('events');
  const [events, setEvents]         = useState<OrgEvent[]>([]);
  const [loading, setLoading]       = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast]           = useState('');

  // Modals
  const [showCreate, setShowCreate]             = useState(false);
  const [editEvent, setEditEvent]               = useState<OrgEvent | null>(null);
  const [attendeesEvent, setAttendeesEvent]     = useState<OrgEvent | null>(null);
  const [attendeesData, setAttendeesData]       = useState<Registration[]>([]);
  const [attendanceEvent, setAttendanceEvent]   = useState<OrgEvent | null>(null);

  // Reports
  const [reportDash, setReportDash]       = useState<ReportDashboard | null>(null);
  const [reportDetail, setReportDetail]   = useState<ReportEventDetail | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError]     = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ── Data loaders ─────────────────────────────────────────────────────────────
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

  const loadReportDetail = useCallback(async (id: number) => {
    setReportLoading(true); setReportError('');
    try { setReportDetail(await api.get(`/organizer/reports/${id}`)); }
    catch (e: any) { setReportError(e.message || 'Failed to load report'); }
    finally { setReportLoading(false); }
  }, []);

  useEffect(() => { loadEvents(); }, []);
  useEffect(() => { if (tab === 'reports') loadReportDashboard(); }, [tab]);

  // ── CRUD ──────────────────────────────────────────────────────────────────────
  const handleCreate = async (data: EventFormData) => {
    setFormLoading(true);
    try { await api.post('/events', data); showToast('✓ Event created!'); setShowCreate(false); loadEvents(); }
    catch (e: any) { showToast(e.message); }
    finally { setFormLoading(false); }
  };

  const handleEdit = async (data: EventFormData) => {
    if (!editEvent) return;
    setFormLoading(true);
    try { await api.put(`/events/${editEvent.id}`, data); showToast('✓ Event updated!'); setEditEvent(null); loadEvents(); }
    catch (e: any) { showToast(e.message); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this event? Registered users will be notified.')) return;
    try { await api.del(`/events/${id}`); showToast('Event deleted.'); loadEvents(); }
    catch (e: any) { showToast(e.message); }
  };

  const openAttendees = async (ev: OrgEvent) => {
    setAttendeesEvent(ev); setAttendeesData([]);
    try { setAttendeesData((await api.get(`/events/${ev.id}/registrations`)) || []); }
    catch { setAttendeesData([]); }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="od-shell">
      <Toast message={toast} />

      {showCreate && <EventModal onClose={() => setShowCreate(false)} onSave={handleCreate} loading={formLoading} />}
      {editEvent  && <EventModal initial={editEvent} onClose={() => setEditEvent(null)} onSave={handleEdit} loading={formLoading} />}
      {attendeesEvent && <AttendeesModal event={attendeesEvent} regs={attendeesData} onClose={() => setAttendeesEvent(null)} />}
      {attendanceEvent && <AttendanceModal event={attendanceEvent} onClose={() => setAttendanceEvent(null)} api={api} showToast={showToast} />}

      <Sidebar
        tab={tab} onTabChange={setTab}
        userName={user?.name} userEmail={user?.email}
        onLogout={() => { logout().then(() => navigate('/login')); }}
      />

      <div className="od-content">
        <header className="od-topbar">
          <div className="od-topbar-title">
            <h1>{{ events:'My Events', attendees:'Attendees', reports:'Reports' }[tab]}</h1>
            <span>{TAB_SUBTITLES[tab]}</span>
          </div>
          <div className="od-topbar-right">
            {tab === 'events' && (
              <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
                + New Event
              </button>
            )}
          </div>
        </header>

        <div className="od-main">
          {tab === 'events' && (
            <EventsTab events={events} loading={loading}
              onCreateClick={() => setShowCreate(true)}
              onEdit={setEditEvent} onDelete={handleDelete}
              onAttendees={openAttendees} onAttendance={setAttendanceEvent} />
          )}
          {tab === 'attendees' && (
            <AttendeesTab events={events} loading={loading}
              onAttendees={openAttendees} onAttendance={setAttendanceEvent} />
          )}
          {tab === 'reports' && (
            <ReportsTab
              dash={reportDash} detail={reportDetail}
              loading={reportLoading} error={reportError}
              onEventClick={loadReportDetail}
              onBack={() => setReportDetail(null)}
              onRetry={loadReportDashboard} />
          )}
        </div>
      </div>
    </div>
  );
}
