import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../services/api.js";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "▦", to: "/admin" },
  { id: "users", label: "Users", icon: "👥", to: "/admin/users" },
  { id: "vendors", label: "Vendors", icon: "🏪", to: "/admin/vendors" },
  { id: "stores", label: "Stores", icon: "🏬", to: "/admin/stores" },
  { id: "orders", label: "Orders", icon: "📦", to: "/admin/orders" },
];

const PIE_COLORS = [
  "#0A4174",
  "#49769F",
  "#4E8EA2",
  "#6EA2B3",
  "#7BBDE8",
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentTab, setRecentTab] = useState("revenue");

  const location = useLocation();

  async function loadDashboard() {
    try {
      setError("");

      const [analyticsRes, ordersRes] = await Promise.all([
        api.get("/analytics/admin"),
        api.get("/admin/orders"),
      ]);

      setData(analyticsRes.data);
      setOrders(ordersRes.data?.orders || []);
    } catch (err) {
      console.error("ADMIN DASHBOARD ERROR:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load admin dashboard"
      );
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const liveTime = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formatDate = (date) => {
    if (!date) return "";

    const parts = date.split("-");

    if (parts.length !== 3) return date;

    return `${parts[2]}/${parts[1]}`;
  };

  const chartData = useMemo(() => {
    return (data?.revenueTrend || []).map((item) => ({
      ...item,
      dateLabel: formatDate(item.date),
    }));
  }, [data]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customerName =
        order.customerId?.name?.toLowerCase() || "";

      const customerEmail =
        order.customerId?.email?.toLowerCase() || "";

      const storeName =
        order.storeId?.name?.toLowerCase() || "";

      const orderId =
        order._id?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        orderId.includes(query) ||
        customerName.includes(query) ||
        customerEmail.includes(query) ||
        storeName.includes(query);

      const matchesStatus =
        !statusFilter ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const topVendors = useMemo(() => {
    const vendorMap = {};

    orders.forEach((order) => {
      const vendorId = order.vendorId?._id;
      const vendorName = order.vendorId?.name;

      if (!vendorId || !vendorName) return;

      if (!vendorMap[vendorId]) {
        vendorMap[vendorId] = {
          id: vendorId,
          name: vendorName,
          count: 0,
          revenue: 0,
        };
      }

      vendorMap[vendorId].count += 1;

      if (
        order.paymentStatus === "PAID" &&
        order.status !== "CANCELLED"
      ) {
        vendorMap[vendorId].revenue += Number(
          order.total || 0
        );
      }
    });

    return Object.values(vendorMap)
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }

        return b.revenue - a.revenue;
      })
      .slice(0, 5);
  }, [orders]);

  const orderStatusData = useMemo(() => {
    const statusMap = {
      PLACED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    orders.forEach((order) => {
      if (
        Object.prototype.hasOwnProperty.call(
          statusMap,
          order.status
        )
      ) {
        statusMap[order.status] += 1;
      }
    });

    return [
      {
        name: "Placed",
        value: statusMap.PLACED,
      },
      {
        name: "Processing",
        value: statusMap.PROCESSING,
      },
      {
        name: "Shipped",
        value: statusMap.SHIPPED,
      },
      {
        name: "Delivered",
        value: statusMap.DELIVERED,
      },
      {
        name: "Cancelled",
        value: statusMap.CANCELLED,
      },
    ].filter((item) => item.value > 0);
  }, [orders]);

  const dashboardStats = data
    ? [
        {
          label: "Total Users",
          value: data.users ?? 0,
          icon: "👥",
          color: "text-[#0A4174]",
          bg: "bg-[#7BBDE8]/25",
        },
        {
          label: "Vendors",
          value: data.vendors ?? 0,
          icon: "🏪",
          color: "text-[#0A4174]",
          bg: "bg-[#49769F]/15",
        },
        {
          label: "Stores",
          value: data.stores ?? 0,
          icon: "🏬",
          color: "text-[#4E8EA2]",
          bg: "bg-[#6EA2B3]/20",
        },
        {
          label: "Products",
          value: data.products ?? 0,
          icon: "🛍️",
          color: "text-[#49769F]",
          bg: "bg-[#7BBDE8]/25",
        },
        {
          label: "Orders",
          value: data.orders ?? 0,
          icon: "📦",
          color: "text-[#0A4174]",
          bg: "bg-[#49769F]/15",
        },
        {
          label: "Pending",
          value: data.pendingOrders ?? 0,
          icon: "◷",
          color: "text-[#4E8EA2]",
          bg: "bg-[#6EA2B3]/20",
        },
        {
          label: "Active Vendors",
          value: data.activeVendors ?? 0,
          icon: "✦",
          color: "text-[#4E8EA2]",
          bg: "bg-[#6EA2B3]/20",
        },
        {
          label: "Active Stores",
          value: data.activeStores ?? 0,
          icon: "●",
          color: "text-[#4E8EA2]",
          bg: "bg-[#6EA2B3]/20",
        },
      ]
    : [];

  const getOrderStatusStyle = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-[#6EA2B3]/20 text-[#0A4174]";

      case "CANCELLED":
        return "bg-rose-100 text-rose-600";

      case "SHIPPED":
        return "bg-[#7BBDE8]/25 text-[#0A4174]";

      case "PROCESSING":
        return "bg-[#49769F]/15 text-[#0A4174]";

      default:
        return "bg-[#6EA2B3]/20 text-[#4E8EA2]";
    }
  };

  return (
    <div className="flex min-h-screen bg-[#eef4f8] font-sans text-slate-700">

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`sticky top-0 z-30 flex h-screen shrink-0 flex-col overflow-hidden border-r border-white/60 bg-[#e6ebf5] shadow-[8px_0_30px_rgba(73,118,159,0.20)] transition-[width] duration-500 ease-in-out ${
          sidebarOpen ? "w-[220px]" : "w-0"
        }`}
      >
        {/* BRAND */}

        <div className="flex h-[72px] shrink-0 items-center gap-3 border-b border-white/70 px-5">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#001D39] to-[#0A4174] font-black text-white shadow-lg">
            S
          </div>

          <div className="whitespace-nowrap">
            <p className="text-sm font-black tracking-wide text-[#001D39]">
              ShopSphere
            </p>

            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#4E8EA2]">
              Control Center
            </p>
          </div>

        </div>

        {/* PLATFORM LABEL */}

        <div className="px-5 pt-6">
          <p className="whitespace-nowrap text-[9px] font-black uppercase tracking-[0.22em] text-[#49769F]">
            Platform
          </p>
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-4">

          {navItems.map((item) => {

            const isActive =
              location.pathname === item.to;

            return (
              <Link
                key={item.id}
                to={item.to}
                className={`group relative flex w-full items-center gap-3 overflow-hidden whitespace-nowrap rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-white/90 text-[#0A4174] shadow-[6px_6px_12px_rgba(73,118,159,0.20),-6px_-6px_12px_rgba(255,255,255,0.9)]"
                    : "text-slate-500 hover:bg-white/50 hover:text-[#001D39]"
                }`}
              >

                {isActive && (
                  <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#0A4174]" />
                )}

                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base transition ${
                    isActive
                      ? "bg-[#7BBDE8]/25 text-[#0A4174]"
                      : "bg-white/70 text-[#49769F]"
                  }`}
                >
                  {item.icon}
                </span>

                {item.label}

              </Link>
            );
          })}

        </nav>

        {/* PLATFORM STATUS */}

        <div className="mx-3 mb-4 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[6px_6px_12px_rgba(73,118,159,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)]">

          <div className="flex items-center gap-2">

            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4E8EA2] opacity-40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#4E8EA2]" />
            </span>

            <p className="text-xs font-bold text-[#001D39]">
              Platform Online
            </p>

          </div>

          <p className="mt-2 text-[10px] leading-relaxed text-[#49769F]">
            All ShopSphere services are operating normally.
          </p>

        </div>

        {/* ADMIN PROFILE */}

        <div className="border-t border-white/60 p-3">

          <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-sm">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#001D39] to-[#4E8EA2] text-xs font-black text-white">
              A
            </div>

            <div className="min-w-0 whitespace-nowrap">

              <p className="truncate text-xs font-bold text-[#001D39]">
                Super Admin
              </p>

              <p className="mt-0.5 truncate text-[10px] text-[#49769F]">
                Full Platform Access
              </p>

            </div>

          </div>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="min-w-0 flex-1">

        {/* TOPBAR */}

        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-white/60 bg-[#eef4f8]/90 px-4 backdrop-blur-xl sm:px-5 lg:px-7">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                setSidebarOpen((prev) => !prev)
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-lg text-[#0A4174] shadow-[4px_4px_10px_rgba(73,118,159,0.20),-4px_-4px_10px_rgba(255,255,255,0.9)] transition hover:bg-white hover:text-[#001D39]"
            >
              {sidebarOpen ? "←" : "→"}
            </button>

            <div>

              <h1 className="text-base font-black tracking-tight text-[#001D39] sm:text-lg">
                Admin Dashboard
              </h1>

              <p className="hidden text-[11px] text-[#49769F] sm:block">
                ShopSphere platform intelligence
              </p>

            </div>

          </div>

          <div className="flex items-center gap-3">

            {/* SEARCH */}

            <div className="hidden items-center rounded-2xl bg-white/80 px-3 py-2.5 shadow-[4px_4px_10px_rgba(73,118,159,0.15),-4px_-4px_10px_rgba(255,255,255,0.9)] md:flex lg:w-72">

              <span className="mr-2 text-xs text-[#49769F]">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search orders, customers..."
                className="w-full bg-transparent text-xs text-[#001D39] outline-none placeholder:text-[#6EA2B3]"
              />

            </div>

            {/* NOTIFICATION */}

            <button
              type="button"
              className="relative hidden h-10 w-10 items-center justify-center rounded-2xl bg-white/80 text-slate-500 shadow-[4px_4px_10px_rgba(73,118,159,0.15),-4px_-4px_10px_rgba(255,255,255,0.9)] transition hover:text-[#0A4174] sm:flex"
            >
              🔔

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#4E8EA2]" />

            </button>

            {/* REFRESH */}

            <button
              type="button"
              onClick={loadDashboard}
              className="flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2.5 text-xs font-bold text-slate-500 shadow-[4px_4px_10px_rgba(73,118,159,0.15),-4px_-4px_10px_rgba(255,255,255,0.9)] transition hover:bg-white hover:text-[#0A4174]"
            >

              <span className="text-base">
                ↻
              </span>

              <span className="hidden sm:inline">
                Refresh
              </span>

            </button>

            {/* ADMIN AVATAR */}

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#001D39] to-[#4E8EA2] text-xs font-black text-white shadow-lg">
              A
            </div>

          </div>

        </header>

        {/* ================= CONTENT ================= */}

        <div className="p-4 sm:p-5 lg:p-7">

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50/80 p-5 shadow-sm">

              <p className="font-bold text-rose-600">
                Failed to load dashboard
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {error}
              </p>

              <button
                type="button"
                onClick={loadDashboard}
                className="mt-4 rounded-2xl bg-[#0A4174] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#001D39]"
              >
                Try Again
              </button>

            </div>
          )}

          {/* LOADING */}

          {!data && !error && (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm font-semibold text-[#49769F]">
                Loading platform intelligence...
              </p>
            </div>
          )}

          {data && (
            <>

              {/* ================= HEADER ================= */}

              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4E8EA2]">
                    Overview & Assets
                  </p>

                  <h1 className="mt-1 text-2xl font-black text-[#001D39] md:text-3xl">
                    ShopSphere Control Center
                  </h1>

                </div>

                <div className="flex items-center gap-3">

                  <span className="inline-flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-xs font-bold text-slate-600 shadow-[4px_4px_10px_rgba(73,118,159,0.20),-4px_-4px_10px_rgba(255,255,255,0.9)]">

                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#4E8EA2]" />

                    Live • {liveTime}

                  </span>

                </div>

              </div>

              {/* ================= DUAL PANEL ================= */}

              <div className="mb-8 grid gap-6 lg:grid-cols-2">

                {/* LEFT PANEL */}

                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-[#e6ebf5] p-6 shadow-[14px_14px_28px_rgba(73,118,159,0.25),-14px_-14px_28px_rgba(255,255,255,0.95)]">

                  <div className="flex items-center justify-between px-2 pb-4">

                    <span className="text-xs font-black tracking-wide text-[#49769F]">
                      ☁ Platform Assets
                    </span>

                    <div className="flex items-center gap-2">

                      <span className="h-2 w-2 rounded-full bg-[#6EA2B3]" />

                      <span className="text-xs font-bold text-[#49769F]">
                        ≡
                      </span>

                    </div>

                  </div>

                  {/* DARK HEADER */}

                  <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#001D39] to-[#0A4174] p-5 text-white shadow-2xl">

                    <div className="relative z-10">

                      <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-md">

                        <span className="text-[11px] font-medium text-[#7BBDE8]">
                          Search...
                        </span>

                        <span className="text-xs text-[#6EA2B3]">
                          🔍
                        </span>

                      </div>

                      <div className="mt-5 flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4E8EA2]/30 text-lg">
                          📑
                        </div>

                        <div>

                          <h3 className="text-base font-extrabold text-white">
                            ShopSphere
                          </h3>

                          <p className="text-[10px] text-[#7BBDE8]">
                            {data.orders ?? 0} orders •{" "}
                            {data.products ?? 0} products
                          </p>

                        </div>

                      </div>

                      <div className="mt-5">

                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#001D39]">

                          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#4E8EA2] to-[#7BBDE8]" />

                        </div>

                        <p className="mt-1.5 text-right text-[9px] font-bold text-[#6EA2B3]">
                          {formatCurrency(data.revenue)} total revenue
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* METRICS */}

                  <div className="mt-6 grid grid-cols-3 gap-3">

                    {dashboardStats
                      .slice(0, 6)
                      .map((stat, i) => (

                        <div
                          key={i}
                          className="flex flex-col items-center justify-center rounded-2xl bg-[#e6ebf5] p-3 shadow-[6px_6px_12px_rgba(73,118,159,0.25),-6px_-6px_12px_rgba(255,255,255,0.9)] transition hover:-translate-y-0.5"
                        >

                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} text-base`}
                          >
                            {stat.icon}
                          </div>

                          <span className="mt-2 text-xs font-bold text-[#001D39]">
                            {stat.value}
                          </span>

                          <span className="text-[9px] font-semibold text-[#49769F]">
                            {stat.label}
                          </span>

                        </div>

                      ))}

                  </div>

                </div>

                {/* RIGHT PANEL */}

                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-gradient-to-b from-[#e6ebf5] via-[#e6ebf5] to-[#001D39] p-6 shadow-[14px_14px_28px_rgba(73,118,159,0.25),-14px_-14px_28px_rgba(255,255,255,0.95)]">

                  <div className="flex items-center justify-between px-2 pb-3">

                    <span className="text-xs font-black tracking-wide text-[#49769F]">
                      🕒 Recents
                    </span>

                    <span className="text-xs font-bold text-[#49769F]">
                      :::
                    </span>

                  </div>

                  <div className="grid grid-cols-3 gap-3 pb-6">

                    {[
                      {
                        title: "Users",
                        sub: data?.users ?? 0,
                        icon: "👥",
                        color: "bg-[#7BBDE8]/25",
                      },
                      {
                        title: "Vendors",
                        sub: data?.vendors ?? 0,
                        icon: "🏪",
                        color: "bg-[#49769F]/15",
                      },
                      {
                        title: "Stores",
                        sub: data?.stores ?? 0,
                        icon: "🏬",
                        color: "bg-[#6EA2B3]/20",
                      },
                      {
                        title: "Orders",
                        sub: data?.orders ?? 0,
                        icon: "📦",
                        color: "bg-[#7BBDE8]/25",
                      },
                      {
                        title: "Pending",
                        sub: data?.pendingOrders ?? 0,
                        icon: "◷",
                        color: "bg-[#6EA2B3]/20",
                      },
                      {
                        title: "Active",
                        sub: data?.activeVendors ?? 0,
                        icon: "✦",
                        color: "bg-[#4E8EA2]/20",
                      },
                    ].map((item, i) => (

                      <div
                        key={i}
                        className="flex flex-col items-center justify-center rounded-2xl bg-[#e6ebf5] p-3 shadow-[6px_6px_12px_rgba(73,118,159,0.25),-6px_-6px_12px_rgba(255,255,255,0.9)]"
                      >

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color} text-base`}
                        >
                          {item.icon}
                        </div>

                        <span className="mt-2 text-xs font-bold text-[#001D39]">
                          {item.sub}
                        </span>

                        <span className="text-[9px] font-semibold text-[#49769F]">
                          {item.title}
                        </span>

                      </div>

                    ))}

                  </div>

                  {/* LIVE PANEL */}

                  <div className="mt-2 rounded-2xl bg-[#001D39] p-4 text-white shadow-inner">

                    <div className="flex items-center gap-2">

                      <span className="rounded-lg bg-[#0A4174] px-2.5 py-1 text-[10px] font-black text-white">
                        Live
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setRecentTab("revenue")
                        }
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                          recentTab === "revenue"
                            ? "bg-white/15 text-white"
                            : "text-[#49769F] hover:text-[#7BBDE8]"
                        }`}
                      >
                        Revenue
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setRecentTab("orders")
                        }
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                          recentTab === "orders"
                            ? "bg-white/15 text-white"
                            : "text-[#49769F] hover:text-[#7BBDE8]"
                        }`}
                      >
                        Orders
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setRecentTab("vendors")
                        }
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                          recentTab === "vendors"
                            ? "bg-white/15 text-white"
                            : "text-[#49769F] hover:text-[#7BBDE8]"
                        }`}
                      >
                        Vendors
                      </button>

                    </div>

                    <div className="mt-4">

                      {recentTab === "revenue" && (
                        <div>

                          <p className="text-[10px] uppercase tracking-widest text-[#49769F]">
                            Total Revenue
                          </p>

                          <p className="mt-1 text-xl font-black">
                            {formatCurrency(data.revenue)}
                          </p>

                          <p className="mt-1 text-[10px] text-[#49769F]">
                            Paid marketplace revenue
                          </p>

                        </div>
                      )}

                      {recentTab === "orders" && (
                        <div>

                          <p className="text-[10px] uppercase tracking-widest text-[#49769F]">
                            Total Orders
                          </p>

                          <p className="mt-1 text-xl font-black">
                            {data.orders ?? orders.length}
                          </p>

                          <p className="mt-1 text-[10px] text-[#49769F]">
                            {data.pendingOrders ?? 0} currently pending
                          </p>

                        </div>
                      )}

                      {recentTab === "vendors" && (
                        <div>

                          <p className="text-[10px] uppercase tracking-widest text-[#49769F]">
                            Active Vendors
                          </p>

                          <p className="mt-1 text-xl font-black">
                            {data.activeVendors ?? 0}
                          </p>

                          <p className="mt-1 text-[10px] text-[#49769F]">
                            {data.vendors ?? 0} total vendors
                          </p>

                        </div>
                      )}

                    </div>

                  </div>

                </div>

              </div>

              {/* ================= REVENUE + STATUS ================= */}

              <div className="mb-6 grid gap-5 xl:grid-cols-3">

                {/* REVENUE */}

                <div className="rounded-[2rem] border border-white/60 bg-[#e6ebf5] p-5 shadow-[10px_10px_20px_rgba(73,118,159,0.25),-10px_-10px_20px_rgba(255,255,255,0.9)] xl:col-span-2">

                  <div className="mb-6 flex items-start justify-between">

                    <div>

                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A4174]">
                        Analytics
                      </p>

                      <h2 className="mt-1 text-base font-black text-[#001D39]">
                        Revenue Overview
                      </h2>

                      <p className="mt-1 text-xs text-[#49769F]">
                        Paid revenue across the last 7 days
                      </p>

                    </div>

                    <div className="rounded-2xl bg-[#7BBDE8]/25 px-3 py-2 text-[10px] font-bold text-[#0A4174]">
                      {formatCurrency(data.revenue)}
                    </div>

                  </div>

                  <div className="h-72">

                    {chartData.length > 0 ? (
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <LineChart
                          data={chartData}
                          margin={{
                            top: 10,
                            right: 10,
                            left: -15,
                            bottom: 0,
                          }}
                        >

                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#cbdce6"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="dateLabel"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#49769F",
                              fontSize: 10,
                            }}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#49769F",
                              fontSize: 10,
                            }}
                          />

                          <Tooltip
                            formatter={(value) =>
                              formatCurrency(value)
                            }
                            contentStyle={{
                              backgroundColor:
                                "rgba(255,255,255,0.95)",
                              border:
                                "1px solid #d5e3eb",
                              borderRadius: "16px",
                              fontSize: "12px",
                              boxShadow:
                                "0 15px 40px rgba(10,65,116,0.10)",
                            }}
                          />

                          <Line
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="#0A4174"
                            strokeWidth={3}
                            dot={{
                              r: 4,
                              fill: "#4E8EA2",
                              stroke: "#fff",
                              strokeWidth: 2,
                            }}
                            activeDot={{
                              r: 7,
                              fill: "#001D39",
                              stroke: "#fff",
                              strokeWidth: 2,
                            }}
                          />

                        </LineChart>

                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[#6EA2B3]/40 text-xs text-[#49769F]">
                        No revenue data available
                      </div>
                    )}

                  </div>

                </div>

                {/* ORDER STATUS */}

                <div className="rounded-[2rem] border border-white/60 bg-[#e6ebf5] p-5 shadow-[10px_10px_20px_rgba(73,118,159,0.25),-10px_-10px_20px_rgba(255,255,255,0.9)]">

                  <div className="mb-4">

                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4E8EA2]">
                      Distribution
                    </p>

                    <h2 className="mt-1 text-base font-black text-[#001D39]">
                      Order Status
                    </h2>

                  </div>

                  <div className="h-72">

                    {orderStatusData.length > 0 ? (
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <PieChart>

                          <Pie
                            data={orderStatusData}
                            cx="50%"
                            cy="42%"
                            innerRadius={55}
                            outerRadius={88}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >

                            {orderStatusData.map(
                              (entry, index) => (
                                <Cell
                                  key={entry.name}
                                  fill={
                                    PIE_COLORS[
                                      index %
                                        PIE_COLORS.length
                                    ]
                                  }
                                />
                              )
                            )}

                          </Pie>

                          <Tooltip
                            contentStyle={{
                              backgroundColor:
                                "rgba(255,255,255,0.95)",
                              border:
                                "1px solid #d5e3eb",
                              borderRadius: "16px",
                              fontSize: "12px",
                            }}
                          />

                          <Legend
                            iconType="circle"
                            iconSize={7}
                            wrapperStyle={{
                              fontSize: "10px",
                              color: "#49769F",
                            }}
                          />

                        </PieChart>

                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[#6EA2B3]/40 text-xs text-[#49769F]">
                        No order data available
                      </div>
                    )}

                  </div>

                </div>

              </div>

              {/* ================= ORDER TREND ================= */}

              <div className="mb-6 rounded-[2rem] border border-white/60 bg-[#e6ebf5] p-5 shadow-[10px_10px_20px_rgba(73,118,159,0.25),-10px_-10px_20px_rgba(255,255,255,0.9)]">

                <div className="mb-6 flex items-start justify-between">

                  <div>

                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4E8EA2]">
                      Activity
                    </p>

                    <h2 className="mt-1 text-base font-black text-[#001D39]">
                      Order Trend
                    </h2>

                  </div>

                </div>

                <div className="h-64">

                  {chartData.length > 0 ? (
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <BarChart
                        data={chartData}
                        barCategoryGap="35%"
                        margin={{
                          top: 10,
                          right: 10,
                          left: -15,
                          bottom: 0,
                        }}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#cbdce6"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="dateLabel"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#49769F",
                            fontSize: 10,
                          }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                          tick={{
                            fill: "#49769F",
                            fontSize: 10,
                          }}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor:
                              "rgba(255,255,255,0.95)",
                            border:
                              "1px solid #d5e3eb",
                            borderRadius: "16px",
                            fontSize: "12px",
                          }}
                        />

                        <Bar
                          dataKey="orders"
                          name="Orders"
                          fill="#4E8EA2"
                          radius={[10, 10, 0, 0]}
                        />

                      </BarChart>

                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[#6EA2B3]/40 text-xs text-[#49769F]">
                      No order trend data available
                    </div>
                  )}

                </div>

              </div>

              {/* ================= RECENT ORDERS + TOP VENDORS ================= */}

              <div className="grid gap-6 lg:grid-cols-2">

                {/* RECENT ORDERS */}

                <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-[#e6ebf5] shadow-[10px_10px_20px_rgba(73,118,159,0.25),-10px_-10px_20px_rgba(255,255,255,0.9)]">

                  <div className="flex flex-col gap-4 border-b border-slate-200/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A4174]">
                        Operations
                      </p>

                      <h2 className="mt-1 text-base font-black text-[#001D39]">
                        Recent Orders
                      </h2>

                      <p className="mt-1 text-xs text-[#49769F]">
                        {filteredOrders.length} orders found
                      </p>

                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(e.target.value)
                      }
                      className="rounded-2xl border border-white/60 bg-white/80 px-3 py-2.5 text-xs font-bold text-slate-500 outline-none shadow-sm"
                    >

                      <option value="">
                        All Statuses
                      </option>

                      <option value="PLACED">
                        Placed
                      </option>

                      <option value="PROCESSING">
                        Processing
                      </option>

                      <option value="SHIPPED">
                        Shipped
                      </option>

                      <option value="DELIVERED">
                        Delivered
                      </option>

                      <option value="CANCELLED">
                        Cancelled
                      </option>

                    </select>

                  </div>

                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[600px] text-left text-xs">

                      <thead className="border-b border-slate-200/60 bg-white/40">

                        <tr>

                          <th className="px-5 py-4 font-bold uppercase tracking-wide text-[#49769F]">
                            Customer
                          </th>

                          <th className="px-5 py-4 font-bold uppercase tracking-wide text-[#49769F]">
                            Store
                          </th>

                          <th className="px-5 py-4 font-bold uppercase tracking-wide text-[#49769F]">
                            Amount
                          </th>

                          <th className="px-5 py-4 font-bold uppercase tracking-wide text-[#49769F]">
                            Status
                          </th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-slate-200/40">

                        {filteredOrders
                          .slice(0, 6)
                          .map((order) => (

                            <tr
                              key={order._id}
                              className="transition hover:bg-white/40"
                            >

                              <td className="px-5 py-4">

                                <p className="font-bold text-[#001D39]">
                                  {order.customerId?.name ||
                                    "—"}
                                </p>

                                <p className="mt-1 text-[10px] text-[#49769F]">
                                  {order.customerId?.email ||
                                    ""}
                                </p>

                              </td>

                              <td className="px-5 py-4 font-semibold text-slate-500">
                                {order.storeId?.name || "—"}
                              </td>

                              <td className="px-5 py-4 font-bold text-[#001D39]">
                                {formatCurrency(
                                  order.total
                                )}
                              </td>

                              <td className="px-5 py-4">

                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black tracking-wide ${getOrderStatusStyle(
                                    order.status
                                  )}`}
                                >
                                  {order.status ||
                                    "UNKNOWN"}
                                </span>

                              </td>

                            </tr>

                          ))}

                        {filteredOrders.length === 0 && (
                          <tr>

                            <td
                              colSpan={4}
                              className="px-5 py-14 text-center"
                            >

                              <p className="font-bold text-slate-500">
                                No orders found
                              </p>

                            </td>

                          </tr>
                        )}

                      </tbody>

                    </table>

                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/60 px-5 py-4">

                    <p className="text-[10px] text-[#49769F]">
                      Showing up to 6 recent orders
                    </p>

                    <Link
                      to="/admin/orders"
                      className="text-xs font-bold text-[#0A4174] transition hover:text-[#001D39]"
                    >
                      View all orders →
                    </Link>

                  </div>

                </div>

                {/* TOP VENDORS */}

                <div className="overflow-hidden rounded-[2rem] border border-white/60 bg-[#e6ebf5] shadow-[10px_10px_20px_rgba(73,118,159,0.25),-10px_-10px_20px_rgba(255,255,255,0.9)]">

                  <div className="border-b border-slate-200/60 px-5 py-5">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0A4174]">
                          Rankings
                        </p>

                        <h2 className="mt-1 text-base font-black text-[#001D39]">
                          Top Vendors
                        </h2>

                      </div>

                      <span className="rounded-xl bg-[#7BBDE8]/25 px-2.5 py-1 text-[9px] font-bold text-[#0A4174]">
                        TOP 5
                      </span>

                    </div>

                    <p className="mt-2 text-xs text-[#49769F]">
                      Based on platform order activity
                    </p>

                  </div>

                  <div className="divide-y divide-slate-200/40">

                    {topVendors.length > 0 ? (
                      topVendors.map(
                        (vendor, index) => (

                          <div
                            key={vendor.id}
                            className="group flex items-center justify-between px-5 py-4 transition hover:bg-white/40"
                          >

                            <div className="flex min-w-0 items-center gap-3">

                              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7BBDE8]/25 text-xs font-black text-[#0A4174] shadow-sm">

                                {vendor.name
                                  .charAt(0)
                                  .toUpperCase()}

                                {index === 0 && (
                                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#4E8EA2] text-[8px] text-white">
                                    ★
                                  </span>
                                )}

                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-xs font-bold text-[#001D39]">
                                  {vendor.name}
                                </p>

                                <p className="mt-1 text-[10px] text-[#49769F]">
                                  {formatCurrency(
                                    vendor.revenue
                                  )}{" "}
                                  revenue
                                </p>

                              </div>

                            </div>

                            <div className="ml-3 flex flex-col items-end gap-1">

                              <span className="flex min-w-8 items-center justify-center rounded-xl bg-[#7BBDE8]/25 px-2 py-1 text-[10px] font-black text-[#0A4174]">
                                {vendor.count}
                              </span>

                              <span className="text-[8px] font-bold uppercase tracking-wide text-[#49769F]">
                                orders
                              </span>

                            </div>

                          </div>

                        )
                      )
                    ) : (
                      <div className="px-5 py-16 text-center">

                        <div className="text-3xl text-[#6EA2B3]">
                          ◇
                        </div>

                        <p className="mt-3 text-xs font-semibold text-slate-500">
                          No vendor data yet
                        </p>

                      </div>
                    )}

                  </div>

                  <div className="border-t border-slate-200/60 px-5 py-4">

                    <Link
                      to="/admin/vendors"
                      className="text-xs font-bold text-[#0A4174] transition hover:text-[#001D39]"
                    >
                      View all vendors →
                    </Link>

                  </div>

                </div>

              </div>

              {/* ================= PLATFORM MANAGEMENT ================= */}

              <div className="mt-8">

                <div className="mb-4">

                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4E8EA2]">
                    Administration
                  </p>

                  <h2 className="mt-1 text-lg font-black text-[#001D39]">
                    Platform Management
                  </h2>

                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  {[
                    {
                      to: "/admin/users",
                      icon: "👥",
                      label: "Users",
                      desc: "Manage customers and administrators",
                    },
                    {
                      to: "/admin/vendors",
                      icon: "🏪",
                      label: "Vendors",
                      desc: "Manage marketplace vendor accounts",
                    },
                    {
                      to: "/admin/stores",
                      icon: "🏬",
                      label: "Stores",
                      desc: "Monitor and control store activity",
                    },
                    {
                      to: "/admin/orders",
                      icon: "📦",
                      label: "Orders",
                      desc: "Monitor all marketplace orders",
                    },
                  ].map((item) => (

                    <Link
                      key={item.label}
                      to={item.to}
                      className="group flex items-center gap-3 rounded-2xl bg-[#e6ebf5] p-4 shadow-[6px_6px_12px_rgba(73,118,159,0.25),-6px_-6px_12px_rgba(255,255,255,0.9)] transition hover:-translate-y-0.5"
                    >

                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                        {item.icon}
                      </span>

                      <div>

                        <p className="text-xs font-bold text-[#001D39]">
                          {item.label}
                        </p>

                        <p className="text-[9px] text-[#49769F]">
                          {item.desc}
                        </p>

                      </div>

                    </Link>

                  ))}

                </div>

              </div>

              {/* FOOTER */}

              <div className="mt-8 border-t border-slate-200/60 pt-5 text-center">

                <p className="text-[10px] font-semibold tracking-wide text-[#49769F]">
                  SHOPSPHERE CONTROL CENTER • PLATFORM ADMINISTRATION
                </p>

              </div>

            </>

          )}

        </div>

      </main>

    </div>
  );
}