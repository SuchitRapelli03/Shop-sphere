import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="font-semibold text-indigo-600">
              ShopSphere Admin
            </p>

            <h1 className="mt-1 text-4xl font-black">
              User Management
            </h1>

            <p className="mt-2 text-slate-600">
              View and manage ShopSphere users.
            </p>
          </div>

          <Link
            to="/admin"
            className="rounded-xl border bg-white px-5 py-3 font-semibold shadow-sm transition hover:bg-slate-50"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="VENDOR">Vendor</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <section className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm">

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">

                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">
                      User
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">
                      Role
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
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {user.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              {user._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {user.email}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getRoleStyle(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {user.role === "SUPER_ADMIN" ? (
                          <span className="text-sm font-semibold text-slate-400">
                            Protected
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              handleDelete(user)
                            }
                            disabled={
                              deletingId === user._id
                            }
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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

      </div>
    </main>
  );
}