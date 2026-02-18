import React from "react";
import axios from "axios";
import { IndianRupee, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

// INR formatter
const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const categoryColors = {
  "Food & Dining": "bg-emerald-500/20 text-emerald-400",
  Travel: "bg-sky-500/20 text-sky-400",
  Shopping: "bg-purple-500/20 text-purple-400",
  Utilities: "bg-red-500/20 text-red-400",
  Other: "bg-gray-500/20 text-gray-300",
};

export default function ExpenseList({ expenses = [], onDelete }) {
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expense?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/expenses/${id}`);
      toast.success("Expense deleted 🗑️");
      onDelete?.(); // refresh dashboard + list
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white">All Expenses</h2>
        <p className="text-gray-400">
          Complete history of your AI-tracked expenses
        </p>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden">
        {expenses.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            No expenses recorded yet.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-left text-gray-400 text-sm">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Merchant</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {expenses.map((e) => (
                <tr
                  key={e.id}
                  className="border-t border-white/10 hover:bg-white/5 transition"
                >
                  <td className="px-6 py-4 text-gray-300">
                    {e.date || "-"}
                  </td>
                  <td className="px-6 py-4 text-white font-medium">
                    {e.merchant || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        categoryColors[e.category] || categoryColors.Other
                      }`}
                    >
                      {e.category || "Other"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-indigo-400 flex items-center justify-end gap-1">
                    <IndianRupee size={14} />
                    {fmtINR(e.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-red-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
