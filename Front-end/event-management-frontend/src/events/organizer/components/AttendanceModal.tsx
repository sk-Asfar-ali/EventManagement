import { useState, useEffect, useCallback } from 'react';
import { ModalShell, SkeletonRows, EmptyState, AlertBanner } from './UI';
import { type OrgEvent, type AttendanceSummary, fmtDate, toBoolean, initials, canMarkAttendance } from '../utils/helpers';

interface Props {
  event: OrgEvent;g
  onClose: () => void;
  api: any;
  showToast: (m: string) => void;
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background:'var(--ivory-2)', borderRadius:'var(--r-sm)', padding:'12px', textAlign:'center' }}>
      <div style={{ fontFamily:'var(--serif)', fontSize:'1.5rem', fontWeight:700, color }}>{value}</div>
      <div style={{ fontSize:'.68rem', color:'var(--ink-4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.6px', marginTop:2 }}>{label}</div>
    </div>
  );
}

export function AttendanceModal({ event, onClose, api, showToast }: Props) {
  const canMark = canMarkAttendance(event);
  const isToday = (() => {
    const n = new Date(); const d = new Date(event.eventDate);
    return d.getFullYear()===n.getFullYear() && d.getMonth()===n.getMonth() && d.getDate()===n.getDate();
  })();

  const [summary, setSummary]           = useState<AttendanceSummary | null>(null);
  const [localPresent, setLocalPresent] = useState<Record<number, boolean>>({});
  const [saving, setSaving]             = useState<number | null>(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data: AttendanceSummary = await api.get(`/attendance/event/${event.id}`);
      setSummary(data);
      const map: Record<number, boolean> = {};
      for (const u of data.users) map[u.userId] = toBoolean(u.isPresent);
      setLocalPresent(map);
    } catch (e: any) {
      setError(e.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [event.id]);

  useEffect(() => { load(); }, []);

  const toggle = async (userId: number, current: boolean) => {
    if (!canMark) { showToast('Attendance can only be marked on or after the event date'); return; }
    setSaving(userId);
    const next = !current;
    setLocalPresent(p => ({ ...p, [userId]: next }));
    try {
      await api.post('/attendance/mark-attendance', { userId, eventId: event.id, isPresent: next });
      showToast(next ? '✓ Marked present' : '✓ Marked absent');
      load();
    } catch (e: any) {
      setLocalPresent(p => ({ ...p, [userId]: current }));
      showToast(e.message || 'Failed to update');
    } finally {
      setSaving(null);
    }
  };

  const presentCount = Object.values(localPresent).filter(Boolean).length;
  const total = summary?.totalRegistered ?? 0;

  return (
    <ModalShell
      title={`Attendance — ${event.title}`}
      subtitle={`${fmtDate(event.eventDate)}${isToday ? '  ·  Today' : ''}`}
      onClose={onClose}
      maxWidth={560}
    >
      {!canMark && (
        <AlertBanner type="warn" message="Attendance can only be marked on or after the event date." />
      )}
      {error && <AlertBanner type="error" message={error} onRetry={load} />}

      {!loading && summary && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
          <StatBox label="Registered" value={total}                              color="var(--ink)" />
          <StatBox label="Present"    value={presentCount}                       color="var(--jade)" />
          <StatBox label="Absent"     value={Math.max(total - presentCount, 0)}  color="var(--coral)" />
        </div>
      )}

      {loading ? (
        <SkeletonRows count={3} height={56} />
      ) : !summary || summary.users.length === 0 ? (
        <EmptyState icon="👥" title="No registrations" desc="No one has registered for this event yet" />
      ) : (
        <div className="attendees-list">
          {summary.users.map(u => {
            const present  = localPresent[u.userId] ?? false;
            const isSaving = saving === u.userId;
            return (
              <div key={u.userId} className="attendee-row" style={{
                justifyContent:'space-between',
                borderLeft:`3px solid ${present ? 'var(--jade)' : 'var(--ivory-3)'}`,
                transition:'border-color .2s',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div className="attendee-avatar" style={{
                    background: present ? 'var(--jade)' : 'var(--ivory-3)',
                    color: present ? 'white' : 'var(--ink-3)',
                    transition:'background .2s',
                  }}>{initials(u.name)}</div>
                  <div>
                    <div className="attendee-name">{u.name}</div>
                    <div className="attendee-email">{u.email}</div>
                  </div>
                </div>
                <button
                  className={`att-toggle ${present ? 'present' : 'absent'}`}
                  disabled={isSaving || !canMark}
                  onClick={() => toggle(u.userId, present)}
                >
                  {isSaving
                    ? <span className="btn-spin" style={{ width:12, height:12 }} />
                    : present ? '✓ Present' : '✗ Absent'
                  }
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ModalShell>
  );
}
