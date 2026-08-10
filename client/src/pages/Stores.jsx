import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/stores")
      .then((response) => {
        setStores(response.data.stores || []);
      })
      .catch((error) => {
        console.error("Failed to load stores:", error);
        setError("Unable to load stores.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-3xl font-bold">Loading stores...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-3xl font-bold text-red-600">{error}</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-8 text-4xl font-black">Explore Stores</h1>

      {stores.length === 0 ? (
        <div className="rounded-2xl border bg-white p-8 text-center">
          <h2 className="text-xl font-bold">No stores available yet</h2>
          <p className="mt-2 text-slate-600">
            Vendors haven't created any stores yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <Link
              to={`/store/${store.slug}`}
              key={store._id}
              className="overflow-hidden rounded-2xl border bg-white p-4 transition hover:shadow-lg"
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
                {store.description || "No description available."}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
