import type { ReactNode } from 'react'

import type { EventReportDetails } from '../ReportsDashboard'
import { AttendancePieChart } from './AttendancePieChart'
import { RegistrationTrendLineChart } from './RegistrationTrendLineChart'

type EventModalProps = {
  isOpen: boolean
  loading: boolean
  details: EventReportDetails | null
  onClose: () => void
}

const ModalSection = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="event-modal-section">
    <h3 className="event-modal-section-title">{title}</h3>
    <div>{children}</div>
  </section>
)

export const EventModal = ({ isOpen, loading, details, onClose }: EventModalProps) => {
  if (!isOpen) return null

  const event = details?.event
  const stats = details?.stats
  const report = details?.reports?.[0]

  const formattedDate =
    event &&
    new Date(event.eventDate).toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="event-modal-backdrop" role="dialog" aria-modal="true">
      <div className="event-modal">
        <header className="event-modal-header">
          <div>
            <h2 className="event-modal-title">
              {event ? event.title : 'Event details'}
            </h2>
            {event && (
              <p className="event-modal-subtitle">
                {event.venue} • {formattedDate}
              </p>
            )}
          </div>
          <button
            className="event-modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        {loading && <div className="event-modal-loading">Loading event details...</div>}

        {!loading && details && (
          <div className="event-modal-body">
            <ModalSection title="Overview">
              <p className="event-description">{event?.description}</p>
              <div className="event-overview-grid">
                <div>
                  <span className="event-overview-label">Duration</span>
                  <span className="event-overview-value">
                    {event?.durationInHours} hours
                  </span>
                </div>
                <div>
                  <span className="event-overview-label">Registration closes</span>
                  <span className="event-overview-value">
                    {event &&
                      new Date(event.registrationClosingDate).toLocaleString()}
                  </span>
                </div>
              </div>
            </ModalSection>

            <ModalSection title="Attendance summary">
              <div className="event-attendance-grid">
                <div className="event-attendance-pill present">
                  Present: {stats?.totalPresent}
                </div>
                <div className="event-attendance-pill absent">
                  Absent: {stats?.totalAbsent}
                </div>
                <div className="event-attendance-pill">
                  Registered: {stats?.totalRegistered}
                </div>
                <div className="event-attendance-pill">
                  Attendance rate: {stats?.attendanceRate}%
                </div>
              </div>
            </ModalSection>

            <div className="modal-charts-grid">
              <AttendancePieChart
                present={stats?.totalPresent ?? 0}
                absent={stats?.totalAbsent ?? 0}
              />
              <RegistrationTrendLineChart trend={details.registrationTrend} />
            </div>

            <ModalSection title="Report">
              {report ? (
                <div className="event-report">
                  <p className="event-report-content">{report.content}</p>
                  <a
                    href={report.driveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="event-report-link"
                  >
                    View full report
                  </a>
                  <p className="event-report-meta">
                    Submitted by {report.user.name} on{' '}
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="event-report-empty">
                  No report has been uploaded for this event yet.
                </p>
              )}
            </ModalSection>
          </div>
        )}
      </div>
    </div>
  )
}

