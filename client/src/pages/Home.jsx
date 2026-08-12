import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingStores, setLoadingStores] = useState(true);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");

        const productData =
          response.data?.products ||
          response.data?.data ||
          response.data ||
          [];

        setProducts(Array.isArray(productData) ? productData : []);
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await api.get("/stores");

        const storeData =
          response.data?.stores ||
          response.data?.data ||
          response.data ||
          [];

        setStores(Array.isArray(storeData) ? storeData : []);
      } catch (error) {
        console.error("Failed to load stores:", error);
        setStores([]);
      } finally {
        setLoadingStores(false);
      }
    };

    fetchStores();
  }, []);

  const categories = [
    {
      name: "Fashion",
      icon: "👕",
      description: "Trending clothes & accessories",
    },
    {
      name: "Electronics",
      icon: "💻",
      description: "Latest gadgets & technology",
    },
    {
      name: "Shoes",
      icon: "👟",
      description: "Sneakers & footwear",
    },
    {
      name: "Beauty",
      icon: "✨",
      description: "Beauty & personal care",
    },
    {
      name: "Home",
      icon: "🏠",
      description: "Everything for your home",
    },
    {
      name: "Sports",
      icon: "⚽",
      description: "Sports & fitness products",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />
          <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center lg:px-8 lg:py-28">

          {/* Hero Text */}
          <div>
            <div className="mb-5 inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200 backdrop-blur">
              🚀 Welcome to ShopSphere
            </div>

            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Discover.
              <span className="block text-indigo-400">
                Shop.
              </span>
              Enjoy.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Explore products from multiple stores, discover new brands,
              and enjoy a simple shopping experience — all in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="rounded-xl bg-indigo-500 px-6 py-3 font-bold text-white transition hover:bg-indigo-400"
              >
                Shop Products →
              </Link>

              <Link
                to="/stores"
                className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Explore Stores
              </Link>
            </div>

            {/* Small Stats */}
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
              <div>
                <p className="text-2xl font-black">100+</p>
                <p className="mt-1 text-sm text-slate-400">
                  Products
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">20+</p>
                <p className="mt-1 text-sm text-slate-400">
                  Stores
                </p>
              </div>

              <div>
                <p className="text-2xl font-black">24/7</p>
                <p className="mt-1 text-sm text-slate-400">
                  Shopping
                </p>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="relative mx-auto max-w-md">

              <div className="absolute -inset-6 rounded-[3rem] bg-indigo-500/20 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
                <div className="rounded-[1.5rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8">

                  <div className="rounded-2xl bg-white p-6 text-slate-900 shadow-xl">

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Featured
                        </p>

                        <h3 className="mt-1 text-xl font-black">
                          New Collection
                        </h3>
                      </div>

                      <div className="rounded-xl bg-indigo-100 px-3 py-2 text-xl">
                        🛍️
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="flex h-32 items-center justify-center rounded-xl bg-slate-100 text-5xl">
                        👟
                      </div>

                      <div className="flex h-32 items-center justify-center rounded-xl bg-slate-100 text-5xl">
                        🎧
                      </div>

                      <div className="flex h-32 items-center justify-center rounded-xl bg-slate-100 text-5xl">
                        👕
                      </div>

                      <div className="flex h-32 items-center justify-center rounded-xl bg-slate-100 text-5xl">
                        ⌚
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">
                          Starting from
                        </p>

                        <p className="text-xl font-black">
                          ₹499
                        </p>
                      </div>

                      <Link
                        to="/products"
                        className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white"
                      >
                        Shop
                      </Link>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-semibold text-indigo-600">
              SHOP BY CATEGORY
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Find what you love
            </h2>

            <p className="mt-3 max-w-xl text-slate-500">
              Browse popular categories and discover products from
              different stores.
            </p>
          </div>

          <Link
            to="/products"
            className="font-bold text-indigo-600 hover:text-indigo-500"
          >
            View all products →
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/products?category=${encodeURIComponent(
                category.name
              )}`}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-3xl transition group-hover:bg-indigo-100">
                {category.icon}
              </div>

              <h3 className="mt-4 font-bold">
                {category.name}
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {category.description}
              </p>

            </Link>
          ))}

        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="bg-white py-16">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>
              <p className="font-semibold text-indigo-600">
                FEATURED PRODUCTS
              </p>

              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Popular right now
              </h2>

              <p className="mt-3 text-slate-500">
                Check out some of the latest products available on
                ShopSphere.
              </p>
            </div>

            <Link
              to="/products"
              className="font-bold text-indigo-600 hover:text-indigo-500"
            >
              View all →
            </Link>

          </div>

          {loadingProducts ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-80 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <div className="text-4xl">📦</div>

              <h3 className="mt-4 text-xl font-bold">
                No products available
              </h3>

              <p className="mt-2 text-slate-500">
                Products will appear here once they are added.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

              {products.slice(0, 8).map((product) => (

                <Link
                  key={product._id}
                  to="/products"
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* Product Image */}
                  <div className="relative flex h-56 items-center justify-center overflow-hidden bg-slate-100">

                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-6xl">
                        🛍️
                      </div>
                    )}

                    <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold shadow">
                      Featured
                    </div>

                  </div>

                  {/* Product Details */}
                  <div className="p-5">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {product.category || "Product"}
                    </p>

                    <h3 className="mt-2 line-clamp-1 text-lg font-bold">
                      {product.name || "Product"}
                    </h3>

                    <div className="mt-4 flex items-center justify-between">

                      <p className="text-xl font-black text-slate-900">
                        ₹{product.price ?? "—"}
                      </p>

                      <span className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white">
                        View
                      </span>

                    </div>

                  </div>

                </Link>

              ))}

            </div>
          )}

        </div>
      </section>

      {/* ================= STORES ================= */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>
            <p className="font-semibold text-indigo-600">
              DISCOVER STORES
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Explore our stores
            </h2>

            <p className="mt-3 text-slate-500">
              Discover different vendors and shop their collections.
            </p>
          </div>

          <Link
            to="/stores"
            className="font-bold text-indigo-600 hover:text-indigo-500"
          >
            Explore all stores →
          </Link>

        </div>

        {loadingStores ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <div className="text-4xl">🏪</div>

            <h3 className="mt-4 text-xl font-bold">
              No stores available
            </h3>

            <p className="mt-2 text-slate-500">
              Stores will appear here once vendors create them.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {stores.slice(0, 6).map((store) => (

              <Link
                key={store._id}
                to={`/store/${store.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >

                <div className="flex items-center gap-5">

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-100 text-3xl">

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

                  <div className="min-w-0">

                    <h3 className="truncate text-xl font-black">
                      {store.name || "Store"}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {store.description ||
                        "Discover products from this store."}
                    </p>

                  </div>

                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                  <span className="text-sm font-semibold text-slate-500">
                    Visit store
                  </span>

                  <span className="font-bold text-indigo-600 transition group-hover:translate-x-1">
                    →
                  </span>

                </div>

              </Link>

            ))}

          </div>
        )}

      </section>

      {/* ================= WHY SHOPSPHERE ================= */}
      <section className="bg-slate-950 py-16 text-white">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <p className="font-semibold text-indigo-400">
              WHY SHOPSPHERE?
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Shopping made simple
            </h2>

            <p className="mt-4 text-slate-400">
              Everything you need for a smooth and enjoyable shopping
              experience.
            </p>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
              <div className="text-4xl">🛍️</div>

              <h3 className="mt-5 text-xl font-bold">
                Multiple Stores
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Explore products from different vendors and stores
                through one convenient platform.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
              <div className="text-4xl">🔒</div>

              <h3 className="mt-5 text-xl font-bold">
                Secure Shopping
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Shop with confidence using secure authentication and
                protected checkout workflows.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
              <div className="text-4xl">⚡</div>

              <h3 className="mt-5 text-xl font-bold">
                Simple Experience
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Discover products, manage your cart, and place orders
                through a clean and simple interface.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-white shadow-xl md:px-12">

          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">

            <div>

              <h2 className="text-3xl font-black sm:text-4xl">
                Ready to start shopping?
              </h2>

              <p className="mt-3 max-w-xl text-indigo-100">
                Explore products and stores on ShopSphere today.
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <Link
                to="/products"
                className="rounded-xl bg-white px-6 py-3 font-bold text-indigo-600 transition hover:bg-indigo-50"
              >
                Start Shopping
              </Link>

              <Link
                to="/stores"
                className="rounded-xl border border-white/30 px-6 py-3 font-bold text-white transition hover:bg-white/10"
              >
                Explore Stores
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">

          <div>
            <p className="text-lg font-black text-slate-900">
              ShopSphere
            </p>

            <p className="mt-1">
              Your multi-store shopping platform.
            </p>
          </div>

          <div className="flex gap-6">

            <Link
              to="/products"
              className="hover:text-indigo-600"
            >
              Products
            </Link>

            <Link
              to="/stores"
              className="hover:text-indigo-600"
            >
              Stores
            </Link>

            <Link
              to="/login"
              className="hover:text-indigo-600"
            >
              Login
            </Link>

          </div>

        </div>

      </footer>

    </div>
  );
}