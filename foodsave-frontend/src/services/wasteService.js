import api from "./api";

export const getWasteSummary = async (organizationId) => {
  const response = await api.get(
    `/waste/organization/${organizationId}/summary`
  );

  return response.data;
};

export const getWasteRecords = async (organizationId) => {
  const response = await api.get(
    `/waste/organization/${organizationId}`
  );

  return response.data;
};

export const getWasteByRange = async (
  organizationId,
  startDate,
  endDate
) => {
  const response = await api.get(
    `/waste/organization/${organizationId}/range`,
    {
      params: {
        startDate,
        endDate,
      },
    }
  );

  return response.data;
};