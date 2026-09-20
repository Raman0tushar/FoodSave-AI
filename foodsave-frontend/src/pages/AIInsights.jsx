import { useCallback, useEffect, useState } from "react";

import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileText,
  Lightbulb,
  RefreshCw,
  Search,
  Sparkles,
  Target,
} from "lucide-react";

import { getPredictions } from "../services/predictionService";
import { getOrganizations } from "../services/organizationService";
import { generatePredictionRAGInsight } from "../services/aiService";

const AIInsights = () => {
  // ============================================================
  // STATE
  // ============================================================

  const [predictions, setPredictions] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  const [selectedPrediction, setSelectedPrediction] = useState(null);

  const [insight, setInsight] = useState(null);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState("");

  const [query, setQuery] = useState(
    "Explain this prediction and recommend practical ways to reduce food waste."
  );

  // ============================================================
  // SORT PREDICTIONS
  // Newest prediction first
  // ============================================================

  const sortPredictions = (items) => {
    return [...items].sort((a, b) => {
      const dateA = new Date(
        a.createdAt || a.predictionDate || 0
      ).getTime();

      const dateB = new Date(
        b.createdAt || b.predictionDate || 0
      ).getTime();

      return dateB - dateA;
    });
  };

  // ============================================================
  // LOAD DATA
  // Used by Refresh button
  // ============================================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [predictionsData, organizationsData] =
        await Promise.all([
          getPredictions(),
          getOrganizations(),
        ]);

      const safePredictions = Array.isArray(predictionsData)
        ? predictionsData
        : [];

      const safeOrganizations = Array.isArray(
        organizationsData
      )
        ? organizationsData
        : [];

      const sortedPredictions =
        sortPredictions(safePredictions);

      setPredictions(sortedPredictions);
      setOrganizations(safeOrganizations);

      setSelectedPrediction((current) => {
        if (current) {
          const existing = sortedPredictions.find(
            (prediction) =>
              prediction.id === current.id
          );

          if (existing) {
            return existing;
          }
        }

        return sortedPredictions.length > 0
          ? sortedPredictions[0]
          : null;
      });
    } catch (err) {
      console.error(
        "Failed to load AI insights data:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load prediction data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // INITIAL LOAD
  //
  // Do not call loadData() directly inside the effect.
  // This avoids react-hooks/set-state-in-effect.
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const [
          predictionsData,
          organizationsData,
        ] = await Promise.all([
          getPredictions(),
          getOrganizations(),
        ]);

        if (cancelled) {
          return;
        }

        const safePredictions = Array.isArray(
          predictionsData
        )
          ? predictionsData
          : [];

        const safeOrganizations = Array.isArray(
          organizationsData
        )
          ? organizationsData
          : [];

        const sortedPredictions =
          sortPredictions(safePredictions);

        setPredictions(sortedPredictions);
        setOrganizations(safeOrganizations);

        setSelectedPrediction(
          sortedPredictions.length > 0
            ? sortedPredictions[0]
            : null
        );

        setLoading(false);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to initialize AI insights:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to load prediction data."
        );

        setLoading(false);
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // CHANGE PREDICTION
  // ============================================================

  const handlePredictionChange = (event) => {
    const predictionId = event.target.value;

    const prediction = predictions.find(
      (item) => item.id === predictionId
    );

    setSelectedPrediction(prediction || null);

    setInsight(null);
    setError("");
  };

  // ============================================================
  // ORGANIZATION NAME
  // ============================================================

  const getOrganizationName = (organizationId) => {
    const organization = organizations.find(
      (item) => item.id === organizationId
    );

    return organization?.name || "Unknown Organization";
  };

  // ============================================================
  // GENERATE AI + RAG INSIGHT
  // ============================================================

  const handleGenerateInsight = async () => {
    if (!selectedPrediction) {
      setError("Please select a prediction first.");
      return;
    }

    if (!query.trim()) {
      setError(
        "Please enter a question for the AI assistant."
      );
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setInsight(null);

      const result =
        await generatePredictionRAGInsight({
          organizationId:
            selectedPrediction.organizationId,

          predictionId:
            selectedPrediction.id,

          expectedCustomers:
            selectedPrediction.expectedCustomers,

          mealType:
            selectedPrediction.mealType,

          predictedDemandKg:
            selectedPrediction.predictedDemandKg,

          recommendedPreparationKg:
            selectedPrediction.recommendedPreparationKg,

          historicalKgPerCustomer:
            selectedPrediction.historicalKgPerCustomer,

          recentWasteRate:
            selectedPrediction.recentWasteRate,

          confidence:
            selectedPrediction.confidence,

          // IMPORTANT:
          // Send actual user question to RAG.
          query: query.trim(),
        });

      setInsight(result);
    } catch (err) {
      console.error(
        "AI insight generation failed:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to generate AI insight."
      );
    } finally {
      setGenerating(false);
    }
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    setInsight(null);
    setError("");

    await loadData();
  };

  // ============================================================
  // FORMAT NUMBER
  // ============================================================

  const formatNumber = (value, digits = 2) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return "0";
    }

    return number.toFixed(digits);
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                <BrainCircuit className="h-7 w-7 animate-pulse text-emerald-600" />
              </div>

              <p className="text-sm font-medium text-slate-600">
                Loading AI insights...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <BrainCircuit className="h-5 w-5 text-emerald-600" />
              </div>

              <span className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
                AI + RAG
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              AI Insights
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Ask questions about your food-demand predictions
              and get practical recommendations grounded in the
              FoodSave knowledge base.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || generating}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* ======================================================
            ERROR
        ======================================================= */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div>
              <p className="font-semibold text-red-800">
                Something went wrong
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ======================================================
            EMPTY STATE
        ======================================================= */}

        {predictions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Target className="h-8 w-8 text-slate-500" />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              No predictions available
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
              Create a demand prediction first. Once a prediction
              exists, FoodSave AI can explain it and retrieve
              relevant food-waste reduction guidance.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* ==================================================
                PREDICTION SELECTOR
            =================================================== */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Select Prediction
                  </h2>

                  <p className="text-sm text-slate-500">
                    Newest prediction is selected automatically.
                  </p>
                </div>
              </div>

              <select
                value={selectedPrediction?.id || ""}
                onChange={handlePredictionChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {predictions.map((prediction) => (
                  <option
                    key={prediction.id}
                    value={prediction.id}
                  >
                    {formatDate(
                      prediction.predictionDate
                    )}
                    {" — "}
                    {prediction.mealType}
                    {" — "}
                    {prediction.expectedCustomers}{" "}
                    customers
                    {" — "}
                    {formatNumber(
                      prediction.predictedDemandKg
                    )}{" "}
                    kg
                  </option>
                ))}
              </select>
            </section>

            {selectedPrediction && (
              <>

                {/* ==================================================
                    PREDICTION SUMMARY
                =================================================== */}

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  {/* Organization */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Organization
                      </span>

                      <Database className="h-5 w-5 text-slate-400" />
                    </div>

                    <p className="truncate text-lg font-bold text-slate-900">
                      {getOrganizationName(
                        selectedPrediction.organizationId
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {selectedPrediction.mealType}
                    </p>
                  </div>

                  {/* Customers */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Customers
                      </span>

                      <Target className="h-5 w-5 text-blue-500" />
                    </div>

                    <p className="text-2xl font-bold text-slate-900">
                      {selectedPrediction.expectedCustomers ??
                        0}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Expected customers
                    </p>
                  </div>

                  {/* Predicted Demand */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Predicted Demand
                      </span>

                      <Sparkles className="h-5 w-5 text-emerald-500" />
                    </div>

                    <p className="text-2xl font-bold text-emerald-600">
                      {formatNumber(
                        selectedPrediction.predictedDemandKg
                      )}{" "}
                      kg
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Numerical prediction
                    </p>
                  </div>

                  {/* Preparation */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Preparation
                      </span>

                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>

                    <p className="text-2xl font-bold text-slate-900">
                      {formatNumber(
                        selectedPrediction.recommendedPreparationKg
                      )}{" "}
                      kg
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Recommended preparation
                    </p>
                  </div>

                </section>

                {/* ==================================================
                    PREDICTION CONTEXT
                =================================================== */}

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Prediction Context
                      </h2>

                      <p className="text-sm text-slate-500">
                        Data used by FoodSave's prediction engine.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-500">
                        Historical kg/customer
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {formatNumber(
                          selectedPrediction.historicalKgPerCustomer
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-500">
                        Recent waste rate
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {formatNumber(
                          selectedPrediction.recentWasteRate
                        )}
                        %
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-500">
                        Waste adjustment
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {formatNumber(
                          selectedPrediction.wasteAdjustment
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-500">
                        Day adjustment
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {formatNumber(
                          selectedPrediction.dayAdjustment
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-500">
                        Confidence
                      </p>

                      <p className="mt-1 text-lg font-bold text-emerald-600">
                        {formatNumber(
                          selectedPrediction.confidence,
                          0
                        )}
                        %
                      </p>
                    </div>

                  </div>

                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                      Prediction method
                    </p>

                    <p className="mt-1 text-sm text-amber-900">
                      {selectedPrediction.predictionMethod ||
                        "Historical Consumption + Waste + Day-of-Week Adjustment"}
                    </p>
                  </div>
                </section>

                {/* ==================================================
                    AI QUESTION
                =================================================== */}

                <section className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                      <BrainCircuit className="h-6 w-6 text-emerald-600" />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Ask FoodSave AI
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Granite will use the prediction context
                        together with the retrieved knowledge base
                        to answer your question.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">

                    <div>
                      <label
                        htmlFor="ai-question"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        AI Question
                      </label>

                      <textarea
                        id="ai-question"
                        value={query}
                        onChange={(event) =>
                          setQuery(event.target.value)
                        }
                        rows={4}
                        placeholder="Ask about this prediction, food waste reduction, portion control, batch cooking, leftovers, etc."
                        className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Search className="h-4 w-4" />

                        <span>
                          RAG searches the FoodSave knowledge base
                          before generating the response.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateInsight}
                        disabled={
                          generating ||
                          !selectedPrediction ||
                          !query.trim()
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {generating ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Generate AI Insight
                          </>
                        )}
                      </button>

                    </div>
                  </div>
                </section>

                {/* ==================================================
                    AI RESULT
                =================================================== */}

                {insight && (
                  <section className="space-y-6">

                    {/* AI Response */}

                    <div className="rounded-2xl border border-emerald-200 bg-white shadow-sm">
                      <div className="border-b border-emerald-100 bg-emerald-50/50 p-5">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                            <Sparkles className="h-5 w-5 text-emerald-600" />
                          </div>

                          <div>
                            <h2 className="font-bold text-slate-900">
                              Granite AI Insight
                            </h2>

                            <p className="text-xs text-slate-500">
                              {insight.model ||
                                "IBM Granite + MongoDB Atlas Vector Search"}
                            </p>
                          </div>

                        </div>
                      </div>

                      <div className="p-6">
                        <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                          {insight.response ||
                            insight.explanation ||
                            "No AI response was returned."}
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}

                    {Array.isArray(
                      insight.recommendations
                    ) &&
                      insight.recommendations.length > 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                          <div className="mb-5 flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100">
                              <Lightbulb className="h-5 w-5 text-yellow-600" />
                            </div>

                            <div>
                              <h2 className="font-bold text-slate-900">
                                Recommended Actions
                              </h2>

                              <p className="text-sm text-slate-500">
                                Practical actions based on the
                                retrieved knowledge.
                              </p>
                            </div>

                          </div>

                          <div className="space-y-3">
                            {insight.recommendations.map(
                              (recommendation, index) => (
                                <div
                                  key={`${index}-${recommendation}`}
                                  className="flex gap-3 rounded-xl bg-slate-50 p-4"
                                >
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                                    {index + 1}
                                  </div>

                                  <p className="text-sm leading-6 text-slate-700">
                                    {recommendation}
                                  </p>
                                </div>
                              )
                            )}
                          </div>

                        </div>
                      )}

                    {/* Caution */}

                    {insight.caution && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                        <div className="flex items-start gap-3">

                          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                          <div>
                            <h3 className="font-semibold text-amber-900">
                              Caution
                            </h3>

                            <p className="mt-1 text-sm leading-6 text-amber-800">
                              {insight.caution}
                            </p>
                          </div>

                        </div>
                      </div>
                    )}

                    {/* RAG Sources */}

                    {Array.isArray(insight.sources) &&
                      insight.sources.length > 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                          <div className="mb-5 flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                              <Database className="h-5 w-5 text-blue-600" />
                            </div>

                            <div>
                              <h2 className="font-bold text-slate-900">
                                Knowledge Sources
                              </h2>

                              <p className="text-sm text-slate-500">
                                Documents retrieved by the RAG
                                system.
                              </p>
                            </div>

                          </div>

                          <div className="grid gap-4 md:grid-cols-2">

                            {insight.sources.map(
                              (source, index) => (
                                <div
                                  key={`${source.title || "source"}-${index}`}
                                  className="rounded-xl border border-slate-200 p-4"
                                >

                                  <div className="flex items-start justify-between gap-3">

                                    <div className="flex min-w-0 gap-3">

                                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                        <FileText className="h-4 w-4 text-slate-600" />
                                      </div>

                                      <div className="min-w-0">

                                        <h3 className="font-semibold text-slate-900">
                                          {source.title ||
                                            "Knowledge Document"}
                                        </h3>

                                        {source.category && (
                                          <p className="mt-1 text-xs text-slate-500">
                                            {source.category}
                                          </p>
                                        )}

                                      </div>

                                    </div>

                                    {source.score !==
                                      undefined &&
                                      source.score !== null && (
                                        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                          {formatNumber(
                                            source.score,
                                            3
                                          )}
                                        </span>
                                      )}

                                  </div>

                                  {source.source && (
                                    <p className="mt-3 text-xs leading-5 text-slate-500">
                                      Source: {source.source}
                                    </p>
                                  )}

                                </div>
                              )
                            )}

                          </div>
                        </div>
                      )}

                    {/* Decision Support */}

                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
                      <div className="flex items-start gap-3">

                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />

                        <div>
                          <h3 className="font-semibold text-indigo-900">
                            Decision Support
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-indigo-800">
                            The numerical quantity comes from the
                            FoodSave prediction engine. RAG and
                            Granite provide explanations and
                            recommendations; they do not change or
                            override the predicted quantity.
                          </p>
                        </div>

                      </div>
                    </div>

                  </section>
                )}

              </>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;