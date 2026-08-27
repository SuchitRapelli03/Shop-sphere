import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import api from "../services/api.js";

import { setAuth } from "../redux/slices/authSlice.js";


export default function Register() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER"
  });


  const dispatch = useDispatch();

  const navigate = useNavigate();


  async function submit(e) {

    e.preventDefault();


    try {

      const { data } =
        await api.post(
          "/auth/register",
          form
        );


      dispatch(
        setAuth(data)
      );


      /* =========================
         REDIRECT BY ROLE
      ========================= */

      if (
        data.user?.role === "VENDOR"
      ) {

        navigate(
          "/vendor/dashboard"
        );

      } else {

        navigate("/");

      }

    } catch (e) {

      console.error(
        "REGISTRATION ERROR:",
        e
      );

      alert(
        e.response?.data?.message ||
          "Registration failed"
      );

    }

  }


  return (

    <div className="mx-auto max-w-md px-6 py-16">

      <form
        onSubmit={submit}
        className="rounded-2xl border bg-white p-8 shadow-sm"
      >

        <h1 className="text-3xl font-black">
          Create account
        </h1>


        <p className="mt-2 text-sm text-slate-500">
          Choose how you want to use ShopSphere.
        </p>


        {/* =========================
            NAME
        ========================= */}

        <input
          className="mt-6 w-full rounded-lg border p-3 outline-none focus:border-indigo-500"
          placeholder="Name"
          type="text"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value
            })
          }
          required
        />


        {/* =========================
            EMAIL
        ========================= */}

        <input
          className="mt-4 w-full rounded-lg border p-3 outline-none focus:border-indigo-500"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value
            })
          }
          required
        />


        {/* =========================
            PASSWORD
        ========================= */}

        <input
          className="mt-4 w-full rounded-lg border p-3 outline-none focus:border-indigo-500"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value
            })
          }
          minLength={6}
          required
        />


        {/* =========================
            ACCOUNT TYPE
        ========================= */}

        <div className="mt-5">

          <label className="text-sm font-bold text-slate-700">
            Account Type
          </label>


          <div className="mt-3 grid grid-cols-2 gap-3">

            {/* CUSTOMER */}

            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  role: "CUSTOMER"
                })
              }
              className={`rounded-xl border p-4 text-left transition ${
                form.role === "CUSTOMER"
                  ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >

              <div className="text-2xl">
                🛒
              </div>

              <p className="mt-2 font-bold">
                Customer
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Shop and place orders
              </p>

            </button>


            {/* VENDOR */}

            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  role: "VENDOR"
                })
              }
              className={`rounded-xl border p-4 text-left transition ${
                form.role === "VENDOR"
                  ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >

              <div className="text-2xl">
                🏪
              </div>

              <p className="mt-2 font-bold">
                Vendor
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Sell products and manage orders
              </p>

            </button>

          </div>

        </div>


        {/* =========================
            REGISTER
        ========================= */}

        <button
          type="submit"
          className="mt-6 w-full rounded-lg bg-indigo-600 p-3 font-bold text-white transition hover:bg-indigo-700"
        >
          Register as{" "}
          {form.role === "VENDOR"
            ? "Vendor"
            : "Customer"}
        </button>

      </form>

    </div>

  );

}