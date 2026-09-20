import { Link } from "react-router-dom";
import {
  Leaf,
  Brain,
  TrendingDown,
  ArrowRight,
} from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5">

        <div className="flex items-center gap-2">
          <Leaf className="text-green-400" />
          <span className="text-xl font-bold">
            FoodSave AI
          </span>
        </div>

        <Link
          to="/dashboard"
          className="rounded-lg bg-green-500 px-5 py-2.5 font-semibold text-slate-950 hover:bg-green-400"
        >
          Open Dashboard
        </Link>

      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-8 py-24">

        <div className="max-w-3xl">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">
            <Leaf size={16} />
            AI for Sustainable Food Management
          </div>

          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Predict.
            <span className="text-green-400">
              {" "}Prepare.
            </span>
            <br />
            Prevent Waste.
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            FoodSave AI helps hostels, restaurants, hotels,
            college canteens, and institutional kitchens
            predict food demand and reduce avoidable food waste.
          </p>

          <div className="mt-10 flex gap-4">

            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 font-semibold text-slate-950 hover:bg-green-400"
            >
              View Dashboard
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/predictions"
              className="rounded-lg border border-slate-700 px-6 py-3 font-semibold hover:bg-slate-800"
            >
              Try Prediction
            </Link>

          </div>

        </div>

      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-6xl gap-6 px-8 pb-20 md:grid-cols-3">

        <FeatureCard
          icon={<Brain />}
          title="AI Demand Prediction"
          description="Use historical consumption data to estimate upcoming food demand."
        />

        <FeatureCard
          icon={<TrendingDown />}
          title="Waste Analytics"
          description="Track prepared, consumed and wasted food across meals."
        />

        <FeatureCard
          icon={<Leaf />}
          title="Sustainability"
          description="Turn food data into measurable waste-reduction insights."
        />

      </section>

    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <div className="mb-5 inline-flex rounded-lg bg-green-500/10 p-3 text-green-400">
        {icon}
      </div>

      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-400">
        {description}
      </p>

    </div>
  );
}

export default Home;