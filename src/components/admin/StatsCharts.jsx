import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#6c63ff', '#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#5b21b6']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel px-3 py-2 text-sm">
      <p className="text-text-primary font-medium">{label}</p>
      <p className="text-accent">{payload[0].value} голосов</p>
    </div>
  )
}

function GeoBarChart({ data, emptyText, dataKey = 'label' }) {
  const chartData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, count]) => ({ [dataKey]: label, count }))

  if (chartData.length === 0) {
    return <p className="text-text-muted text-sm text-center py-8">{emptyText}</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#242840" horizontal={false} />
        <XAxis type="number" stroke="#565c75" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey={dataKey}
          stroke="#8b90a4"
          fontSize={12}
          width={110}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(108,99,255,0.08)' }} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CountryChart({ data }) {
  return <GeoBarChart data={data} emptyText="Нет данных по странам" dataKey="country" />
}

export function CityChart({ data }) {
  return <GeoBarChart data={data} emptyText="Нет данных по городам" dataKey="city" />
}

export function TimelineChart({ data }) {
  const chartData = Object.entries(data)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
      count,
    }))

  if (chartData.length === 0) {
    return <p className="text-text-muted text-sm text-center py-8">Нет данных активности</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ left: 0, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#242840" vertical={false} />
        <XAxis dataKey="date" stroke="#565c75" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#565c75" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(108,99,255,0.08)' }} />
        <Bar dataKey="count" fill="#6c63ff" radius={[6, 6, 0, 0]} barSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}
