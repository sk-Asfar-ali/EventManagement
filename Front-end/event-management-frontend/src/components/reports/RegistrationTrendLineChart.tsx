import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type RegistrationTrendLineChartProps = {
  trend: { date: string; count: string }[]
}

export const RegistrationTrendLineChart = ({ trend }: RegistrationTrendLineChartProps) => {
  const data = trend.map((row) => ({
    date: new Date(row.date).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
    }),
    registrations: Number(row.count),
  }))

  return (
    <div className="chart-card chart-card--compact">
      <div className="chart-card-header">
        <h3>Registration trend</h3>
        <p>Daily registrations</p>
      </div>

      <div className="chart-card-body">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="registrations"
              name="Registrations"
              stroke="#7c3aed"
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

