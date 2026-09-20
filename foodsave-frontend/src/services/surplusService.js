import api from "./api";

// Create surplus food
export const createSurplus = async (data) => {
  const response = await api.post("/surplus", data);
  return response.data;
};

// Get all surplus food
export const getAllSurplus = async () => {
  const response = await api.get("/surplus");
  return response.data;
};

// Get food available for donation
export const getAvailableSurplus = async () => {
  const response = await api.get("/surplus/available");
  return response.data;
};

// Get surplus for organization
export const getSurplusByOrganization = async (organizationId) => {
  const response = await api.get(
    `/surplus/organization/${organizationId}`
  );
  return response.data;
};

// Get one surplus listing
export const getSurplus = async (id) => {
  const response = await api.get(`/surplus/${id}`);
  return response.data;
};

// Approve food for donation
export const approveDonation = async (id) => {
  const response = await api.put(
    `/surplus/${id}/approve`
  );
  return response.data;
};

// NGO requests food
export const requestDonation = async (
  id,
  ngoId,
  ngoName
) => {
  const response = await api.put(
    `/surplus/${id}/request`,
    null,
    {
      params: {
        ngoId,
        ngoName,
      },
    }
  );

  return response.data;
};

// Accept NGO request
export const acceptDonation = async (id) => {
  const response = await api.put(
    `/surplus/${id}/accept`
  );

  return response.data;
};

// Schedule pickup
export const schedulePickup = async (id) => {
  const response = await api.put(
    `/surplus/${id}/schedule-pickup`
  );

  return response.data;
};

// Mark collected
export const markCollected = async (id) => {
  const response = await api.put(
    `/surplus/${id}/collected`
  );

  return response.data;
};

// Mark donated
export const markDonated = async (id) => {
  const response = await api.put(
    `/surplus/${id}/donated`
  );

  return response.data;
};

// Cancel donation
export const cancelDonation = async (id) => {
  const response = await api.put(
    `/surplus/${id}/cancel`
  );

  return response.data;
};