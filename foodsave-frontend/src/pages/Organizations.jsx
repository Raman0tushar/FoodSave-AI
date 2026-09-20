import { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  MapPin,
  Users,
  X,
  RefreshCw,
} from "lucide-react";

import {
  getOrganizations,
  createOrganization,
} from "../services/organizationService";

function Organizations() {
  const [organizations, setOrganizations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "HOSTEL",
    city: "",
    state: "",
    country: "India",
    capacity: "",
  });

  /*
   * Load organizations
   */
  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getOrganizations();

      setOrganizations(data || []);
    } catch (err) {
      console.error("Failed to load organizations:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load organizations. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Load organizations when page opens.
   *
   * The async operation is started inside
   * the effect rather than directly executing
   * state updates in the effect body.
   */
  useEffect(() => {
    const initialize = async () => {
      await loadOrganizations();
    };

    initialize();
  }, []);

  /*
   * Handle form changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * Create organization
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Organization name is required.");
      return;
    }

    if (!formData.city.trim()) {
      setError("City is required.");
      return;
    }

    if (!formData.state.trim()) {
      setError("State is required.");
      return;
    }

    if (!formData.capacity || Number(formData.capacity) <= 0) {
      setError("Capacity must be greater than 0.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim() || "India",
        capacity: Number(formData.capacity),
      };

      await createOrganization(payload);

      /*
       * Reload list after successful creation.
       */
      await loadOrganizations();

      /*
       * Reset form
       */
      setFormData({
        name: "",
        type: "HOSTEL",
        city: "",
        state: "",
        country: "India",
        capacity: "",
      });

      setShowModal(false);
    } catch (err) {
      console.error(
        "Failed to create organization:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to create organization."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Open modal
   */
  const handleOpenModal = () => {
    setError("");
    setShowModal(true);
  };

  /*
   * Close modal
   */
  const handleCloseModal = () => {
    if (saving) return;

    setShowModal(false);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================================= */}
      {/* Header                            */}
      {/* ================================= */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <Building2
                size={25}
                className="text-green-700"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Organizations
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage food-service organizations using FoodSave AI.
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={loadOrganizations}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />

              Refresh
            </button>

            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <Plus size={18} />

              Add Organization
            </button>

          </div>

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

        {/* Loading */}
        {loading ? (

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-2xl bg-white shadow-sm"
              />
            ))}

          </div>

        ) : organizations.length === 0 ? (

          /* Empty State */
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100">
              <Building2
                size={30}
                className="text-green-700"
              />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              No organizations yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create your first organization to start tracking
              meals, food waste and demand predictions.
            </p>

            <button
              onClick={handleOpenModal}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <Plus size={18} />

              Add Organization
            </button>

          </div>

        ) : (

          /* Organization Cards */
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {organizations.map((organization) => (

              <div
                key={organization.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                {/* Card Header */}
                <div className="flex items-start justify-between">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                    <Building2
                      size={23}
                      className="text-green-700"
                    />
                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                    {formatOrganizationType(
                      organization.type
                    )}
                  </span>

                </div>

                {/* Name */}
                <h2 className="mt-5 text-lg font-bold text-slate-900">
                  {organization.name}
                </h2>

                {/* Location */}
                <div className="mt-4 flex items-start gap-2 text-sm text-slate-500">

                  <MapPin
                    size={17}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {organization.city},{" "}
                    {organization.state},{" "}
                    {organization.country}
                  </span>

                </div>

                {/* Capacity */}
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">

                  <Users size={17} />

                  <span>
                    Capacity:{" "}
                    <strong className="text-slate-800">
                      {organization.capacity ?? "—"}
                    </strong>
                  </span>

                </div>

                {/* ID */}
                <div className="mt-5 border-t border-slate-100 pt-4">

                  <p className="truncate text-xs text-slate-400">
                    ID: {organization.id}
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>

      {/* ================================= */}
      {/* Create Organization Modal         */}
      {/* ================================= */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Add Organization
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the organization details.
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={21} />
              </button>

            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              {/* Organization Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Organization Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. KNIT Hostel Mess"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Organization Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Organization Type
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                >
                  <option value="HOSTEL">
                    Hostel
                  </option>

                  <option value="RESTAURANT">
                    Restaurant
                  </option>

                  <option value="HOTEL">
                    Hotel
                  </option>

                  <option value="COLLEGE_CANTEEN">
                    College Canteen
                  </option>

                  <option value="INSTITUTIONAL_KITCHEN">
                    Institutional Kitchen
                  </option>
                </select>
              </div>

              {/* City + State */}
              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Sultanpur"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Uttar Pradesh"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  />
                </div>

              </div>

              {/* Country */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Country
                </label>

                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="India"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Capacity */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Capacity
                </label>

                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  placeholder="e.g. 500"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Creating..."
                    : "Create Organization"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

/* ================================= */
/* Helper                            */
/* ================================= */

function formatOrganizationType(type) {
  if (!type) {
    return "Unknown";
  }

  return type
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

export default Organizations;