type KpiCardProps = {
  label: string
  value: number | string
  accent?: 'blue' | 'green' | 'purple' | 'orange'
}

export const KpiCard = ({ label, value, accent = 'blue' }: KpiCardProps) => {
  return (
    <div className={`kpi-card kpi-card--${accent}`}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  )
}

