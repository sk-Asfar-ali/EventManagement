import { type EventItem, fmtDate } from '../utils/helpers';
import { SkeletonRows, EmptyState, StatusPill } from './UI';

interface Props {
  events: EventItem[];
  loading: boolean;
  actionId: number | null;
  onRegister: (id: number) => void;
  onCancel: (id: number) => void;
}

function accentClass(status: EventItem['status']) {
  if (status === 'NOT_REGISTERED') return 'open';
  if (status === 'REGISTERED')     return 'reg';
  return 'closed';
}

export function BrowseTab({ events, loading, actionId, onRegister, onCancel }: Props) {
  if (loading) return <SkeletonRows count={4} height={240} />;
  if (events.length === 0) return (
    <EmptyState icon="🗓️" title="No events yet" desc="Check back soon for upcoming events" />
  );

  return (
    <div className="events-grid">
      {events.map((ev, i) => {
        // Normalise venue — the backend may return it as `venue` or nested.
        // Trim to treat empty string the same as missing.
        const venue    = ev.venue?.trim() || null;
        const duration = ev.durationInHours ?? null;

        return (
          <div className="event-card" key={ev.id} style={{ animationDelay:`${i*.06}s` }}>
            <div className={`event-card-accent ${accentClass(ev.status)}`} />
            <div className="event-card-body">
              <StatusPill status={ev.status} />
              <h3 className="event-card-title">{ev.title}</h3>
              <p className="event-card-desc">{ev.description}</p>

              <div className="event-card-details">
                <div className="event-detail">
                  <span className="event-detail-icon">📅</span>
                  {fmtDate(ev.eventDate)}
                </div>

                <div className="event-detail">
                  <span className="event-detail-icon">📍</span>
                  {venue ?? <em style={{ color:'var(--ud-ink-4)' }}>Venue TBA</em>}
                </div>

                <div className="event-detail">
                  <span className="event-detail-icon">🕐</span>
                  {duration !== null
                    ? `${duration}h duration`
                    : <em style={{ color:'var(--ud-ink-4)' }}>Duration TBA</em>
                  }
                </div>
              </div>

              <div className="event-card-actions">
                {ev.status === 'NOT_REGISTERED' && (
                  <button className="ud-btn ud-btn-primary" disabled={actionId === ev.id}
                    onClick={() => onRegister(ev.id)}>
                    {actionId === ev.id ? <span className="ud-btn-spin" /> : '+ Register'}
                  </button>
                )}
                {ev.status === 'REGISTERED' && (
                  <>
                    <span className="ud-btn ud-btn-outline" style={{ cursor:'default', flex:'none' }}>✓ Registered</span>
                    {ev.canCancel && (
                      <button className="ud-btn ud-btn-danger ud-btn-sm" disabled={actionId === ev.id}
                        onClick={() => onCancel(ev.id)}>Cancel</button>
                    )}
                  </>
                )}
                {ev.status === 'CLOSED' && (
                  <button className="ud-btn ud-btn-outline" disabled>Event Closed</button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}