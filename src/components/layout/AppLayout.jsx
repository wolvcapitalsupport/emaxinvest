import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, TrendingUp, ArrowDownCircle, History,
  LogOut, Menu, X, Shield, Users, ChevronRight
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Invest", icon: TrendingUp, path: "/invest" },
  { label: "Withdraw", icon: ArrowDownCircle, path: "/withdraw" },
  { label: "History", icon: History, path: "/history" },
];

const adminItems = [
  { label: "Admin Panel", icon: Shield, path: "/admin" },
  { label: "User Management", icon: Users, path: "/admin/users" },
];

export default function AppLayout({ children, user, userProfile }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    await base44.auth.logout("/");
  };

  const NavLink = ({ item }) => {
    const active = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          active
            ? "bg-primary/15 text-primary border border-primary/30"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`}
      >
        <item.icon size={18} className={active ? "text-primary" : "group-hover:text-primary transition-colors"} />
        <span className="font-medium text-sm">{item.label}</span>
        {active && <ChevronRight size={14} className="ml-auto text-primary" />}
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(147, 197, 253, 0.15)", border: "1px solid rgba(147, 197, 253, 0.3)" }}>
            <span className="text-xs font-bold text-blue-200">E</span>
          </div>
          <span className="text-xl font-bold text-white font-body">EMAX</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className="bg-secondary rounded-xl p-3">
          <p className="text-xs text-muted-foreground">Logged in as</p>
          <p className="font-semibold text-sm truncate">{user?.full_name || user?.email}</p>
          {userProfile?.wallet_balance !== undefined && (
            <p className="text-xs text-primary mt-1">
              Balance: ${(userProfile.wallet_balance || 0).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 px-1">Main Menu</p>
        {navItems.map(item => <NavLink key={item.path} item={item} />)}

        {isAdmin && (
          <>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mt-6 mb-3 px-1">Administration</p>
            {adminItems.map(item => <NavLink key={item.path} item={item} />)}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-300 lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-border flex items-center px-4 lg:px-6 gap-4 bg-card flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(147, 197, 253, 0.15)", border: "1px solid rgba(147, 197, 253, 0.3)" }}>
              <span className="text-xs font-bold text-blue-200">E</span>
            </div>
            <span className="font-bold text-white font-body">EMAX</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {isAdmin && (
              <span className="hidden sm:flex items-center gap-1 text-xs bg-primary/15 text-primary border border-primary/30 px-3 py-1 rounded-full">
                <Shield size={10} />
                Admin
              </span>
            )}
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(147, 197, 253, 0.2)", border: "1px solid rgba(147, 197, 253, 0.3)" }}>
              <span className="text-xs font-bold text-blue-200">
                {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}