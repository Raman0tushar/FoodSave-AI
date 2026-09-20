import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
];

function MealTypeChart({ data = [] }) {
  return (
    <div className="h-80 w-full">
      {data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          No meal data available.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius={100}
              innerRadius={55}
              paddingAngle={3}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}-${index}`}
                  fill={
                    COLORS[index % COLORS.length]
                  }
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) =>
                `${Number(value).toFixed(2)} kg`
              }
            />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default MealTypeChart;