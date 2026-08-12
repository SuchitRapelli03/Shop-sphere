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
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* ShopSphere Logo */}
        <Link to="/" className="flex items-center gap-2">

          {/* Shopping Bag Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 8.5H18L19 21H5L6 8.5Z"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              <path
                d="M9 9V6.5C9 4.84 10.34 3.5 12 3.5C13.66 3.5 15 4.84 15 6.5V9"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <circle
                cx="9"
                cy="13"
                r="1"
                fill="white"
              />

              <circle
                cx="15"
                cy="13"
                r="1"
                fill="white"
              />
            </svg>
          </div>

          {/* Brand Name */}
          <span className="text-2xl font-black tracking-tight">
            <span className="text-indigo-600">Shop</span>
            <span className="text-purple-600">Sphere</span>
          </span>

        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-5 text-sm font-medium">

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

          {user?.role === "VENDOR" && (
            <Link
              to="/vendor"
              className="transition hover:text-indigo-600"
            >
              Vendor
            </Link>
          )}

          {user?.role === "SUPER_ADMIN" && (
            <Link
              to="/admin"
              className="transition hover:text-indigo-600"
            >
              Admin
            </Link>
          )}

          {user?.role === "CUSTOMER" && (
            <Link
              to="/cart"
              className="transition hover:text-indigo-600"
            >
              Cart
            </Link>
          )}

          {!user ? (
            <Link
              to="/login"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={signOut}
              className="rounded-lg border px-4 py-2 transition hover:bg-slate-50"
            >
              Logout
            </button>
          )}

        </div>
      </div>
    </nav>
  );
}