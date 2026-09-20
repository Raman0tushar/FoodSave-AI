
import { useEffect, useState } from "react";
import {
  Brain,
  CalendarDays,
  CheckCircle2,
  Database,
  Lightbulb,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Utensils,
  AlertTriangle,
} from "lucide-react";

import {
  createPrediction,
  getPredictionsByOrganization,
} from "../services/predictionService";

import { getOrganizations } from "../services/organizationService";

import {
  generatePredictionInsight,
  generateRAGInsight,
} from "../services/aiService";

function Predictions() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState("");

  const [predictionHistory, setPredictionHistory] =
    useState([]);

  const [prediction, setPrediction] = useState(null);

  const [loading, setLoading] = useState(true);
  const [predictionLoading, setPredictionLoading] =
    useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [ragLoading, setRagLoading] = useState(false);

  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");
  const [ragError, setRagError] = useState("");

  const [aiInsight, setAiInsight] = useState(null);
  const [ragInsight, setRagInsight] = useState(null);

  const [form, setForm] = useState({
    predictionDate: new Date()
      .toISOString()
      .split("T")[0],
    mealType: "LUNCH",
    expectedCustomers: "",
  });

  /*
   * Initial page loading.
   */
  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        setLoading(true);
        setError("");

        const organizationsData =
          await getOrganizations();

        if (cancelled) {
          return;
        }

        const organizationList =
          Array.isArray(organizationsData)
            ? organizationsData
            : [];

        setOrganizations(organizationList);

        if (organizationList.length === 0) {
          setSelectedOrganization("");
          setPredictionHistory([]);
          return;
        }

        const firstOrganization =
          organizationList[0];

        const firstOrganizationId =
          firstOrganization.id;

        setSelectedOrganization(
          firstOrganizationId
        );

        setForm((previous) => ({
          ...previous,
          organizationId:
            firstOrganizationId,
        }));

        const predictions =
          await getPredictionsByOrganization(
            firstOrganizationId
          );

        if (!cancelled) {
          setPredictionHistory(
            Array.isArray(predictions)
              ? predictions
              : []
          );
        }
      } catch (err) {
        console.error(
          "Unable to load organizations:",
          err
        );

        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              "Unable to load organizations. Please check your backend."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Change organization.
   */
  const handleOrganizationChange = async (
    event
  ) => {
    const organizationId =
      event.target.value;

    setSelectedOrganization(
      organizationId
    );

    setForm((previous) => ({
      ...previous,
      organizationId,
    }));

    setPrediction(null);
    setAiInsight(null);
    setRagInsight(null);
    setAiError("");
    setRagError("");

    if (!organizationId) {
      setPredictionHistory([]);
      return;
    }

    try {
      setLoading(true);

      const predictions =
        await getPredictionsByOrganization(
          organizationId
        );

      setPredictionHistory(
        Array.isArray(predictions)
          ? predictions
          : []
      );
    } catch (err) {
      console.error(
        "Unable to load prediction history:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load prediction history."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Form change handler.
   */
  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * Generate numerical prediction.
   */
  const handleGeneratePrediction =
    async (event) => {
      event.preventDefault();

      if (!selectedOrganization) {
        setError(
          "Please select an organization."
        );
        return;
      }

      if (!form.expectedCustomers) {
        setError(
          "Please enter expected customers."
        );
        return;
      }

      try {
        setPredictionLoading(true);
        setError("");

        setAiInsight(null);
        setRagInsight(null);
        setAiError("");
        setRagError("");

        const request = {
          organizationId:
            selectedOrganization,

          predictionDate:
            form.predictionDate,

          mealType:
            form.mealType,

          expectedCustomers:
            Number(
              form.expectedCustomers
            ),
        };

        const result =
          await createPrediction(request);

        setPrediction(result);

        /*
         * Refresh prediction history.
         */
        try {
          const predictions =
            await getPredictionsByOrganization(
              selectedOrganization
            );

          setPredictionHistory(
            Array.isArray(predictions)
              ? predictions
              : []
          );
        } catch (historyError) {
          console.error(
            "Unable to refresh prediction history:",
            historyError
          );
        }
      } catch (err) {
        console.error(
          "Prediction generation error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Unable to generate prediction."
        );
      } finally {
        setPredictionLoading(false);
      }
    };

  /*
   * Generate normal Granite explanation.
   */
  const handleAIInsight = async () => {
    if (!prediction) {
      return;
    }

    try {
      setAiLoading(true);
      setAiError("");
      setAiInsight(null);

      const result =
        await generatePredictionInsight({
          organizationId:
            prediction.organizationId,

          predictionId:
            prediction.id,

          expectedCustomers:
            prediction.expectedCustomers,

          mealType:
            prediction.mealType,

          predictedDemandKg:
            prediction.predictedDemandKg,

          recommendedPreparationKg:
            prediction.recommendedPreparationKg,

          historicalKgPerCustomer:
            prediction.historicalKgPerCustomer,

          recentWasteRate:
            prediction.recentWasteRate,

          wasteAdjustment:
            prediction.wasteAdjustment,

          dayAdjustment:
            prediction.dayAdjustment,

          confidence:
            prediction.confidence,
        });

      setAiInsight(result);
    } catch (err) {
      console.error(
        "AI insight error:",
        err
      );

      setAiError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to generate AI insight."
      );
    } finally {
      setAiLoading(false);
    }
  };

  /*
   * Generate semantic RAG insight.
   */
  const handleRAGInsight = async () => {
    if (!prediction) {
      return;
    }

    try {
      setRagLoading(true);
      setRagError("");
      setRagInsight(null);

      const result =
        await generateRAGInsight({
          organizationId:
            prediction.organizationId,

          predictionId:
            prediction.id,

          query:
            `How can I reduce food waste for this ${prediction.mealType} prediction?`,
        });

      setRagInsight(result);
    } catch (err) {
      console.error(
        "RAG insight error:",
        err
      );

      setRagError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to generate knowledge-based AI insight."
      );
    } finally {
      setRagLoading(false);
    }
  };

  /*
   * Reload page.
   */
  const handleRetry = () => {
    window.location.reload();
  };

  const selectedOrganizationObject =
    organizations.find(
      (organization) =>
        organization.id ===
        selectedOrganization
    );

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2
            className="animate-spin"
            size={22}
          />
          <span>
            Loading prediction workspace...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                  <Target size={22} />
                </div>

                <span className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
                  Demand Intelligence
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Food Demand Predictions
              </h1>

              <p className="mt-2 max-w-2xl text-slate-600">
                Predict meal demand using historical
                consumption, waste patterns, and
                day-of-week behavior.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <Database
                  size={18}
                  className="text-emerald-600"
                />

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Prediction Engine
                  </p>

                  <p className="text-sm font-semibold text-slate-800">
                    Historical + Waste + Day
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 shrink-0 text-red-600"
                size={20}
              />

              <div className="flex-1">
                <p className="font-semibold text-red-800">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                <RefreshCw size={15} />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Prediction Form */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <CalendarDays size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Generate Prediction
              </h2>

              <p className="text-sm text-slate-500">
                Enter the expected meal demand.
              </p>
            </div>
          </div>

          <form
            onSubmit={
              handleGeneratePrediction
            }
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-4"
          >
            {/* Organization */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Organization
              </label>

              <select
                value={
                  selectedOrganization
                }
                onChange={
                  handleOrganizationChange
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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

            {/* Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Prediction Date
              </label>

              <input
                type="date"
                name="predictionDate"
                value={
                  form.predictionDate
                }
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            {/* Meal */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Meal Type
              </label>

              <select
                name="mealType"
                value={form.mealType}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="BREAKFAST">
                  Breakfast
                </option>

                <option value="LUNCH">
                  Lunch
                </option>

                <option value="DINNER">
                  Dinner
                </option>

                <option value="SNACK">
                  Snack
                </option>
              </select>
            </div>

            {/* Customers */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Expected Customers
              </label>

              <input
                type="number"
                name="expectedCustomers"
                min="1"
                value={
                  form.expectedCustomers
                }
                onChange={handleChange}
                placeholder="e.g. 450"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4">
              <button
                type="submit"
                disabled={
                  predictionLoading ||
                  !selectedOrganization
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {predictionLoading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <Target size={18} />
                    Generate Prediction
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Current Prediction */}
        {prediction && (
          <div className="mb-8">

            {/* Prediction heading */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Prediction Result
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedOrganizationObject?.name ||
                    prediction.organizationId}
                  {" · "}
                  {prediction.mealType}
                  {" · "}
                  {prediction.predictionDate}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={16} />
                Prediction generated
              </div>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <MetricCard
                icon={
                  <Utensils
                    size={20}
                  />
                }
                label="Expected Customers"
                value={
                  prediction.expectedCustomers ??
                  "-"
                }
                suffix=""
              />

              <MetricCard
                icon={
                  <Target size={20} />
                }
                label="Predicted Demand"
                value={formatNumber(
                  prediction.predictedDemandKg
                )}
                suffix="kg"
              />

              <MetricCard
                icon={
                  <CheckCircle2
                    size={20}
                  />
                }
                label="Recommended Preparation"
                value={formatNumber(
                  prediction.recommendedPreparationKg
                )}
                suffix="kg"
              />

              <MetricCard
                icon={
                  <Brain size={20} />
                }
                label="Confidence"
                value={formatNumber(
                  prediction.confidence
                )}
                suffix="%"
              />
            </div>

            {/* Prediction Factors */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-900">
                  Prediction Factors
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Factors used by the numerical
                  prediction engine.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <Factor
                  label="Historical Consumption"
                  value={
                    prediction.historicalKgPerCustomer !=
                    null
                      ? `${formatNumber(
                          prediction.historicalKgPerCustomer,
                          3
                        )} kg/customer`
                      : "N/A"
                  }
                />

                <Factor
                  label="Recent Waste Rate"
                  value={
                    prediction.recentWasteRate !=
                    null
                      ? `${formatNumber(
                          prediction.recentWasteRate
                        )}%`
                      : "N/A"
                  }
                />

                <Factor
                  label="Waste Adjustment"
                  value={
                    prediction.wasteAdjustment !=
                    null
                      ? `${formatNumber(
                          prediction.wasteAdjustment,
                          2
                        )}x`
                      : "N/A"
                  }
                />

                <Factor
                  label="Day Adjustment"
                  value={
                    prediction.dayAdjustment !=
                    null
                      ? `${formatNumber(
                          prediction.dayAdjustment,
                          2
                        )}x`
                      : "N/A"
                  }
                />
              </div>

              {prediction.predictionMethod && (
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Prediction Method
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {
                      prediction.predictionMethod
                    }
                  </p>
                </div>
              )}
            </div>

            {/* AI actions */}
            <div className="mt-6 grid gap-4 lg:grid-cols-2">

              {/* Granite insight */}
              <div className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
                    <Sparkles size={20} />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      AI Prediction Explanation
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      IBM Granite explains the
                      numerical prediction.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAIInsight}
                  disabled={aiLoading}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {aiLoading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Generating Explanation...
                    </>
                  ) : (
                    <>
                      <Sparkles size={17} />
                      Generate AI Explanation
                    </>
                  )}
                </button>

                {aiError && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {aiError}
                  </div>
                )}

                {aiInsight && (
                  <div className="mt-5 space-y-4">

                    <div className="rounded-xl bg-violet-50 p-4">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-600">
                        Explanation
                      </p>

                      <p className="text-sm leading-6 text-slate-700">
                        {aiInsight.explanation}
                      </p>
                    </div>

                    {aiInsight.recommendations
                      ?.length > 0 && (
                      <div>
                        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                          <Lightbulb
                            size={16}
                            className="text-amber-500"
                          />
                          Recommendations
                        </p>

                        <ul className="space-y-2">
                          {aiInsight.recommendations.map(
                            (
                              recommendation,
                              index
                            ) => (
                              <li
                                key={index}
                                className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700"
                              >
                                {recommendation}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {aiInsight.caution && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                          Caution
                        </p>

                        <p className="mt-1 text-sm text-amber-800">
                          {aiInsight.caution}
                        </p>
                      </div>
                    )}

                    {aiInsight.model && (
                      <p className="text-xs text-slate-400">
                        Model:{" "}
                        {aiInsight.model}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* RAG insight */}
              <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                    <Search size={20} />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      Knowledge-Based AI Insight
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Uses semantic search over the
                      FoodSave knowledge base.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRAGInsight}
                  disabled={ragLoading}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ragLoading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Searching Knowledge Base...
                    </>
                  ) : (
                    <>
                      <Search size={17} />
                      Ask AI Knowledge Base
                    </>
                  )}
                </button>

                {ragError && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {ragError}
                  </div>
                )}

                {ragInsight && (
                  <div className="mt-5 space-y-5">

                    {/* RAG answer */}
                    <div className="rounded-xl bg-emerald-50 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <CheckCircle2
                          size={16}
                          className="text-emerald-600"
                        />

                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                          Grounded Answer
                        </p>
                      </div>

                      <p className="text-sm leading-6 text-slate-700">
                        {ragInsight.response}
                      </p>
                    </div>

                    {/* Sources */}
                    {ragInsight.sources?.length >
                      0 && (
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900">
                              Knowledge Sources
                            </h4>

                            <p className="mt-1 text-xs text-slate-500">
                              Documents retrieved by
                              semantic vector search.
                            </p>
                          </div>

                          <Database
                            size={17}
                            className="text-slate-400"
                          />
                        </div>

                        <div className="space-y-3">
                          {ragInsight.sources.map(
                            (
                              source,
                              index
                            ) => (
                              <div
                                key={`${source.title}-${index}`}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <p className="font-medium text-slate-900">
                                      {
                                        source.title
                                      }
                                    </p>

                                    {source.source && (
                                      <p className="mt-1 text-sm text-slate-500">
                                        {
                                          source.source
                                        }
                                      </p>
                                    )}

                                    {source.category && (
                                      <span className="mt-2 inline-block rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">
                                        {
                                          source.category
                                        }
                                      </span>
                                    )}
                                  </div>

                                  {typeof source.score ===
                                    "number" && (
                                    <div className="shrink-0 text-right">
                                      <p className="text-xs text-slate-400">
                                        Similarity
                                      </p>

                                      <p className="mt-1 font-semibold text-emerald-700">
                                        {(
                                          source.score *
                                          100
                                        ).toFixed(
                                          1
                                        )}
                                        %
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {ragInsight.model && (
                      <p className="text-xs text-slate-400">
                        Generated with{" "}
                        {ragInsight.model}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prediction History */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Prediction History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Previous predictions for the
                  selected organization.
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {predictionHistory.length} records
              </div>
            </div>
          </div>

          {predictionHistory.length === 0 ? (
            <div className="p-10 text-center">
              <Target
                size={32}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-medium text-slate-700">
                No predictions yet
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Generate your first prediction
                above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Meal
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customers
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Demand
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Preparation
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Confidence
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {predictionHistory.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 text-sm text-slate-700">
                          {item.predictionDate ||
                            "-"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {item.mealType ||
                              "-"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {item.expectedCustomers ??
                            "-"}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-800">
                          {formatNumber(
                            item.predictedDemandKg
                          )}{" "}
                          kg
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-emerald-700">
                          {formatNumber(
                            item.recommendedPreparationKg
                          )}{" "}
                          kg
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {item.confidence !=
                          null
                            ? `${formatNumber(
                                item.confidence
                              )}%`
                            : "-"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Decision note */}
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={19}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <p className="font-semibold text-amber-900">
                Human decision remains final
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                FoodSave AI provides demand estimates
                and knowledge-based recommendations.
                Kitchen managers should consider
                real-world conditions before deciding
                how much food to prepare.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
 * Metric card.
 */
function MetricCard({
  icon,
  label,
  value,
  suffix,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
          {icon}
        </div>
      </div>

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900">
          {value}
        </span>

        {suffix && (
          <span className="text-sm font-medium text-slate-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/*
 * Prediction factor.
 */
function Factor({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/*
 * Number formatter.
 */
function formatNumber(
  value,
  maximumFractionDigits = 2
) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "-";
  }

  return Number(value).toLocaleString(
    undefined,
    {
      maximumFractionDigits,
    }
  );
}

export default Predictions;


