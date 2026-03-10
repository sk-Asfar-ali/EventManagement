import { type AttendanceRecord, fmtDate, fmtDay, fmtMon, attendanceColor } from '../utils/helpers';
import { SkeletonRows, EmptyState } from './UI';

interface Props {
  attendance: AttendanceRecord | null;
  loading: boolean;
}

export function AttendanceTab({ attendance, loading }: Props) {
  if (loading) return <SkeletonRows count={3} height={72} />;
  if (!attendance) return (
    <EmptyState icon="📋" title="No attendance data yet"
      desc="Your attendance will appear here after events you've registered for take place" />
  );

  const { eventsAttended,  attendancePercentage } = attendance;
  const rateColor = attendanceColor(attendancePercentage);

  return (
    <>
      {/* KPI cards — only attended count and rate; missed is implicit */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:12, marginBottom:24 }}>
        {[
          { label:'Events Attended', value: eventsAttended.length, color:'var(--ud-sage)' },
          { label:'Attendance Rate', value: `${attendancePercentage}%`, color: rateColor },
        ].map((s, i) => (
          <div key={s.label} className="ud-stat-card"
            style={{ borderTop:`3px solid ${s.color}`, animationDelay:`${i*.06}s` }}>
            <div className="ud-stat-label">{s.label}</div>
            <div className="ud-stat-value" style={{ color:s.color, fontSize:'1.8rem' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="ud-progress-card">
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:'.83rem', fontWeight:600, color:'var(--ud-ink-2)' }}>Overall Attendance Rate</span>
          <span style={{ fontSize:'.83rem', fontWeight:700, color:rateColor }}>{attendancePercentage}%</span>
        </div>
        <div className="ud-progress-track">
          <div className="ud-progress-fill" style={{ width:`${attendancePercentage}%`, background:rateColor }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:'.7rem', color:'var(--ud-ink-4)' }}>0%</span>
          <span style={{ fontSize:'.7rem', color:'var(--ud-ink-4)' }}>100%</span>
        </div>
      </div>

      {/* Events attended list only — missed events are not shown to the user */}
      {eventsAttended.length === 0 ? (
        <EmptyState icon="🎟️" title="No events attended yet" desc="Events you attend will appear here" />
      ) : (
        <>
          <h3 style={{ fontFamily:'var(--ud-serif)', fontSize:'.95rem', fontWeight:700, color:'var(--ud-ink)', marginBottom:12 }}>
            Events Attended ({eventsAttended.length})
          </h3>
          <div className="bookings-list">
            {eventsAttended.map((ev, i) => (
              <div className="booking-row" key={ev.eventId} style={{ animationDelay:`${i*.06}s` }}>
                <div className="booking-date-block" style={{ background:'var(--ud-sage-pale)' }}>
                  <div className="booking-date-day" style={{ color:'var(--ud-sage)' }}>{ev.date ? fmtDay(ev.date) : '—'}</div>
                  <div className="booking-date-month" style={{ color:'var(--ud-sage)' }}>{ev.date ? fmtMon(ev.date) : ''}</div>
                </div>
                <div className="booking-info">
                  <div className="booking-title">{ev.title}</div>
                  {ev.date && <div className="booking-venue">{fmtDate(ev.date)}</div>}
                </div>
                <span className="ud-pill ud-pill-reg">✓ Present</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
