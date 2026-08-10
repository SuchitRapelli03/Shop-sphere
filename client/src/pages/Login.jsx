import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { setAuth } from "../redux/slices/authSlice.js";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();

    try {
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
    }
  }

  return (
    <AuthForm
      title="Welcome back"
      submit={submit}
      form={form}
      setForm={setForm}
      button="Login"
    />
  );
}

function AuthForm({ title, submit, form, setForm, button }) {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <form
        onSubmit={submit}
        className="rounded-2xl border bg-white p-8 shadow-sm"
      >
        <h1 className="text-3xl font-black">{title}</h1>

        <input
          className="mt-6 w-full rounded-lg border p-3"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        <input
          className="mt-3 w-full rounded-lg border p-3"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
        />

        <button
          type="submit"
          className="mt-5 w-full rounded-lg bg-indigo-600 p-3 font-bold text-white"
        >
          {button}
        </button>
      </form>
    </div>
  );
}