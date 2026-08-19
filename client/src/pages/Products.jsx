import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api.js";
import ProductCard from "../components/ProductCard.jsx";

const categories = [
  "Fashion",
  "Electronics",
  "Shoes",
  "Beauty",
  "Home",
  "Sports",
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [category, setCategory] = useState(
    searchParams.get("category") || ""
  );

  const [storeId, setStoreId] = useState(
    searchParams.get("storeId") || ""
  );

  const [minPrice, setMinPrice] = useState(
    searchParams.get("minPrice") || ""
  );

  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("maxPrice") || ""
  );

  const [sort, setSort] = useState(
    searchParams.get("sort") || "newest"
  );

  const [page, setPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  });

  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD STORES
  // =========================

  async function loadStores() {
    try {
      const { data } = await api.get("/stores");

      setStores(data.stores || []);
    } catch (error) {
      console.error("Store loading error:", error);
      setStores([]);
    }
  }

  // =========================
  // LOAD PRODUCTS
  // =========================

  async function loadProducts() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (category) {
        params.set("category", category);
      }

      if (storeId) {
        params.set("storeId", storeId);
      }

      if (minPrice) {
        params.set("minPrice", minPrice);
      }

      if (maxPrice) {
        params.set("maxPrice", maxPrice);
      }

      params.set("sort", sort);
      params.set("page", page);
      params.set("limit", 12);

      const { data } = await api.get(
        `/products?${params.toString()}`
      );

      setProducts(data.products || []);

      setPagination(
        data.pagination || {
          page,
          limit: 12,
          total: data.products?.length || 0,
          pages: 1,
        }
      );

      setSearchParams(params);
    } catch (error) {
      console.error("Product loading error:", error);

      setProducts([]);

      setPagination({
        page: 1,
        limit: 12,
        total: 0,
        pages: 1,
      });
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadStores();
  }, []);

  // =========================
  // FILTER CHANGES
  // =========================

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [
    search,
    category,
    storeId,
    minPrice,
    maxPrice,
    sort,
    page,
  ]);

  // =========================
  // RESET PAGE WHEN FILTERS CHANGE
  // =========================

  useEffect(() => {
    setPage(1);
  }, [
    search,
    category,
    storeId,
    minPrice,
    maxPrice,
    sort,
  ]);

  // =========================
  // CLEAR FILTERS
  // =========================

  function clearFilters() {
    setSearch("");
    setCategory("");
    setStoreId("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
  }

  // =========================
  // PAGE NAVIGATION
  // =========================

  function goToPage(nextPage) {
    if (
      nextPage < 1 ||
      nextPage > pagination.pages ||
      nextPage === page
    ) {
      return;
    }

    setPage(nextPage);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

        {/* =========================
            HEADER
        ========================= */}

        <div>
          <p className="font-semibold text-indigo-600">
            SHOPSPHERE MARKETPLACE
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Explore Products
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Search, filter and discover products from stores
            across ShopSphere.
          </p>
        </div>

        {/* =========================
            FILTER PANEL
        ========================= */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          {/* Search */}

          <div className="flex flex-col gap-3 md:flex-row">

            <div className="relative flex-1">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search products by name or description..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 pl-11 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />

            </div>

            <button
              type="button"
              onClick={loadProducts}
              className="rounded-xl bg-indigo-600 px-7 py-3 font-bold text-white transition hover:bg-indigo-700"
            >
              Search
            </button>

          </div>

          {/* Filters */}

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-5">

            {/* Store */}

            <select
              value={storeId}
              onChange={(e) => {
                setStoreId(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-indigo-500"
            >
              <option value="">
                All Stores
              </option>

              {stores.map((store) => (
                <option
                  key={store._id}
                  value={store._id}
                >
                  {store.name}
                </option>
              ))}
            </select>

            {/* Category */}

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-indigo-500"
            >
              <option value="">
                All Categories
              </option>

              {categories.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

            {/* Minimum price */}

            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              placeholder="Min price ₹"
              className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
            />

            {/* Maximum price */}

            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              placeholder="Max price ₹"
              className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
            />

            {/* Sort */}

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-indigo-500"
            >
              <option value="newest">
                Newest
              </option>

              <option value="price-low">
                Price: Low → High
              </option>

              <option value="price-high">
                Price: High → Low
              </option>

              <option value="name">
                Name A → Z
              </option>
            </select>

          </div>

          {/* Active filters / clear */}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">

            <p className="text-sm text-slate-500">
              {pagination.total}{" "}
              {pagination.total === 1
                ? "product"
                : "products"}{" "}
              found
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Clear Filters
            </button>

          </div>

        </section>

        {/* =========================
            PRODUCTS
        ========================= */}

        <section className="mt-10">

          {loading ? (

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {[1, 2, 3, 4, 5, 6, 7, 8].map(
                (item) => (
                  <div
                    key={item}
                    className="h-96 animate-pulse rounded-2xl bg-slate-200"
                  />
                )
              )}

            </div>

          ) : products.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">

              <div className="text-5xl">
                🔎
              </div>

              <h2 className="mt-5 text-2xl font-black">
                No products found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-slate-500">
                Try changing your search terms or
                adjusting your filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700"
              >
                Clear Filters
              </button>

            </div>

          ) : (

            <>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                ))}

              </div>

              {/* =========================
                  PAGINATION
              ========================= */}

              {pagination.pages > 1 && (

                <div className="mt-10 flex flex-wrap items-center justify-center gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      goToPage(page - 1)
                    }
                    disabled={page === 1}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Previous
                  </button>

                  {Array.from(
                    {
                      length: pagination.pages,
                    },
                    (_, index) => index + 1
                  ).map((pageNumber) => (

                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() =>
                        goToPage(pageNumber)
                      }
                      className={`h-10 w-10 rounded-lg font-bold transition ${
                        pageNumber === page
                          ? "bg-indigo-600 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {pageNumber}
                    </button>

                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      goToPage(page + 1)
                    }
                    disabled={
                      page === pagination.pages
                    }
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next →
                  </button>

                </div>

              )}

            </>

          )}

        </section>

      </div>
    </main>
  );
}