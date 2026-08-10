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
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();

    try {
      const { data } = await api.post("/auth/register", form);

      dispatch(setAuth(data));
      navigate("/");
    } catch (e) {
      alert(e.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <form
        onSubmit={submit}
        className="rounded-2xl border bg-white p-8 shadow-sm"
      >
        <h1 className="text-3xl font-black">Create account</h1>

        {[
          ["name", "Name", "text"],
          ["email", "Email", "email"],
          ["password", "Password", "password"],
        ].map(([key, label, type]) => (
          <input
            key={key}
            className="mt-4 w-full rounded-lg border p-3"
            placeholder={label}
            type={type}
            value={form[key]}
            onChange={(e) =>
              setForm({
                ...form,
                [key]: e.target.value,
              })
            }
          />
        ))}

        <button
          type="submit"
          className="mt-5 w-full rounded-lg bg-indigo-600 p-3 font-bold text-white"
        >
          Register
        </button>
      </form>
    </div>
  );
}