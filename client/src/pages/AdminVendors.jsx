// client/src/pages/AdminVendors.jsx

import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import AdminLayout from "../components/AdminLayout.jsx";
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
  <AdminLayout
    title="Vendor Management"
    subtitle="Monitor and control ShopSphere marketplace vendors"
    search={search}
    onSearchChange={setSearch}
    searchPlaceholder="Search vendors by name or email..."
    actions={
      <button
        type="button"
        onClick={loadVendors}
        className="flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2.5 text-xs font-bold text-slate-500 shadow-[4px_4px_10px_rgba(163,177,198,0.2),-4px_-4px_10px_rgba(255,255,255,0.9)] transition hover:bg-white hover:text-violet-500"
      >
        <span className="text-base">↻</span>
        <span className="hidden sm:inline">Refresh</span>
      </button>
    }
  >
    {/* PAGE HEADER */}
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">
          Marketplace
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-800 md:text-3xl">
          Vendor Management
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          View, monitor and control ShopSphere vendors.
        </p>
      </div>

      <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-xs font-bold text-slate-600 shadow-[4px_4px_10px_rgba(163,177,198,0.25),-4px_-4px_10px_rgba(255,255,255,0.9)]">
        <span className="h-2 w-2 rounded-full bg-violet-400" />
        {vendors.length} vendors
      </div>
    </div>

    {/* SEARCH */}
    <section className="mb-6 rounded-[2rem] border border-white/60 bg-[#e6ebf5] p-5 shadow-[10px_10px_20px_rgba(163,177,198,0.3),-10px_-10px_20px_rgba(255,255,255,0.9)]">
      <div className="flex items-center rounded-2xl bg-white/80 px-4 py-3 shadow-sm md:hidden">
        <span className="mr-2 text-xs text-slate-400">🔎</span>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendors..."
          className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
        />
      </div>
    </section>

    {/* ERROR */}
    {error && (
      <div className="mb-6 rounded-[2rem] border border-rose-200 bg-rose-50/80 p-5">
        <p className="font-bold text-rose-600">
          Vendor operation failed
        </p>

        <p className="mt-1 text-sm text-slate-600">
          {error}
        </p>
      </div>
    )}

    {/* TABLE */}
    <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-[#e6ebf5] shadow-[10px_10px_20px_rgba(163,177,198,0.3),-10px_-10px_20px_rgba(255,255,255,0.9)]">
      {loading ? (
        <div className="p-12 text-center text-sm font-semibold text-slate-400">
          Loading vendors...
        </div>
      ) : vendors.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-4xl">🏪</div>

          <p className="mt-3 text-sm font-bold text-slate-500">
            No vendors found.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left text-xs">
            <thead className="border-b border-slate-200/60 bg-white/40">
              <tr>
                {[
                  "Vendor",
                  "Email",
                  "Stores",
                  "Products",
                  "Orders",
                  "Revenue",
                  "Status",
                  "Joined",
                  "Action",
                ].map((heading, index) => (
                  <th
                    key={heading}
                    className={`px-5 py-4 font-black uppercase tracking-wide text-slate-400 ${
                      [2, 3, 4].includes(index)
                        ? "text-center"
                        : [5, 8].includes(index)
                        ? "text-right"
                        : ""
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/40">
              {vendors.map((vendor) => (
                <tr
                  key={vendor._id}
                  className="transition hover:bg-white/40"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 font-black text-violet-600 shadow-sm">
                        {vendor.name?.charAt(0)?.toUpperCase() || "V"}
                      </div>

                      <div>
                        <p className="font-bold text-slate-800">
                          {vendor.name}
                        </p>

                        <span className="mt-1 inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-[9px] font-black text-violet-600">
                          VENDOR
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {vendor.email}
                  </td>

                  <td className="px-5 py-4 text-center font-black">
                    {vendor.stores}
                  </td>

                  <td className="px-5 py-4 text-center font-black">
                    {vendor.products}
                  </td>

                  <td className="px-5 py-4 text-center font-black">
                    {vendor.orders}
                  </td>

                  <td className="px-5 py-4 text-right font-black text-teal-600">
                    ₹
                    {Number(vendor.revenue || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[9px] font-black tracking-wide ${getStatusStyle(
                        vendor.status
                      )}`}
                    >
                      {vendor.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {vendor.createdAt
                      ? new Date(vendor.createdAt).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={
                          updatingId === vendor._id ||
                          deletingId === vendor._id
                        }
                        onClick={() =>
                          handleStatusChange(
                            vendor,
                            vendor.status === "ACTIVE"
                              ? "SUSPENDED"
                              : "ACTIVE"
                          )
                        }
                        className={`rounded-2xl px-4 py-2 text-[10px] font-black text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          vendor.status === "ACTIVE"
                            ? "bg-rose-500 hover:bg-rose-600"
                            : "bg-emerald-500 hover:bg-emerald-600"
                        }`}
                      >
                        {updatingId === vendor._id
                          ? "Updating..."
                          : vendor.status === "ACTIVE"
                          ? "Suspend"
                          : "Activate"}
                      </button>

                      {vendor.stores === 0 &&
                      vendor.products === 0 &&
                      vendor.orders === 0 ? (
                        <button
                          type="button"
                          disabled={
                            deletingId === vendor._id ||
                            updatingId === vendor._id
                          }
                          onClick={() => handleDelete(vendor)}
                          className="rounded-2xl bg-white/80 px-4 py-2 text-[10px] font-black text-slate-600 shadow-sm transition hover:bg-rose-100 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === vendor._id
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
  </AdminLayout>
);
}