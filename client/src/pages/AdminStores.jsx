import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import AdminLayout from "../components/AdminLayout.jsx";
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
  <AdminLayout
    title="Store Management"
    subtitle="Monitor and manage all ShopSphere stores"
    search={search}
    onSearchChange={setSearch}
    searchPlaceholder="Search stores..."
    actions={
      <button
        type="button"
        onClick={loadStores}
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
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500">
          Marketplace
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-800 md:text-3xl">
          Store Management
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Monitor and manage all stores on ShopSphere.
        </p>
      </div>

      <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-xs font-bold text-slate-600 shadow-[4px_4px_10px_rgba(163,177,198,0.25),-4px_-4px_10px_rgba(255,255,255,0.9)]">
        <span className="h-2 w-2 rounded-full bg-teal-400" />
        {stores.length} stores
      </div>
    </div>

    {/* FILTERS */}
    <section className="mb-6 rounded-[2rem] border border-white/60 bg-[#e6ebf5] p-5 shadow-[10px_10px_20px_rgba(163,177,198,0.3),-10px_-10px_20px_rgba(255,255,255,0.9)]">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 items-center rounded-2xl bg-white/80 px-4 py-3 shadow-sm md:hidden">
          <span className="mr-2 text-xs text-slate-400">🔎</span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-xs font-bold text-slate-500 outline-none shadow-sm"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>
    </section>

    {/* ERROR */}
    {error && (
      <div className="mb-6 rounded-[2rem] border border-rose-200 bg-rose-50/80 p-5 shadow-sm">
        <p className="font-bold text-rose-600">
          Store operation failed
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {error}
        </p>
      </div>
    )}

    {/* STORES */}
    <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-[#e6ebf5] shadow-[10px_10px_20px_rgba(163,177,198,0.3),-10px_-10px_20px_rgba(255,255,255,0.9)]">
      {loading ? (
        <div className="p-12 text-center text-sm font-semibold text-slate-400">
          Loading stores...
        </div>
      ) : stores.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-4xl">🏬</div>
          <p className="mt-3 text-sm font-bold text-slate-500">
            No stores found.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-left text-xs">
            <thead className="border-b border-slate-200/60 bg-white/40">
              <tr>
                {[
                  "Store",
                  "Vendor",
                  "Products",
                  "Orders",
                  "Revenue",
                  "Status",
                  "Created",
                  "Action",
                ].map((heading, index) => (
                  <th
                    key={heading}
                    className={`px-5 py-4 font-black uppercase tracking-wide text-slate-400 ${
                      index === 2 || index === 3
                        ? "text-center"
                        : index === 4 || index === 7
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
              {stores.map((store) => (
                <tr
                  key={store._id}
                  className="transition hover:bg-white/40"
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800">
                      {store.name}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      /{store.slug}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    {store.vendor ? (
                      <>
                        <p className="font-semibold text-slate-800">
                          {store.vendor.name}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {store.vendor.email}
                        </p>
                      </>
                    ) : (
                      <span className="text-xs text-rose-500">
                        Vendor unavailable
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-center font-black text-slate-700">
                    {store.products}
                  </td>

                  <td className="px-5 py-4 text-center font-black text-slate-700">
                    {store.orders}
                  </td>

                  <td className="px-5 py-4 text-right font-black text-teal-600">
                    ₹{Number(store.revenue || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[9px] font-black tracking-wide ${getStatusStyle(
                        store.status
                      )}`}
                    >
                      {store.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {store.createdAt
                      ? new Date(store.createdAt).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      disabled={updatingId === store._id}
                      onClick={() =>
                        handleStatusChange(
                          store._id,
                          store.status === "ACTIVE"
                            ? "SUSPENDED"
                            : "ACTIVE"
                        )
                      }
                      className={`rounded-2xl px-4 py-2 text-[10px] font-black text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        store.status === "ACTIVE"
                          ? "bg-rose-500 hover:bg-rose-600"
                          : "bg-emerald-500 hover:bg-emerald-600"
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
  </AdminLayout>
);
}