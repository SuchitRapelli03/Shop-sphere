import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStores() {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get("/stores");

        setStores(
          Array.isArray(data)
            ? data
            : data.stores || []
        );
      } catch (err) {
        console.error("STORES ERROR:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load stores."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStores();
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f1e9]">

      {/* Hero */}
      <section className="border-b border-[#e3d8c8] bg-[#e5f1f3]">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#674936]">
              ShopSphere Marketplace
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#18352f] sm:text-5xl">
              Discover Stores
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Explore trusted sellers and discover products
              from stores across ShopSphere.
            </p>
          </div>
        </div>
      </section>

      {/* Stores */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-3xl border border-[#ded4c6] bg-white"
              >
                <div className="h-40 bg-[#e9e1d5]" />

                <div className="space-y-4 p-6">
                  <div className="h-6 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-4 w-4/5 rounded bg-slate-200" />
                  <div className="h-10 w-32 rounded-xl bg-slate-200" />
                </div>
              </div>
            ))}

          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">

            <div className="text-6xl">
              🏪
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900">
              Stores unavailable
            </h2>

            <p className="mt-3 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-7 rounded-xl bg-[#674936] px-6 py-3 font-black text-white transition hover:bg-[#533824]"
            >
              Try Again
            </button>

          </div>
        )}

        {/* Empty */}
        {!loading && !error && stores.length === 0 && (
          <div className="rounded-3xl border border-[#ded4c6] bg-white px-6 py-16 text-center shadow-sm">

            <div className="text-7xl">
              🏪
            </div>

            <h2 className="mt-6 text-2xl font-black text-slate-900">
              No stores found
            </h2>

            <p className="mx-auto mt-3 max-w-md text-slate-500">
              There are no stores available right now.
              Please check back later.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex rounded-xl bg-[#674936] px-6 py-3 font-black text-white transition hover:bg-[#533824]"
            >
              Browse Products
            </Link>

          </div>
        )}

        {/* Store Grid */}
        {!loading && !error && stores.length > 0 && (
          <>
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#18352f]">
                  All Stores
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {stores.length}{" "}
                  {stores.length === 1 ? "store" : "stores"} available
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {stores.map((store) => {
                const storeId =
                  store._id || store.id;

                const storeName =
                  store.name || "Unnamed Store";

                const storeDescription =
                  store.description ||
                  "Discover products from this ShopSphere store.";

                const storeImage =
                  store.image ||
                  store.logo ||
                  store.imageUrl ||
                  "";

                const slug =
                  store.slug || storeId;

                return (
                  <article
                    key={storeId}
                    className="group overflow-hidden rounded-3xl border border-[#ded4c6] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >

                    {/* Store Image */}
                    <div className="relative flex h-44 items-center justify-center overflow-hidden bg-[#e5f1f3]">

                      {storeImage ? (
                        <img
                          src={storeImage}
                          alt={storeName}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm">
                          🏪
                        </div>
                      )}

                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[#674936] backdrop-blur">
                        ShopSphere Store
                      </div>

                    </div>

                    {/* Store Info */}
                    <div className="p-6">

                      <h3 className="text-xl font-black text-[#18352f]">
                        {storeName}
                      </h3>

                      <p className="mt-3 line-clamp-2 min-h-[48px] text-sm leading-6 text-slate-500">
                        {storeDescription}
                      </p>

                      <div className="mt-6 flex items-center justify-between gap-3">

                        <span className="inline-flex items-center gap-2 rounded-full bg-[#e5f1f3] px-3 py-2 text-xs font-bold text-[#365f66]">
                          ✓ Verified Store
                        </span>

                        <Link
                          to={`/store/${slug}`}
                          className="inline-flex items-center rounded-xl bg-[#674936] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#533824]"
                        >
                          Visit Store →
                        </Link>

                      </div>

                    </div>
                  </article>
                );
              })}

            </div>
          </>
        )}

      </section>
    </main>
  );
}