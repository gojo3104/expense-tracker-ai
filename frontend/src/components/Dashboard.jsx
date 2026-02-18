import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  IndianRupee,
  Layers,
  TrendingUp,
  Calendar,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

/* ================= UTIL ================= */

const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const COLORS = [
  "#818cf8",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#38bdf8",
  "#a855f7",
];

/* ================= KPI ================= */

const KPI = ({ icon: Icon, label, value, accent }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="relative overflow-hidden rounded-2xl p-6 bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl"
  >
    <div className={`absolute inset-0 opacity-20 ${accent}`} />
    <div className="relative flex items-center gap-4">
      <div className="p-3 rounded-xl bg-white/10 text-white">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  </motion.div>
);

/* ================= DASHBOARD ================= */

export default function Dashboard({ expenses = [] }) {
  const {
    total,
    byCategory,
    byMonth,
    topCategory,
    entries,
    avgMonthly,
    recent,
  } = useMemo(() => {
    if (!Array.isArray(expenses) || expenses.length === 0) {
      return {
        total: 0,
        byCategory: [],
        byMonth: [],
        topCategory: "-",
        entries: 0,
        avgMonthly: 0,
        recent: [],
      };
    }

    const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const categoryTotals = {};
    const monthTotals = {};

    expenses.forEach((e) => {
      const amt = Number(e.amount || 0);
      const cat = e.category || "Other";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;

      if (e.date) {
        const m = new Date(e.date).toISOString().slice(0, 7);
        monthTotals[m] = (monthTotals[m] || 0) + amt;
      }
    });

    const byCategory = Object.entries(categoryTotals).map(
      ([name, value]) => ({ name, value })
    );

    const byMonth = Object.entries(monthTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({ month, value }));

    return {
      total,
      byCategory,
      byMonth,
      topCategory:
        byCategory.length > 0
          ? byCategory.reduce((a, b) => (a.value > b.value ? a : b)).name
          : "-",
      entries: expenses.length,
      avgMonthly: total / (byMonth.length || 1),
      recent: [...expenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5),
    };
  }, [expenses]);

  const aiInsight =
    total > 50000
      ? "Your spending is trending high. Consider reviewing discretionary categories."
      : "Your spending looks balanced. Keep tracking to maintain control.";

  return (
    <section className="space-y-12">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold text-white">Spending Overview</h2>
        <p className="text-gray-400 mt-1">
          Real-time insights powered by AI
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI label="Total Spending" value={fmtINR(total)} icon={IndianRupee}
          accent="bg-gradient-to-br from-indigo-500 to-purple-600" />
        <KPI label="Total Entries" value={entries} icon={Layers}
          accent="bg-gradient-to-br from-emerald-500 to-green-600" />
        <KPI label="Top Category" value={topCategory} icon={TrendingUp}
          accent="bg-gradient-to-br from-amber-400 to-orange-500" />
        <KPI label="Avg Monthly Spend" value={fmtINR(avgMonthly)} icon={Calendar}
          accent="bg-gradient-to-br from-sky-500 to-blue-600" />
      </div>

      {/* AI INSIGHT */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl p-6 bg-indigo-500/10 border border-indigo-400/20 flex gap-4"
      >
        <Sparkles className="text-indigo-400" />
        <p className="text-indigo-100">{aiInsight}</p>
      </motion.div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PIE */}
        <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4">
            Category Distribution
          </h3>

          {byCategory.length === 0 ? (
            <p className="text-gray-400 text-sm">No data available</p>
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCategory} dataKey="value" outerRadius={120}>
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmtINR(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* LINE */}
        <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4">
            Monthly Spending Trend
          </h3>

          {byMonth.length === 0 ? (
            <p className="text-gray-400 text-sm">No data available</p>
          ) : (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={byMonth}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#cbd5f5" />
                  <YAxis stroke="#cbd5f5" />
                  <Tooltip formatter={(v) => fmtINR(v)} />
                  <Line dataKey="value" stroke="#818cf8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* RECENT */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-white font-semibold mb-4">
          Recent Expenses
        </h3>

        {recent.length === 0 ? (
          <p className="text-gray-400 text-sm">No recent expenses</p>
        ) : (
          <ul className="space-y-3">
            {recent.map((e) => (
              <li
                key={e.id}
                className="flex justify-between text-sm text-gray-300"
              >
                <span>{e.merchant || "Unknown"}</span>
                <span className="text-indigo-400">{fmtINR(e.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
