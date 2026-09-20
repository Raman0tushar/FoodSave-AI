import api from "./api";

export const getMeals = async () => {
  const response = await api.get("/meals");
  return response.data;
};

export const getMealsByOrganization = async (organizationId) => {
  const response = await api.get(
    `/meals/organization/${organizationId}`
  );

  return response.data;
};

export const createMeal = async (data) => {
  const response = await api.post("/meals", data);
  return response.data;
};