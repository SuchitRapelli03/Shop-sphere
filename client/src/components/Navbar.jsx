import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice.js";

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const cartItems = useSelector((s) => s.cart?.items || []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const menuRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
  if (location.pathname !== "/products") {
    setSearchQuery("");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/products") {
      const params = new URLSearchParams(location.search);
      setSearchQuery(params.get("search") || "");
    } else {
      setSearchQuery("");
    }
  }, [location.pathname, location.search]);

  const cartCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  function signOut() {
    setIsMenuOpen(false);
    dispatch(logout());
    navigate("/");
  }

  /* =========================================================
     SEARCH
  ========================================================= */

 function handleSearch(event) {
  event.preventDefault();

  const query = searchQuery.trim();

  if (!query) {
    navigate("/products");
    return;
  }

  navigate(
    {
      pathname: "/products",
      search: `?search=${encodeURIComponent(query)}`,
    },
    {
      replace: true,
    }
  );
}

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="w-full border-b border-emerald-400/20 bg-gradient-to-r from-[#022C22] via-[#064E3B] to-[#0F172A] shadow-lg shadow-emerald-950/20">

      {/* =========================
          MAIN NAVIGATION
      ========================= */}

      <div className="mx-auto flex min-h-[68px] max-w-7xl items-center gap-3 px-4 py-2 sm:gap-4 lg:px-6">

        {/* =========================
            LOGO
        ========================= */}

        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2"
        >
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-forest-900 text-lg font-black text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <span className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-emerald-400/30" />
            <span className="relative">S</span>
          </div>

          <div className="hidden sm:block">
            <div className="text-lg font-black tracking-tight text-white">
              Shop<span className="text-emerald-300">Sphere</span>
            </div>

            <div className="-mt-0.5 text-[8px] font-bold uppercase tracking-[0.22em] text-emerald-100/60">
              Your marketplace
            </div>
          </div>
        </Link>

        {/* =========================
            SEARCH
        ========================= */}

        <div className="min-w-0 flex-1">

          <form
            onSubmit={handleSearch}
            className="group flex h-11 overflow-hidden rounded-xl border border-white/10 bg-white/[0.08] backdrop-blur-md transition duration-300 focus-within:border-emerald-300/60 focus-within:bg-white/[0.12] focus-within:ring-2 focus-within:ring-emerald-400/10"
          >

            <span className="hidden items-center pl-3.5 text-base text-emerald-200/70 sm:flex">
              🔎
            </span>

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products, stores and more..."
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:bg-gradient-to-r placeholder:from-cyan-200 placeholder:via-emerald-200 placeholder:to-white placeholder:bg-clip-text placeholder:text-transparent sm:pl-2"
            />

            <button
              type="submit"
              className="m-1 flex w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-300 text-base font-bold text-[#022C22] shadow-sm transition duration-300 hover:from-emerald-300 hover:to-cyan-200"
              aria-label="Search"
            >
              →
            </button>

          </form>

        </div>

        {/* =========================
            DESKTOP NAVIGATION
        ========================= */}

        <nav className="hidden items-center gap-0.5 lg:flex">

          <Link
            to="/products"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-emerald-50/90 transition duration-300 hover:bg-white/10 hover:text-emerald-300"
          >
            Products
          </Link>

          <Link
            to="/stores"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-emerald-50/90 transition duration-300 hover:bg-white/10 hover:text-emerald-300"
          >
            Stores
          </Link>

          {user?.role === "CUSTOMER" && (
            <Link
              to="/orders"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-emerald-50/90 transition duration-300 hover:bg-white/10 hover:text-emerald-300"
            >
              Orders
            </Link>
          )}

          {user?.role === "VENDOR" && (
            <Link
              to="/vendor"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-emerald-50/90 transition duration-300 hover:bg-white/10 hover:text-emerald-300"
            >
              Dashboard
            </Link>
          )}

          {user?.role === "SUPER_ADMIN" && (
            <Link
              to="/admin"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-emerald-50/90 transition duration-300 hover:bg-white/10 hover:text-emerald-300"
            >
              Admin
            </Link>
          )}

        </nav>

        {/* =========================
            RIGHT SIDE
        ========================= */}

        <div className="flex shrink-0 items-center gap-1.5">

          {/* CUSTOMER CART */}

          {user?.role === "CUSTOMER" && (
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] text-lg transition duration-300 hover:border-emerald-300/30 hover:bg-emerald-400/10"
              aria-label="Cart"
            >
              🛒

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 px-1 text-[9px] font-black text-[#022C22] shadow-md">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* =========================
              LOGGED OUT
          ========================= */}

          {!user && (
            <div className="flex items-center gap-1.5">

              <Link
                to="/login"
                className="rounded-xl border border-white/15 bg-white/[0.05] px-3.5 py-2 text-sm font-semibold text-white transition duration-300 hover:border-emerald-300/30 hover:bg-white/10 hover:text-emerald-300"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="hidden rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-300 px-4 py-2 text-sm font-bold text-[#022C22] shadow-md transition duration-300 hover:-translate-y-0.5 hover:from-emerald-300 hover:to-cyan-200 sm:block"
              >
                Join ShopSphere
              </Link>

            </div>
          )}

          {/* =========================
              LOGGED IN USER
          ========================= */}

          {user && (
            <div className="relative" ref={menuRef}>

              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-2 py-1.5 transition duration-300 hover:border-emerald-300/30 hover:bg-white/10"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-300 to-cyan-300 text-sm font-black text-[#022C22]">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </span>

                <span className="hidden max-w-24 truncate text-sm font-semibold text-white xl:block">
                  {user.name || "Account"}
                </span>
              </button>

              {/* USER MENU */}

              <div
                className={`absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-emerald-200/10 bg-[#022C22]/95 p-2 shadow-2xl backdrop-blur-xl transition-all duration-200 ${
                  isMenuOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible translate-y-2 opacity-0"
                }`}
              >

                <div className="border-b border-white/10 px-3 py-2">

                  <p className="truncate text-sm font-bold text-white">
                    {user.name || "Account"}
                  </p>

                  <p className="truncate text-xs text-emerald-200/60">
                    {user.email}
                  </p>

                </div>

                <div className="mt-1">

                  {user.role === "CUSTOMER" && (
                    <>
                      <Link
                        to="/orders"
                        onClick={() => setIsMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-white/10 hover:text-emerald-300"
                      >
                        My Orders
                      </Link>

                      <Link
                        to="/cart"
                        onClick={() => setIsMenuOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-white/10 hover:text-emerald-300"
                      >
                        My Cart
                      </Link>
                    </>
                  )}

                  {user.role === "VENDOR" && (
                    <Link
                      to="/vendor"
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-white/10 hover:text-emerald-300"
                    >
                      Vendor Dashboard
                    </Link>
                  )}

                  {user.role === "SUPER_ADMIN" && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-white/10 hover:text-emerald-300"
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={signOut}
                    className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-red-300 transition hover:bg-red-400/10 hover:text-red-200"
                  >
                    Sign out
                  </button>

                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* =========================
          MOBILE NAVIGATION
      ========================= */}

      <div className="border-t border-white/10 bg-black/10 px-4 py-2 lg:hidden">

        <div className="flex items-center gap-1.5 overflow-x-auto">

          <Link
            to="/"
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-100/90 transition hover:bg-white/10 hover:text-emerald-300"
          >
            Home
          </Link>

          <Link
            to="/products"
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-100/90 transition hover:bg-white/10 hover:text-emerald-300"
          >
            Products
          </Link>

          <Link
            to="/stores"
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-100/90 transition hover:bg-white/10 hover:text-emerald-300"
          >
            Stores
          </Link>

          {user?.role === "CUSTOMER" && (
            <Link
              to="/orders"
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-100/90 transition hover:bg-white/10 hover:text-emerald-300"
            >
              Orders
            </Link>
          )}

          {user?.role === "VENDOR" && (
            <Link
              to="/vendor"
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-100/90 transition hover:bg-white/10 hover:text-emerald-300"
            >
              Vendor Dashboard
            </Link>
          )}

          {user?.role === "SUPER_ADMIN" && (
            <Link
              to="/admin"
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-100/90 transition hover:bg-white/10 hover:text-emerald-300"
            >
              Admin Dashboard
            </Link>
          )}

        </div>
      </div>

    </header>
  );
}