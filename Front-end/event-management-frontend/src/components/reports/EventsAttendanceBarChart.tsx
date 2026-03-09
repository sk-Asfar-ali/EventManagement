import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type EventsAttendanceBarChartProps = {
  events: {
    id: number
    title: string
    totalRegistrations: number
    presentCount: number
  }[]
}

export const EventsAttendanceBarChart = ({
  events,
}: EventsAttendanceBarChartProps) => {
  const data = events.map((event) => ({
    name: event.title.length > 18 ? `${event.title.slice(0, 18)}…` : event.title,
    registrations: event.totalRegistrations,
    present: event.presentCount,
  }))

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3>Event performance</h3>
        <p>Registrations vs Present</p>
      </div>

      <div className="chart-card-body">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="registrations"
              name="Registrations"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="present"
              name="Present"
              fill="#16a34a"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

