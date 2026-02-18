import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UploadCloud,
  ReceiptText,
  Sparkles,
  LogOut,
} from "lucide-react";

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `
      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
      transition-all duration-300
      ${
        isActive
          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      }
    `
    }
  >
    <Icon size={18} />
    <span>{label}</span>
  </NavLink>
);

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Hide layout on login page
  if (location.pathname === "/login") {
    return <>{children}</>;
  }

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("demo_auth");
    navigate("/login");
  };

  return (
    <div className="w-full min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-gray-100">
      
      {/* SIDEBAR */}
      <aside className="w-64 shrink-0 backdrop-blur-xl bg-slate-950/70 border-r border-white/10 flex flex-col p-6 shadow-2xl">
        
        {/* LOGO */}
        <div className="flex items-center gap-3 text-indigo-400 font-bold text-xl mb-12">
          <div className="p-2 rounded-lg bg-indigo-500/10">
            <Sparkles />
          </div>
          <span>Expense AI</span>
        </div>

        {/* NAV */}
        <nav className="space-y-2">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/upload" icon={UploadCloud} label="Upload Receipt" />
          <NavItem to="/expenses" icon={ReceiptText} label="All Expenses" />
        </nav>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl
                     text-red-400 hover:bg-red-500/10 hover:text-red-500
                     transition"
        >
          <LogOut size={18} />
          Logout
        </button>

        {/* FOOTER */}
        <div className="pt-6 text-xs text-gray-500 text-center">
          AI-Powered Expense Tracking
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR */}
        <header className="backdrop-blur-xl bg-slate-900/60 border-b border-white/10 px-10 py-6 shadow-md">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Expense Tracker AI 🤖
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Smart receipts → instant insights
          </p>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 px-10 py-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full space-y-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
