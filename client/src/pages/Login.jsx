import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../services/api.js";
import { setAuth } from "../redux/slices/authSlice.js";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } = await api.post("/auth/login", form);

      dispatch(setAuth(data));

      navigate(
        data.user.role === "VENDOR"
          ? "/vendor"
          : data.user.role === "SUPER_ADMIN"
          ? "/admin"
          : "/"
      );
    } catch (e) {
      alert(e.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden bg-gradient-to-br from-[#062e22] via-[#0b5138] to-[#071d35] px-5 py-12">

      {/* =========================
          BACKGROUND GLOW
      ========================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="absolute -bottom-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-sky-300/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-300/5 blur-3xl" />

      </div>


      {/* =========================
          DECORATIVE SPHERES
      ========================= */}

      <div className="pointer-events-none absolute left-[8%] top-[18%] h-5 w-5 rounded-full bg-emerald-300/40 shadow-[0_0_25px_rgba(110,231,183,0.5)]" />

      <div className="pointer-events-none absolute right-[12%] top-[28%] h-3 w-3 rounded-full bg-sky-200/50 shadow-[0_0_20px_rgba(186,230,253,0.6)]" />

      <div className="pointer-events-none absolute bottom-[18%] left-[15%] h-3 w-3 rounded-full bg-amber-200/30" />

      {/* =========================
          LOGIN FORM
      ========================= */}

      <div className="relative z-10 w-full max-w-md">

        {/* Brand */}

        <div className="mb-7 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-emerald-200/30 bg-gradient-to-br from-emerald-400 to-teal-700 text-3xl shadow-[0_0_35px_rgba(52,211,153,0.25)]">
            🛍️
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-white">
            Shop<span className="text-emerald-300">Sphere</span>
          </h1>

          <p className="mt-1 text-sm text-emerald-100/60">
            One world. Endless things to discover.
          </p>

        </div>


        {/* Form */}

        <form
          onSubmit={submit}
          className="relative overflow-hidden rounded-[2.5rem] border border-emerald-200/20 bg-gradient-to-br from-[#123f31]/95 via-[#0d3429]/95 to-[#172d39]/95 p-7 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-9"
        >

          {/* Inner glow */}

          <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative">

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">
              Welcome back
            </p>

            <h2 className="mt-2 text-3xl font-black text-white">
              Enter your sphere.
            </h2>

            <p className="mt-2 text-sm leading-6 text-emerald-50/60">
              Sign in and continue exploring everything ShopSphere has
              to offer.
            </p>


            {/* =========================
                EMAIL
            ========================= */}

            <div className="mt-7">

              <label className="mb-2 block text-sm font-semibold text-emerald-50">
                Email address
              </label>

              <div className="group flex items-center rounded-2xl border border-emerald-100/10 bg-black/15 transition focus-within:border-emerald-300/60 focus-within:bg-black/20 focus-within:shadow-[0_0_25px_rgba(52,211,153,0.08)]">

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

            <div className="mt-5">

              <label className="mb-2 block text-sm font-semibold text-emerald-50">
                Password
              </label>

              <div className="flex items-center rounded-2xl border border-emerald-100/10 bg-black/15 transition focus-within:border-emerald-300/60 focus-within:bg-black/20 focus-within:shadow-[0_0_25px_rgba(52,211,153,0.08)]">

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
                  placeholder="Enter your password"
                  className="w-full bg-transparent px-3 py-3.5 text-sm text-white outline-none placeholder:text-emerald-100/30"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="mr-3 text-sm text-emerald-200/60 transition hover:text-emerald-200"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>


            {/* =========================
                LOGIN BUTTON
            ========================= */}

            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-300 px-5 py-3.5 font-black text-[#063426] shadow-[0_10px_30px_rgba(52,211,153,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(52,211,153,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Entering ShopSphere..." : "Enter ShopSphere →"}
            </button>


            {/* =========================
                REGISTER
            ========================= */}

            <div className="mt-7 flex items-center gap-3">

              <div className="h-px flex-1 bg-emerald-100/10" />

              <span className="text-xs text-emerald-100/30">
                NEW HERE?
              </span>

              <div className="h-px flex-1 bg-emerald-100/10" />

            </div>

            <p className="mt-5 text-center text-sm text-emerald-50/60">

              Create your ShopSphere account{" "}

              <Link
                to="/register"
                className="font-black text-emerald-300 transition hover:text-sky-200"
              >
                Register
              </Link>

            </p>

          </div>

        </form>


        {/* Footer */}

        <p className="mt-6 text-center text-xs text-emerald-100/30">
          🛡️ Secure authentication · Shop with confidence
        </p>

      </div>

    </main>
  );
}