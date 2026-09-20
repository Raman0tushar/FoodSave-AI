import { useEffect, useMemo, useState } from "react";

import {
  Trash2,
  Utensils,
  Scale,
  Percent,
  RefreshCw,
  CalendarDays,
  Building2,
  AlertCircle,
  TrendingDown,
} from "lucide-react";

import { getOrganizations } from "../services/organizationService";
import { getMealsByOrganization } from "../services/mealService";

function Waste() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState("");

  const [meals, setMeals] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingOrganizations, setLoadingOrganizations] =
    useState(true);

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
  // Load meals
  // ==================================================

  useEffect(() => {
    if (!selectedOrganization) {
      return;
    }

    let cancelled = false;

    const fetchMeals = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getMealsByOrganization(
            selectedOrganization
          );

        if (cancelled) return;

        setMeals(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Failed to load meals:",
            err
          );

          const message =
            err?.response?.data?.message ||
            err?.response?.data ||
            "Unable to load meal data.";

          setError(
            typeof message === "string"
              ? message
              : "Unable to load meal data."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchMeals();

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

      const data =
        await getMealsByOrganization(
          selectedOrganization
        );

      setMeals(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to refresh waste data:",
        err
      );

      setError(
        "Unable to refresh waste data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // Filter meals by date
  // ==================================================

  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      const date =
        meal.mealDate ||
        meal.date ||
        "";

      if (!date) {
        return !startDate && !endDate;
      }

      if (
        startDate &&
        date < startDate
      ) {
        return false;
      }

      if (
        endDate &&
        date > endDate
      ) {
        return false;
      }

      return true;
    });
  }, [meals, startDate, endDate]);

  // ==================================================
  // Apply filter
  // ==================================================

  const handleFilter = () => {
    setError("");

    if (
      startDate &&
      endDate &&
      startDate > endDate
    ) {
      setError(
        "Start date cannot be after end date."
      );
      return;
    }
  };

  // ==================================================
  // Clear filter
  // ==================================================

  const clearFilter = () => {
    setStartDate("");
    setEndDate("");
    setError("");
  };

  // ==================================================
  // Calculate statistics
  // ==================================================

  const stats = useMemo(() => {
    const prepared = filteredMeals.reduce(
      (total, meal) =>
        total +
        Number(
          meal.foodPreparedKg || 0
        ),
      0
    );

    const consumed = filteredMeals.reduce(
      (total, meal) =>
        total +
        Number(
          meal.foodConsumedKg || 0
        ),
      0
    );

    const wasted = filteredMeals.reduce(
      (total, meal) =>
        total +
        Number(
          meal.foodWasteKg || 0
        ),
      0
    );

    const percentage =
      prepared > 0
        ? (wasted / prepared) * 100
        : 0;

    return {
      prepared,
      consumed,
      wasted,
      percentage,
      totalMeals: filteredMeals.length,
    };
  }, [filteredMeals]);

  // ==================================================
  // Format number
  // ==================================================

  const formatNumber = (value) => {
    return Number(value || 0).toFixed(2);
  };

  // ==================================================
  // Waste status
  // ==================================================

  const getWasteStatus = (percentage) => {
    if (percentage <= 5) {
      return {
        label: "Low Waste",
        className:
          "bg-green-100 text-green-700",
      };
    }

    if (percentage <= 10) {
      return {
        label: "Moderate Waste",
        className:
          "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "High Waste",
      className:
        "bg-red-100 text-red-700",
    };
  };

  const selectedOrganizationData =
    organizations.find(
      (organization) =>
        organization.id ===
        selectedOrganization
    );

  const wasteStatus =
    getWasteStatus(stats.percentage);

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

              <div className="rounded-xl bg-green-100 p-2 text-green-600">
                <Trash2 size={22} />
              </div>

              <span className="text-sm font-semibold text-green-600">
                FOOD WASTE MANAGEMENT
              </span>

            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Waste Analytics
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track food preparation, consumption
              and avoidable waste.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={
              loading ||
              !selectedOrganization
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
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

              {" • "}

              {selectedOrganizationData.city ||
                "Location unavailable"}
            </p>
          )}
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* No organization */}

        {!loadingOrganizations &&
          organizations.length === 0 && (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center">

              <Building2
                size={40}
                className="mx-auto mb-3 text-yellow-600"
              />

              <h2 className="text-lg font-bold text-slate-900">
                No organizations found
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Create an organization before
                viewing waste analytics.
              </p>

            </div>
          )}

        {selectedOrganization && (
          <>
            {/* Statistics */}

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <StatCard
                title="Food Prepared"
                value={`${formatNumber(
                  stats.prepared
                )} kg`}
                icon={
                  <Utensils size={22} />
                }
                iconClass="bg-blue-100 text-blue-600"
              />

              <StatCard
                title="Food Consumed"
                value={`${formatNumber(
                  stats.consumed
                )} kg`}
                icon={
                  <Scale size={22} />
                }
                iconClass="bg-green-100 text-green-600"
              />

              <StatCard
                title="Food Wasted"
                value={`${formatNumber(
                  stats.wasted
                )} kg`}
                icon={
                  <Trash2 size={22} />
                }
                iconClass="bg-red-100 text-red-600"
              />

              <StatCard
                title="Waste Percentage"
                value={`${formatNumber(
                  stats.percentage
                )}%`}
                icon={
                  <Percent size={22} />
                }
                iconClass="bg-orange-100 text-orange-600"
              />

            </div>

            {/* Waste level */}

            <div className="mb-6 grid gap-6 lg:grid-cols-3">

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Current Waste Level
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                      {formatNumber(
                        stats.percentage
                      )}%
                    </h2>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${wasteStatus.className}`}
                  >
                    {wasteStatus.label}
                  </span>

                </div>

                <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        stats.percentage,
                        100
                      )}%`,
                      background:
                        stats.percentage <= 5
                          ? "#22c55e"
                          : stats.percentage <= 10
                            ? "#eab308"
                            : "#ef4444",
                    }}
                  />

                </div>

                <div className="mt-3 flex justify-between text-xs text-slate-400">
                  <span>0%</span>
                  <span>5%</span>
                  <span>10%</span>
                  <span>20%+</span>
                </div>

              </div>

              {/* Goal */}

              <div className="rounded-2xl bg-green-600 p-6 text-white shadow-sm">

                <div className="mb-4 flex items-center justify-between">

                  <div className="rounded-xl bg-white/15 p-3">
                    <TrendingDown size={24} />
                  </div>

                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                    FoodSave AI
                  </span>

                </div>

                <h3 className="text-lg font-bold">
                  Waste Reduction Goal
                </h3>

                <p className="mt-2 text-sm leading-6 text-green-50">
                  Use historical waste patterns to
                  improve demand prediction and
                  reduce unnecessary food
                  preparation.
                </p>

                <div className="mt-5">

                  <div className="mb-2 flex justify-between text-xs">
                    <span>Target</span>
                    <span>≤ 5%</span>
                  </div>

                  <div className="h-2 rounded-full bg-white/20">

                    <div
                      className="h-full rounded-full bg-white"
                      style={{
                        width: `${Math.min(
                          (stats.percentage / 5) *
                            100,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* Filters */}

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center gap-2">

                <CalendarDays
                  size={19}
                  className="text-green-600"
                />

                <h2 className="font-bold text-slate-900">
                  Filter Waste Records
                </h2>

              </div>

              <div className="grid gap-4 md:grid-cols-3">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) =>
                      setStartDate(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    End Date
                  </label>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) =>
                      setEndDate(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div className="flex items-end gap-2">

                  <button
                    onClick={handleFilter}
                    disabled={loading}
                    className="flex-1 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                  >
                    Apply Filter
                  </button>

                  <button
                    onClick={clearFilter}
                    disabled={loading}
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Clear
                  </button>

                </div>

              </div>
            </div>

            {/* Table */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-5">

                <div className="flex items-center justify-between">

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Waste Records
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {filteredMeals.length} meal
                      {filteredMeals.length === 1
                        ? ""
                        : "s"}{" "}
                      found
                    </p>
                  </div>

                  <Trash2
                    size={20}
                    className="text-slate-400"
                  />

                </div>

              </div>

              {loading ? (
                <div className="flex min-h-60 items-center justify-center">

                  <div className="text-center">

                    <RefreshCw
                      size={28}
                      className="mx-auto animate-spin text-green-600"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading waste data...
                    </p>

                  </div>

                </div>
              ) : filteredMeals.length === 0 ? (
                <div className="flex min-h-60 flex-col items-center justify-center p-8 text-center">

                  <div className="rounded-full bg-slate-100 p-4">
                    <Trash2
                      size={30}
                      className="text-slate-400"
                    />
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-900">
                    No meal records
                  </h3>

                  <p className="mt-1 max-w-md text-sm text-slate-500">
                    Record meals first. Their
                    preparation, consumption and
                    waste values will appear here.
                  </p>

                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full min-w-212.5 text-left">

                    <thead className="bg-slate-50">

                      <tr>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Date
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Meal
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Customers
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Prepared
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Consumed
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Waste
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Waste %
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {filteredMeals.map(
                        (meal) => {
                          const percentage =
                            Number(
                              meal.wasteRate ??
                                (
                                  Number(
                                    meal.foodPreparedKg ||
                                      0
                                  ) > 0
                                    ? (
                                        Number(
                                          meal.foodWasteKg ||
                                            0
                                        ) /
                                        Number(
                                          meal.foodPreparedKg ||
                                            0
                                        )
                                      ) *
                                      100
                                    : 0
                                )
                            );

                          const status =
                            getWasteStatus(
                              percentage
                            );

                          return (
                            <tr
                              key={meal.id}
                              className="transition hover:bg-slate-50"
                            >

                              <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                {meal.mealDate ||
                                  "-"}
                              </td>

                              <td className="px-5 py-4">

                                <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                  {meal.mealType ||
                                    "-"}
                                </span>

                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {meal.expectedCustomers ??
                                  "-"}
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {formatNumber(
                                  meal.foodPreparedKg
                                )}{" "}
                                kg
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {formatNumber(
                                  meal.foodConsumedKg
                                )}{" "}
                                kg
                              </td>

                              <td className="px-5 py-4 text-sm font-semibold text-red-600">
                                {formatNumber(
                                  meal.foodWasteKg
                                )}{" "}
                                kg
                              </td>

                              <td className="px-5 py-4">

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
                                >
                                  {formatNumber(
                                    percentage
                                  )}
                                  %
                                </span>

                              </td>

                            </tr>
                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </h3>
        </div>

        <div
          className={`rounded-xl p-3 ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}

export default Waste;