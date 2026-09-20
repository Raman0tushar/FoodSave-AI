import { TrendingDown, TrendingUp } from "lucide-react";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconClass = "bg-green-100 text-green-600",
  trend,
  trendType = "positive",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </h3>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">
              {subtitle}
            </p>
          )}

          {trend !== undefined && trend !== null && (
            <div
              className={`mt-3 flex items-center gap-1 text-xs font-semibold ${
                trendType === "positive"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {trendType === "positive" ? (
                <TrendingDown size={14} />
              ) : (
                <TrendingUp size={14} />
              )}

              {trend}
            </div>
          )}
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;