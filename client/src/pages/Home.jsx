import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <section className="bg-slate-950 px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="font-semibold text-indigo-400">
            MULTI-TENANT COMMERCE
          </p>

          <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-tight md:text-7xl">
            One platform. Thousands of stores.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Shop products from independent vendors, or build and manage your
            own store.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              to="/stores"
              className="rounded-xl bg-indigo-600 px-6 py-3 font-bold"
            >
              Explore Stores
            </Link>

            <Link
              to="/register"
              className="rounded-xl border border-slate-700 px-6 py-3 font-bold"
            >
              Become a Customer
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-3">
        {[
          [
            "Multiple stores",
            "Each vendor owns an isolated store and catalog.",
          ],
          [
            "Secure payments",
            "Stripe Checkout handles customer payments.",
          ],
          [
            "Vendor analytics",
            "Vendors can track products, stores and revenue.",
          ],
        ].map(([title, text]) => (
          <div
            className="rounded-2xl border bg-white p-7"
            key={title}
          >
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-2 text-slate-600">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}