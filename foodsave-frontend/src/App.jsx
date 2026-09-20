import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Organizations from "./pages/Organizations";
import Meals from "./pages/Meals";
import Waste from "./pages/Waste";
import Predictions from "./pages/Predictions";
import AIInsights from "./pages/AIInsights";
import Surplus from "./pages/Surplus";



function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(true)}
      />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* Application */}
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/organizations"
            element={<Organizations />}
          />

          <Route
            path="/meals"
            element={<Meals />}
          />

          <Route
            path="/waste"
            element={<Waste />}
          />

          <Route
            path="/predictions"
            element={<Predictions />}
          />

          <Route
            path="/ai-insights"
            element={<AIInsights />}
          />

          <Route
            path="/surplus"
            element={<Surplus />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;