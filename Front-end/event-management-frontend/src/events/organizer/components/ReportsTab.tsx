import { type ReportDashboard, type ReportEventDetail, fmtDate } from '../utils/helpers';
import { SkeletonRows, EmptyState, AlertBanner, SectionCard } from './UI';

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({ present, absent }: { present: number; absent: number }) {
  const total = present + absent;
  if (total === 0) return (
    <div style={{ textAlign:'center', padding:'24px 0', color:'var(--ink-4)', fontSize:'.82rem' }}>
      No attendance data yet
    </div>
  );
  const pct   = Math.round((present / total) * 100);
  const r     = 40; const cx = 60; const cy = 60;
  const circ  = 2 * Math.PI * r;
  const dash  = (pct / 100) * circ;

  return (
    <div className="donut-wrap">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--coral-pale)" strokeWidth="14" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--jade)" strokeWidth="14"
          strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4}
          strokeLinecap="round" style={{ transition:'stroke-dasharray .6s ease' }} />
        <text x={cx} y={cy - 3} textAnchor="middle"
          style={{ fontFamily:'var(--serif)', fontSize:14, fontWeight:700, fill:'var(--ink)' }}>{pct}%</text>
        <text x={cx} y={cy + 13} textAnchor="middle"
          style={{ fontFamily:'var(--sans)', fontSize:9, fill:'var(--ink-4)' }}>present</text>
      </svg>
      <div className="donut-legend">
        {[
          { label:'Present', val:present, pct, color:'var(--jade)' },
          { label:'Absent',  val:absent,  pct: 100-pct, color:'var(--coral)' },
        ].map(s => (
          <div className="donut-leg-item" key={s.label}>
            <div className="donut-leg-dot" style={{ background:s.color }} />
            <div>
              <div className="donut-leg-label">{s.label}</div>
              <div className="donut-leg-sub">{s.val} ({s.pct}%)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Trend Bar ────────────────────────────────────────────────────────────────
function TrendBars({ trend }: { trend: { date:string; count:string }[] }) {
  const max = Math.max(...trend.map(t => parseInt(t.count)), 1);
  return (
    <div>
      {trend.slice(0, 8).map(t => (
        <div className="trend-bar-row" key={t.date}>
          <div className="trend-bar-label">{new Date(t.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}</div>
          <div className="trend-bar-track">
            <div className="trend-bar-fill" style={{ width:`${(parseInt(t.count)/max)*100}%` }} />
          </div>
          <div className="trend-bar-count">{t.count}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Event Detail View ────────────────────────────────────────────────────────
function EventDetailView({
  detail, loading, onBack,
}: { detail: ReportEventDetail; loading: boolean; onBack: () => void }) {
  const { event, stats, registrationTrend, attendanceBreakdown, reports } = detail;
  const rateColor = stats.attendanceRate >= 75 ? 'var(--jade)' : stats.attendanceRate >= 50 ? 'var(--amber)' : 'var(--coral)';

  return (
    <>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:28 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        <div>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:'1.3rem', fontWeight:700, color:'var(--ink)', letterSpacing:'-.4px' }}>
            {event.title}
          </h2>
          <p style={{ fontSize:'.78rem', color:'var(--ink-4)', marginTop:2 }}>
            {fmtDate(event.eventDate)} · {event.venue} · {event.durationInHours}h
          </p>
        </div>
      </div>

      {loading ? <SkeletonRows count={3} height={80} /> : (
        <>
          {/* KPIs */}
          <div className="stats-row" style={{ marginBottom:24 }}>
            {[
              { label:'Registered',     val: stats.totalRegistered,  color:'var(--ink)',   sub:'Total sign-ups' },
              { label:'Cancelled',      val: stats.totalCancelled,   color:'var(--coral)', sub:'Dropped out' },
              { label:'Present',        val: stats.totalPresent,     color:'var(--jade)',  sub:'Attended' },
              { label:'Absent',         val: stats.totalAbsent,      color:'var(--amber)', sub:'No-show' },
              { label:'Attendance',     val: `${stats.attendanceRate}%`, color: rateColor, sub:'Rate' },
            ].map((s, i) => (
              <div className="stat-card" key={s.label}
                style={{ animationDelay:`${i*.06}s`, borderTop:`3px solid ${s.color}` }}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ color:s.color, fontSize:'1.8rem' }}>{s.val}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
            <SectionCard title="Registration Trend">
              <div style={{ padding:'18px 20px' }}>
                {registrationTrend.length === 0
                  ? <div style={{ color:'var(--ink-4)', fontSize:'.82rem', textAlign:'center', padding:'24px 0' }}>No trend data</div>
                  : <TrendBars trend={registrationTrend} />
                }
              </div>
            </SectionCard>
            <SectionCard title="Attendance Breakdown">
              <div style={{ padding:'18px 20px' }}>
                <DonutChart present={attendanceBreakdown.present} absent={attendanceBreakdown.absent} />
              </div>
            </SectionCard>
          </div>

          {/* Submitted reports */}
          <SectionCard title="Submitted Reports" count={reports.length}>
            {reports.length === 0 ? (
              <EmptyState icon="📄" title="No reports submitted" desc="No attendee reports for this event yet" />
            ) : (
              <div>
                {reports.map((r, i) => (
                  <div key={r.id} style={{
                    padding:'14px 20px', borderBottom:'1px solid var(--border-2)',
                    background: i % 2 === 0 ? 'white' : 'var(--ivory-2)',
                    display:'flex', alignItems:'flex-start', gap:12,
                  }}>
                    <div className="attendee-avatar" style={{ background:'var(--navy)', flexShrink:0 }}>
                      {r.user?.name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '?'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                        <span style={{ fontSize:'.84rem', fontWeight:600, color:'var(--ink)' }}>{r.user?.name}</span>
                        <span style={{ fontSize:'.74rem', color:'var(--ink-4)' }}>{r.user?.email}</span>
                        <span style={{ marginLeft:'auto', fontSize:'.72rem', color:'var(--ink-4)' }}>
                          {new Date(r.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                        </span>
                      </div>
                      <p style={{ fontSize:'.82rem', color:'var(--ink-2)', lineHeight:1.55, margin:0 }}>{r.content}</p>
                      {r.driveLink && (
                        <a href={r.driveLink} target="_blank" rel="noreferrer"
                          style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:6, fontSize:'.76rem', color:'var(--amber)', fontWeight:500 }}>
                          ↗ View Drive Link
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      )}
    </>
  );
}

// ─── Reports Dashboard ────────────────────────────────────────────────────────
function ReportsDashboardView({
  dash, onEventClick,
}: { dash: ReportDashboard; onEventClick: (id: number) => void }) {
  return (
    <>
      <div className="stats-row" style={{ marginBottom:28 }}>
        {[
          { label:'Total Events',        val: dash.dashboard.totalEvents,        sub:'All time',         color:'var(--ink)' },
          { label:'Registrations',       val: dash.dashboard.totalRegistrations, sub:'Active sign-ups',  color:'var(--amber)' },
          { label:'Total Attended',      val: dash.dashboard.totalPresent,       sub:'Confirmed present',color:'var(--jade)' },
          { label:'Upcoming Events',     val: dash.dashboard.upcomingEvents,     sub:'Scheduled ahead',  color:'var(--navy-2)' },
        ].map((s, i) => (
          <div className="stat-card" key={s.label}
            style={{ animationDelay:`${i*.07}s`, borderTop:`3px solid ${s.color}` }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.val}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {dash.events.length === 0 ? (
        <EmptyState icon="📊" title="No event data yet" desc="Create and run events to see reports here" />
      ) : (
        <div className="events-table-wrap">
          <div className="events-table-head"><h3>Event Reports ({dash.events.length})</h3></div>
          {dash.events.map((ev, i) => {
            const rate = ev.attendanceRate;
            const rateColor = rate >= 75 ? 'var(--jade)' : rate >= 50 ? 'var(--amber)' : 'var(--coral)';
            return (
              <div key={ev.id} className="org-event-row"
                style={{ gridTemplateColumns:'1fr auto auto auto', animationDelay:`${i*.05}s`, cursor:'pointer' }}
                onClick={() => onEventClick(ev.id)}>
                <div>
                  <div className="org-event-name">{ev.title}</div>
                  <div className="org-event-meta">
                    <span>{fmtDate(ev.eventDate)}</span>
                    {ev.venue && <span>{ev.venue}</span>}
                  </div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'.68rem', color:'var(--ink-4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.6px', marginBottom:3 }}>Registered</div>
                  <div style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:700, color:'var(--ink)' }}>{ev.totalRegistrations}</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'.68rem', color:'var(--ink-4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.6px', marginBottom:3 }}>Present</div>
                  <div style={{ fontFamily:'var(--serif)', fontSize:'1.1rem', fontWeight:700, color:'var(--jade)' }}>{ev.presentCount}</div>
                </div>
                <div style={{ textAlign:'center', minWidth:80 }}>
                  <div style={{ fontSize:'.68rem', color:'var(--ink-4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.6px', marginBottom:5 }}>Rate</div>
                  <div style={{ height:5, background:'var(--ivory-3)', borderRadius:3, overflow:'hidden', marginBottom:3 }}>
                    <div style={{ height:'100%', width:`${rate}%`, background:rateColor, borderRadius:3, transition:'width .5s' }} />
                  </div>
                  <div style={{ fontSize:'.78rem', fontWeight:700, color:rateColor }}>{rate}%</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ─── Public Component ─────────────────────────────────────────────────────────
interface ReportsTabProps {
  dash: ReportDashboard | null;
  detail: ReportEventDetail | null;
  loading: boolean;
  error: string;
  onEventClick: (id: number) => void;
  onBack: () => void;
  onRetry: () => void;
}

export function ReportsTab({ dash, detail, loading, error, onEventClick, onBack, onRetry }: ReportsTabProps) {
  if (loading && !dash && !detail) return <SkeletonRows count={4} height={80} />;
  if (error) return <AlertBanner type="error" message={error} onRetry={onRetry} />;

  if (detail) return <EventDetailView detail={detail} loading={loading} onBack={onBack} />;
  if (dash)   return <ReportsDashboardView dash={dash} onEventClick={onEventClick} />;
  return null;
}
