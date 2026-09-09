import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api.js";
import ProductCard from "../components/ProductCard.jsx";

const categories = [
  "Fashion",
  "Electronics",
  "Beauty",
  "Home & Living",
  "Food",
  "Grocery",
  "Stationery",
  "Tools",
  "Arts",
];

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 12,
  total: 0,
  pages: 1,
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);

  const [category, setCategory] = useState(
    searchParams.get("category") || ""
  );

  const [subcategory, setSubcategory] = useState(
    searchParams.get("subcategory") || ""
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

  const [pagination, setPagination] = useState(
    DEFAULT_PAGINATION
  );

  const [loading, setLoading] = useState(true);

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  /*
   * SEARCH ALWAYS COMES FROM THE URL.
   *
   * Example:
   *
   * /products?search=headphones
   * /products?search=mouse
   * /products?search=speaker
   *
   * Changing the URL search automatically updates the page.
   */
  const currentSearch = searchParams.get("search") || "";

  // =========================================================
  // LOAD STORES
  // =========================================================

  async function loadStores() {
    try {
      const { data } = await api.get("/stores");

      setStores(data.stores || []);
    } catch (error) {
      console.error("Store loading error:", error);
      setStores([]);
    }
  }

  // =========================================================
  // BUILD PRODUCT QUERY
  // =========================================================

  function buildProductParams() {
    const params = new URLSearchParams();

    if (currentSearch.trim()) {
      params.set("search", currentSearch.trim());
    }

    if (category) {
      params.set("category", category);
    }

    if (subcategory) {
      params.set("subcategory", subcategory);
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

    return params;
  }

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  async function loadProducts() {
    try {
      setLoading(true);

      const params = buildProductParams();

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
    } catch (error) {
      console.error("Product loading error:", error);

      setProducts([]);

      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadStores();
  }, []);

  // =========================================================
  // LOAD PRODUCTS WHEN SEARCH / FILTERS CHANGE
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 250);

    return () => clearTimeout(timer);
  }, [
    currentSearch,
    category,
    subcategory,
    storeId,
    minPrice,
    maxPrice,
    sort,
    page,
  ]);

  // =========================================================
  // KEEP URL IN SYNC WITH FILTERS
  // =========================================================

  useEffect(() => {
    const params = new URLSearchParams();

    if (currentSearch.trim()) {
      params.set("search", currentSearch.trim());
    }

    if (category) {
      params.set("category", category);
    }

    if (subcategory) {
      params.set("subcategory", subcategory);
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

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    /*
     * Only update the URL when something actually changed.
     *
     * This prevents an infinite update loop.
     */
    if (nextQuery !== currentQuery) {
      setSearchParams(params, { replace: true });
    }
  }, [
    currentSearch,
    category,
    subcategory,
    storeId,
    minPrice,
    maxPrice,
    sort,
    page,
  ]);

  // =========================================================
  // RESET PAGE WHEN FILTERS CHANGE
  // =========================================================

  useEffect(() => {
    setPage(1);
  }, [
    category,
    subcategory,
    storeId,
    minPrice,
    maxPrice,
    sort,
  ]);

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  function clearFilters() {
    setCategory("");
    setSubcategory("");
    setStoreId("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);

    /*
     * Preserve the Navbar search.
     *
     * Example:
     *
     * /products?search=headphones&category=Shoes
     *
     * becomes:
     *
     * /products?search=headphones
     */
    const params = new URLSearchParams();

    if (currentSearch.trim()) {
      params.set("search", currentSearch.trim());
    }

    params.set("sort", "newest");
    params.set("page", "1");
    params.set("limit", "12");

    setSearchParams(params, { replace: true });

    setMobileFiltersOpen(false);
  }

  // =========================================================
  // PAGE NAVIGATION
  // =========================================================

  function goToPage(nextPage) {
    if (
      nextPage < 1 ||
      nextPage > pagination.pages ||
      nextPage === page
    ) {
      return;
    }

    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================================================
  // REMOVE INDIVIDUAL FILTER
  // =========================================================

  function removeFilter(type) {
    if (type === "category") {
      setCategory("");
    }

    if (type === "subcategory") {
      setSubcategory("");
    }

    if (type === "store") {
      setStoreId("");
    }

    if (type === "price") {
      setMinPrice("");
      setMaxPrice("");
    }

    setPage(1);
  }

  // =========================================================
  // ACTIVE FILTER COUNT
  // =========================================================

  const activeFilterCount =
    (category ? 1 : 0) +
    (storeId ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0);

  const selectedStore = stores.find(
    (store) => store._id === storeId
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="min-h-screen bg-[#f5f1e9] text-[#30251f]">

      {/* =====================================================
          PAGE INTRO
      ===================================================== */}

      <section className="border-b border-[#ded5ca] bg-[#e5f1f3]">

        <div className="mx-auto max-w-7xl px-5 py-9 lg:px-8">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#6a9aa2]">
                ShopSphere marketplace
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-[#30251f] sm:text-4xl">
                Explore products
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#746a62]">
                Discover products from different stores,
                all gathered in one sphere.
              </p>

            </div>

            <div className="rounded-2xl border border-[#c7dfe2] bg-[#f0f7f8] px-5 py-3">

              <p className="text-[10px] font-black uppercase tracking-wider text-[#75949a]">
                Marketplace
              </p>

              <p className="mt-0.5 text-lg font-black text-[#674936]">
                {pagination.total}{" "}
                {pagination.total === 1
                  ? "product"
                  : "products"}
              </p>

            </div>

          </div>

          {/* SEARCH CONTEXT */}

          {currentSearch && (

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#bcd7db] bg-[#f1f8f9] px-4 py-2">

              <span className="text-sm">
                🔎
              </span>

              <span className="text-xs font-semibold text-[#55777d]">
                Results for
              </span>

              <span className="max-w-[220px] truncate text-xs font-black text-[#674936] sm:max-w-none">
                "{currentSearch}"
              </span>

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          CATEGORY STRIP
      ===================================================== */}

      <section className="border-b border-[#ded5ca] bg-[#f8f5ef]">

        <div className="mx-auto max-w-7xl px-5 py-5 lg:px-8">

          <div className="flex gap-2 overflow-x-auto pb-1">

            <button
              type="button"
              onClick={() => {
                setCategory("");
                setSubcategory("");
                setPage(1);
              }}
              className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-black transition ${
                !category
                  ? "bg-[#674936] text-[#f8f1e8] shadow-sm"
                  : "border border-[#d8cec2] bg-[#eee9e0] text-[#6d6259] hover:border-[#9fcbd1] hover:bg-[#e5f1f2]"
              }`}
            >
              All
            </button>

            {categories.map((item) => (

              <button
                key={item}
                type="button"
                onClick={() => {
                  setCategory(
                    category === item ? "" : item
                  );
                  setSubcategory("");
                  setPage(1);
                }}
                className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-black transition ${
                  category === item
                    ? "bg-[#674936] text-[#f8f1e8] shadow-sm"
                    : "border border-[#d8cec2] bg-[#eee9e0] text-[#6d6259] hover:border-[#9fcbd1] hover:bg-[#e5f1f2]"
                }`}
              >
                {item}
              </button>

            ))}

          </div>

        </div>

      </section>


      {/* =====================================================
          FILTER / SORT TOOLBAR
      ===================================================== */}

      <section className="sticky top-0 z-30 border-b border-[#ded5ca] bg-[#f5f1e9]/95 backdrop-blur-md">

        <div className="mx-auto max-w-7xl px-5 py-3 lg:px-8">

          <div className="flex items-center justify-between gap-3">

            {/* MOBILE FILTER BUTTON */}

            <button
              type="button"
              onClick={() =>
                setMobileFiltersOpen(
                  (previous) => !previous
                )
              }
              className="flex items-center gap-2 rounded-xl border border-[#d3c9bd] bg-[#eee9e0] px-4 py-2.5 text-xs font-black text-[#5e5148] transition hover:bg-[#e6f0f1] md:hidden"
            >
              <span>☷</span>

              Filters

              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#674936] px-1 text-[9px] text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>


            {/* DESKTOP FILTERS */}

            <div className="hidden items-center gap-2 md:flex">

              <span className="text-xs font-black uppercase tracking-wider text-[#81756b]">
                Filter by
              </span>

              {/* STORE */}

              <select
                value={storeId}
                onChange={(e) => {
                  setStoreId(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-[#d3c9bd] bg-[#eee9e0] px-3 py-2.5 text-xs font-bold text-[#5e5148] outline-none transition focus:border-[#91c4cb]"
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


              {/* MIN PRICE */}

              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
                placeholder="Min ₹"
                className="w-24 rounded-xl border border-[#d3c9bd] bg-[#eee9e0] px-3 py-2.5 text-xs font-bold text-[#5e5148] outline-none placeholder:text-[#9a8f85] focus:border-[#91c4cb]"
              />


              {/* MAX PRICE */}

              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
                placeholder="Max ₹"
                className="w-24 rounded-xl border border-[#d3c9bd] bg-[#eee9e0] px-3 py-2.5 text-xs font-bold text-[#5e5148] outline-none placeholder:text-[#9a8f85] focus:border-[#91c4cb]"
              />


              {/* CLEAR */}

              {activeFilterCount > 0 && (

                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-2 text-xs font-black text-[#674936] hover:text-[#4d3427]"
                >
                  Clear all
                </button>

              )}

            </div>


            {/* SORT */}

            <div className="ml-auto flex items-center gap-2">

              <span className="hidden text-xs font-bold text-[#897d73] sm:block">
                Sort by
              </span>

              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-[#d3c9bd] bg-[#eee9e0] px-3 py-2.5 text-xs font-black text-[#5e5148] outline-none focus:border-[#91c4cb]"
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

          </div>


          {/* =================================================
              MOBILE FILTER PANEL
          ================================================= */}

          {mobileFiltersOpen && (

            <div className="mt-4 grid gap-3 border-t border-[#ddd3c7] pt-4 md:hidden">

              <select
                value={storeId}
                onChange={(e) => {
                  setStoreId(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-[#d3c9bd] bg-[#eee9e0] p-3 text-sm font-semibold text-[#5e5148] outline-none"
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


              <div className="grid grid-cols-2 gap-3">

                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Minimum price ₹"
                  className="rounded-xl border border-[#d3c9bd] bg-[#eee9e0] p-3 text-sm outline-none"
                />

                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Maximum price ₹"
                  className="rounded-xl border border-[#d3c9bd] bg-[#eee9e0] p-3 text-sm outline-none"
                />

              </div>


              {activeFilterCount > 0 && (

                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl bg-[#674936] px-4 py-3 text-xs font-black text-[#f8f1e8]"
                >
                  Clear all filters
                </button>

              )}

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          ACTIVE FILTERS
      ===================================================== */}

      {(category ||
        storeId ||
        minPrice ||
        maxPrice) && (

        <div className="mx-auto max-w-7xl px-5 pt-6 lg:px-8">

          <div className="flex flex-wrap items-center gap-2">

            <span className="mr-1 text-[10px] font-black uppercase tracking-wider text-[#897d73]">
              Applied
            </span>


            {/* CATEGORY */}

            {category && (

              <button
                type="button"
                onClick={() => removeFilter("category")}
                className="rounded-full border border-[#c4dfe2] bg-[#e4f0f2] px-3 py-1.5 text-xs font-bold text-[#55757c]"
              >
                {category} ×
              </button>

            )}

            {subcategory && (

              <button
                type="button"
                onClick={() => removeFilter("subcategory")}
                className="rounded-full border border-[#c4dfe2] bg-[#e4f0f2] px-3 py-1.5 text-xs font-bold text-[#55757c]"
              >
                {subcategory} ×
              </button>

            )}


            {/* STORE */}

            {selectedStore && (

              <button
                type="button"
                onClick={() => removeFilter("store")}
                className="rounded-full border border-[#c4dfe2] bg-[#e4f0f2] px-3 py-1.5 text-xs font-bold text-[#55757c]"
              >
                {selectedStore.name} ×
              </button>

            )}


            {/* PRICE */}

            {(minPrice || maxPrice) && (

              <button
                type="button"
                onClick={() => removeFilter("price")}
                className="rounded-full border border-[#d9c6b7] bg-[#eee1d7] px-3 py-1.5 text-xs font-bold text-[#765744]"
              >
                ₹{minPrice || "0"} – ₹
                {maxPrice || "∞"} ×
              </button>

            )}

          </div>

        </div>

      )}


      {/* =====================================================
          PRODUCT GRID
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">

        {loading ? (

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

            {[1, 2, 3, 4, 5, 6, 7, 8].map(
              (item) => (

                <div
                  key={item}
                  className="h-80 animate-pulse rounded-2xl bg-[#e3ddd4]"
                />

              )
            )}

          </div>

        ) : products.length === 0 ? (

          <div className="rounded-[1.75rem] border border-dashed border-[#cfc4b8] bg-[#eee9e0] px-6 py-16 text-center">

            <div className="text-5xl">
              🛍️
            </div>

            <h2 className="mt-5 text-2xl font-black text-[#30251f]">
              Nothing found here
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#81766d]">
              {currentSearch
                ? `We couldn't find anything matching "${currentSearch}". Try another search or adjust your filters.`
                : "Try another category or adjust your filters. There might be something lovely hiding elsewhere in the sphere."}
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-xl bg-[#674936] px-6 py-3 text-sm font-black text-[#f8f1e8] transition hover:bg-[#563b2c]"
            >
              Clear filters
            </button>

          </div>

        ) : (

          <>

            {/* RESULTS SUMMARY */}

            <div className="mb-5 flex items-center justify-between">

              <p className="text-xs font-bold text-[#81766d]">

                Showing{" "}

                <span className="font-black text-[#4e4037]">
                  {products.length}
                </span>{" "}

                of{" "}

                <span className="font-black text-[#4e4037]">
                  {pagination.total}
                </span>{" "}

                products

              </p>

            </div>


            {/* PRODUCT GRID */}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

              {products.map((product) => (

                <ProductCard
                  key={product._id}
                  product={product}
                />

              ))}

            </div>


            {/* =================================================
                PAGINATION
            ================================================= */}

            {pagination.pages > 1 && (

              <div className="mt-12 flex flex-wrap items-center justify-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    goToPage(page - 1)
                  }
                  disabled={page === 1}
                  className="rounded-xl border border-[#d5cbc0] bg-[#eee9e0] px-4 py-2.5 text-xs font-black text-[#63574e] transition hover:bg-[#e3eff0] disabled:cursor-not-allowed disabled:opacity-40"
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
                    className={`h-10 w-10 rounded-xl text-xs font-black transition ${
                      pageNumber === page
                        ? "bg-[#674936] text-[#f8f1e8] shadow-sm"
                        : "border border-[#d5cbc0] bg-[#eee9e0] text-[#63574e] hover:bg-[#e3eff0]"
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
                  className="rounded-xl border border-[#d5cbc0] bg-[#eee9e0] px-4 py-2.5 text-xs font-black text-[#63574e] transition hover:bg-[#e3eff0] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>

              </div>

            )}

          </>

        )}

      </section>

    </main>
  );
}