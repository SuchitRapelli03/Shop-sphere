import React, { useEffect, useState } from "react";
import api from "../services/api.js";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/analytics/admin")
      .then((response) => {
        setData(response.data);
      })
      .catch((err) => {
        console.error("ADMIN DASHBOARD ERROR:", err);
        setError(
          err.response?.data?.message || "Failed to load admin dashboard"
        );
      });
  }, []);

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-xl border border-red-300 bg-red-50 p-6 text-red-700">
          <h2 className="text-xl font-bold">Error</h2>
          <p className="mt-2">{error}</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-bold">Loading Admin Dashboard...</h1>
      </main>
    );
  }

  const stats = [
    ["Users", data.users],
    ["Vendors", data.vendors],
    ["Stores", data.stores],
    ["Products", data.products],
    ["Orders", data.orders],
    ["Revenue", `₹${data.revenue}`],
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-4xl font-black">
        Super Admin Dashboard
      </h1>

      <p className="mt-2 text-slate-600">
        Manage and monitor the ShopSphere platform.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {stats.map(([key, value]) => (
          <div
            key={key}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">
              {key}
            </p>

            <p className="mt-2 text-2xl font-black">
              {value ?? 0}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}