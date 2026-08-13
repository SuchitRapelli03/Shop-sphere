import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice.js";

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function signOut() {
    dispatch(logout());
    navigate("/");
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-xl text-white shadow-md">
            🛍️
          </div>

          <span className="text-2xl font-black tracking-tight text-indigo-600">
            Shop<span className="text-purple-600">Sphere</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6 text-sm font-semibold">

          <Link
            to="/"
            className="transition hover:text-indigo-600"
          >
            Home
          </Link>

          <Link
            to="/stores"
            className="transition hover:text-indigo-600"
          >
            Stores
          </Link>

          <Link
            to="/products"
            className="transition hover:text-indigo-600"
          >
            Products
          </Link>

          {/* Customer links */}
          {user?.role === "CUSTOMER" && (
            <>
              <Link
                to="/orders"
                className="transition hover:text-indigo-600"
              >
                Orders
              </Link>

              <Link
                to="/cart"
                className="transition hover:text-indigo-600"
              >
                Cart
              </Link>
            </>
          )}

          {/* Vendor */}
          {user?.role === "VENDOR" && (
            <Link
              to="/vendor"
              className="transition hover:text-indigo-600"
            >
              Vendor
            </Link>
          )}

          {/* Admin */}
          {user?.role === "SUPER_ADMIN" && (
            <Link
              to="/admin"
              className="transition hover:text-indigo-600"
            >
              Admin
            </Link>
          )}

          {/* Login / Logout */}
          {!user ? (
            <Link
              to="/login"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-white shadow-md transition hover:shadow-lg"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={signOut}
              className="rounded-xl border border-slate-200 px-5 py-2.5 transition hover:bg-slate-50"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}