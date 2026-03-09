import type { MouseEventHandler } from 'react'

type EventCardProps = {
  event: {
    id: number
    title: string
    venue: string
    eventDate: string
    totalRegistrations: number
    presentCount: number
    attendanceRate: number
  }
  onClick?: MouseEventHandler<HTMLButtonElement>
}

export const EventCard = ({ event, onClick }: EventCardProps) => {
  const eventDate = new Date(event.eventDate)

  const formattedDate = eventDate.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <button className="event-card" onClick={onClick} type="button">
      <div className="event-card-header">
        <h3 className="event-title">{event.title}</h3>
        <span className="event-attendance-pill">
          {event.attendanceRate}% attendance
        </span>
      </div>

      <div className="event-meta">
        <div className="event-meta-item">
          <span className="event-meta-label">Venue</span>
          <span className="event-meta-value">{event.venue}</span>
        </div>
        <div className="event-meta-item">
          <span className="event-meta-label">Date</span>
          <span className="event-meta-value">{formattedDate}</span>
        </div>
      </div>

      <div className="event-stats-row">
        <div className="event-stat">
          <span className="event-stat-label">Registrations</span>
          <span className="event-stat-value">{event.totalRegistrations}</span>
        </div>
        <div className="event-stat">
          <span className="event-stat-label">Present</span>
          <span className="event-stat-value">{event.presentCount}</span>
        </div>
      </div>

      <div className="event-progress-wrapper">
        <div className="event-progress-labels">
          <span>Attendance progress</span>
          <span>{event.attendanceRate}%</span>
        </div>
        <div className="event-progress-bar">
          <div
            className="event-progress-fill"
            style={{ width: `${Math.min(Math.max(event.attendanceRate, 0), 100)}%` }}
          />
        </div>
      </div>
    </button>
  )
}

