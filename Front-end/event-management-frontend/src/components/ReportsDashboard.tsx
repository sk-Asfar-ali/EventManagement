import { useEffect, useState } from 'react'
import axios from 'axios'
import { KpiCard } from './reports/KpiCard'
import { EventCard } from './reports/EventCard'
import { EventModal } from './reports/EventModal'
import { EventsAttendanceBarChart } from './reports/EventsAttendanceBarChart'

type DashboardSummary = {
  totalEvents: number
  totalRegistrations: number
  totalCancelledRegistrations: number
  totalPresent: number
  upcomingEvents: number
  totalReports: number
  attendanceRate: number
  eventsWithReports: number
}

type EventSummary = {
  id: number
  title: string
  venue: string
  eventDate: string
  totalRegistrations: number
  presentCount: number
  attendanceRate: number
}

export type EventReportDetails = {
  event: {
    id: number
    title: string
    description: string
    venue: string
    eventDate: string
    registrationClosingDate: string
    durationInHours: number
  }
  stats: {
    totalRegistered: number
    totalCancelled: number
    totalPresent: number
    totalAbsent: number
    attendanceRate: number
  }
  registrationTrend: {
    date: string
    count: string
  }[]
  attendanceBreakdown: {
    present: number
    absent: number
  }
  reports: {
    id: number
    content: string
    driveLink: string
    user: {
      id: number
      name: string
    }
    createdAt: string
  }[]
}

type ReportsDashboardData = {
  dashboard: DashboardSummary
  events: EventSummary[]
}

export const ReportsDashboard = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [events, setEvents] = useState<EventSummary[]>([])
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [selectedEventDetails, setSelectedEventDetails] =
    useState<EventReportDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await axios.get<ReportsDashboardData>(
          'http://localhost:3000/organizer/reports',
        )
        setSummary(response.data.dashboard)
        setEvents(response.data.events)
      } catch (err) {
        setError('Failed to load reports dashboard.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  useEffect(() => {
    const fetchDetails = async () => {
      if (selectedEventId == null) return
      setDetailsLoading(true)
      setError(null)
      try {
        const response = await axios.get<EventReportDetails>(
          `http://localhost:3000/organizer/reports/${selectedEventId}`,
        )
        setSelectedEventDetails(response.data)
        setIsModalOpen(true)
      } catch (err) {
        setError('Failed to load event details.')
      } finally {
        setDetailsLoading(false)
      }
    }

    fetchDetails()
  }, [selectedEventId])

  const handleEventClick = (eventId: number) => {
    setSelectedEventId(eventId)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEventDetails(null)
    setSelectedEventId(null)
  }

  const totalParticipants = summary?.totalRegistrations ?? 0

  return (
    <div className="reports-dashboard">
      <header className="reports-header">
        <h1>Reports Dashboard</h1>
        <p className="reports-subtitle">
          Overview of events, attendance, and reports.
        </p>
      </header>

      {error && <div className="reports-error-banner">{error}</div>}

      {loading && (
        <div className="reports-loading">Loading dashboard data...</div>
      )}

      {!loading && summary && (
        <>
          <section className="reports-kpi-grid">
            <KpiCard
              label="Total Events"
              value={summary.totalEvents}
              accent="blue"
            />
            <KpiCard
              label="Total Participants"
              value={totalParticipants}
              accent="green"
            />
            <KpiCard
              label="Total Reports"
              value={summary.totalReports}
              accent="purple"
            />
            <KpiCard
              label="Events With Reports"
              value={summary.eventsWithReports}
              accent="orange"
            />
          </section>

          <section className="reports-kpi-grid reports-kpi-grid--secondary">
            <KpiCard
              label="Avg. Attendance Rate"
              value={`${summary.attendanceRate}%`}
              accent="blue"
            />
            <KpiCard
              label="Total Present"
              value={summary.totalPresent}
              accent="green"
            />
            <KpiCard
              label="Total Cancelled Registrations"
              value={summary.totalCancelledRegistrations}
              accent="purple"
            />
            <KpiCard
              label="Upcoming Events"
              value={summary.upcomingEvents}
              accent="orange"
            />
          </section>

          <section className="reports-events-section">
            <div className="reports-events-header">
              <h2>Events</h2>
              <span className="reports-events-count">
                {events.length} events ({summary.upcomingEvents} upcoming)
              </span>
            </div>

            {events.length > 0 && (
              <div className="reports-charts-grid">
                <EventsAttendanceBarChart events={events} />
              </div>
            )}

            {events.length === 0 ? (
              <div className="reports-empty-state">
                No events found. Events with registrations will appear here.
              </div>
            ) : (
              <div className="reports-events-grid">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => handleEventClick(event.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <EventModal
        isOpen={isModalOpen}
        loading={detailsLoading}
        details={selectedEventDetails}
        onClose={handleCloseModal}
      />
    </div>
  )
}

