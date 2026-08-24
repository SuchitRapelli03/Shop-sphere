import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadStores = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status) {
        params.set("status", status);
      }

      const { data } = await api.get(
        `/admin/stores?${params.toString()}`
      );

      setStores(data.stores || []);
    } catch (error) {
      console.error("ADMIN STORES ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load stores."
      );
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStores();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadStores]);

  async function handleStatusChange(
    storeId,
    newStatus
  ) {
    const action =
      newStatus === "SUSPENDED"
        ? "suspend"
        : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this store?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(storeId);
      setError("");

      const { data } = await api.put(
        `/admin/stores/${storeId}/status`,
        {
          status: newStatus
        }
      );

      setStores((currentStores) =>
        currentStores.map((store) =>
          store._id === storeId
            ? {
                ...store,
                status: data.store.status
              }
            : store
        )
      );
    } catch (error) {
      console.error(
        "UPDATE STORE STATUS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update store status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function getStatusStyle(storeStatus) {
    if (storeStatus === "ACTIVE") {
      return "bg-green-100 text-green-700";
    }

    return "bg-red-100 text-red-700";
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="font-semibold text-indigo-600">
              ShopSphere Admin
            </p>

            <h1 className="mt-1 text-4xl font-black">
              Store Management
            </h1>

            <p className="mt-2 text-slate-600">
              Monitor and manage all stores on ShopSphere.
            </p>
          </div>

          <Link
            to="/admin"
            className="rounded-xl border bg-white px-5 py-3 font-semibold shadow-sm transition hover:bg-slate-50"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by store name or slug..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-indigo-500"
            >
              <option value="">
                All Statuses
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="SUSPENDED">
                Suspended
              </option>
            </select>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Store table */}
        <section className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading stores...
            </div>
          ) : stores.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No stores found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px]">

                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">
                      Store
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">
                      Vendor
                    </th>

                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-600">
                      Products
                    </th>

                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-600">
                      Orders
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-600">
                      Revenue
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">
                      Created
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {stores.map((store) => (
                    <tr
                      key={store._id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Store */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900">
                            {store.name}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            /{store.slug}
                          </p>
                        </div>
                      </td>

                      {/* Vendor */}
                      <td className="px-6 py-4">
                        {store.vendor ? (
                          <div>
                            <p className="font-semibold text-slate-900">
                              {store.vendor.name}
                            </p>

                            <p className="text-sm text-slate-500">
                              {store.vendor.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-red-500">
                            Vendor unavailable
                          </span>
                        )}
                      </td>

                      {/* Products */}
                      <td className="px-6 py-4 text-center font-bold">
                        {store.products}
                      </td>

                      {/* Orders */}
                      <td className="px-6 py-4 text-center font-bold">
                        {store.orders}
                      </td>

                      {/* Revenue */}
                      <td className="px-6 py-4 text-right font-bold text-green-700">
                        ₹{store.revenue}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                            store.status
                          )}`}
                        >
                          {store.status}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {store.createdAt
                          ? new Date(
                              store.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled={
                            updatingId === store._id
                          }
                          onClick={() =>
                            handleStatusChange(
                              store._id,
                              store.status === "ACTIVE"
                                ? "SUSPENDED"
                                : "ACTIVE"
                            )
                          }
                          className={`rounded-lg px-4 py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            store.status === "ACTIVE"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {updatingId === store._id
                            ? "Updating..."
                            : store.status === "ACTIVE"
                            ? "Suspend"
                            : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}