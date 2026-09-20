import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

function WasteChart({ data = [] }) {
  return (
    <div className="h-80 w-full">
      {data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          No waste data available.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 10,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              unit=" kg"
            />

            <Tooltip
              formatter={(value) =>
                `${Number(value).toFixed(2)} kg`
              }
            />

            <Legend />

            <Bar
              dataKey="prepared"
              name="Prepared"
              fill="#3b82f6"
              radius={[5, 5, 0, 0]}
            />

            <Bar
              dataKey="consumed"
              name="Consumed"
              fill="#22c55e"
              radius={[5, 5, 0, 0]}
            />

            <Bar
              dataKey="wasted"
              name="Wasted"
              fill="#ef4444"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default WasteChart;