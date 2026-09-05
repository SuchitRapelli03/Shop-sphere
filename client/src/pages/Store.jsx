import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api.js";
import ProductCard from "../components/ProductCard.jsx";

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
        const { data } = await api.get(
          `/stores/slug/${slug}`
        );

        setStore(data.store);

        // Get products belonging to this store
        if (data.store?._id) {
          const productResponse = await api.get(
            `/products?storeId=${data.store._id}`
          );

          setProducts(
            productResponse.data.products || []
          );
        }
      } catch (err) {
        console.error(
          "Failed to load store:",
          err
        );

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

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f1e9] px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="animate-pulse rounded-[1.75rem] border border-[#ded5ca] bg-[#eee9e0] p-8">

            <div className="h-28 w-28 rounded-3xl bg-[#ded5ca]" />

            <div className="mt-6 h-4 w-32 rounded bg-[#ded5ca]" />

            <div className="mt-3 h-10 w-1/3 rounded bg-[#ded5ca]" />

            <div className="mt-4 h-5 w-1/2 rounded bg-[#ded5ca]" />

          </div>

        </div>
      </main>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <main className="min-h-screen bg-[#f5f1e9] px-5 py-16 lg:px-8">

        <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-[#ded5ca] bg-[#eee9e0] p-10 text-center">

          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-black text-[#30251f]">
            Unable to load store
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#81766d]">
            {error}
          </p>

          <p className="mt-2 text-xs text-[#9a8f85]">
            Store: {slug}
          </p>

          <Link
            to="/stores"
            className="mt-6 inline-block rounded-xl bg-[#674936] px-6 py-3 text-sm font-black text-[#f8f1e8] transition hover:bg-[#543a2b]"
          >
            ← Back to Stores
          </Link>

        </div>

      </main>
    );
  }

  /* =========================================================
     STORE NOT FOUND
  ========================================================= */

  if (!store) {
    return (
      <main className="min-h-screen bg-[#f5f1e9] px-5 py-16 lg:px-8">

        <div className="mx-auto max-w-3xl text-center">

          <div className="text-6xl">
            🏪
          </div>

          <h1 className="mt-5 text-3xl font-black text-[#30251f]">
            Store not found
          </h1>

          <p className="mt-3 text-sm text-[#81766d]">
            We couldn't find this store.
          </p>

          <Link
            to="/stores"
            className="mt-6 inline-block rounded-xl bg-[#674936] px-6 py-3 text-sm font-black text-[#f8f1e8] transition hover:bg-[#543a2b]"
          >
            ← Back to Stores
          </Link>

        </div>

      </main>
    );
  }

  /* =========================================================
     STORE PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f5f1e9] text-[#30251f]">

      {/* =====================================================
            STORE HEADER
        ===================================================== */}

        <section className="border-b border-[#ded5ca] bg-[#f5f1e9]">

          <div className="mx-auto max-w-7xl px-5 lg:px-8">

            {/* Back link */}

            <div className="pt-6">
              <Link
                to="/stores"
                className="text-xs font-black text-[#64939c] transition hover:text-[#4f7e85]"
              >
                ← Back to Stores
              </Link>
            </div>

            {/* Banner + Logo */}

            <div className="relative mt-5">

              {store.banner ? (
                <div className="h-52 w-full overflow-hidden rounded-[1.75rem] bg-[#e5f1f3] sm:h-60 lg:h-64">
                  <img
                    src={store.banner}
                    alt={`${store.name} banner`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-52 w-full rounded-[1.75rem] bg-[#e5f1f3] sm:h-60 lg:h-64" />
              )}

              {/* Store Logo overlapping banner */}

              <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2">

                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.75rem] border-4 border-[#f5f1e9] bg-[#f5f1e9] text-5xl shadow-lg sm:h-32 sm:w-32">

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

              </div>

            </div>

            {/* Store Information */}

            <div className="px-2 pb-10 pt-20 text-center">

              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6a9aa2]">
                ShopSphere Store
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#30251f] sm:text-4xl">
                {store.name}
              </h1>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#746a62]">
                {store.description ||
                  "Discover amazing products from this store."}
              </p>

              {/* Store status */}

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#c7dfe2] bg-[#f0f7f8] px-3 py-1.5">

                <span className="h-2 w-2 rounded-full bg-[#6a9aa2]" />

                <span className="text-[10px] font-black uppercase tracking-wider text-[#55777d]">
                  Active Store
                </span>

              </div>

            </div>

          </div>

        </section>


      {/* =====================================================
          STORE PRODUCTS
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">

        {/* Section heading */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6a9aa2]">
              Store Products
            </p>

            <h2 className="mt-2 text-3xl font-black text-[#30251f]">
              Products
            </h2>

            <p className="mt-1 text-sm text-[#81766d]">
              {products.length}{" "}
              {products.length === 1
                ? "product"
                : "products"}{" "}
              available
            </p>

          </div>

          <Link
            to="/products"
            className="rounded-xl bg-[#674936] px-4 py-2.5 text-center text-xs font-black text-[#f8f1e8] transition hover:bg-[#543a2b]"
          >
            View All Products →
          </Link>

        </div>


        {/* ===================================================
            NO PRODUCTS
        =================================================== */}

        {products.length === 0 ? (

          <div className="mt-8 rounded-[1.75rem] border border-dashed border-[#cfc4b8] bg-[#eee9e0] px-6 py-16 text-center">

            <div className="text-5xl">
              📦
            </div>

            <h3 className="mt-4 text-xl font-black text-[#30251f]">
              No products available
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#81766d]">
              This store doesn't have any active products yet.
            </p>

          </div>

        ) : (

          /* =================================================
             PRODUCT GRID
          ================================================= */

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

            {products.map((product) => (

              <ProductCard
                key={product._id}
                product={product}
              />

            ))}

          </div>

        )}

      </section>

    </main>
  );
}
