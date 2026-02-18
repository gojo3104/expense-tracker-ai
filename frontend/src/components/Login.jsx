import React, { useState } from "react";
import { toast } from "react-toastify";
import { Lock, Mail, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // DEMO credentials
    if (email === "admin@expense.ai" && password === "admin123") {
      localStorage.setItem("demo_auth", "true");
      toast.success("Welcome back 👋");
      navigate("/");
    } else {
      toast.error("Invalid demo credentials ❌");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <form
        onSubmit={handleLogin}
        className="relative w-full max-w-md rounded-2xl p-8
        bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Sparkles />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Expense Tracker AI
            </h2>
            <p className="text-sm text-gray-400">
              Sign in to continue
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="text-xs text-gray-400">Email</label>
          <div className="mt-1 flex items-center gap-2 rounded-lg
            bg-white/20 border border-white/20 px-3">
            <Mail size={16} className="text-indigo-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@expense.ai"
              className="w-full bg-transparent py-2 text-sm
                text-gray-900 placeholder-gray-400 outline-none"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="text-xs text-gray-400">Password</label>
          <div className="mt-1 flex items-center gap-2 rounded-lg
            bg-white/20 border border-white/20 px-3">
            <Lock size={16} className="text-indigo-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              className="w-full bg-transparent py-2 text-sm
                text-gray-900 placeholder-gray-400 outline-none"
              required
            />
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl font-semibold text-white
          bg-gradient-to-r from-indigo-500 to-purple-600
          hover:shadow-lg hover:shadow-indigo-500/30 transition"
        >
          Login
        </button>

        {/* Demo Hint */}
        <p className="mt-4 text-center text-xs text-gray-400">
          Demo access ·{" "}
          <span className="text-indigo-400">
            admin@expense.ai
          </span>{" "}
          / admin123
        </p>
      </form>
    </section>
  );
}
