import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

/**
 * Get a nested property from an object using dot notation.
 * e.g., getNestedValue(obj, "cpu.percent") => obj.cpu.percent
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export default function MetricsChart({ title, data, dataKey, color = '#3b82f6', unit = '' }) {
  const chartData = data.map((d, i) => ({
    index: i,
    value: getNestedValue(d, dataKey) ?? 0,
    time: new Date(d._receivedAt).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
  }))

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-4">{title}</h3>
      
      {chartData.length < 2 ? (
        <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
          Collecting data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={192}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                background: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value) => [`${Math.round(value)}${unit}`, title]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.time || ''}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
