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
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-black text-indigo-600"
        >
          ShopSphere
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-5 text-sm font-medium">
          <Link to="/">Home</Link>

          <Link to="/stores">Stores</Link>

          <Link to="/products">Products</Link>

          {user?.role === "VENDOR" && (
            <Link to="/vendor">Vendor</Link>
          )}

          {user?.role === "SUPER_ADMIN" && (
            <Link to="/admin">Admin</Link>
          )}

          {user?.role === "CUSTOMER" && (
            <Link to="/cart">Cart</Link>
          )}

          {!user ? (
            <Link
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
              to="/login"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={signOut}
              className="rounded-lg border px-4 py-2"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}