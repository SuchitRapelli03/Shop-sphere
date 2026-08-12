import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api.js";

export default function Store() {
  const { slug } = useParams();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStore() {
      try {
        setLoading(true);
        setError("");

        // Get the individual store using its slug
        const { data } = await api.get(`/stores/slug/${slug}`);

        setStore(data.store);

        // Get products belonging to this store
        if (data.store?._id) {
          const productResponse = await api.get(
            `/products?storeId=${data.store._id}`
          );

          setProducts(productResponse.data.products || []);
        }
      } catch (err) {
        console.error("Failed to load store:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load this store."
        );
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadStore();
    }
  }, [slug]);

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse rounded-2xl bg-white p-8">
            <div className="h-8 w-1/3 rounded bg-slate-200" />
            <div className="mt-4 h-5 w-1/2 rounded bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  // Error
  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-10 text-center">

          <div className="text-5xl">⚠️</div>

          <h1 className="mt-4 text-2xl font-black">
            Unable to load store
          </h1>

          <p className="mt-3 text-slate-600">
            {error}
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Store: {slug}
          </p>

          <Link
            to="/stores"
            className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white"
          >
            ← Back to Stores
          </Link>

        </div>
      </main>
    );
  }

  // Store not found
  if (!store) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">

          <div className="text-6xl">🏪</div>

          <h1 className="mt-5 text-3xl font-black">
            Store not found
          </h1>

          <p className="mt-3 text-slate-600">
            We couldn't find this store.
          </p>

          <Link
            to="/stores"
            className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white"
          >
            ← Back to Stores
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* Store Header */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

          <Link
            to="/stores"
            className="text-sm font-semibold text-indigo-300 hover:text-indigo-200"
          >
            ← Back to Stores
          </Link>

          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center">

            {/* Store Logo */}
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-white text-5xl">

              {store.logo ? (
                <img
                  src={store.logo}
                  alt={store.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                "🏪"
              )}

            </div>

            {/* Store Information */}
            <div>

              <p className="text-sm font-bold uppercase tracking-wider text-indigo-400">
                ShopSphere Store
              </p>

              <h1 className="mt-2 text-4xl font-black">
                {store.name}
              </h1>

              <p className="mt-3 max-w-2xl text-slate-300">
                {store.description ||
                  "Discover amazing products from this store."}
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

        <div className="flex items-end justify-between">

          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
              Store Products
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Products
            </h2>
          </div>

          <Link
            to="/products"
            className="font-bold text-indigo-600 hover:text-indigo-500"
          >
            View All Products →
          </Link>

        </div>

        {products.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed bg-white p-12 text-center">

            <div className="text-5xl">📦</div>

            <h3 className="mt-4 text-xl font-bold">
              No products available
            </h3>

            <p className="mt-2 text-slate-600">
              This store doesn't have any active products yet.
            </p>

          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {products.map((product) => (
              <div
                key={product._id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                {/* Product Image */}
                <div className="flex h-52 items-center justify-center bg-slate-100">

                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">
                      📦
                    </span>
                  )}

                </div>

                {/* Product Details */}
                <div className="p-5">

                  <h3 className="text-lg font-bold">
                    {product.name}
                  </h3>

                  {product.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between">

                    <span className="text-xl font-black text-indigo-600">
                      ₹{product.price}
                    </span>

                    <span className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-600">
                      Stock: {product.stock}
                    </span>

                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

      </section>
    </main>
  );
}