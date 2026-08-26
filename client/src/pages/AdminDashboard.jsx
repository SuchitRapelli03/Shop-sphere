import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  Legend
} from "recharts";

import api from "../services/api.js";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setError("");

      const response = await api.get("/analytics/admin");

      setData(response.data);
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

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <h2 className="text-xl font-bold">
              Failed to Load Dashboard
            </h2>

            <p className="mt-2">
              {error}
            </p>

            <button
              onClick={loadDashboard}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-lg font-semibold text-slate-700">
              Loading Admin Analytics...
            </p>
          </div>
        </div>
      </main>
    );
  }

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "";

    const parts = date.split("-");

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}/${parts[1]}`;
  };

  const chartData = (data.revenueTrend || []).map((item) => ({
    ...item,
    dateLabel: formatDate(item.date)
  }));

  const overviewStats = [
    {
      label: "Total Users",
      value: data.users,
      icon: "👥",
      bg: "bg-indigo-100"
    },
    {
      label: "Vendors",
      value: data.vendors,
      icon: "🏪",
      bg: "bg-blue-100"
    },
    {
      label: "Stores",
      value: data.stores,
      icon: "🏬",
      bg: "bg-orange-100"
    },
    {
      label: "Products",
      value: data.products,
      icon: "🛍️",
      bg: "bg-purple-100"
    }
  ];

  const orderStats = [
    {
      label: "Total Orders",
      value: data.orders,
      icon: "📦",
      bg: "bg-slate-100"
    },
    {
      label: "Pending Orders",
      value: data.pendingOrders,
      icon: "⏳",
      bg: "bg-yellow-100"
    },
    {
      label: "Completed Orders",
      value: data.completedOrders,
      icon: "✅",
      bg: "bg-green-100"
    },
    {
      label: "Cancelled Orders",
      value: data.cancelledOrders,
      icon: "❌",
      bg: "bg-red-100"
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* =========================
            HEADER
        ========================= */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="font-semibold text-indigo-600">
              ShopSphere Admin
            </p>

            <h1 className="mt-1 text-4xl font-black text-slate-900">
              Super Admin Dashboard
            </h1>

            <p className="mt-2 text-slate-600">
              Monitor and manage the entire ShopSphere marketplace.
            </p>
          </div>

          <button
            onClick={loadDashboard}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            ↻ Refresh Analytics
          </button>
        </div>


        {/* =========================
            MAIN REVENUE CARD
        ========================= */}

        <section className="mt-8">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-7 text-white shadow-lg">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-100">
                  Total Platform Revenue
                </p>

                <h2 className="mt-2 text-4xl font-black">
                  {formatCurrency(data.revenue)}
                </h2>

                <p className="mt-2 text-sm text-indigo-100">
                  Revenue from paid, non-cancelled orders
                </p>
              </div>

              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-4xl">
                ₹
              </div>

            </div>
          </div>
        </section>


        {/* =========================
            PLATFORM STATS
        ========================= */}

        <section className="mt-8">
          <h2 className="text-2xl font-black text-slate-900">
            Platform Statistics
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overviewStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} text-2xl`}
                  >
                    {stat.icon}
                  </div>

                  <p className="text-3xl font-black text-slate-900">
                    {stat.value ?? 0}
                  </p>
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>


        {/* =========================
            ORDER STATISTICS
        ========================= */}

        <section className="mt-8">
          <h2 className="text-2xl font-black text-slate-900">
            Order Statistics
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {orderStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} text-2xl`}
                  >
                    {stat.icon}
                  </div>

                  <p className="text-3xl font-black text-slate-900">
                    {stat.value ?? 0}
                  </p>
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>


        {/* =========================
            ACTIVE MARKETPLACE
        ========================= */}

        <section className="mt-8">
          <div className="grid gap-5 md:grid-cols-2">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Active Vendors
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {data.activeVendors ?? 0}
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-2xl">
                  🟢
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Vendors currently allowed to operate on ShopSphere.
              </p>
            </div>


            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Active Stores
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {data.activeStores ?? 0}
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                  🏬
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Stores currently active on the marketplace.
              </p>
            </div>

          </div>
        </section>


        {/* =========================
            REVENUE CHART
        ========================= */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900">
              Revenue Trend
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Paid revenue generated during the last 7 days.
            </p>
          </div>

          <div className="h-80 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 10
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="dateLabel"
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                No revenue data available.
              </div>
            )}
          </div>
        </section>


        {/* =========================
            ORDERS CHART
        ========================= */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900">
              Order Trend
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Orders received during the last 7 days.
            </p>
          </div>

          <div className="h-80 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 10
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="dateLabel"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="orders"
                    name="Orders"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                No order data available.
              </div>
            )}
          </div>
        </section>


        {/* =========================
            MANAGEMENT
        ========================= */}

        <section className="mt-10">

          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Management
            </h2>

            <p className="mt-1 text-slate-500">
              Manage the ShopSphere marketplace.
            </p>
          </div>


          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {/* USERS */}

            <Link
              to="/admin/users"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                👥
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Users
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                View and manage customers, vendors and admins.
              </p>

              <p className="mt-4 font-semibold text-indigo-600">
                Manage Users →
              </p>
            </Link>


            {/* VENDORS */}

            <Link
              to="/admin/vendors"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                🏪
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Vendors
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                View vendors and monitor their stores, products and orders.
              </p>

              <p className="mt-4 font-semibold text-indigo-600">
                Manage Vendors →
              </p>
            </Link>


            {/* STORES */}

            <Link
              to="/admin/stores"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                🏬
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Stores
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Monitor stores, vendors, products, orders and revenue.
              </p>

              <p className="mt-4 font-semibold text-indigo-600">
                Manage Stores →
              </p>
            </Link>


            {/* ORDERS */}

            <Link
              to="/admin/orders"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                📦
              </div>

              <h3 className="mt-4 text-xl font-bold text-slate-900">
                Orders
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                View and monitor all customer orders across ShopSphere.
              </p>

              <p className="mt-4 font-semibold text-indigo-600">
                Manage Orders →
              </p>
            </Link>

          </div>
        </section>


        {/* =========================
            PLATFORM OVERVIEW
        ========================= */}

        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Platform Overview
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Advanced analytics gives the Super Admin a complete view
                of ShopSphere performance.
              </p>
            </div>

            <div className="rounded-xl bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700">
              Super Admin Access
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}