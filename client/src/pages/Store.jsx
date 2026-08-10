import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStores() {
      try {
        const { data } = await api.get("/stores");
        setStores(data.stores || []);
      } catch (error) {
        console.error("Failed to load stores:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStores();
  }, []);

  const filteredStores = stores.filter((store) => {
    const text = search.toLowerCase();

    return (
      store.name?.toLowerCase().includes(text) ||
      store.description?.toLowerCase().includes(text)
    );
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black">
          Explore Stores
        </h1>

        <p className="mt-2 text-slate-600">
          Discover stores and shop from different vendors.
        </p>
      </div>

      {/* Search */}
      <div className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="relative">
          <span className="absolute left-4 top-3 text-xl">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search stores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border p-3 pl-12 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Stores */}
      {loading ? (
        <div className="mt-10">
          <p className="text-slate-600">
            Loading stores...
          </p>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="mt-10 rounded-2xl border bg-white p-10 text-center">
          <h2 className="text-xl font-bold">
            No stores found
          </h2>

          <p className="mt-2 text-slate-600">
            Try a different store name or search term.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStores.map((store) => (
            <Link
              to={`/store/${store.slug}`}
              key={store._id}
              className="overflow-hidden rounded-2xl border bg-white p-4 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={
                  store.logo ||
                  "https://placehold.co/600x300?text=Store"
                }
                alt={store.name}
                className="h-40 w-full rounded-xl object-cover"
              />

              <h2 className="mt-4 text-xl font-bold">
                {store.name}
              </h2>

              <p className="mt-2 text-slate-600">
                {store.description ||
                  "No description available."}
              </p>

              <div className="mt-4 font-semibold text-indigo-600">
                Visit Store →
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}