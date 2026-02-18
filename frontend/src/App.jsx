import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import UploadReceipt from "./components/UploadReceipt";
import ExpenseList from "./components/ExpenseList";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Routes, Route, Navigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

// 🔒 Protected wrapper
const Protected = ({ isAuth, children }) =>
  isAuth ? children : <Navigate to="/login" replace />;

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ AUTH STATE (CRITICAL FIX)
  const [isAuth, setIsAuth] = useState(
    localStorage.getItem("demo_auth") === "true"
  );

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/expenses`);
      setExpenses(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Fetch when auth becomes true
  useEffect(() => {
    if (isAuth) {
      fetchExpenses();
    }
  }, [isAuth]); // 👈 THIS IS THE KEY FIX

  return (
    <>
      <Routes>
        {/* 🔓 LOGIN */}
        <Route
          path="/login"
          element={
            isAuth ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={() => setIsAuth(true)} />
            )
          }
        />

        {/* 📊 DASHBOARD */}
        <Route
          path="/"
          element={
            <Protected isAuth={isAuth}>
              <Layout>
                <Dashboard expenses={expenses} />
              </Layout>
            </Protected>
          }
        />

        {/* 🤖 UPLOAD */}
        <Route
          path="/upload"
          element={
            <Protected isAuth={isAuth}>
              <Layout>
                <UploadReceipt onUpload={fetchExpenses} />
              </Layout>
            </Protected>
          }
        />

        {/* 📄 EXPENSE LIST */}
        <Route
          path="/expenses"
          element={
            <Protected isAuth={isAuth}>
              <Layout>
                {loading ? (
                  <div className="p-10 text-gray-400 animate-pulse">
                    Loading expenses...
                  </div>
                ) : (
                  <ExpenseList
                    expenses={expenses}
                    onDelete={fetchExpenses}
                  />
                )}
              </Layout>
            </Protected>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer />
    </>
  );
}

export default App;
