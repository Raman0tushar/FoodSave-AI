import {
  Menu,
  Leaf,
  Bell,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

function Navbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-40 h-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left */}
        <div className="flex items-center gap-3">

          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={23} />
          </button>

          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2"
          >
            <div className="rounded-lg bg-green-100 p-2 text-green-600">
              <Leaf size={20} />
            </div>

            <div>
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                FoodSave AI
              </h1>

              <p className="hidden text-xs text-slate-400 sm:block">
                Predict. Prepare. Prevent Waste.
              </p>
            </div>
          </Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* Notification */}
          <button
            className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Notifications"
          >
            <Bell size={20} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-green-500" />
          </button>

          {/* Desktop User */}
          <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
            <div className="rounded-full bg-slate-100 p-2 text-slate-600">
              <User size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Food Manager
              </p>

              <p className="text-xs text-slate-400">
                Administrator
              </p>
            </div>
          </div>

          {/* Mobile User */}
          <button
            className="rounded-full bg-slate-100 p-2 text-slate-600 sm:hidden"
            aria-label="User profile"
          >
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;