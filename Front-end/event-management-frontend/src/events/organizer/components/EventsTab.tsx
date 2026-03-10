import { type OrgEvent, fmtDate, eventStatus, canMarkAttendance } from '../utils/helpers';
import { SkeletonRows, EmptyState, StatusPill } from './UI';

interface Props {
  events: OrgEvent[];
  loading: boolean;
  onCreateClick: () => void;
  onEdit: (ev: OrgEvent) => void;
  onDelete: (id: number) => void;
  onAttendees: (ev: OrgEvent) => void;
  onAttendance: (ev: OrgEvent) => void;
}

function StatCard({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

export function EventsTab({ events, loading, onCreateClick, onEdit, onDelete, onAttendees, onAttendance }: Props) {
  const total    = events.length;
  const upcoming = events.filter(e => new Date(e.eventDate) > new Date()).length;
  const past     = total - upcoming;

  return (
    <>
      <div className="stats-row">
        <StatCard label="Total Events" value={total}    sub="All time" />
        <StatCard label="Upcoming"     value={upcoming} sub="Scheduled" />
        <StatCard label="Past"         value={past}     sub="Completed" />
      </div>

      {loading ? (
        <SkeletonRows count={3} height={72} />
      ) : events.length === 0 ? (
        <EmptyState
          icon="📅" title="No events yet" desc="Create your first event to get started"
          action={
            <button className="btn btn-primary btn-sm" style={{ margin:'16px auto 0', maxWidth:140 }}
              onClick={onCreateClick}>+ Create Event</button>
          }
        />
      ) : (
        <div className="events-table-wrap">
          <div className="events-table-head">
            <h3>Your Events ({events.length})</h3>
          </div>
          {events.map((ev, i) => {
            const { isToday, upcoming } = eventStatus(ev);
            const canMark = canMarkAttendance(ev);
            return (
              <div className="org-event-row" key={ev.id}
                style={{ animationDelay:`${i*.05}s`, gridTemplateColumns:'1fr auto auto auto auto' }}>
                <div>
                  <div className="org-event-name">{ev.title}</div>
                  <div className="org-event-meta">
                    <span>📅 {fmtDate(ev.eventDate)}</span>
                    {ev.venue && <span>📍 {ev.venue}</span>}
                  </div>
                </div>

                <StatusPill isToday={isToday} upcoming={upcoming} />

                <button className="btn btn-outline btn-sm" onClick={() => onAttendees(ev)}>
                  Registrations
                </button>

                <button className="btn btn-sm"
                  style={{
                    background: isToday ? 'var(--jade)' : canMark ? 'var(--jade-pale)' : 'var(--ivory-2)',
                    color: isToday ? 'white' : canMark ? 'var(--jade)' : 'var(--ink-3)',
                    border:'none',
                  }}
                  onClick={() => onAttendance(ev)}>
                  {isToday ? 'Mark Attendance' : canMark ? 'View / Edit' : 'Attendance'}
                </button>

                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => onEdit(ev)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(ev.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
