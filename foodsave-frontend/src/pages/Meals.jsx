import { useEffect, useState } from "react";
import {
  Utensils,
  Plus,
  Trash2,
  RefreshCw,
  Building2,
  CalendarDays,
  Users,
  Scale,
} from "lucide-react";

import { getOrganizations } from "../services/organizationService";
import {
  getMealsByOrganization,
  createMeal,
} from "../services/mealService";

function Meals() {
  const [organizations, setOrganizations] = useState([]);
  const [meals, setMeals] = useState([]);

  const [selectedOrganization, setSelectedOrganization] =
    useState("");

  const [loadingOrganizations, setLoadingOrganizations] =
    useState(true);

  const [loadingMeals, setLoadingMeals] = useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    mealDate: new Date().toISOString().split("T")[0],
    mealType: "LUNCH",
    expectedCustomers: "",
    foodPreparedKg: "",
    foodConsumedKg: "",
  });

  const [menuItems, setMenuItems] = useState([
    {
      name: "",
      category: "MAIN",
    },
  ]);

  /*
   * Load organizations
   */
  const loadOrganizations = async () => {
    try {
      setLoadingOrganizations(true);
      setError("");

      const data = await getOrganizations();

      const organizationList = data || [];

      setOrganizations(organizationList);

      if (organizationList.length > 0) {
        setSelectedOrganization(organizationList[0].id);
      }
    } catch (err) {
      console.error(
        "Failed to load organizations:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load organizations. Make sure the backend is running."
      );
    } finally {
      setLoadingOrganizations(false);
    }
  };

  /*
   * Load meals
   */
  const loadMeals = async (organizationId) => {
    if (!organizationId) {
      setMeals([]);
      return;
    }

    try {
      setLoadingMeals(true);
      setError("");

      const data = await getMealsByOrganization(
        organizationId
      );

      setMeals(data || []);
    } catch (err) {
      console.error("Failed to load meals:", err);

      setMeals([]);

      setError(
        err.response?.data?.message ||
          "Unable to load meals."
      );
    } finally {
      setLoadingMeals(false);
    }
  };

  /*
   * Initial organization loading
   */
  useEffect(() => {
    const initialize = async () => {
      await loadOrganizations();
    };

    initialize();
  }, []);

  /*
   * Load meals after organization selection
   */
  useEffect(() => {
    if (!selectedOrganization) {
      return;
    }

    const load = async () => {
      await loadMeals(selectedOrganization);
    };

    load();
  }, [selectedOrganization]);

  /*
   * Form change
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * Menu item change
   */
  const handleMenuItemChange = (
    index,
    field,
    value
  ) => {
    setMenuItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  /*
   * Add menu item
   */
  const addMenuItem = () => {
    setMenuItems((previous) => [
      ...previous,
      {
        name: "",
        category: "MAIN",
      },
    ]);
  };

  /*
   * Remove menu item
   */
  const removeMenuItem = (index) => {
    setMenuItems((previous) =>
      previous.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  /*
   * Create meal
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!selectedOrganization) {
      setError("Please select an organization.");
      return;
    }

    if (!formData.mealDate) {
      setError("Meal date is required.");
      return;
    }

    if (
      !formData.expectedCustomers ||
      Number(formData.expectedCustomers) <= 0
    ) {
      setError(
        "Expected customers must be greater than 0."
      );
      return;
    }

    if (
      formData.foodPreparedKg === "" ||
      Number(formData.foodPreparedKg) < 0
    ) {
      setError(
        "Food prepared must be a valid positive number."
      );
      return;
    }

    if (
      formData.foodConsumedKg === "" ||
      Number(formData.foodConsumedKg) < 0
    ) {
      setError(
        "Food consumed must be a valid positive number."
      );
      return;
    }

    if (
      Number(formData.foodConsumedKg) >
      Number(formData.foodPreparedKg)
    ) {
      setError(
        "Food consumed cannot be greater than food prepared."
      );
      return;
    }

    const validMenuItems = menuItems.filter(
      (item) => item.name.trim() !== ""
    );

    if (validMenuItems.length === 0) {
      setError("Please add at least one menu item.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        organizationId: selectedOrganization,

        mealDate: formData.mealDate,

        mealType: formData.mealType,

        menu: validMenuItems.map((item) => ({
          name: item.name.trim(),
          category: item.category,
        })),

        expectedCustomers: Number(
          formData.expectedCustomers
        ),

        foodPreparedKg: Number(
          formData.foodPreparedKg
        ),

        foodConsumedKg: Number(
          formData.foodConsumedKg
        ),
      };

      await createMeal(payload);

      /*
       * Reset form
       */
      setFormData({
        mealDate: new Date()
          .toISOString()
          .split("T")[0],

        mealType: "LUNCH",

        expectedCustomers: "",

        foodPreparedKg: "",

        foodConsumedKg: "",
      });

      setMenuItems([
        {
          name: "",
          category: "MAIN",
        },
      ]);

      /*
       * Reload meals
       */
      await loadMeals(selectedOrganization);
    } catch (err) {
      console.error(
        "Failed to create meal:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to create meal."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Calculate current form waste
   */
  const prepared = Number(
    formData.foodPreparedKg || 0
  );

  const consumed = Number(
    formData.foodConsumedKg || 0
  );

  const currentWaste = Math.max(
    prepared - consumed,
    0
  );

  const currentWasteRate =
    prepared > 0
      ? (currentWaste / prepared) * 100
      : 0;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================================= */}
      {/* Header                            */}
      {/* ================================= */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <Utensils
                size={25}
                className="text-green-700"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Meals
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Record meals, food preparation and consumption.
              </p>
            </div>

          </div>

          <button
            onClick={() =>
              loadMeals(selectedOrganization)
            }
            disabled={
              loadingMeals ||
              !selectedOrganization
            }
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loadingMeals
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>
      </header>

      {/* ================================= */}
      {/* Main                              */}
      {/* ================================= */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ================================= */}
        {/* Organization Selector              */}
        {/* ================================= */}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                <Building2
                  size={22}
                  className="text-blue-700"
                />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Select Organization
                </h2>

                <p className="text-sm text-slate-500">
                  Choose where this meal was served.
                </p>
              </div>

            </div>

            <div className="w-full md:w-96">

              {loadingOrganizations ? (
                <div className="h-11 animate-pulse rounded-lg bg-slate-100" />
              ) : organizations.length === 0 ? (
                <p className="rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  No organizations found. Create an organization first.
                </p>
              ) : (
                <select
                  value={selectedOrganization}
                  onChange={(event) =>
                    setSelectedOrganization(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                >
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
              )}

            </div>

          </div>

        </section>

        <div className="grid gap-8 lg:grid-cols-5">

          {/* ================================= */}
          {/* Create Meal Form                   */}
          {/* ================================= */}

          <section className="lg:col-span-2">

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <Plus
                      size={20}
                      className="text-green-700"
                    />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Add Meal
                    </h2>

                    <p className="text-sm text-slate-500">
                      Record today's meal data.
                    </p>
                  </div>

                </div>

              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-6"
              >

                {/* Date */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Meal Date
                  </label>

                  <div className="relative">

                    <CalendarDays
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />

                    <input
                      type="date"
                      name="mealDate"
                      value={formData.mealDate}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 pl-10 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />

                  </div>

                </div>

                {/* Meal Type */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Meal Type
                  </label>

                  <select
                    name="mealType"
                    value={formData.mealType}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
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

                  <div className="relative">

                    <Users
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />

                    <input
                      type="number"
                      name="expectedCustomers"
                      value={
                        formData.expectedCustomers
                      }
                      onChange={handleChange}
                      min="1"
                      placeholder="e.g. 450"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 pl-10 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />

                  </div>

                </div>

                {/* Prepared */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Food Prepared (kg)
                  </label>

                  <div className="relative">

                    <Scale
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />

                    <input
                      type="number"
                      name="foodPreparedKg"
                      value={
                        formData.foodPreparedKg
                      }
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="e.g. 90"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 pl-10 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />

                  </div>

                </div>

                {/* Consumed */}
                <div>

                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Food Consumed (kg)
                  </label>

                  <div className="relative">

                    <Scale
                      size={18}
                      className="absolute left-3 top-3 text-slate-400"
                    />

                    <input
                      type="number"
                      name="foodConsumedKg"
                      value={
                        formData.foodConsumedKg
                      }
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="e.g. 82"
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 pl-10 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />

                  </div>

                </div>

                {/* Current Waste */}
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs font-medium text-orange-700">
                        Calculated Waste
                      </p>

                      <p className="mt-1 text-xl font-bold text-orange-900">
                        {currentWaste.toFixed(2)} kg
                      </p>
                    </div>

                    <div>
                      <p className="text-right text-xs text-orange-700">
                        Waste Rate
                      </p>

                      <p className="mt-1 text-right text-xl font-bold text-orange-900">
                        {currentWasteRate.toFixed(2)}%
                      </p>
                    </div>

                  </div>

                </div>

                {/* Menu */}
                <div>

                  <div className="mb-3 flex items-center justify-between">

                    <label className="text-sm font-medium text-slate-700">
                      Menu Items
                    </label>

                    <button
                      type="button"
                      onClick={addMenuItem}
                      className="flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"
                    >
                      <Plus size={16} />

                      Add Item
                    </button>

                  </div>

                  <div className="space-y-3">

                    {menuItems.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="flex gap-2"
                        >

                          <input
                            type="text"
                            value={item.name}
                            onChange={(event) =>
                              handleMenuItemChange(
                                index,
                                "name",
                                event.target.value
                              )
                            }
                            placeholder="e.g. Rice"
                            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                          />

                          <select
                            value={item.category}
                            onChange={(event) =>
                              handleMenuItemChange(
                                index,
                                "category",
                                event.target.value
                              )
                            }
                            className="w-28 rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-sm outline-none"
                          >
                            <option value="MAIN">
                              Main
                            </option>

                            <option value="SIDE">
                              Side
                            </option>

                            <option value="SWEET">
                              Sweet
                            </option>

                            <option value="DRINK">
                              Drink
                            </option>

                            <option value="OTHER">
                              Other
                            </option>
                          </select>

                          {menuItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeMenuItem(
                                  index
                                )
                              }
                              className="rounded-lg p-2.5 text-red-500 transition hover:bg-red-50"
                            >
                              <Trash2
                                size={17}
                              />
                            </button>
                          )}

                        </div>
                      )
                    )}

                  </div>

                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    saving ||
                    !selectedOrganization
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {saving ? (
                    <>
                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />

                      Save Meal
                    </>
                  )}

                </button>

              </form>

            </div>

          </section>

          {/* ================================= */}
          {/* Meal History                       */}
          {/* ================================= */}

          <section className="lg:col-span-3">

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-200 p-6">

                <div>
                  <h2 className="font-bold text-slate-900">
                    Meal History
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Recorded meals for the selected organization.
                  </p>
                </div>

                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {meals.length} meals
                </div>

              </div>

              {loadingMeals ? (

                <div className="space-y-4 p-6">

                  {[1, 2, 3].map(
                    (item) => (
                      <div
                        key={item}
                        className="h-32 animate-pulse rounded-xl bg-slate-100"
                      />
                    )
                  )}

                </div>

              ) : meals.length === 0 ? (

                <div className="px-6 py-16 text-center">

                  <Utensils
                    size={40}
                    className="mx-auto mb-4 text-slate-300"
                  />

                  <h3 className="font-semibold text-slate-800">
                    No meals recorded
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Add your first meal using the form.
                  </p>

                </div>

              ) : (

                <div className="divide-y divide-slate-100">

                  {meals.map((meal) => (

                    <div
                      key={meal.id}
                      className="p-6 transition hover:bg-slate-50"
                    >

                      {/* Meal header */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                        <div>

                          <div className="flex items-center gap-3">

                            <h3 className="font-semibold text-slate-900">
                              {formatMealType(
                                meal.mealType
                              )}
                            </h3>

                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                              {meal.mealDate}
                            </span>

                          </div>

                          <p className="mt-2 text-sm text-slate-500">
                            {meal.expectedCustomers ??
                              0}{" "}
                            expected customers
                          </p>

                        </div>

                        <div className="rounded-lg bg-red-50 px-3 py-2 text-right">

                          <p className="text-xs text-red-600">
                            Waste
                          </p>

                          <p className="font-bold text-red-700">
                            {Number(
                              meal.foodWasteKg || 0
                            ).toFixed(2)}{" "}
                            kg
                          </p>

                        </div>

                      </div>

                      {/* Metrics */}
                      <div className="mt-5 grid grid-cols-3 gap-3">

                        <Metric
                          label="Prepared"
                          value={`${Number(
                            meal.foodPreparedKg || 0
                          ).toFixed(2)} kg`}
                        />

                        <Metric
                          label="Consumed"
                          value={`${Number(
                            meal.foodConsumedKg || 0
                          ).toFixed(2)} kg`}
                        />

                        <Metric
                          label="Waste Rate"
                          value={`${Number(
                            meal.wasteRate || 0
                          ).toFixed(2)}%`}
                        />

                      </div>

                      {/* Menu */}
                      {meal.menu &&
                        meal.menu.length > 0 && (
                          <div className="mt-4">

                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                              Menu
                            </p>

                            <div className="flex flex-wrap gap-2">

                              {meal.menu.map(
                                (item, index) => (
                                  <span
                                    key={index}
                                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                                  >
                                    {item.name}
                                  </span>
                                )
                              )}

                            </div>

                          </div>
                        )}

                    </div>

                  ))}

                </div>

              )}

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

/* ================================= */
/* Metric                            */
/* ================================= */

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* ================================= */
/* Helpers                           */
/* ================================= */

function formatMealType(type) {
  if (!type) {
    return "Unknown Meal";
  }

  return (
    type.charAt(0).toUpperCase() +
    type.slice(1).toLowerCase()
  );
}

export default Meals;