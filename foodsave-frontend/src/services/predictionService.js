import api from "./api";

// ============================================================
// GET ALL PREDICTIONS
// ============================================================

export const getPredictions = async () => {
  const response = await api.get("/predictions");
  return response.data;
};


// ============================================================
// GET PREDICTIONS BY ORGANIZATION
// ============================================================

export const getPredictionsByOrganization = async (
  organizationId
) => {
  if (!organizationId) {
    throw new Error("organizationId is required");
  }

  const response = await api.get(
    `/predictions/organization/${organizationId}`
  );

  return response.data;
};


// ============================================================
// CREATE PREDICTION
// ============================================================

export const createPrediction = async ({
  organizationId,
  predictionDate,
  mealType,
  expectedCustomers,
}) => {

  // ----------------------------------------------------------
  // Frontend validation
  // ----------------------------------------------------------

  if (!organizationId) {
    throw new Error("Organization is required");
  }

  if (!predictionDate) {
    throw new Error("Prediction date is required");
  }

  if (!mealType) {
    throw new Error("Meal type is required");
  }

  if (
    expectedCustomers === undefined ||
    expectedCustomers === null ||
    Number(expectedCustomers) <= 0
  ) {
    throw new Error(
      "Expected customers must be greater than 0"
    );
  }


  // ----------------------------------------------------------
  // Build clean backend payload
  // ----------------------------------------------------------

  const payload = {
    organizationId: String(organizationId).trim(),

    predictionDate: String(predictionDate),

    mealType: String(mealType).toUpperCase(),

    expectedCustomers: Number(expectedCustomers),
  };


  // ----------------------------------------------------------
  // Debug
  // ----------------------------------------------------------

  console.log(
    "Creating prediction with payload:",
    payload
  );


  // ----------------------------------------------------------
  // API request
  // ----------------------------------------------------------

  const response = await api.post(
    "/predictions",
    payload
  );


  console.log(
    "Prediction API response:",
    response.data
  );


  return response.data;
};