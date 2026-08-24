import React, {
  useEffect,
  useState
} from "react";

import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get(
          "/analytics/admin"
        );

        setData(response.data);
      } catch (err) {
        console.error(
          "ADMIN DASHBOARD ERROR:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Failed to load admin dashboard"
        );
      }
    }

    loadDashboard();
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-700">
            <h2 className="text-xl font-bold">
              Error
            </h2>

            <p className="mt-2">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="text-3xl font-bold">
            Loading Admin Dashboard...
          </h1>
        </div>
      </main>
    );
  }

  const stats = [
    ["Users", data.users],
    ["Vendors", data.vendors],
    ["Stores", data.stores],
    ["Products", data.products],
    ["Orders", data.orders],
    ["Revenue", `₹${data.revenue}`]
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* HEADER */}
        <div>
          <p className="font-semibold text-indigo-600">
            ShopSphere Admin
          </p>

          <h1 className="mt-1 text-4xl font-black">
            Super Admin Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Manage and monitor the ShopSphere platform.
          </p>
        </div>

        {/* STATS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {stats.map(([key, value]) => (
            <div
              key={key}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">
                {key}
              </p>

              <p className="mt-2 text-2xl font-black text-slate-900">
                {value ?? 0}
              </p>
            </div>
          ))}
        </div>

        {/* MANAGEMENT */}
        <section className="mt-10">
          <h2 className="text-2xl font-black text-slate-900">
            Management
          </h2>

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

        {/* OVERVIEW */}
        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                Platform Overview
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Use the management sections above to control the ShopSphere marketplace.
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