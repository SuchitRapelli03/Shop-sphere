import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import api from "../services/api.js";
import { setAuth } from "../redux/slices/authSlice.js";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } = await api.post(
        "/auth/register",
        form
      );

      dispatch(setAuth(data));

      if (data.user?.role === "VENDOR") {
        navigate("/vendor");
      } else {
        navigate("/");
      }
    } catch (e) {
      console.error("REGISTRATION ERROR:", e);

      alert(
        e.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden bg-gradient-to-br from-[#062e22] via-[#0b5138] to-[#071d35] px-5 py-12">

      {/* =========================
          BACKGROUND
      ========================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-40 top-0 h-[30rem] w-[30rem] rounded-full bg-emerald-400/15 blur-3xl" />

        <div className="absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-sky-300/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-lime-300/5 blur-3xl" />

      </div>


      {/* Floating particles */}

      <div className="pointer-events-none absolute left-[10%] top-[20%] h-4 w-4 rounded-full bg-emerald-300/30 shadow-[0_0_25px_rgba(110,231,183,0.4)]" />

      <div className="pointer-events-none absolute right-[9%] top-[17%] h-6 w-6 rounded-full bg-sky-200/20" />

      <div className="pointer-events-none absolute bottom-[16%] right-[18%] h-3 w-3 rounded-full bg-amber-200/30" />


      {/* =========================
          REGISTER CONTAINER
      ========================= */}

      <div className="relative z-10 w-full max-w-xl">

        {/* Brand */}

        <div className="mb-6 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-emerald-200/30 bg-gradient-to-br from-emerald-400 to-teal-700 text-2xl shadow-[0_0_35px_rgba(52,211,153,0.22)]">
            🛍️
          </div>

          <h1 className="mt-3 text-3xl font-black text-white">
            Shop<span className="text-emerald-300">Sphere</span>
          </h1>

          <p className="mt-1 text-sm text-emerald-100/60">
            One account. A whole world of stores.
          </p>

        </div>


        {/* =========================
            FORM
        ========================= */}

        <form
          onSubmit={submit}
          className="relative overflow-hidden rounded-[2.7rem] border border-emerald-200/20 bg-gradient-to-br from-[#123f31]/95 via-[#0d3429]/95 to-[#172d39]/95 p-7 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-9"
        >

          <div className="pointer-events-none absolute -right-28 -top-28 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative">

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">
              Join the marketplace
            </p>

            <h2 className="mt-2 text-3xl font-black text-white">
              Enter the ShopSphere.
            </h2>

            <p className="mt-2 text-sm leading-6 text-emerald-50/60">
              Create your account and choose how you want to
              experience the marketplace.
            </p>


            {/* =========================
                NAME
            ========================= */}

            <div className="mt-6">

              <label className="mb-2 block text-sm font-semibold text-emerald-50">
                Your name
              </label>

              <div className="flex items-center rounded-2xl border border-emerald-100/10 bg-black/15 transition focus-within:border-emerald-300/60">

                <span className="pl-4 text-lg">
                  👤
                </span>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="What should we call you?"
                  className="w-full rounded-2xl bg-transparent px-3 py-3.5 text-sm text-white outline-none placeholder:text-emerald-100/30"
                  required
                />

              </div>

            </div>


            {/* =========================
                EMAIL
            ========================= */}

            <div className="mt-4">

              <label className="mb-2 block text-sm font-semibold text-emerald-50">
                Email address
              </label>

              <div className="flex items-center rounded-2xl border border-emerald-100/10 bg-black/15 transition focus-within:border-emerald-300/60">

                <span className="pl-4 text-lg">
                  ✉️
                </span>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  placeholder="you@example.com"
                  className="w-full rounded-2xl bg-transparent px-3 py-3.5 text-sm text-white outline-none placeholder:text-emerald-100/30"
                  required
                />

              </div>

            </div>


            {/* =========================
                PASSWORD
            ========================= */}

            <div className="mt-4">

              <label className="mb-2 block text-sm font-semibold text-emerald-50">
                Password
              </label>

              <div className="flex items-center rounded-2xl border border-emerald-100/10 bg-black/15 transition focus-within:border-emerald-300/60">

                <span className="pl-4 text-lg">
                  🔐
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  placeholder="At least 6 characters"
                  className="w-full bg-transparent px-3 py-3.5 text-sm text-white outline-none placeholder:text-emerald-100/30"
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="mr-3 text-sm text-emerald-200/60 transition hover:text-emerald-200"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>


            {/* =========================
                ACCOUNT TYPE
            ========================= */}

            <div className="mt-6">

              <label className="text-sm font-bold text-emerald-50">
                Choose your experience
              </label>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">

                {/* CUSTOMER */}

                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      role: "CUSTOMER",
                    })
                  }
                  className={`group rounded-2xl border p-5 text-left transition duration-300 ${
                    form.role === "CUSTOMER"
                      ? "border-emerald-300/60 bg-emerald-400/10 shadow-[0_0_25px_rgba(52,211,153,0.08)]"
                      : "border-emerald-100/10 bg-black/10 hover:border-emerald-200/30 hover:bg-white/5"
                  }`}
                >

                  <div className="flex items-center justify-between">

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${
                        form.role === "CUSTOMER"
                          ? "bg-emerald-300/20"
                          : "bg-white/5"
                      }`}
                    >
                      🛍️
                    </div>

                    {form.role === "CUSTOMER" && (
                      <span className="text-sm text-emerald-300">
                        ✓
                      </span>
                    )}

                  </div>

                  <h3 className="mt-4 font-black text-white">
                    Customer
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-emerald-50/50">
                    Discover stores, explore products and
                    place orders.
                  </p>

                </button>


                {/* VENDOR */}

                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      role: "VENDOR",
                    })
                  }
                  className={`group rounded-2xl border p-5 text-left transition duration-300 ${
                    form.role === "VENDOR"
                      ? "border-sky-300/60 bg-sky-300/10 shadow-[0_0_25px_rgba(125,211,252,0.08)]"
                      : "border-emerald-100/10 bg-black/10 hover:border-emerald-200/30 hover:bg-white/5"
                  }`}
                >

                  <div className="flex items-center justify-between">

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${
                        form.role === "VENDOR"
                          ? "bg-sky-300/20"
                          : "bg-white/5"
                      }`}
                    >
                      🏪
                    </div>

                    {form.role === "VENDOR" && (
                      <span className="text-sm text-sky-300">
                        ✓
                      </span>
                    )}

                  </div>

                  <h3 className="mt-4 font-black text-white">
                    Vendor
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-emerald-50/50">
                    Create stores, sell products and manage
                    your marketplace presence.
                  </p>

                </button>

              </div>

            </div>


            {/* =========================
                REGISTER BUTTON
            ========================= */}

            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-300 px-5 py-3.5 font-black text-[#063426] shadow-[0_10px_30px_rgba(52,211,153,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(52,211,153,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating your sphere..."
                : `Create ${form.role === "VENDOR" ? "Vendor" : "Customer"} Account →`}
            </button>


            {/* =========================
                LOGIN
            ========================= */}

            <div className="mt-7 flex items-center gap-3">

              <div className="h-px flex-1 bg-emerald-100/10" />

              <span className="text-xs text-emerald-100/30">
                ALREADY HERE?
              </span>

              <div className="h-px flex-1 bg-emerald-100/10" />

            </div>

            <p className="mt-5 text-center text-sm text-emerald-50/60">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-black text-emerald-300 transition hover:text-sky-200"
              >
                Login
              </Link>

            </p>

          </div>

        </form>


        <p className="mt-6 text-center text-xs text-emerald-100/30">
          🌐 Welcome to a marketplace where every store has a place.
        </p>

      </div>

    </main>
  );
}