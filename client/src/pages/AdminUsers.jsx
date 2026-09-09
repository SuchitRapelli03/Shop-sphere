import React, { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout.jsx";
import api from "../services/api.js";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (role) {
        params.set("role", role);
      }

      const { data } = await api.get(
        `/admin/users?${params.toString()}`
      );

      setUsers(data.users || []);
    } catch (error) {
      console.error("ADMIN USERS ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  }, [search, role]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadUsers]);

  async function handleDelete(user) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(user._id);
      setError("");

      await api.delete(`/admin/users/${user._id}`);

      setUsers((currentUsers) =>
        currentUsers.filter(
          (item) => item._id !== user._id
        )
      );
    } catch (error) {
      console.error("DELETE USER ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to delete user."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function getRoleStyle(userRole) {
    switch (userRole) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-700";

      case "VENDOR":
        return "bg-blue-100 text-blue-700";

      case "CUSTOMER":
        return "bg-green-100 text-green-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  return (
  <AdminLayout
    title="User Management"
    subtitle="Manage ShopSphere customer and administrator accounts"
    search={search}
    onSearchChange={setSearch}
    searchPlaceholder="Search users by name or email..."
    actions={
      <button
        type="button"
        onClick={loadUsers}
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
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500">
          Administration
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-800 md:text-3xl">
          User Management
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          View and manage ShopSphere users.
        </p>
      </div>

      <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-xs font-bold text-slate-600 shadow-[4px_4px_10px_rgba(163,177,198,0.25),-4px_-4px_10px_rgba(255,255,255,0.9)]">
        <span className="h-2 w-2 rounded-full bg-sky-400" />
        {users.length} users
      </div>
    </div>

    {/* FILTER */}
    <section className="mb-6 rounded-[2rem] border border-white/60 bg-[#e6ebf5] p-5 shadow-[10px_10px_20px_rgba(163,177,198,0.3),-10px_-10px_20px_rgba(255,255,255,0.9)]">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 items-center rounded-2xl bg-white/80 px-4 py-3 shadow-sm md:hidden">
          <span className="mr-2 text-xs text-slate-400">🔎</span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-xs font-bold text-slate-500 outline-none shadow-sm"
        >
          <option value="">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="VENDOR">Vendor</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </div>
    </section>

    {/* ERROR */}
    {error && (
      <div className="mb-6 rounded-[2rem] border border-rose-200 bg-rose-50/80 p-5">
        <p className="font-bold text-rose-600">
          User operation failed
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
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center">
          <div className="text-4xl">👥</div>

          <p className="mt-3 text-sm font-bold text-slate-500">
            No users found.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-xs">
            <thead className="border-b border-slate-200/60 bg-white/40">
              <tr>
                <th className="px-5 py-4 font-black uppercase tracking-wide text-slate-400">
                  User
                </th>

                <th className="px-5 py-4 font-black uppercase tracking-wide text-slate-400">
                  Email
                </th>

                <th className="px-5 py-4 font-black uppercase tracking-wide text-slate-400">
                  Role
                </th>

                <th className="px-5 py-4 font-black uppercase tracking-wide text-slate-400">
                  Joined
                </th>

                <th className="px-5 py-4 text-right font-black uppercase tracking-wide text-slate-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/40">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="transition hover:bg-white/40"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 font-black text-sky-600 shadow-sm">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>

                      <div>
                        <p className="font-bold text-slate-800">
                          {user.name}
                        </p>

                        <p className="mt-1 text-[9px] text-slate-400">
                          {user._id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {user.email}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-[9px] font-black tracking-wide ${getRoleStyle(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {user.role === "SUPER_ADMIN" ? (
                      <span className="text-[10px] font-bold text-slate-400">
                        Protected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        disabled={deletingId === user._id}
                        className="rounded-2xl bg-rose-500 px-4 py-2 text-[10px] font-black text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === user._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    )}
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