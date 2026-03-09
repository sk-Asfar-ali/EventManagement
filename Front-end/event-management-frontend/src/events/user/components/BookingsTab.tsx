import { type Booking, fmtDay, fmtMon } from '../utils/helpers';
import { SkeletonRows, EmptyState } from './UI';

interface Props {
  bookings: Booking[];
  loading: boolean;
  onCancel: (eventId: number) => void;
}

export function BookingsTab({ bookings, loading, onCancel }: Props) {
  if (loading) return <SkeletonRows count={3} height={80} />;
  if (bookings.length === 0) return (
    <EmptyState icon="🎟️" title="No bookings yet" desc="Browse events and register to see them here" />
  );

  return (
    <div className="bookings-list">
      {bookings.map((b, i) => (
        <div className="booking-row" key={b.id} style={{ animationDelay:`${i*.06}s` }}>
          <div className="booking-date-block">
            <div className="booking-date-day">{fmtDay(b.event.eventDate)}</div>
            <div className="booking-date-month">{fmtMon(b.event.eventDate)}</div>
          </div>
          <div className="booking-info">
            <div className="booking-title">{b.event.title}</div>
            {b.event.venue && (
              <div className="booking-venue">📍 {b.event.venue}</div>
            )}
          </div>
          <div className="booking-actions">
            <span className="ud-pill ud-pill-reg">Registered</span>
            <button className="ud-btn ud-btn-danger ud-btn-sm" onClick={() => onCancel(b.event.id)}>
              Cancel
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
