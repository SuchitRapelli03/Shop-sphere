// client/src/pages/AdminVendors.jsx

import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const { data } = await api.get(
        `/admin/vendors?${params.toString()}`
      );

      setVendors(data.vendors || []);
    } catch (error) {
      console.error("ADMIN VENDORS ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load vendors."
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVendors();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadVendors]);

  async function handleStatusChange(
    vendor,
    newStatus
  ) {
    const action =
      newStatus === "SUSPENDED"
        ? "suspend"
        : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} vendor "${vendor.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(vendor._id);
      setError("");

      const { data } = await api.put(
        `/admin/vendors/${vendor._id}/status`,
        {
          status: newStatus
        }
      );

      setVendors((currentVendors) =>
        currentVendors.map((item) =>
          item._id === vendor._id
            ? {
                ...item,
                status: data.vendor.status
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "UPDATE VENDOR STATUS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update vendor status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(vendor) {
    const confirmed = window.confirm(
      `Are you sure you want to delete vendor "${vendor.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(vendor._id);
      setError("");

      await api.delete(
        `/admin/vendors/${vendor._id}`
      );

      setVendors((currentVendors) =>
        currentVendors.filter(
          (item) => item._id !== vendor._id
        )
      );
    } catch (error) {
      console.error(
        "DELETE VENDOR ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete vendor."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function getStatusStyle(vendorStatus) {
    if (vendorStatus === "SUSPENDED") {
      return "bg-red-100 text-red-700";
    }

    return "bg-green-100 text-green-700";
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="font-semibold text-indigo-600">
              ShopSphere Admin
            </p>

            <h1 className="mt-1 text-4xl font-black">
              Vendor Management
            </h1>

            <p className="mt-2 text-slate-600">
              View, monitor and control ShopSphere vendors.
            </p>
          </div>

          <Link
            to="/admin"
            className="rounded-xl border bg-white px-5 py-3 font-semibold shadow-sm transition hover:bg-slate-50"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* SEARCH */}
        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search vendors by name or email..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* VENDOR TABLE */}
        <section className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm">

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading vendors...
            </div>
          ) : vendors.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No vendors found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px]">

                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">
                      Vendor
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">
                      Email
                    </th>

                    <th className="px-6 py-4 text-center text-sm font-bold text-slate-600">
                      Stores
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
                      Joined
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-bold text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {vendors.map((vendor) => (
                    <tr
                      key={vendor._id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* VENDOR */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                            {vendor.name
                              ?.charAt(0)
                              ?.toUpperCase() || "V"}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {vendor.name}
                            </p>

                            <span className="mt-1 inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                              VENDOR
                            </span>
                          </div>

                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {vendor.email}
                      </td>

                      {/* STORES */}
                      <td className="px-6 py-4 text-center font-bold">
                        {vendor.stores}
                      </td>

                      {/* PRODUCTS */}
                      <td className="px-6 py-4 text-center font-bold">
                        {vendor.products}
                      </td>

                      {/* ORDERS */}
                      <td className="px-6 py-4 text-center font-bold">
                        {vendor.orders}
                      </td>

                      {/* REVENUE */}
                      <td className="px-6 py-4 text-right font-bold text-green-700">
                        ₹
                        {Number(
                          vendor.revenue || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                            vendor.status
                          )}`}
                        >
                          {vendor.status}
                        </span>
                      </td>

                      {/* JOINED */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {vendor.createdAt
                          ? new Date(
                              vendor.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            disabled={
                              updatingId ===
                                vendor._id ||
                              deletingId ===
                                vendor._id
                            }
                            onClick={() =>
                              handleStatusChange(
                                vendor,
                                vendor.status ===
                                  "ACTIVE"
                                  ? "SUSPENDED"
                                  : "ACTIVE"
                              )
                            }
                            className={`rounded-lg px-4 py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              vendor.status ===
                              "ACTIVE"
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                          >
                            {updatingId ===
                            vendor._id
                              ? "Updating..."
                              : vendor.status ===
                                "ACTIVE"
                              ? "Suspend"
                              : "Activate"}
                          </button>

                          {vendor.stores === 0 &&
                          vendor.products === 0 &&
                          vendor.orders === 0 ? (
                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                  vendor._id ||
                                updatingId ===
                                  vendor._id
                              }
                              onClick={() =>
                                handleDelete(
                                  vendor
                                )
                              }
                              className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId ===
                              vendor._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          ) : null}

                        </div>
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