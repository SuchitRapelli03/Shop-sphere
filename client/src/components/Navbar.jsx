import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice.js";

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const cartItems = useSelector((s) => s.cart?.items || []);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  function signOut() {
    dispatch(logout());
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      {/* Top navigation */}
      <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-3 lg:px-6">

        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl font-black text-white shadow-sm">
            S
          </div>

          <div className="hidden sm:block">
            <div className="text-xl font-black tracking-tight text-slate-900">
              Shop<span className="text-indigo-600">Sphere</span>
            </div>

            <div className="-mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Shop smarter
            </div>
          </div>
        </Link>

        {/* Search */}
        <div className="hidden flex-1 md:block">
          <div className="flex h-11 overflow-hidden rounded-lg border border-slate-300 bg-slate-50 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
            <input
              type="text"
              placeholder="Search for products, stores and more..."
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />

            <button
              type="button"
              className="flex w-14 items-center justify-center bg-indigo-600 text-lg text-white transition hover:bg-indigo-700"
              aria-label="Search"
            >
              🔍
            </button>
          </div>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">

          {/* Account */}
          {!user ? (
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:flex"
            >
              <span className="text-lg">👤</span>

              <span>
                <span className="block text-[10px] font-medium text-slate-400">
                  Hello, sign in
                </span>
                Account
              </span>
            </Link>
          ) : (
            <div className="hidden items-center gap-2 rounded-lg px-3 py-2 sm:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </span>

              <div>
                <span className="block text-[10px] font-medium text-slate-400">
                  Hello
                </span>

                <span className="block max-w-28 truncate text-sm font-bold text-slate-800">
                  {user.name || "Account"}
                </span>
              </div>
            </div>
          )}

          {/* Orders */}
          {user?.role === "CUSTOMER" && (
            <Link
              to="/orders"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:block"
            >
              <span className="block text-[10px] font-medium text-slate-400">
                Track
              </span>
              Orders
            </Link>
          )}

          {/* Cart */}
          {user?.role === "CUSTOMER" && (
            <Link
              to="/cart"
              className="relative flex items-center gap-1 rounded-lg px-3 py-2 text-slate-700 transition hover:bg-slate-100"
            >
              <span className="text-2xl">🛒</span>

              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}

              <span className="hidden text-sm font-bold sm:block">
                Cart
              </span>
            </Link>
          )}

          {/* Login */}
          {!user && (
            <Link
              to="/login"
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Login
            </Link>
          )}

          {/* Logout */}
          {user && (
            <button
              onClick={signOut}
              className="hidden rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 md:block"
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Secondary navigation */}
      <div className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 text-sm font-semibold lg:px-6">

          <Link
            to="/"
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-white hover:text-indigo-600"
          >
            🏠 Home
          </Link>

          <Link
            to="/products"
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-white hover:text-indigo-600"
          >
            🛍️ All Products
          </Link>

          <Link
            to="/stores"
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-white hover:text-indigo-600"
          >
            🏪 Stores
          </Link>

          {user?.role === "VENDOR" && (
            <Link
              to="/vendor"
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-white hover:text-indigo-600"
            >
              📊 Vendor Dashboard
            </Link>
          )}

          {user?.role === "SUPER_ADMIN" && (
            <Link
              to="/admin"
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-white hover:text-indigo-600"
            >
              ⚙️ Admin Dashboard
            </Link>
          )}

          <div className="ml-auto hidden items-center gap-2 text-xs text-slate-500 lg:flex">
            <span>✓ Secure payments</span>
            <span>•</span>
            <span>✓ Trusted stores</span>
          </div>
        </div>
      </div>
    </header>
  );
}