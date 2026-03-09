import { type OrgEvent, fmtDate, eventStatus, canMarkAttendance } from '../utils/helpers';
import { SkeletonRows, EmptyState, StatusPill } from './UI';

interface Props {
  events: OrgEvent[];
  loading: boolean;
  onAttendees: (ev: OrgEvent) => void;
  onAttendance: (ev: OrgEvent) => void;
}

export function AttendeesTab({ events, loading, onAttendees, onAttendance }: Props) {
  return (
    <>
      <p style={{ color:'var(--ink-4)', fontSize:'.85rem', marginBottom:24 }}>
        View registrations or manage attendance for any of your events.
        Attendance can be marked on the day of the event or any time after.
      </p>

      {loading ? (
        <SkeletonRows count={3} height={72} />
      ) : events.length === 0 ? (
        <EmptyState icon="👥" title="No events yet" desc="Create an event first to manage attendees" />
      ) : (
        <div className="events-table-wrap">
          <div className="events-table-head"><h3>Your Events</h3></div>
          {events.map(ev => {
            const { isToday, upcoming } = eventStatus(ev);
            const canMark = canMarkAttendance(ev);
            return (
              <div className="org-event-row" key={ev.id} style={{ gridTemplateColumns:'1fr auto auto' }}>
                <div>
                  <div className="org-event-name">{ev.title}</div>
                  <div className="org-event-meta">
                    <span>{fmtDate(ev.eventDate)}</span>
                    <StatusPill isToday={isToday} upcoming={upcoming} />
                  </div>
                </div>
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
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
