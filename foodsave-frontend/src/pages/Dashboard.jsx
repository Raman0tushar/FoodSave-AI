import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  Brain,
  Building2,
  Leaf,
  RefreshCw,
  Target,
  Trash2,
  TrendingDown,
  Utensils,
} from "lucide-react";

import { getOrganizations } from "../services/organizationService";
import { getMealsByOrganization } from "../services/mealService";
import { getWasteRecords } from "../services/wasteService";
import {
  getPredictionsByOrganization,
} from "../services/predictionService";

import StatCard from "../components/Statcard";
import WasteChart from "../components/WasteChart";
import MealTypeChart from "../components/MealTypeChart";
import Loading from "../components/Loading";

function Dashboard() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState("");

  const [meals, setMeals] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);
  const [predictions, setPredictions] = useState([]);

  const [loadingOrganizations, setLoadingOrganizations] =
    useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==================================================
  // Load organizations
  // ==================================================

  useEffect(() => {
    let cancelled = false;

    const fetchOrganizations = async () => {
      try {
        const data = await getOrganizations();

        if (cancelled) return;

        const list = Array.isArray(data) ? data : [];

        setOrganizations(list);

        if (list.length > 0) {
          setSelectedOrganization((current) => {
            return current || list[0].id;
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Failed to load organizations:",
            err
          );

          setError(
            "Unable to load organizations."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOrganizations(false);
        }
      }
    };

    fetchOrganizations();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==================================================
  // Load dashboard data
  // ==================================================

  useEffect(() => {
    if (!selectedOrganization) return;

    let cancelled = false;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          mealData,
          wasteData,
          predictionData,
        ] = await Promise.all([
          getMealsByOrganization(
            selectedOrganization
          ),
          getWasteRecords(
            selectedOrganization
          ),
          getPredictionsByOrganization(
            selectedOrganization
          ),
        ]);

        if (cancelled) return;

        setMeals(
          Array.isArray(mealData)
            ? mealData
            : []
        );

        setWasteRecords(
          Array.isArray(wasteData)
            ? wasteData
            : []
        );

        setPredictions(
          Array.isArray(predictionData)
            ? predictionData
            : []
        );
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Failed to load dashboard:",
            err
          );

          setError(
            "Unable to load dashboard data. Check that the backend is running."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, [selectedOrganization]);

  // ==================================================
  // Refresh
  // ==================================================

  const handleRefresh = async () => {
    if (!selectedOrganization) return;

    try {
      setLoading(true);
      setError("");

      const [
        mealData,
        wasteData,
        predictionData,
      ] = await Promise.all([
        getMealsByOrganization(
          selectedOrganization
        ),
        getWasteRecords(
          selectedOrganization
        ),
        getPredictionsByOrganization(
          selectedOrganization
        ),
      ]);

      setMeals(
        Array.isArray(mealData)
          ? mealData
          : []
      );

      setWasteRecords(
        Array.isArray(wasteData)
          ? wasteData
          : []
      );

      setPredictions(
        Array.isArray(predictionData)
          ? predictionData
          : []
      );
    } catch (err) {
      console.error(
        "Dashboard refresh failed:",
        err
      );

      setError(
        "Unable to refresh dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // Calculate statistics
  // IMPORTANT:
  // Use MEALS as the source of truth for the
  // dashboard's food quantities.
  // ==================================================

  const stats = useMemo(() => {
    const prepared = meals.reduce(
      (sum, meal) =>
        sum + Number(
          meal.foodPreparedKg || 0
        ),
      0
    );

    const consumed = meals.reduce(
      (sum, meal) =>
        sum + Number(
          meal.foodConsumedKg || 0
        ),
      0
    );

    const wasted = meals.reduce(
      (sum, meal) =>
        sum + Number(
          meal.foodWasteKg || 0
        ),
      0
    );

    const wastePercentage =
      prepared > 0
        ? (wasted / prepared) * 100
        : 0;

    return {
      prepared,
      consumed,
      wasted,
      wastePercentage,
      totalMeals: meals.length,
      totalPredictions: predictions.length,
    };
  }, [meals, predictions]);

  // ==================================================
  // Food Waste Trend
  // ==================================================

  const wasteChartData = useMemo(() => {
    const grouped = {};

    meals.forEach((meal) => {
      const date =
        meal.mealDate ||
        meal.date ||
        "Unknown";

      if (!grouped[date]) {
        grouped[date] = {
          date,
          prepared: 0,
          consumed: 0,
          wasted: 0,
        };
      }

      grouped[date].prepared += Number(
        meal.foodPreparedKg || 0
      );

      grouped[date].consumed += Number(
        meal.foodConsumedKg || 0
      );

      grouped[date].wasted += Number(
        meal.foodWasteKg || 0
      );
    });

    return Object.values(grouped)
      .sort((a, b) =>
        a.date.localeCompare(b.date)
      )
      .slice(-7);
  }, [meals]);

  // ==================================================
  // Waste by Meal Type
  // ==================================================

  const mealTypeChartData = useMemo(() => {
    const grouped = {};

    meals.forEach((meal) => {
      const mealType =
        meal.mealType || "UNKNOWN";

      grouped[mealType] =
        (grouped[mealType] || 0) +
        Number(meal.foodWasteKg || 0);
    });

    return Object.entries(grouped).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
  }, [meals]);

  // ==================================================
  // Latest prediction
  // ==================================================

  const latestPrediction =
    predictions.length > 0
      ? [...predictions].sort((a, b) => {
          const dateA =
            a.predictionDate || "";
          const dateB =
            b.predictionDate || "";

          return dateB.localeCompare(dateA);
        })[0]
      : null;

  // ==================================================
  // Selected organization
  // ==================================================

  const selectedOrganizationData =
    organizations.find(
      (organization) =>
        organization.id ===
        selectedOrganization
    );

  // ==================================================
  // Render
  // ==================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Activity
                size={19}
                className="text-green-600"
              />

              <span className="text-sm font-semibold text-green-600">
                FOOD OPERATIONS
              </span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor food consumption, waste and
              AI-powered demand predictions.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={
              loading ||
              !selectedOrganization
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* Organization */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Organization
          </label>

          <div className="relative">
            <Building2
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={selectedOrganization}
              onChange={(event) =>
                setSelectedOrganization(
                  event.target.value
                )
              }
              disabled={
                loadingOrganizations
              }
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            >
              <option value="">
                Select organization
              </option>

              {organizations.map(
                (organization) => (
                  <option
                    key={organization.id}
                    value={organization.id}
                  >
                    {organization.name}
                  </option>
                )
              )}
            </select>
          </div>

          {selectedOrganizationData && (
            <p className="mt-2 text-xs text-slate-500">
              {selectedOrganizationData.type?.replaceAll(
                "_",
                " "
              )}

              {selectedOrganizationData.city
                ? ` • ${selectedOrganizationData.city}`
                : ""}
            </p>
          )}
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white">
            <Loading message="Loading dashboard data..." />
          </div>
        ) : (
          <>
            {/* Statistics */}

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <StatCard
                title="Food Prepared"
                value={`${stats.prepared.toFixed(
                  2
                )} kg`}
                subtitle="Recorded food preparation"
                icon={
                  <Utensils size={22} />
                }
                iconClass="bg-blue-100 text-blue-600"
              />

              <StatCard
                title="Food Consumed"
                value={`${stats.consumed.toFixed(
                  2
                )} kg`}
                subtitle="Recorded consumption"
                icon={
                  <Leaf size={22} />
                }
                iconClass="bg-green-100 text-green-600"
              />

              <StatCard
                title="Food Wasted"
                value={`${stats.wasted.toFixed(
                  2
                )} kg`}
                subtitle="Recorded avoidable waste"
                icon={
                  <Trash2 size={22} />
                }
                iconClass="bg-red-100 text-red-600"
              />

              <StatCard
                title="Waste Rate"
                value={`${stats.wastePercentage.toFixed(
                  2
                )}%`}
                subtitle={`${stats.totalMeals} meals recorded`}
                icon={
                  <TrendingDown size={22} />
                }
                iconClass="bg-orange-100 text-orange-600"
              />

            </div>

            {/* Charts */}

            <div className="mb-6 grid gap-6 lg:grid-cols-3">

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">

                <div className="mb-4">
                  <h2 className="font-bold text-slate-900">
                    Food Waste Trend
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Latest recorded food preparation,
                    consumption and waste.
                  </p>
                </div>

                {wasteChartData.length > 0 ? (
                  <WasteChart
                    data={wasteChartData}
                  />
                ) : (
                  <EmptyChart
                    message="No meal data available for the waste trend."
                  />
                )}

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="mb-4">
                  <h2 className="font-bold text-slate-900">
                    Waste by Meal
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Distribution of recorded waste.
                  </p>
                </div>

                {mealTypeChartData.length > 0 ? (
                  <MealTypeChart
                    data={
                      mealTypeChartData
                    }
                  />
                ) : (
                  <EmptyChart
                    message="No waste data available."
                  />
                )}

              </div>
            </div>

            {/* AI Prediction */}

            <div className="mb-6 rounded-2xl bg-slate-900 p-6 text-white shadow-sm">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div className="flex items-start gap-4">

                  <div className="rounded-xl bg-green-500/15 p-3 text-green-400">
                    <Brain size={25} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-green-400">
                      AI DEMAND FORECASTING
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      Latest Prediction
                    </h2>

                    {latestPrediction ? (
                      <p className="mt-2 text-sm text-slate-400">
                        {latestPrediction.mealType} •{" "}
                        {latestPrediction.predictionDate}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-400">
                        Generate your first prediction
                        to see demand forecasting here.
                      </p>
                    )}
                  </div>

                </div>

                {latestPrediction && (
                  <div className="grid grid-cols-3 gap-3">

                    <DashboardMetric
                      title="Demand"
                      value={`${Number(
                        latestPrediction.predictedDemandKg ||
                          0
                      ).toFixed(1)} kg`}
                    />

                    <DashboardMetric
                      title="Prepare"
                      value={`${Number(
                        latestPrediction.recommendedPreparationKg ||
                          0
                      ).toFixed(1)} kg`}
                    />

                    <DashboardMetric
                      title="Confidence"
                      value={`${Number(
                        latestPrediction.confidence ||
                          0
                      ).toFixed(0)}%`}
                    />

                  </div>
                )}

              </div>
            </div>

            {/* Quick Actions */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <QuickAction
                icon={<Utensils size={21} />}
                title="Record Meal"
                description="Add today's meal data."
                href="/meals"
              />

              <QuickAction
                icon={<Trash2 size={21} />}
                title="View Waste"
                description="Analyze food waste."
                href="/waste"
              />

              <QuickAction
                icon={<Brain size={21} />}
                title="Predict Demand"
                description="Generate a forecast."
                href="/predictions"
              />

              <QuickAction
                icon={<Target size={21} />}
                title="AI Insights"
                description="Review recommendations."
                href="/ai-insights"
              />

            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ======================================================
// Empty Chart
// ======================================================

function EmptyChart({ message }) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-xl bg-slate-50 text-center">
      <div>
        <TrendingDown
          size={30}
          className="mx-auto mb-3 text-slate-300"
        />

        <p className="text-sm text-slate-400">
          {message}
        </p>
      </div>
    </div>
  );
}

// ======================================================
// Dashboard Metric
// ======================================================

function DashboardMetric({
  title,
  value,
}) {
  return (
    <div className="rounded-xl bg-white/5 px-4 py-3 text-center">
      <p className="text-xs text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-lg font-bold">
        {value}
      </p>
    </div>
  );
}

// ======================================================
// Quick Action
// ======================================================

function QuickAction({
  icon,
  title,
  description,
  href,
}) {
  return (
    <a
      href={href}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
    >
      <div className="mb-4 inline-flex rounded-xl bg-green-100 p-3 text-green-600">
        {icon}
      </div>

      <h3 className="font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </a>
  );
}

export default Dashboard;