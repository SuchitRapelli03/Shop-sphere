import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [storeId, setStoreId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");

  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (storeId) params.set("storeId", storeId);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);

      params.set("sort", sort);

      const { data } = await api.get(
        `/products?${params.toString()}`
      );

      setProducts(data.products || []);
    } catch (error) {
      console.error("Product loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStores() {
    try {
      const { data } = await api.get("/stores");
      setStores(data.stores || []);
    } catch (error) {
      console.error("Store loading error:", error);
    }
  }

  useEffect(() => {
    loadStores();
  }, []);

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
  ]);

  function clearFilters() {
    setSearch("");
    setCategory("");
    setStoreId("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-black">
          Explore Products
        </h1>

        <p className="mt-2 text-slate-600">
          Search and discover products from all stores.
        </p>
      </div>

      {/* Advanced Search */}
      <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">

        {/* Search bar */}
        <div className="flex flex-col gap-3 md:flex-row">

          <div className="relative flex-1">
            <span className="absolute left-4 top-3 text-xl">
              🔍
            </span>

            <input
              className="w-full rounded-xl border p-3 pl-12 outline-none focus:border-indigo-500"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <button
            onClick={loadProducts}
            className="rounded-xl bg-indigo-600 px-7 py-3 font-bold text-white"
          >
            Search
          </button>

        </div>

        {/* Filters */}
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-5">

          {/* Store */}
          <select
            value={storeId}
            onChange={(e) =>
              setStoreId(e.target.value)
            }
            className="rounded-xl border p-3"
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
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="rounded-xl border p-3"
          >
            <option value="">
              All Categories
            </option>

            <option value="Electronics">
              Electronics
            </option>

            <option value="Clothing">
              Clothing
            </option>

            <option value="Shoes">
              Shoes
            </option>

            <option value="Accessories">
              Accessories
            </option>

            <option value="Home">
              Home
            </option>
          </select>

          {/* Min price */}
          <input
            type="number"
            min="0"
            placeholder="Min price ₹"
            value={minPrice}
            onChange={(e) =>
              setMinPrice(e.target.value)
            }
            className="rounded-xl border p-3"
          />

          {/* Max price */}
          <input
            type="number"
            min="0"
            placeholder="Max price ₹"
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(e.target.value)
            }
            className="rounded-xl border p-3"
          />

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
            className="rounded-xl border p-3"
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

        {/* Clear */}
        <button
          onClick={clearFilters}
          className="mt-5 rounded-lg border px-5 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Clear Filters
        </button>

      </section>

      {/* Products */}
      <section className="mt-10">

        {loading ? (
          <p className="text-slate-600">
            Loading products...
          </p>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <h2 className="text-xl font-bold">
              No products found
            </h2>

            <p className="mt-2 text-slate-600">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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