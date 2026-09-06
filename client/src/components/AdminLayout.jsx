import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "▦", to: "/admin" },
  { id: "users", label: "Users", icon: "👥", to: "/admin/users" },
  { id: "vendors", label: "Vendors", icon: "🏪", to: "/admin/vendors" },
  { id: "stores", label: "Stores", icon: "🏬", to: "/admin/stores" },
  { id: "orders", label: "Orders", icon: "📦", to: "/admin/orders" },
];

export default function AdminLayout({
  children,
  title,
  subtitle,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  actions,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const location = useLocation();

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const liveTime = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex min-h-screen bg-[#eaf0f6] font-sans text-slate-700">

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`sticky top-0 z-30 flex h-screen shrink-0 flex-col overflow-hidden border-r border-white/60 bg-[#e6ebf5] shadow-[8px_0_30px_rgba(163,177,198,0.25)] transition-[width] duration-500 ease-in-out ${
          sidebarOpen ? "w-[220px]" : "w-0"
        }`}
      >
        {/* BRAND */}
        <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-white/70 px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-sky-400 font-black text-white shadow-lg">
            S
          </div>

          <div className="whitespace-nowrap">
            <p className="text-sm font-black tracking-wide text-slate-800">
              ShopSphere
            </p>

            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-violet-400">
              Control Center
            </p>
          </div>
        </div>

        {/* PLATFORM LABEL */}
        <div className="px-5 pt-6">
          <p className="whitespace-nowrap text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
            Platform
          </p>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              item.to === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.id}
                to={item.to}
                className={`group relative flex w-full items-center gap-3 overflow-hidden whitespace-nowrap rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-white/90 text-violet-600 shadow-[6px_6px_12px_rgba(163,177,198,0.25),-6px_-6px_12px_rgba(255,255,255,0.9)]"
                    : "text-slate-500 hover:bg-white/50 hover:text-slate-800"
                }`}
              >
                {isActive && (
                  <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-violet-400" />
                )}

                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base transition ${
                    isActive
                      ? "bg-violet-100 text-violet-600"
                      : "bg-white/70 text-slate-400"
                  }`}
                >
                  {item.icon}
                </span>

                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ONLINE STATUS */}
        <div className="mx-3 mb-4 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[6px_6px_12px_rgba(163,177,198,0.2),-6px_-6px_12px_rgba(255,255,255,0.9)]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>

            <p className="text-xs font-bold text-slate-700">
              Platform Online
            </p>
          </div>

          <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
            All ShopSphere services are operating normally.
          </p>
        </div>

        {/* ADMIN */}
        <div className="border-t border-white/60 p-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-sky-400 text-xs font-black text-white">
              A
            </div>

            <div className="min-w-0 whitespace-nowrap">
              <p className="truncate text-xs font-bold text-slate-800">
                Super Admin
              </p>

              <p className="mt-0.5 truncate text-[10px] text-slate-400">
                Full Platform Access
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="min-w-0 flex-1">

        {/* TOPBAR */}
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-white/60 bg-[#eaf0f6]/90 px-4 backdrop-blur-xl sm:px-5 lg:px-7">

          <div className="flex min-w-0 items-center gap-3">

            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-lg text-violet-500 shadow-[4px_4px_10px_rgba(163,177,198,0.25),-4px_-4px_10px_rgba(255,255,255,0.9)] transition hover:bg-white"
            >
              {sidebarOpen ? "←" : "→"}
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-base font-black tracking-tight text-slate-800 sm:text-lg">
                {title}
              </h1>

              {subtitle && (
                <p className="hidden truncate text-[11px] text-slate-400 sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">

            {/* SEARCH */}
            {search !== undefined && (
              <div className="hidden items-center rounded-2xl bg-white/80 px-3 py-2.5 shadow-[4px_4px_10px_rgba(163,177,198,0.2),-4px_-4px_10px_rgba(255,255,255,0.9)] md:flex lg:w-72">
                <span className="mr-2 text-xs text-slate-400">
                  🔎
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
            )}

            {/* LIVE TIME */}
            <div className="hidden items-center gap-2 rounded-2xl bg-white/80 px-3 py-2.5 text-[10px] font-bold text-slate-500 shadow-[4px_4px_10px_rgba(163,177,198,0.2),-4px_-4px_10px_rgba(255,255,255,0.9)] lg:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Live • {liveTime}
            </div>

            {/* NOTIFICATION */}
            <button
              type="button"
              className="relative hidden h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-slate-500 shadow-[4px_4px_10px_rgba(163,177,198,0.2),-4px_-4px_10px_rgba(255,255,255,0.9)] transition hover:text-violet-500 sm:flex"
            >
              🔔

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </button>

            {/* PAGE ACTIONS */}
            {actions}

            {/* ADMIN AVATAR */}
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-sky-400 text-xs font-black text-white shadow-lg">
              A
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-4 sm:p-5 lg:p-7">
          {children}
        </div>
      </main>
    </div>
  );
}