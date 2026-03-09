import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

type AttendancePieChartProps = {
  present: number
  absent: number
}

export const AttendancePieChart = ({ present, absent }: AttendancePieChartProps) => {
  const data = [
    { name: 'Present', value: present, color: '#16a34a' },
    { name: 'Absent', value: absent, color: '#dc2626' },
  ]

  return (
    <div className="chart-card chart-card--compact">
      <div className="chart-card-header">
        <h3>Attendance breakdown</h3>
        <p>Present vs Absent</p>
      </div>

      <div className="chart-card-body">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

