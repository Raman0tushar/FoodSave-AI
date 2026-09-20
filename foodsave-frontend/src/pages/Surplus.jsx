
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  HeartHandshake,
  PackageCheck,
  Plus,
  RefreshCw,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";

import {
  createSurplus,
  getAllSurplus,
  approveDonation,
  requestDonation,
  acceptDonation,
  schedulePickup,
  markCollected,
  markDonated,
  cancelDonation,
} from "../services/surplusService";

import { getOrganizations } from "../services/organizationService";


// ============================================================
// DATE/TIME HELPERS
// ============================================================

const getDateTimeLocal = (date) => {
  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16);
};

const getDefaultPreparedAt = () => {
  return getDateTimeLocal(new Date());
};

const getDefaultAvailableUntil = () => {
  const date = new Date();

  // Default donation availability = 3 hours
  // from the current time.
  date.setHours(date.getHours() + 3);

  return getDateTimeLocal(date);
};


// ============================================================
// STATUS CONFIG
// ============================================================

const STATUS_CONFIG = {
  PENDING_SAFETY_CHECK: {
    label: "Pending Safety Check",
    className:
      "bg-amber-50 text-amber-700 border-amber-200",
  },

  AVAILABLE_FOR_DONATION: {
    label: "Available for Donation",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  NGO_REQUESTED: {
    label: "NGO Requested",
    className:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  NGO_ACCEPTED: {
    label: "NGO Accepted",
    className:
      "bg-indigo-50 text-indigo-700 border-indigo-200",
  },

  PICKUP_SCHEDULED: {
    label: "Pickup Scheduled",
    className:
      "bg-purple-50 text-purple-700 border-purple-200",
  },

  COLLECTED: {
    label: "Collected",
    className:
      "bg-cyan-50 text-cyan-700 border-cyan-200",
  },

  DONATED: {
    label: "Donated",
    className:
      "bg-green-50 text-green-700 border-green-200",
  },

  EXPIRED: {
    label: "Expired",
    className:
      "bg-slate-100 text-slate-600 border-slate-200",
  },

  CANCELLED: {
    label: "Cancelled",
    className:
      "bg-red-50 text-red-700 border-red-200",
  },
};


// ============================================================
// INITIAL FORM
// ============================================================

const createInitialForm = () => ({
  organizationId: "",
  mealId: "",
  mealType: "LUNCH",
  foodName: "",
  quantityKg: "",
  availablePortions: "",
  preparedAt: getDefaultPreparedAt(),
  availableUntil: getDefaultAvailableUntil(),
});


// ============================================================
// COMPONENT
// ============================================================

export default function Surplus() {

  const [surplus, setSurplus] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState(
    createInitialForm()
  );


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData = useCallback(async () => {

    try {

      setLoading(true);
      setError("");

      const [
        surplusData,
        organizationData,
      ] = await Promise.all([
        getAllSurplus(),
        getOrganizations(),
      ]);

      setSurplus(
        Array.isArray(surplusData)
          ? surplusData
          : []
      );

      setOrganizations(
        Array.isArray(organizationData)
          ? organizationData
          : []
      );

    } catch (err) {

      console.error(
        "Unable to load surplus data:",
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to load surplus donation data."
      );

    } finally {

      setLoading(false);

    }

  }, []);


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();

  }, [loadData]);


  // ==========================================================
  // HANDLE INPUT
  // ==========================================================

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


  // ==========================================================
  // HANDLE PREPARED TIME CHANGE
  // ==========================================================

  const handlePreparedAtChange = (event) => {

    const preparedAt =
      event.target.value;

    setForm((previous) => {

      const preparedDate =
        new Date(preparedAt);

      if (
        Number.isNaN(
          preparedDate.getTime()
        )
      ) {

        return {
          ...previous,
          preparedAt,
        };

      }

      /*
       * Automatically make availability
       * 3 hours after preparation.
       */
      const expiryDate =
        new Date(
          preparedDate.getTime()
          + 3 * 60 * 60 * 1000
        );

      return {
        ...previous,
        preparedAt,
        availableUntil:
          getDateTimeLocal(expiryDate),
      };

    });

  };


  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {

    setForm(
      createInitialForm()
    );

  };


  // ==========================================================
  // CREATE SURPLUS
  // ==========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess("");


    // --------------------------------------------------------
    // ORGANIZATION
    // --------------------------------------------------------

    const organizationId =
      form.organizationId ||
      organizations[0]?.id;

    if (!organizationId) {

      setError(
        "Please create/select an organization first."
      );

      return;
    }


    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    if (!form.foodName.trim()) {

      setError(
        "Please enter the food name."
      );

      return;
    }

    if (
      !form.quantityKg ||
      Number(form.quantityKg) <= 0
    ) {

      setError(
        "Quantity must be greater than 0 kg."
      );

      return;
    }

    if (
      !form.availablePortions ||
      Number(form.availablePortions) <= 0
    ) {

      setError(
        "Available portions must be greater than 0."
      );

      return;
    }


    // --------------------------------------------------------
    // DATE VALIDATION
    // --------------------------------------------------------

    const preparedAt =
      new Date(form.preparedAt);

    const availableUntil =
      new Date(form.availableUntil);

    const now =
      new Date();


    if (
      Number.isNaN(
        preparedAt.getTime()
      )
    ) {

      setError(
        "Please select a valid preparation time."
      );

      return;
    }


    if (
      Number.isNaN(
        availableUntil.getTime()
      )
    ) {

      setError(
        "Please select a valid availability time."
      );

      return;
    }


    if (
      availableUntil <= preparedAt
    ) {

      setError(
        "Available until time must be after preparation time."
      );

      return;
    }


    if (
      availableUntil <= now
    ) {

      setError(
        "Available until time must be in the future."
      );

      return;
    }


    // --------------------------------------------------------
    // PAYLOAD
    // --------------------------------------------------------

    const payload = {

      organizationId,

      mealId:
        form.mealId.trim()
          ? form.mealId.trim()
          : null,

      mealType:
        form.mealType,

      foodName:
        form.foodName.trim(),

      quantityKg:
        Number(form.quantityKg),

      availablePortions:
        Number(form.availablePortions),

      preparedAt:
        form.preparedAt,

      availableUntil:
        form.availableUntil,
    };


    console.log(
      "SURPLUS PAYLOAD:",
      payload
    );


    // --------------------------------------------------------
    // API REQUEST
    // --------------------------------------------------------

    try {

      setSubmitting(true);

      await createSurplus(payload);

      setSuccess(
        "Surplus food listing created successfully."
      );

      resetForm();

      setShowForm(false);

      await loadData();

    } catch (err) {

      console.error(
        "Unable to create surplus:",
        err
      );

      console.error(
        "Status:",
        err?.response?.status
      );

      console.error(
        "Response:",
        err?.response?.data
      );

      console.error(
        "Request:",
        err?.config?.data
      );

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to create surplus donation."
      );

    } finally {

      setSubmitting(false);

    }

  };


  // ==========================================================
  // PERFORM ACTION
  // ==========================================================

  const performAction = async (
    id,
    action,
    successMessage
  ) => {

    try {

      setError("");
      setSuccess("");

      await action(id);

      setSuccess(
        successMessage
      );

      await loadData();

    } catch (err) {

      console.error(
        "Surplus action failed:",
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to update surplus listing."
      );

    }

  };


  // ==========================================================
  // NGO REQUEST
  // ==========================================================

  const handleNGORequest = async (
    item
  ) => {

    const ngoName =
      window.prompt(
        "Enter NGO name:"
      );

    if (!ngoName?.trim()) {
      return;
    }


    const ngoId =
      window.prompt(
        "Enter NGO ID:"
      );

    if (!ngoId?.trim()) {
      return;
    }


    try {

      setError("");
      setSuccess("");

      await requestDonation(
        item.id,
        ngoId.trim(),
        ngoName.trim()
      );

      setSuccess(
        "NGO donation request recorded successfully."
      );

      await loadData();

    } catch (err) {

      console.error(
        "Unable to request donation:",
        err
      );

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to create NGO donation request."
      );

    }

  };


  // ==========================================================
  // STATS
  // ==========================================================

  const stats = useMemo(() => {

    const total =
      surplus.length;

    const pending =
      surplus.filter(
        (item) =>
          item.status ===
          "PENDING_SAFETY_CHECK"
      ).length;

    const available =
      surplus.filter(
        (item) =>
          item.status ===
          "AVAILABLE_FOR_DONATION"
      ).length;

    const donated =
      surplus.filter(
        (item) =>
          item.status ===
          "DONATED"
      ).length;

    const totalKg =
      surplus.reduce(
        (sum, item) =>
          sum +
          (Number(item.quantityKg) || 0),
        0
      );

    const donatedKg =
      surplus
        .filter(
          (item) =>
            item.status ===
            "DONATED"
        )
        .reduce(
          (sum, item) =>
            sum +
            (Number(item.quantityKg) || 0),
          0
        );

    return {
      total,
      pending,
      available,
      donated,
      totalKg,
      donatedKg,
    };

  }, [surplus]);


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (value) => {

    if (!value) {
      return "—";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return value;

    }

    return date.toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );

  };


  // ==========================================================
  // ORGANIZATION NAME
  // ==========================================================

  const getOrganizationName = (
    organizationId
  ) => {

    const organization =
      organizations.find(
        (item) =>
          item.id === organizationId
      );

    return (
      organization?.name ||
      organizationId ||
      "Unknown organization"
    );

  };


  // ==========================================================
  // STATUS BADGE
  // ==========================================================

  const StatusBadge = ({
    status,
  }) => {

    const config =
      STATUS_CONFIG[status] ||
      {
        label: status || "Unknown",
        className:
          "bg-slate-100 text-slate-600 border-slate-200",
      };

    return (
      <span
        className={`
          inline-flex
          items-center
          rounded-full
          border
          px-3
          py-1
          text-xs
          font-semibold
          ${config.className}
        `}
      >
        {config.label}
      </span>
    );

  };


  // ==========================================================
  // ACTION BUTTONS
  // ==========================================================

  const renderActions = (item) => {

    const buttons = [];


    if (
      item.status ===
      "PENDING_SAFETY_CHECK"
    ) {

      buttons.push(
        <button
          key="approve"
          type="button"
          onClick={() =>
            performAction(
              item.id,
              approveDonation,
              "Food approved for donation."
            )
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-emerald-600
            px-3
            py-2
            text-sm
            font-medium
            text-white
            hover:bg-emerald-700
          "
        >
          <ShieldCheck size={16} />
          Approve Donation
        </button>
      );

    }


    if (
      item.status ===
      "AVAILABLE_FOR_DONATION"
    ) {

      buttons.push(
        <button
          key="request"
          type="button"
          onClick={() =>
            handleNGORequest(item)
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-blue-600
            px-3
            py-2
            text-sm
            font-medium
            text-white
            hover:bg-blue-700
          "
        >
          <HeartHandshake size={16} />
          NGO Request
        </button>
      );

    }


    if (
      item.status ===
      "NGO_REQUESTED"
    ) {

      buttons.push(
        <button
          key="accept"
          type="button"
          onClick={() =>
            performAction(
              item.id,
              acceptDonation,
              "NGO request accepted."
            )
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-indigo-600
            px-3
            py-2
            text-sm
            font-medium
            text-white
            hover:bg-indigo-700
          "
        >
          <CheckCircle2 size={16} />
          Accept NGO
        </button>
      );

    }


    if (
      item.status ===
      "NGO_ACCEPTED"
    ) {

      buttons.push(
        <button
          key="pickup"
          type="button"
          onClick={() =>
            performAction(
              item.id,
              schedulePickup,
              "Pickup scheduled successfully."
            )
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-purple-600
            px-3
            py-2
            text-sm
            font-medium
            text-white
            hover:bg-purple-700
          "
        >
          <Truck size={16} />
          Schedule Pickup
        </button>
      );

    }


    if (
      item.status ===
      "PICKUP_SCHEDULED"
    ) {

      buttons.push(
        <button
          key="collected"
          type="button"
          onClick={() =>
            performAction(
              item.id,
              markCollected,
              "Food marked as collected."
            )
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-cyan-600
            px-3
            py-2
            text-sm
            font-medium
            text-white
            hover:bg-cyan-700
          "
        >
          <PackageCheck size={16} />
          Mark Collected
        </button>
      );

    }


    if (
      item.status ===
      "COLLECTED"
    ) {

      buttons.push(
        <button
          key="donated"
          type="button"
          onClick={() =>
            performAction(
              item.id,
              markDonated,
              "Donation completed successfully."
            )
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            bg-green-600
            px-3
            py-2
            text-sm
            font-medium
            text-white
            hover:bg-green-700
          "
        >
          <HeartHandshake size={16} />
          Mark Donated
        </button>
      );

    }


    if (
      item.status !==
        "DONATED" &&
      item.status !==
        "CANCELLED" &&
      item.status !==
        "EXPIRED"
    ) {

      buttons.push(
        <button
          key="cancel"
          type="button"
          onClick={() =>
            performAction(
              item.id,
              cancelDonation,
              "Donation cancelled."
            )
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-3
            py-2
            text-sm
            font-medium
            text-red-600
            hover:bg-red-100
          "
        >
          <XCircle size={16} />
          Cancel
        </button>
      );

    }


    return buttons;

  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="border-b bg-white">

        <div className="
          mx-auto
          max-w-7xl
          px-4
          py-6
          sm:px-6
          lg:px-8
        ">

          <div className="
            flex
            flex-col
            gap-4
            md:flex-row
            md:items-center
            md:justify-between
          ">

            <div>

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-100
                  text-emerald-600
                ">
                  <HeartHandshake
                    size={26}
                  />
                </div>

                <div>

                  <h1 className="
                    text-2xl
                    font-bold
                    text-slate-900
                  ">
                    Surplus Donation
                  </h1>

                  <p className="
                    text-sm
                    text-slate-500
                  ">
                    Recover safe surplus food
                    and connect it with NGOs.
                  </p>

                </div>

              </div>

            </div>


            <div className="
              flex
              gap-2
            ">

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-slate-700
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <RefreshCw
                  size={16}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  resetForm();
                  setShowForm(true);
                }}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-emerald-600
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  hover:bg-emerald-700
                "
              >
                <Plus size={17} />
                Add Surplus
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* ====================================================
          CONTENT
      ==================================================== */}

      <main className="
        mx-auto
        max-w-7xl
        px-4
        py-6
        sm:px-6
        lg:px-8
      ">


        {/* ==================================================
            ALERTS
        ================================================== */}

        {error && (

          <div className="
            mb-6
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-red-200
            bg-red-50
            p-4
            text-red-700
          ">

            <XCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">

              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="
                text-sm
                font-medium
                hover:underline
              "
            >
              Close
            </button>

          </div>

        )}


        {success && (

          <div className="
            mb-6
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-emerald-200
            bg-emerald-50
            p-4
            text-emerald-700
          ">

            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">

              <p className="font-semibold">
                Success
              </p>

              <p className="mt-1 text-sm">
                {success}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="
                text-sm
                font-medium
                hover:underline
              "
            >
              Close
            </button>

          </div>

        )}


        {/* ==================================================
            STATS
        ================================================== */}

        <div className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          lg:grid-cols-4
        ">

          <StatCard
            icon={<HeartHandshake size={21} />}
            label="Total Listings"
            value={stats.total}
          />

          <StatCard
            icon={<ShieldCheck size={21} />}
            label="Pending Safety"
            value={stats.pending}
          />

          <StatCard
            icon={<PackageCheck size={21} />}
            label="Available"
            value={stats.available}
          />

          <StatCard
            icon={<CheckCircle2 size={21} />}
            label="Donated"
            value={stats.donated}
          />

        </div>


        {/* ==================================================
            WEIGHT SUMMARY
        ================================================== */}

        <div className="
          mt-4
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
        ">

          <div className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-5
          ">

            <div className="
              flex
              items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  text-slate-500
                ">
                  Surplus Food Listed
                </p>

                <p className="
                  mt-1
                  text-2xl
                  font-bold
                  text-slate-900
                ">
                  {stats.totalKg.toFixed(1)} kg
                </p>

              </div>

              <div className="
                rounded-lg
                bg-amber-50
                p-3
                text-amber-600
              ">
                <PackageCheck
                  size={22}
                />
              </div>

            </div>

          </div>


          <div className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-5
          ">

            <div className="
              flex
              items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  text-slate-500
                ">
                  Food Donated
                </p>

                <p className="
                  mt-1
                  text-2xl
                  font-bold
                  text-emerald-600
                ">
                  {stats.donatedKg.toFixed(1)} kg
                </p>

              </div>

              <div className="
                rounded-lg
                bg-emerald-50
                p-3
                text-emerald-600
              ">
                <HeartHandshake
                  size={22}
                />
              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            ADD FORM
        ================================================== */}

        {showForm && (

          <div className="
            mt-6
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
          ">

            <div className="
              mb-6
              flex
              items-start
              justify-between
              gap-4
            ">

              <div>

                <h2 className="
                  text-lg
                  font-bold
                  text-slate-900
                ">
                  Add Surplus Food
                </h2>

                <p className="
                  mt-1
                  text-sm
                  text-slate-500
                ">
                  Record safe surplus food
                  that may be donated to an NGO.
                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
                className="
                  rounded-lg
                  p-2
                  text-slate-400
                  hover:bg-slate-100
                  hover:text-slate-600
                "
              >
                <XCircle size={20} />
              </button>

            </div>


            <form
              onSubmit={handleSubmit}
              className="
                grid
                grid-cols-1
                gap-5
                md:grid-cols-2
              "
            >

              {/* ORGANIZATION */}

              <FormField
                label="Organization"
                required
              >

                <select
                  name="organizationId"
                  value={
                    form.organizationId
                  }
                  onChange={handleChange}
                  className="input"
                >

                  <option value="">
                    Select organization
                  </option>

                  {organizations.map(
                    (organization) => (
                      <option
                        key={
                          organization.id
                        }
                        value={
                          organization.id
                        }
                      >
                        {organization.name}
                      </option>
                    )
                  )}

                </select>

              </FormField>


              {/* MEAL ID */}

              <FormField
                label="Meal ID"
              >

                <input
                  type="text"
                  name="mealId"
                  value={form.mealId}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="input"
                />

              </FormField>


              {/* MEAL TYPE */}

              <FormField
                label="Meal Type"
                required
              >

                <select
                  name="mealType"
                  value={form.mealType}
                  onChange={handleChange}
                  className="input"
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

              </FormField>


              {/* FOOD NAME */}

              <FormField
                label="Food Name"
                required
              >

                <input
                  type="text"
                  name="foodName"
                  value={form.foodName}
                  onChange={handleChange}
                  placeholder="e.g. Rice and Dal"
                  className="input"
                />

              </FormField>


              {/* QUANTITY */}

              <FormField
                label="Quantity (kg)"
                required
              >

                <input
                  type="number"
                  name="quantityKg"
                  value={form.quantityKg}
                  onChange={handleChange}
                  placeholder="10"
                  min="0.1"
                  step="0.1"
                  className="input"
                />

              </FormField>


              {/* PORTIONS */}

              <FormField
                label="Available Portions"
                required
              >

                <input
                  type="number"
                  name="availablePortions"
                  value={
                    form.availablePortions
                  }
                  onChange={handleChange}
                  placeholder="40"
                  min="1"
                  step="1"
                  className="input"
                />

              </FormField>


              {/* PREPARED AT */}

              <FormField
                label="Prepared At"
                required
              >

                <input
                  type="datetime-local"
                  name="preparedAt"
                  value={form.preparedAt}
                  onChange={
                    handlePreparedAtChange
                  }
                  className="input"
                />

              </FormField>


              {/* AVAILABLE UNTIL */}

              <FormField
                label="Available Until"
                required
              >

                <input
                  type="datetime-local"
                  name="availableUntil"
                  value={
                    form.availableUntil
                  }
                  min={
                    form.preparedAt
                  }
                  onChange={handleChange}
                  className="input"
                />

                <p className="
                  mt-1.5
                  text-xs
                  text-slate-500
                ">
                  Must be later than the
                  preparation time and in the future.
                </p>

              </FormField>


              {/* FORM ACTIONS */}

              <div className="
                flex
                flex-col
                gap-3
                pt-2
                md:col-span-2
                sm:flex-row
                sm:justify-end
              ">

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                  className="
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-700
                    hover:bg-slate-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-emerald-600
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-emerald-700
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {submitting ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Create Listing
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        )}


        {/* ==================================================
            LISTINGS
        ================================================== */}

        <div className="
          mt-6
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        ">

          <div className="
            border-b
            border-slate-200
            px-6
            py-5
          ">

            <div className="
              flex
              items-center
              gap-3
            ">

              <Clock3
                size={20}
                className="text-slate-500"
              />

              <div>

                <h2 className="
                  font-bold
                  text-slate-900
                ">
                  Surplus Listings
                </h2>

                <p className="
                  text-sm
                  text-slate-500
                ">
                  Track food from safety
                  check through final donation.
                </p>

              </div>

            </div>

          </div>


          {loading ? (

            <div className="
              flex
              min-h-60
              items-center
              justify-center
              p-8
            ">

              <div className="
                flex
                items-center
                gap-3
                text-slate-500
              ">

                <RefreshCw
                  size={20}
                  className="animate-spin"
                />

                Loading surplus listings...

              </div>

            </div>

          ) : surplus.length === 0 ? (

            <div className="
              flex
              min-h-60
              flex-col
              items-center
              justify-center
              p-8
              text-center
            ">

              <div className="
                mb-4
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-emerald-50
                text-emerald-600
              ">

                <HeartHandshake
                  size={28}
                />

              </div>

              <h3 className="
                text-lg
                font-semibold
                text-slate-900
              ">
                No surplus listings yet
              </h3>

              <p className="
                mt-1
                max-w-md
                text-sm
                text-slate-500
              ">
                Add safe surplus food to
                start the donation workflow.
              </p>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-emerald-600
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-white
                  hover:bg-emerald-700
                "
              >
                <Plus size={17} />
                Add Surplus
              </button>

            </div>

          ) : (

            <div className="
              divide-y
              divide-slate-100
            ">

              {surplus.map(
                (item) => (

                  <div
                    key={item.id}
                    className="
                      p-6
                      transition
                      hover:bg-slate-50/70
                    "
                  >

                    {/* TOP */}

                    <div className="
                      flex
                      flex-col
                      gap-4
                      lg:flex-row
                      lg:items-start
                      lg:justify-between
                    ">

                      <div className="min-w-0">

                        <div className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                        ">

                          <h3 className="
                            text-lg
                            font-bold
                            text-slate-900
                          ">
                            {item.foodName}
                          </h3>

                          <StatusBadge
                            status={
                              item.status
                            }
                          />

                        </div>


                        <p className="
                          mt-1
                          text-sm
                          text-slate-500
                        ">
                          {
                            getOrganizationName(
                              item.organizationId
                            )
                          }
                        </p>

                      </div>


                      <div className="
                        flex
                        flex-wrap
                        gap-2
                      ">

                        {renderActions(
                          item
                        )}

                      </div>

                    </div>


                    {/* DETAILS */}

                    <div className="
                      mt-5
                      grid
                      grid-cols-1
                      gap-4
                      sm:grid-cols-2
                      lg:grid-cols-4
                    ">

                      <DetailItem
                        label="Quantity"
                        value={`${item.quantityKg ?? 0} kg`}
                      />

                      <DetailItem
                        label="Portions"
                        value={
                          item.availablePortions ??
                          "—"
                        }
                      />

                      <DetailItem
                        label="Prepared At"
                        value={
                          formatDate(
                            item.preparedAt
                          )
                        }
                      />

                      <DetailItem
                        label="Available Until"
                        value={
                          formatDate(
                            item.availableUntil
                          )
                        }
                      />

                    </div>


                    {/* NGO */}

                    {(item.ngoName ||
                      item.ngoId) && (

                      <div className="
                        mt-5
                        rounded-xl
                        border
                        border-blue-100
                        bg-blue-50
                        p-4
                      ">

                        <div className="
                          flex
                          items-center
                          gap-2
                          text-sm
                          font-semibold
                          text-blue-800
                        ">

                          <HeartHandshake
                            size={17}
                          />

                          NGO Donation

                        </div>

                        <div className="
                          mt-2
                          grid
                          grid-cols-1
                          gap-2
                          text-sm
                          sm:grid-cols-2
                        ">

                          <p className="text-blue-700">

                            <span className="font-medium">
                              NGO:
                            </span>{" "}

                            {item.ngoName ||
                              "—"}

                          </p>

                          <p className="text-blue-700">

                            <span className="font-medium">
                              NGO ID:
                            </span>{" "}

                            {item.ngoId ||
                              "—"}

                          </p>

                        </div>

                      </div>

                    )}


                    {/* DONATED */}

                    {item.status ===
                      "DONATED" &&
                      item.donatedAt && (

                        <div className="
                          mt-5
                          flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-emerald-100
                          bg-emerald-50
                          px-4
                          py-3
                          text-sm
                          text-emerald-700
                        ">

                          <CheckCircle2
                            size={17}
                          />

                          Donated on{" "}
                          {formatDate(
                            item.donatedAt
                          )}

                        </div>

                      )}


                    {/* LISTING ID */}

                    <div className="
                      mt-4
                      text-xs
                      text-slate-400
                    ">

                      Listing ID:{" "}
                      <span className="
                        font-mono
                      ">
                        {item.id}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  label,
  value,
}) {

  return (
    <div className="
      rounded-xl
      border
      border-slate-200
      bg-white
      p-5
      shadow-sm
    ">

      <div className="
        flex
        items-center
        justify-between
      ">

        <div>

          <p className="
            text-sm
            font-medium
            text-slate-500
          ">
            {label}
          </p>

          <p className="
            mt-1
            text-2xl
            font-bold
            text-slate-900
          ">
            {value}
          </p>

        </div>

        <div className="
          rounded-lg
          bg-emerald-50
          p-3
          text-emerald-600
        ">
          {icon}
        </div>

      </div>

    </div>
  );
}


// ============================================================
// FORM FIELD
// ============================================================

function FormField({
  label,
  required = false,
  children,
}) {

  return (
    <div>

      <label className="
        mb-2
        block
        text-sm
        font-semibold
        text-slate-700
      ">

        {label}

        {required && (
          <span className="
            ml-1
            text-red-500
          ">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}


// ============================================================
// DETAIL ITEM
// ============================================================

function DetailItem({
  label,
  value,
}) {

  return (
    <div className="
      rounded-lg
      bg-slate-50
      p-3
    ">

      <p className="
        text-xs
        font-medium
        uppercase
        tracking-wide
        text-slate-400
      ">
        {label}
      </p>

      <p className="
        mt-1
        text-sm
        font-semibold
        text-slate-700
      ">
        {value}
      </p>

    </div>
  );
}

