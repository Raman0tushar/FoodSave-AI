import api from "./api";

// ============================================================
// Generate AI explanation for a prediction
// ============================================================

export const generatePredictionInsight = async (data) => {
  const response = await api.post(
    "/ai/prediction-insight",
    data
  );

  return response.data;
};

// ============================================================
// RAG INSIGHT
// ============================================================

export const generateRAGInsight = async (data) => {
  const response = await api.post(
    "/ai/rag-insight",
    data
  );

  return response.data;
};

// ============================================================
// Generate prediction-aware RAG insight
// ============================================================

export const generatePredictionRAGInsight = async ({
  organizationId,
  predictionId,
  expectedCustomers,
  mealType,
  predictedDemandKg,
  recommendedPreparationKg,
  historicalKgPerCustomer,
  recentWasteRate,
  confidence,
  query,
}) => {
  const userQuestion =
    query?.trim() ||
    "Explain this prediction and recommend practical ways to reduce food waste.";

  const ragQuery = `
You are an AI sustainability assistant for FoodSave AI.

The FoodSave prediction engine produced the following numerical prediction:

Expected customers: ${expectedCustomers}
Meal type: ${mealType}
Predicted demand: ${predictedDemandKg} kg
Recommended preparation: ${recommendedPreparationKg} kg
Historical consumption per customer: ${historicalKgPerCustomer} kg/customer
Recent waste rate: ${recentWasteRate}%
Prediction confidence: ${confidence}%

User question:
${userQuestion}

Instructions:

1. Answer the user's question using the retrieved FoodSave knowledge base.
2. Explain the prediction in practical kitchen-management terms when relevant.
3. Recommend specific actions that can reduce avoidable food waste.
4. Do NOT change, recalculate, or override the numerical prediction.
5. Treat the FoodSave prediction engine as the source of truth for quantities.
6. Clearly distinguish the prediction from recommendations.
7. If the knowledge base does not contain enough information, say so instead of inventing information.

The retrieved knowledge base should be the primary source for recommendations.
`;

  return generateRAGInsight({
    organizationId,
    predictionId,
    query: ragQuery,
  });
};