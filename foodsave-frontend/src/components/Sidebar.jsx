import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Utensils,
  Trash2,
  Brain,
  Leaf,
  X,
} from "lucide-react";

import { HeartHandshake } from "lucide-react";

function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Organizations",
      path: "/organizations",
      icon: Building2,
    },
    {
      name: "Meals",
      path: "/meals",
      icon: Utensils,
    },
    {
      name: "Waste Analytics",
      path: "/waste",
      icon: Trash2,
    },
    {
      name: "Predictions",
      path: "/predictions",
      icon: Brain,
    },
    {
      name: "AI Insights",
      path: "/ai-insights",
      icon: Leaf,
    },
    {
      name: "Surplus Donation",
      path: "/surplus",
      icon: HeartHandshake,
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Mobile Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-green-100 p-2 text-green-600">
              <Leaf size={20} />
            </div>

            <span className="font-bold text-slate-900">
              FoodSave AI
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close navigation menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Desktop Top Space */}
        <div className="hidden h-20 lg:block" />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-green-50 text-green-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sustainability Card */}
        <div className="p-4">
          <div className="rounded-2xl bg-slate-900 p-5 text-white">
            <div className="mb-3 inline-flex rounded-lg bg-green-500/10 p-2 text-green-400">
              <Leaf size={20} />
            </div>

            <h3 className="text-sm font-semibold">
              Sustainability Goal
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Reduce avoidable food waste through data-driven
              preparation and better demand planning.
            </p>

            <div className="mt-4">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-slate-400">
                  SDG 12
                </span>

                <span className="font-semibold text-green-400">
                  Responsible Consumption
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                <div className="h-full w-3/5 rounded-full bg-green-500" />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;