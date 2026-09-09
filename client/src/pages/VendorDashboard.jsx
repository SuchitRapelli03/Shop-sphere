import React, { useEffect, useState } from "react";
import api from "../services/api.js";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function VendorDashboard() {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);

  const [store, setStore] = useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
    banner: "",
  });

  const [product, setProduct] = useState({
    storeId: "",
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    subcategory: "",
    images: [],
    variants: [],
  });

  const [editingStoreId, setEditingStoreId] = useState(null);

  const [editStore, setEditStore] = useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
    banner: "",
  });

  const [editingProductId, setEditingProductId] = useState(null);

  const [editProduct, setEditProduct] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    subcategory: "",
    images: [],
    variants: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setError("");

      const [
        analyticsResponse,
        storesResponse,
        productsResponse,
        ordersResponse,
      ] = await Promise.all([
        api.get("/analytics/vendor"),
        api.get("/stores/vendor"),
        api.get("/products/vendor"),
        api.get("/orders/vendor"),
      ]);

      setData(analyticsResponse.data);

      setOrders(ordersResponse.data.orders || []);

      const allStores = storesResponse.data.stores || [];
      setStores(allStores);

      const allProducts = productsResponse.data.products || [];
      setProducts(allProducts);

      if (allStores.length > 0) {
        setProduct((current) => ({
          ...current,
          storeId: current.storeId || allStores[0]._id,
        }));
      }
    } catch (err) {
      console.error("VENDOR DASHBOARD ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load vendor dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // STORE CRUD
  // =========================================================

  async function uploadStoreImage(file) {
    if (!file) return "";

    const reader = new FileReader();

    const base64 = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await api.post("/uploads/image", {
      image: base64,
    });

    return response.data.url;
  }

  async function uploadProductImages(files) {
  if (!files || files.length === 0) return [];

  const uploadedUrls = [];

  for (const file of files) {
    const reader = new FileReader();

    const base64 = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await api.post("/uploads/image", {
      image: base64,
    });

    uploadedUrls.push(response.data.url);
  }

  return uploadedUrls;
}

  async function createStore(e) {
    e.preventDefault();

    if (!store.name || !store.slug) {
      alert("Please enter store name and slug.");
      return;
    }

    try {
      let logoUrl = "";
      let bannerUrl = "";

      if (store.logo) {
        logoUrl = await uploadStoreImage(store.logo);
      }

      if (store.banner) {
        bannerUrl = await uploadStoreImage(store.banner);
      }

      const response = await api.post("/stores", {
        name: store.name,
        slug: store.slug,
        description: store.description,
        logo: logoUrl,
        banner: bannerUrl,
      });

      alert("Store created successfully!");

      setStore({
        name: "",
        slug: "",
        description: "",
        logo: "",
        banner: "",
      });

      setProduct((current) => ({
        ...current,
        storeId: response.data.store._id,
      }));

      await loadDashboard();
    } catch (err) {
      console.error("CREATE STORE ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Unable to create store"
      );
    }
  }

  function startEditingStore(currentStore) {
    setEditingStoreId(currentStore._id);

    setEditStore({
      name: currentStore.name || "",
      slug: currentStore.slug || "",
      description: currentStore.description || "",
      logo: currentStore.logo || "",
      banner: currentStore.banner || "",
    });
  }

  function cancelEditingStore() {
    setEditingStoreId(null);

    setEditStore({
      name: "",
      slug: "",
      description: "",
      logo: "",
      banner: "",
    });
  }

  async function updateStore(e) {
    e.preventDefault();

    if (!editingStoreId) return;

    if (
      !editStore.name.trim() ||
      !editStore.slug.trim()
    ) {
      alert("Store name and slug are required.");
      return;
    }

    try {
      let logoUrl = editStore.logo;
      let bannerUrl = editStore.banner;

      if (editStore.logo instanceof File) {
        logoUrl = await uploadStoreImage(editStore.logo);
      }

      if (editStore.banner instanceof File) {
        bannerUrl = await uploadStoreImage(editStore.banner);
      }

      await api.put(`/stores/${editingStoreId}`, {
        name: editStore.name.trim(),
        slug: editStore.slug.trim().toLowerCase(),
        description: editStore.description.trim(),
        logo: logoUrl,
        banner: bannerUrl,
      });

      alert("Store updated successfully!");

      cancelEditingStore();

      await loadDashboard();
    } catch (err) {
      console.error("UPDATE STORE ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Unable to update store"
      );
    }
  }

  async function deleteStore(storeId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this store?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/stores/${storeId}`);

      alert("Store deleted successfully!");

      await loadDashboard();
    } catch (err) {
      console.error("DELETE STORE ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Unable to delete store"
      );
    }
  }

  // =========================================================
  // PRODUCT VARIANT HELPERS
  // =========================================================

  function createEmptyVariant() {
    return {
      options: {
        color: "",
        size: "",
      },
      price: 0,
      stock: 0,
    };
  }

  function addProductVariant(isEditing = false) {
    if (isEditing) {
      setEditProduct((current) => ({
        ...current,
        variants: [
          ...(current.variants || []),
          createEmptyVariant(),
        ],
      }));
    } else {
      setProduct((current) => ({
        ...current,
        variants: [
          ...(current.variants || []),
          createEmptyVariant(),
        ],
      }));
    }
  }

  function removeProductVariant(
    variantIndex,
    isEditing = false
  ) {
    if (isEditing) {
      setEditProduct((current) => ({
        ...current,
        variants: (current.variants || []).filter(
          (_, index) => index !== variantIndex
        ),
      }));
    } else {
      setProduct((current) => ({
        ...current,
        variants: (current.variants || []).filter(
          (_, index) => index !== variantIndex
        ),
      }));
    }
  }

  function updateVariantField(
    variantIndex,
    field,
    value,
    isEditing = false
  ) {
    const updateVariants = (current) => ({
      ...current,
      variants: (current.variants || []).map(
        (variant, index) =>
          index === variantIndex
            ? {
                ...variant,
                [field]: value,
              }
            : variant
      ),
    });

    if (isEditing) {
      setEditProduct(updateVariants);
    } else {
      setProduct(updateVariants);
    }
  }

  function updateVariantOption(
    variantIndex,
    optionKey,
    value,
    isEditing = false
  ) {
    const updateVariants = (current) => ({
      ...current,
      variants: (current.variants || []).map(
        (variant, index) =>
          index === variantIndex
            ? {
                ...variant,
                options: {
                  ...variant.options,
                  [optionKey]: value,
                },
              }
            : variant
      ),
    });

    if (isEditing) {
      setEditProduct(updateVariants);
    } else {
      setProduct(updateVariants);
    }
  }

  function addVariantOption(
    variantIndex,
    isEditing = false
  ) {
    const updateVariants = (current) => ({
      ...current,
      variants: (current.variants || []).map(
        (variant, index) =>
          index === variantIndex
            ? {
                ...variant,
                options: {
                  ...variant.options,
                  [`option${Object.keys(
                    variant.options || {}
                  ).length + 1}`]: "",
                },
              }
            : variant
      ),
    });

    if (isEditing) {
      setEditProduct(updateVariants);
    } else {
      setProduct(updateVariants);
    }
  }

  function removeVariantOption(
    variantIndex,
    optionKey,
    isEditing = false
  ) {
    const updateVariants = (current) => ({
      ...current,
      variants: (current.variants || []).map(
        (variant, index) => {
          if (index !== variantIndex) {
            return variant;
          }

          const updatedOptions = {
            ...variant.options,
          };

          delete updatedOptions[optionKey];

          return {
            ...variant,
            options: updatedOptions,
          };
        }
      ),
    });

    if (isEditing) {
      setEditProduct(updateVariants);
    } else {
      setProduct(updateVariants);
    }
  }

  function validateProductVariants(variants) {
    if (!Array.isArray(variants) || variants.length === 0) {
      return true;
    }

    const combinationKeys = new Set();

    for (const variant of variants) {
      const validOptions = Object.entries(
        variant.options || {}
      ).filter(
        ([key, value]) =>
          String(key).trim() &&
          String(value).trim()
      );

      if (validOptions.length === 0) {
        alert(
          "Each variant must have at least one option."
        );
        return false;
      }

      const numericPrice = Number(variant.price);

      if (
        Number.isNaN(numericPrice) ||
        numericPrice < 0
      ) {
        alert(
          "Variant price must be a valid non-negative number."
        );
        return false;
      }

      const numericStock = Number(variant.stock);

      if (
        Number.isNaN(numericStock) ||
        numericStock < 0 ||
        !Number.isInteger(numericStock)
      ) {
        alert(
          "Variant stock must be a non-negative integer."
        );
        return false;
      }

      const normalizedOptions = validOptions
        .map(([key, value]) => [
          String(key).trim().toLowerCase(),
          String(value).trim(),
        ])
        .sort(([keyA], [keyB]) =>
          keyA.localeCompare(keyB)
        );

      const combinationKey = normalizedOptions
        .map(([key, value]) => `${key}:${value}`)
        .join("|");

      if (combinationKeys.has(combinationKey)) {
        alert(
          "Duplicate variant option combinations are not allowed."
        );
        return false;
      }

      combinationKeys.add(combinationKey);
    }

    return true;
  }

  function getVariantTotalStock(currentProduct) {
    if (
      !Array.isArray(currentProduct.variants) ||
      currentProduct.variants.length === 0
    ) {
      return Number(currentProduct.stock || 0);
    }

    return currentProduct.variants.reduce(
      (total, variant) =>
        total + Number(variant.stock || 0),
      0
    );
  }

  function getVariantPriceLabel(currentProduct) {
    if (
      !Array.isArray(currentProduct.variants) ||
      currentProduct.variants.length === 0
    ) {
      return formatCurrency(currentProduct.price);
    }

    const prices = currentProduct.variants
      .map((variant) => Number(variant.price))
      .filter((price) => Number.isFinite(price));

    if (prices.length === 0) {
      return formatCurrency(currentProduct.price);
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min === max) {
      return formatCurrency(min);
    }

    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }

  // =========================================================
  // PRODUCT CRUD
  // =========================================================

  function startEditingProduct(currentProduct) {
  setEditingProductId(currentProduct._id);

  setEditProduct({
    name: currentProduct.name || "",
    description: currentProduct.description || "",
    price: currentProduct.price ?? 0,
    stock: currentProduct.stock ?? 0,
    category: currentProduct.category || "",
    subcategory: currentProduct.subcategory || "",
    images: Array.isArray(currentProduct.images)
      ? currentProduct.images
      : [],
    variants: Array.isArray(currentProduct.variants)
      ? currentProduct.variants.map((variant) => ({
          _id: variant._id,
          options: Object.fromEntries(
            Object.entries(variant.options || {})
          ),
          price: variant.price ?? 0,
          stock: variant.stock ?? 0,
        }))
      : [],
  });
}

  function cancelEditingProduct() {
    setEditingProductId(null);

    setEditProduct({
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "",
      subcategory: "",
      images: [],
      variants: [],
    });
  }

  async function updateProduct(e) {
    e.preventDefault();

    if (!editingProductId) return;

    if (!editProduct.name.trim()) {
      alert("Product name is required.");
      return;
    }

    if (
      Number(editProduct.price) < 0 ||
      Number(editProduct.stock) < 0
    ) {
      alert("Price and stock cannot be negative.");
      return;
    }

    if (
      !validateProductVariants(
        editProduct.variants
      )
    ) {
      return;
    }

    try {
      const imageFiles = editProduct.images.filter(
        (image) => image instanceof File
      );

      const existingImageUrls =
        editProduct.images.filter(
          (image) => typeof image === "string"
        );

      const uploadedImages =
        await uploadProductImages(imageFiles);

      await api.put(`/products/${editingProductId}`, {
        name: editProduct.name.trim(),
        description: editProduct.description.trim(),
        price: Number(editProduct.price),
        stock: Number(editProduct.stock),
        category: editProduct.category.trim(),
        subcategory: editProduct.subcategory.trim(),
        images: [
          ...existingImageUrls,
          ...uploadedImages,
        ],
        variants: editProduct.variants.map(
          (variant) => ({
            ...(variant._id
              ? { _id: variant._id }
              : {}),
            options: Object.fromEntries(
              Object.entries(
                variant.options || {}
              ).filter(
                ([key, value]) =>
                  String(key).trim() &&
                  String(value).trim()
              )
            ),
            price: Number(variant.price),
            stock: Number(variant.stock),
          })
        ),
      });

      alert("Product updated successfully!");

      cancelEditingProduct();

      await loadDashboard();
    } catch (err) {
      console.error("UPDATE PRODUCT ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Unable to update product"
      );
    }
  }

  async function createProduct(e) {
    e.preventDefault();

    if (!product.storeId) {
      alert("Please create a store first.");
      return;
    }

    if (!product.name.trim()) {
      alert("Please enter product name.");
      return;
    }

    if (
      Number(product.price) < 0 ||
      Number(product.stock) < 0
    ) {
      alert("Price and stock cannot be negative.");
      return;
    }

    if (
      !validateProductVariants(product.variants)
    ) {
      return;
    }

   try {
    const imageFiles = product.images.filter(
      (image) => image instanceof File
    );

    const imageUrls = product.images.filter(
      (image) => typeof image === "string"
    );

    const uploadedImages =
      await uploadProductImages(imageFiles);

    await api.post("/products", {
      ...product,
      price: Number(product.price),
      stock: Number(product.stock),
      images: [
        ...imageUrls,
        ...uploadedImages,
      ],
      variants: product.variants.map(
        (variant) => ({
          options: Object.fromEntries(
            Object.entries(
              variant.options || {}
            ).filter(
              ([key, value]) =>
                String(key).trim() &&
                String(value).trim()
            )
          ),
          price: Number(variant.price),
          stock: Number(variant.stock),
        })
      ),
    });

    alert("Product created successfully!");

    setProduct((current) => ({
      ...current,
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "",
      subcategory: "",
      images: [],
      variants: [],
    }));

    await loadDashboard();
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);

    alert(
      err.response?.data?.message ||
        "Unable to create product"
    );
  }
}

  async function deleteProduct(productId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/products/${productId}`);

      alert("Product deleted successfully!");

      await loadDashboard();
    } catch (err) {
      console.error("DELETE PRODUCT ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Unable to delete product"
      );
    }
  }

  // =========================================================
  // ORDER
  // =========================================================

  async function updateOrderStatus(orderId, status) {
    try {
      await api.put(`/orders/${orderId}/status`, {
        status,
      });

      await loadDashboard();

      alert("Order status updated successfully!");
    } catch (err) {
      console.error("ORDER STATUS ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Unable to update order status"
      );
    }
  }

  // =========================================================
  // HELPERS
  // =========================================================

  function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  function formatDate(date) {
    if (!date) return "";

    const parts = date.split("-");

    if (parts.length !== 3) return date;

    return `${parts[2]}/${parts[1]}`;
  }

  const chartData = (data?.revenueTrend || []).map(
    (item) => ({
      ...item,
      dateLabel: formatDate(item.date),
    })
  );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f1e8]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#0f766e] border-t-transparent" />

          <p className="mt-3 text-sm font-medium text-[#6b6258]">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f1e8] p-6">
        <div className="w-full max-w-sm rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-red-600">
            Failed to Load Dashboard
          </h2>

          <p className="mt-2 text-sm text-[#6b6258]">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-5 rounded-xl bg-[#0f766e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#115e59]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#f5f1e8]">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-white/10 bg-[#0d3b2e] text-white shadow-xl transition-all duration-500 ease-in-out overflow-hidden ${
          sidebarOpen
            ? "w-[230px]"
            : "w-0 overflow-hidden"
        }`}
      >

        <div className="flex h-[68px] shrink-0 items-center gap-3 border-b border-white/10 px-5">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0f766e]/20 text-[#7dd3c7]">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M4 4h16v2H4V4zm0 4h16v12H4V8zm2 2v8h12v-8H6z" />
            </svg>

          </div>

          <div>
            <p className="text-sm font-bold tracking-wide">
              ShopSphere
            </p>

            <p className="text-[11px] text-[#b7d8d2]/70">
              Vendor Panel
            </p>
          </div>

        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">

          {[
            {
              id: "overview",
              label: "Overview",
              icon: "⌂",
            },
            {
              id: "orders",
              label: "Orders",
              icon: "□",
              badge: orders.length,
            },
            {
              id: "products",
              label: "Products",
              icon: "▣",
            },
            {
              id: "stores",
              label: "Stores",
              icon: "▤",
            },
            {
              id: "analytics",
              label: "Analytics",
              icon: "⌁",
            },
          ].map((item) => (

            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition ${
                activeTab === item.id
                  ? "bg-[#0f766e]/25 text-white"
                  : "text-[#c7ddd8]/70 hover:bg-white/5 hover:text-white"
              }`}
            >

              <span className="flex items-center gap-3">

                <span className="flex h-5 w-5 items-center justify-center text-base">
                  {item.icon}
                </span>

                {item.label}

              </span>

              {item.badge > 0 && (
                <span className="rounded-full bg-[#0f766e]/25 px-2 py-0.5 text-[10px] font-bold text-[#b7d8d2]">
                  {item.badge}
                </span>
              )}

            </button>

          ))}

        </nav>

        <div className="border-t border-white/10 p-3">

          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f766e]/25 text-xs font-bold text-[#c7ddd8]">
              V
            </div>

            <div className="min-w-0">

              <p className="truncate text-xs font-semibold">
                Vendor Account
              </p>

              <p className="truncate text-[10px] text-[#b7d8d2]/50">
                Store Admin
              </p>

            </div>

          </div>

        </div>

      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <main className="min-h-screen flex-1 min-w-0">

        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-[#ded6c9] bg-[#fbfaf6]/95 px-5 backdrop-blur-md lg:px-6">

          <div className="flex min-w-0 items-center gap-3">

            <button
              onClick={() =>
                setSidebarOpen(!sidebarOpen)
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#ded6c9] bg-white text-[#5f574e] shadow-sm transition hover:border-[#8fc9c1] hover:bg-[#edf7f5] hover:text-[#0f766e]"
              title={
                sidebarOpen
                  ? "Close sidebar"
                  : "Open sidebar"
              }
            >

              {sidebarOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}

            </button>

            <div className="min-w-0">

              <h1 className="truncate text-lg font-bold text-[#3f382f]">
                {activeTab === "overview" &&
                  "Overview"}

                {activeTab === "orders" &&
                  "Customer Orders"}

                {activeTab === "products" &&
                  "My Products"}

                {activeTab === "stores" &&
                  "My Stores"}

                {activeTab === "analytics" &&
                  "Analytics"}
              </h1>

              <p className="hidden text-xs text-[#81786d] sm:block">
                Manage your stores, products & orders
              </p>

            </div>

          </div>

          <button
            onClick={loadDashboard}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#ded6c9] bg-white px-3 py-2 text-xs font-semibold text-[#5f574e] shadow-sm transition hover:border-[#8fc9c1] hover:bg-[#edf7f5] hover:text-[#0f766e]"
          >
            <span className="text-sm">↻</span>
            Refresh
          </button>

        </header>

        <div className="p-5 lg:p-6">

          {/* =================================================
              OVERVIEW
          ================================================= */}

          {activeTab === "overview" && (
            <>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {[
                  {
                    label: "Total Revenue",
                    value: formatCurrency(
                      data?.revenue
                    ),
                    icon: "₹",
                    change: "Paid orders",
                  },
                  {
                    label: "Orders",
                    value: data?.orders ?? 0,
                    icon: "□",
                    change: "All time",
                  },
                  {
                    label: "Products",
                    value: data?.products ?? 0,
                    icon: "▣",
                    change: "In catalog",
                  },
                  {
                    label: "Stores",
                    value: data?.stores ?? 0,
                    icon: "▤",
                    change: "Active",
                  },
                ].map((card) => (

                  <div
                    key={card.label}
                    className="rounded-xl border border-[#ded6c9] bg-white p-4 shadow-sm transition hover:shadow-md"
                  >

                    <div className="flex items-center justify-between">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf7f5] text-sm font-bold text-[#0f766e]">
                        {card.icon}
                      </div>

                      <span className="rounded-full bg-[#edf7f5] px-2 py-1 text-[10px] font-medium text-[#0f766e]">
                        {card.change}
                      </span>

                    </div>

                    <p className="mt-4 text-xs font-medium text-[#81786d]">
                      {card.label}
                    </p>

                    <p className="mt-0.5 text-xl font-bold text-[#3f382f]">
                      {card.value}
                    </p>

                  </div>

                ))}

              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-3">

                <div className="rounded-xl border border-[#ded6c9] bg-white p-5 shadow-sm lg:col-span-2">

                  <div className="flex items-center justify-between">

                    <div>
                      <h2 className="text-sm font-bold text-[#3f382f]">
                        Sales Overview
                      </h2>

                      <p className="mt-0.5 text-xs text-[#81786d]">
                        Last 7 days revenue
                      </p>
                    </div>

                    <span className="rounded-full bg-[#edf7f5] px-2.5 py-1 text-[10px] font-medium text-[#0f766e]">
                      Daily
                    </span>

                  </div>

                  <div className="mt-4 h-56">

                    {chartData.length > 0 ? (

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <AreaChart
                          data={chartData}
                        >

                          <defs>

                            <linearGradient
                              id="colorRevenue"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >

                              <stop
                                offset="5%"
                                stopColor="#0f766e"
                                stopOpacity={0.25}
                              />

                              <stop
                                offset="95%"
                                stopColor="#0f766e"
                                stopOpacity={0}
                              />

                            </linearGradient>

                          </defs>

                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#ded6c9"
                          />

                          <XAxis
                            dataKey="dateLabel"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#81786d",
                              fontSize: 10,
                            }}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#81786d",
                              fontSize: 10,
                            }}
                          />

                          <Tooltip
                            formatter={(value) =>
                              formatCurrency(value)
                            }
                            contentStyle={{
                              borderRadius: "10px",
                              border: "none",
                              boxShadow:
                                "0 8px 20px rgba(0,0,0,0.08)",
                              fontSize: "12px",
                            }}
                          />

                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#0f766e"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                          />

                        </AreaChart>

                      </ResponsiveContainer>

                    ) : (

                      <div className="flex h-full items-center justify-center text-xs text-[#9a9084]">
                        No revenue data yet
                      </div>

                    )}

                  </div>

                </div>

                <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">

                  <div className="rounded-xl border border-[#ded6c9] bg-white p-4 shadow-sm">

                    <p className="text-xs font-medium text-[#81786d]">
                      Pending Orders
                    </p>

                    <p className="mt-1 text-2xl font-bold text-amber-500">
                      {data?.pendingOrders || 0}
                    </p>

                  </div>

                  <div className="rounded-xl border border-[#ded6c9] bg-white p-4 shadow-sm">

                    <p className="text-xs font-medium text-[#81786d]">
                      Completed
                    </p>

                    <p className="mt-1 text-2xl font-bold text-[#0f766e]">
                      {data?.completedOrders || 0}
                    </p>

                  </div>

                  <div className="rounded-xl border border-[#ded6c9] bg-white p-4 shadow-sm">

                    <p className="text-xs font-medium text-[#8178686d]">
                      Cancelled
                    </p>

                    <p className="mt-1 text-2xl font-bold text-red-500">
                      {data?.cancelledOrders || 0}
                    </p>

                  </div>

                </div>

              </div>

              <div className="mt-5 overflow-hidden rounded-xl border border-[#ded6c9] bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-[#eee8de] px-5 py-4">

                  <div>

                    <h2 className="text-sm font-bold text-[#3f382f]">
                      Recent Orders
                    </h2>

                    <p className="mt-0.5 text-xs text-[#81786d]">
                      Latest customer purchases
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setActiveTab("orders")
                    }
                    className="text-xs font-semibold text-[#0f766e] hover:text-[#115e59]"
                  >
                    View all →
                  </button>

                </div>

                <div className="overflow-x-auto">

                  <table className="w-full text-left text-xs">

                    <thead className="bg-[#f8f4ec] text-[#81786d]">

                      <tr>

                        <th className="px-5 py-2.5 font-medium">
                          Order ID
                        </th>

                        <th className="px-5 py-2.5 font-medium">
                          Date
                        </th>

                        <th className="px-5 py-2.5 font-medium">
                          Amount
                        </th>

                        <th className="px-5 py-2.5 font-medium">
                          Status
                        </th>

                        <th className="px-5 py-2.5 font-medium">
                          Payment
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-[#eee8de]">

                      {orders.slice(0, 5).map(
                        (order) => (

                          <tr
                            key={order._id}
                            className="transition hover:bg-[#edf7f5]/40"
                          >

                            <td className="px-5 py-3 font-semibold text-[#3f382f]">
                              #
                              {order._id
                                .slice(-8)
                                .toUpperCase()}
                            </td>

                            <td className="px-5 py-3 text-[#81786d]">
                              {order.createdAt
                                ? new Date(
                                    order.createdAt
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                    }
                                  )
                                : "—"}
                            </td>

                            <td className="px-5 py-3 font-semibold text-[#3f382f]">
                              {formatCurrency(
                                order.total
                              )}
                            </td>

                            <td className="px-5 py-3">

                              <span
                                className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                  order.status ===
                                  "DELIVERED"
                                    ? "bg-[#edf7f5] text-[#0f766e]"
                                    : order.status ===
                                      "CANCELLED"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                {order.status}
                              </span>

                            </td>

                            <td className="px-5 py-3">

                              <span
                                className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                  order.paymentStatus ===
                                  "PAID"
                                    ? "bg-[#edf7f5] text-[#0f766e]"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {order.paymentStatus}
                              </span>

                            </td>

                          </tr>

                        )
                      )}

                      {orders.length === 0 && (

                        <tr>

                          <td
                            colSpan={5}
                            className="px-5 py-10 text-center text-xs text-[#9a9084]"
                          >
                            No orders yet
                          </td>

                        </tr>

                      )}

                    </tbody>

                  </table>

                </div>

              </div>

            </>
          )}

          {/* =================================================
              ORDERS
          ================================================= */}

          {activeTab === "orders" && (

            <div className="space-y-4">

              {orders.length === 0 ? (

                <div className="rounded-xl border border-[#ded6c9] bg-white py-14 text-center shadow-sm">

                  <p className="text-3xl">📦</p>

                  <h3 className="mt-3 text-lg font-bold text-[#3f382f]">
                    No orders yet
                  </h3>

                  <p className="mt-1 text-xs text-[#81786d]">
                    Customer orders will appear here.
                  </p>

                </div>

              ) : (

                orders.map((order) => (

                  <div
                    key={order._id}
                    className="rounded-xl border border-[#ded6c9] bg-white p-5 shadow-sm"
                  >

                    <div className="flex flex-col gap-3 border-b border-[#eee8de] pb-4 md:flex-row md:items-center md:justify-between">

                      <div>

                        <p className="text-[10px] font-medium uppercase tracking-wide text-[#9a9084]">
                          Order ID
                        </p>

                        <p className="mt-0.5 text-sm font-bold text-[#3f382f]">
                          #
                          {order._id
                            .slice(-8)
                            .toUpperCase()}
                        </p>

                        <p className="mt-0.5 text-[11px] text-[#81786d]">
                          {order.createdAt
                            ? new Date(
                                order.createdAt
                              ).toLocaleString(
                                "en-IN",
                                {
                                  dateStyle:
                                    "medium",
                                  timeStyle:
                                    "short",
                                }
                              )
                            : "Date unavailable"}
                        </p>

                      </div>

                      <div className="flex gap-2">

                        <div>

                          <p className="mb-1 text-[10px] text-[#9a9084]">
                            Status
                          </p>

                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                            {order.status}
                          </span>

                        </div>

                        <div>

                          <p className="mb-1 text-[10px] text-[#9a9084]">
                            Payment
                          </p>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              order.paymentStatus ===
                              "PAID"
                                ? "bg-[#edf7f5] text-[#0f766e]"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>

                        </div>

                      </div>

                    </div>

                    {order.shippingAddress && (

                      <div className="mt-4 rounded-lg bg-[#f8f4ec] p-3">

                        <p className="text-xs font-semibold text-[#5f574e]">
                          Delivery Details
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[#3f382f]">
                          {
                            order.shippingAddress
                              .fullName
                          }
                        </p>

                        <p className="text-[11px] text-[#81786d]">
                          📞{" "}
                          {
                            order.shippingAddress
                              .phone
                          }
                        </p>

                        <p className="mt-1 text-[11px] text-[#81786d]">
                          {
                            order.shippingAddress
                              .addressLine
                          }
                          ,{" "}
                          {
                            order.shippingAddress
                              .city
                          }
                          ,{" "}
                          {
                            order.shippingAddress
                              .state
                          }{" "}
                          -{" "}
                          {
                            order.shippingAddress
                              .pincode
                          }
                        </p>

                      </div>

                    )}

                    <div className="mt-4 space-y-1.5">

                      {order.items?.map(
                        (item, index) => (

                          <div
                            key={
                              item.productId ||
                              index
                            }
                            className="flex items-center justify-between rounded-lg bg-[#f8f4ec] px-3 py-2.5"
                          >

                            <div>

                              <p className="text-xs font-semibold text-[#5f574e]">
                                {item.name}
                              </p>

                              <p className="text-[10px] text-[#81786d]">
                                Qty: {item.quantity}
                              </p>

                            </div>

                            <p className="text-xs font-semibold text-[#3f382f]">
                              {formatCurrency(
                                Number(
                                  item.price
                                ) *
                                  Number(
                                    item.quantity
                                  )
                              )}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#eee8de] pt-4">

                      <span className="text-sm font-bold text-[#3f382f]">
                        Total
                      </span>

                      <span className="text-lg font-bold text-[#0f766e]">
                        {formatCurrency(
                          order.total
                        )}
                      </span>

                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                      <label className="text-xs font-medium text-[#81786d]">
                        Update Status
                      </label>

                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(
                            order._id,
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-[#ded6c9] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#0f766e] sm:w-52"
                      >

                        <option value="PLACED">
                          Placed
                        </option>

                        <option value="PROCESSING">
                          Processing
                        </option>

                        <option value="SHIPPED">
                          Shipped
                        </option>

                        <option value="DELIVERED">
                          Delivered
                        </option>

                        <option value="CANCELLED">
                          Cancelled
                        </option>

                      </select>

                    </div>

                  </div>

                ))

              )}

            </div>

          )}

          {/* =================================================
              PRODUCTS
          ================================================= */}

          {activeTab === "products" && (

            <div>

              <div className="mb-4 flex items-center justify-between">

                <div>

                  <h2 className="text-sm font-bold text-[#3f382f]">
                    Products
                  </h2>

                  <p className="mt-0.5 text-xs text-[#81786d]">
                    {products.length} products in your
                    catalog
                  </p>

                </div>

              </div>

              {products.length === 0 ? (

                <div className="rounded-xl border border-[#ded6c9] bg-white py-14 text-center shadow-sm">

                  <p className="text-3xl">🛍️</p>

                  <h3 className="mt-3 text-lg font-bold text-[#3f382f]">
                    No products yet
                  </h3>

                  <p className="mt-1 text-xs text-[#81786d]">
                    Create your first product below.
                  </p>

                </div>

              ) : (

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                  {products.map(
                    (currentProduct) => {

                      const totalVariantStock =
                        getVariantTotalStock(
                          currentProduct
                        );

                      const hasVariants =
                        Array.isArray(
                          currentProduct.variants
                        ) &&
                        currentProduct.variants.length >
                          0;

                      return (
                        <div
                          key={currentProduct._id}
                          className="rounded-xl border border-[#ded6c9] bg-white p-4 shadow-sm transition hover:shadow-md"
                        >

                          {editingProductId ===
                          currentProduct._id ? (

                            <form
                              onSubmit={
                                updateProduct
                              }
                              className="space-y-3"
                            >

                              <h3 className="text-sm font-bold text-[#3f382f]">
                                Edit Product
                              </h3>

                              <input
                                className="w-full rounded-lg border border-[#ded6c9] px-3 py-2 text-xs outline-none focus:border-[#0f766e]"
                                placeholder="Product name"
                                value={
                                  editProduct.name
                                }
                                onChange={(e) =>
                                  setEditProduct({
                                    ...editProduct,
                                    name: e.target
                                      .value,
                                  })
                                }
                              />

                              <textarea
                                className="w-full rounded-lg border border-[#ded6c9] px-3 py-2 text-xs outline-none focus:border-[#0f766e]"
                                placeholder="Description"
                                rows="2"
                                value={
                                  editProduct.description
                                }
                                onChange={(e) =>
                                  setEditProduct({
                                    ...editProduct,
                                    description:
                                      e.target
                                        .value,
                                  })
                                }
                              />

                              <div className="grid grid-cols-2 gap-2">

                                <input
                                  type="number"
                                  min="0"
                                  className="w-full rounded-lg border border-[#ded6c9] px-3 py-2 text-xs outline-none focus:border-[#0f766e]"
                                  placeholder="Base Price"
                                  value={
                                    editProduct.price
                                  }
                                  onChange={(e) =>
                                    setEditProduct({
                                      ...editProduct,
                                      price: e
                                        .target
                                        .value,
                                    })
                                  }
                                />

                                <input
                                  type="number"
                                  min="0"
                                  className="w-full rounded-lg border border-[#ded6c9] px-3 py-2 text-xs outline-none focus:border-[#0f766e]"
                                  placeholder="Base Stock"
                                  value={
                                    editProduct.stock
                                  }
                                  onChange={(e) =>
                                    setEditProduct({
                                      ...editProduct,
                                      stock: e
                                        .target
                                        .value,
                                    })
                                  }
                                />

                              </div>

                            <div className="grid grid-cols-2 gap-2">

                              <input
                                className="w-full rounded-lg border border-[#ded6c9] px-3 py-2 text-xs outline-none focus:border-[#0f766e]"
                                placeholder="Category"
                                value={
                                  editProduct.category
                                }
                                onChange={(e) =>
                                  setEditProduct({
                                    ...editProduct,
                                    category:e.target.value,
                                  })
                                }
                              />

                              <input
                                className="w-full rounded-lg border border-[#ded6c9] px-3 py-2 text-xs outline-none focus:border-[#0f766e]"
                                placeholder="Subcategory"
                                value={
                                  editProduct.subcategory
                                }
                                onChange={(e) =>
                                  setEditProduct({
                                    ...editProduct,
                                    subcategory:e.target.value,
                                  })
                                }
                              />

                            </div>

                            <div>
                              <label className="mb-1.5 block text-[10px] font-semibold text-[#5f574e]">
                                Product Images
                              </label>

                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) =>
                                  setEditProduct({
                                    ...editProduct,
                                    images: [
                                      ...(editProduct.images || []),
                                      ...Array.from(e.target.files || []),
                                    ],
                                  })
                                }
                                className="w-full rounded-lg border border-[#ded6c9] bg-white px-3 py-2 text-xs text-[#5f574e] outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#edf7f5] file:px-2.5 file:py-1.5 file:text-[10px] file:font-semibold file:text-[#0f766e] hover:border-[#8fc9c1]"
                              />

                              {editProduct.images?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {editProduct.images.map((image, index) => (
                                    <div
                                      key={index}
                                      className="relative h-16 w-16 overflow-hidden rounded-lg border border-[#ded6c9] bg-[#f8f4ec]"
                                    >
                                      <img
                                        src={
                                          image instanceof File
                                            ? URL.createObjectURL(image)
                                            : image
                                        }
                                        alt={`Product ${index + 1}`}
                                        className="h-full w-full object-cover"
                                      />

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditProduct({
                                            ...editProduct,
                                            images: editProduct.images.filter(
                                              (_, imageIndex) =>
                                                imageIndex !== index
                                            ),
                                          })
                                        }
                                        className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                              {/* =========================
                                  EDIT VARIANTS
                              ========================= */}

                              <div className="rounded-xl border border-[#ded6c9] bg-[#f8f4ec] p-3">

                                <div className="flex items-center justify-between">

                                  <div>
                                    <h4 className="text-xs font-bold text-[#3f382f]">
                                      Product Variants
                                    </h4>

                                    <p className="mt-0.5 text-[10px] text-[#81786d]">
                                      Add size, color,
                                      storage, weight,
                                      or any other option.
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      addProductVariant(
                                        true
                                      )
                                    }
                                    className="rounded-lg bg-[#0f766e] px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-[#115e59]"
                                  >
                                    + Variant
                                  </button>

                                </div>

                                {editProduct.variants
                                  ?.length === 0 ? (

                                  <div className="mt-3 rounded-lg border border-dashed border-[#cfc5b7] bg-white px-3 py-5 text-center">

                                    <p className="text-[10px] text-[#9a9084]">
                                      No variants added.
                                    </p>

                                  </div>

                                ) : (

                                  <div className="mt-3 space-y-3">

                                    {editProduct.variants.map(
                                      (
                                        variant,
                                        variantIndex
                                      ) => (

                                        <div
                                          key={
                                            variant._id ||
                                            `edit-${variantIndex}`
                                          }
                                          className="rounded-lg border border-[#ded6c9] bg-white p-3"
                                        >

                                          <div className="flex items-center justify-between">

                                            <p className="text-[10px] font-bold uppercase tracking-wide text-[#5f574e]">
                                              Variant{" "}
                                              {variantIndex +
                                                1}
                                            </p>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                removeProductVariant(
                                                  variantIndex,
                                                  true
                                                )
                                              }
                                              className="text-[10px] font-semibold text-red-600 hover:text-red-700"
                                            >
                                              Remove
                                            </button>

                                          </div>

                                          <div className="mt-2 space-y-2">

                                            {Object.entries(
                                              variant.options ||
                                                {}
                                            ).map(
                                              ([
                                                optionKey,
                                                optionValue,
                                              ]) => (

                                                <div
                                                  key={
                                                    optionKey
                                                  }
                                                  className="flex gap-2"
                                                >

                                                  <input
                                                    className="w-1/3 rounded-lg border border-[#ded6c9] px-2.5 py-2 text-[10px] outline-none focus:border-[#0f766e]"
                                                    placeholder="Option"
                                                    value={
                                                      optionKey
                                                    }
                                                    readOnly
                                                  />

                                                  <input
                                                    className="min-w-0 flex-1 rounded-lg border border-[#ded6c9] px-2.5 py-2 text-[10px] outline-none focus:border-[#0f766e]"
                                                    placeholder="Value"
                                                    value={
                                                      optionValue
                                                    }
                                                    onChange={(
                                                      e
                                                    ) =>
                                                      updateVariantOption(
                                                        variantIndex,
                                                        optionKey,
                                                        e
                                                          .target
                                                          .value,
                                                        true
                                                      )
                                                    }
                                                  />

                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      removeVariantOption(
                                                        variantIndex,
                                                        optionKey,
                                                        true
                                                      )
                                                    }
                                                    className="rounded-lg bg-red-50 px-2 text-xs font-bold text-red-600 hover:bg-red-100"
                                                    title="Remove option"
                                                  >
                                                    ×
                                                  </button>

                                                </div>

                                              )
                                            )}

                                          </div>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              addVariantOption(
                                                variantIndex,
                                                true
                                              )
                                            }
                                            className="mt-2 rounded-lg bg-[#edf7f5] px-2.5 py-1.5 text-[10px] font-semibold text-[#0f766e] hover:bg-[#dff1ee]"
                                          >
                                            + Add Option
                                          </button>

                                          <div className="mt-3 grid grid-cols-2 gap-2">

                                            <div>
                                              <label className="mb-1 block text-[9px] font-semibold text-[#81786d]">
                                                Variant Price
                                              </label>

                                              <input
                                                type="number"
                                                min="0"
                                                value={
                                                  variant.price
                                                }
                                                onChange={(
                                                  e
                                                ) =>
                                                  updateVariantField(
                                                    variantIndex,
                                                    "price",
                                                    e
                                                      .target
                                                      .value,
                                                    true
                                                  )
                                                }
                                                className="w-full rounded-lg border border-[#ded6c9] px-2.5 py-2 text-[10px] outline-none focus:border-[#0f766e]"
                                              />
                                            </div>

                                            <div>
                                              <label className="mb-1 block text-[9px] font-semibold text-[#81786d]">
                                                Variant Stock
                                              </label>

                                              <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={
                                                  variant.stock
                                                }
                                                onChange={(
                                                  e
                                                ) =>
                                                  updateVariantField(
                                                    variantIndex,
                                                    "stock",
                                                    e
                                                      .target
                                                      .value,
                                                    true
                                                  )
                                                }
                                                className="w-full rounded-lg border border-[#ded6c9] px-2.5 py-2 text-[10px] outline-none focus:border-[#0f766e]"
                                              />
                                            </div>

                                          </div>

                                        </div>

                                      )
                                    )}

                                  </div>

                                )}

                              </div>

                              <div className="flex gap-2 pt-1">

                                <button
                                  type="submit"
                                  className="flex-1 rounded-lg bg-[#0f766e] py-2 text-xs font-semibold text-white hover:bg-[#115e59]"
                                >
                                  Save
                                </button>

                                <button
                                  type="button"
                                  onClick={
                                    cancelEditingProduct
                                  }
                                  className="flex-1 rounded-lg bg-[#eee8de] py-2 text-xs font-semibold text-[#5f574e] hover:bg-[#e3dbcf]"
                                >
                                  Cancel
                                </button>

                              </div>

                            </form>

                          ) : (

                            <>

                              <div className="flex items-start justify-between gap-3">

                                <div className="min-w-0">

                                  <h3 className="truncate text-sm font-bold text-[#3f382f]">
                                    {
                                      currentProduct.name
                                    }
                                  </h3>

                                  <p className="mt-1 text-base font-bold text-[#0f766e]">
                                    {getVariantPriceLabel(
                                      currentProduct
                                    )}
                                  </p>

                                </div>

                                <span
                                  className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${
                                    totalVariantStock >
                                    0
                                      ? "bg-[#edf7f5] text-[#0f766e]"
                                      : "bg-red-50 text-red-600"
                                  }`}
                                >
                                  {totalVariantStock >
                                  0
                                    ? "In stock"
                                    : "Out"}
                                </span>

                              </div>

                              {currentProduct.description && (

                                <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#81786d]">
                                  {
                                    currentProduct.description
                                  }
                                </p>

                              )}

                              <div className="mt-3 flex flex-wrap gap-1.5">

                                {currentProduct.category && (

                                  <span className="rounded-full bg-[#edf7f5] px-2 py-1 text-[9px] font-medium text-[#0f766e]">
                                    {
                                      currentProduct.category
                                    }
                                  </span>

                                )}

                                {currentProduct.subcategory && (

                                  <span className="rounded-full bg-[#f8f4ec] px-2 py-1 text-[9px] font-medium text-[#6f4e37]">
                                    {currentProduct.subcategory}
                                  </span>

                                )}

                                <span className="rounded-full bg-[#eee8de] px-2 py-1 text-[9px] font-medium text-[#81786d]">
                                  Stock:{" "}
                                  {
                                    totalVariantStock
                                  }
                                </span>

                                {hasVariants && (

                                  <span className="rounded-full bg-[#f0e7dc] px-2 py-1 text-[9px] font-medium text-[#6f4e37]">
                                    {
                                      currentProduct
                                        .variants
                                        .length
                                    }{" "}
                                    {currentProduct
                                      .variants
                                      .length === 1
                                      ? "variant"
                                      : "variants"}
                                  </span>

                                )}

                              </div>

                              {hasVariants && (

                                <div className="mt-3 rounded-lg bg-[#f8f4ec] p-2.5">

                                  <p className="text-[9px] font-semibold uppercase tracking-wide text-[#9a9084]">
                                    Variant Stock
                                  </p>

                                  <div className="mt-2 space-y-1">

                                    {currentProduct.variants
                                      .slice(0, 4)
                                      .map(
                                        (
                                          variant
                                        ) => (

                                          <div
                                            key={
                                              variant._id
                                            }
                                            className="flex items-center justify-between text-[10px]"
                                          >

                                            <span className="truncate text-[#5f574e]">
                                              {Object.entries(
                                                variant.options ||
                                                  {}
                                              )
                                                .map(
                                                  ([
                                                    key,
                                                    value,
                                                  ]) =>
                                                    `${key}: ${value}`
                                                )
                                                .join(
                                                  " • "
                                                )}
                                            </span>

                                            <span className="ml-2 shrink-0 font-semibold text-[#81786d]">
                                              {
                                                variant.stock
                                              }{" "}
                                              left
                                            </span>

                                          </div>

                                        )
                                      )}

                                    {currentProduct.variants
                                      .length > 4 && (

                                      <p className="pt-1 text-[9px] text-[#9a9084]">
                                        +
                                        {currentProduct
                                          .variants
                                          .length -
                                          4}{" "}
                                        more variants
                                      </p>

                                    )}

                                  </div>

                                </div>

                              )}

                              <div className="mt-4 grid grid-cols-2 gap-2">

                                <button
                                  onClick={() =>
                                    startEditingProduct(
                                      currentProduct
                                    )
                                  }
                                  className="rounded-lg bg-[#edf7f5] py-2 text-xs font-semibold text-[#0f766e] hover:bg-[#dff1ee]"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() =>
                                    deleteProduct(
                                      currentProduct._id
                                    )
                                  }
                                  className="rounded-lg bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                                >
                                  Delete
                                </button>

                              </div>

                            </>

                          )}

                        </div>
                      );
                    }
                  )}

                </div>

              )}

              {/* =================================================
                  CREATE PRODUCT
              ================================================= */}

              <div className="mt-6 rounded-xl border border-[#ded6c9] bg-white p-5 shadow-sm">

                <div className="mb-4">

                  <h2 className="text-sm font-bold text-[#3f382f]">
                    Create New Product
                  </h2>

                  <p className="mt-0.5 text-xs text-[#81786d]">
                    Add a product to one of your stores
                  </p>

                </div>

                <form
                  onSubmit={createProduct}
                  className="space-y-3"
                >

                  <select
                    className="w-full rounded-lg border border-[#ded6c9] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#0f766e]"
                    value={product.storeId}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        storeId:
                          e.target.value,
                      })
                    }
                  >

                    <option value="">
                      Select Store
                    </option>

                    {stores.map((s) => (

                      <option
                        key={s._id}
                        value={s._id}
                      >
                        {s.name}
                      </option>

                    ))}

                  </select>

                  <input
                    className="w-full rounded-lg border border-[#ded6c9] px-3 py-2.5 text-xs outline-none focus:border-[#0f766e]"
                    placeholder="Product name"
                    value={product.name}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        name: e.target.value,
                      })
                    }
                  />

                  <textarea
                    className="w-full rounded-lg border border-[#ded6c9] px-3 py-2.5 text-xs outline-none focus:border-[#0f766e]"
                    placeholder="Description"
                    rows="2"
                    value={product.description}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        description:
                          e.target.value,
                      })
                    }
                  />

                  <div className="grid grid-cols-2 gap-3">

                    <input
                      type="number"
                      min="0"
                      className="w-full rounded-lg border border-[#ded6c9] px-3 py-2.5 text-xs outline-none focus:border-[#0f766e]"
                      placeholder="Base Price"
                      value={product.price}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          price: e.target.value,
                        })
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      className="w-full rounded-lg border border-[#ded6c9] px-3 py-2.5 text-xs outline-none focus:border-[#0f766e]"
                      placeholder="Base Stock"
                      value={product.stock}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          stock: e.target.value,
                        })
                      }
                    />

                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <input
                      className="w-full rounded-lg border border-[#ded6c9] px-3 py-2.5 text-xs outline-none focus:border-[#0f766e]"
                      placeholder="Category"
                      value={product.category}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          category: e.target.value,
                        })
                      }
                    />

                    <input
                      className="w-full rounded-lg border border-[#ded6c9] px-3 py-2.5 text-xs outline-none focus:border-[#0f766e]"
                      placeholder="Subcategory"
                      value={product.subcategory}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          subcategory: e.target.value,
                        })
                      }
                    />

                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold text-[#5f574e]">
                      Product Images
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          images: [
                            ...(product.images || []),
                            ...Array.from(e.target.files || []),
                          ],
                        })
                      }
                      className="w-full rounded-lg border border-[#ded6c9] bg-white px-3 py-2 text-xs text-[#5f574e] outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#edf7f5] file:px-2.5 file:py-1.5 file:text-[10px] file:font-semibold file:text-[#0f766e] hover:border-[#8fc9c1]"
                    />

                    {product.images?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {product.images.map((image, index) => (
                          <div
                            key={index}
                            className="relative h-16 w-16 overflow-hidden rounded-lg border border-[#ded6c9] bg-[#f8f4ec]"
                          >
                            <img
                              src={
                                image instanceof File
                                  ? URL.createObjectURL(image)
                                  : image
                              }
                              alt={`Product ${index + 1}`}
                              className="h-full w-full object-cover"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setProduct({
                                  ...product,
                                  images: product.images.filter(
                                    (_, imageIndex) =>
                                      imageIndex !== index
                                  ),
                                })
                              }
                              className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ===============================
                      CREATE VARIANTS
                  =============================== */}

                  <div className="rounded-xl border border-[#ded6c9] bg-[#f8f4ec] p-3">

                    <div className="flex items-center justify-between">

                      <div>
                        <h4 className="text-xs font-bold text-[#3f382f]">
                          Product Variants
                        </h4>

                        <p className="mt-0.5 text-[10px] text-[#81786d]">
                          Add size, color, storage,
                          weight, or any other option.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          addProductVariant(false)
                        }
                        className="rounded-lg bg-[#0f766e] px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-[#115e59]"
                      >
                        + Variant
                      </button>

                    </div>

                    {product.variants?.length === 0 ? (

                      <div className="mt-3 rounded-lg border border-dashed border-[#cfc5b7] bg-white px-3 py-5 text-center">

                        <p className="text-[10px] text-[#9a9084]">
                          No variants added.
                        </p>

                      </div>

                    ) : (

                      <div className="mt-3 space-y-3">

                        {product.variants.map(
                          (
                            variant,
                            variantIndex
                          ) => (

                            <div
                              key={`create-${variantIndex}`}
                              className="rounded-lg border border-[#ded6c9] bg-white p-3"
                            >

                              <div className="flex items-center justify-between">

                                <p className="text-[10px] font-bold uppercase tracking-wide text-[#5f574e]">
                                  Variant{" "}
                                  {variantIndex +
                                    1}
                                </p>

                                <button
                                  type="button"
                                  onClick={() =>
                                    removeProductVariant(
                                      variantIndex,
                                      false
                                    )
                                  }
                                  className="text-[10px] font-semibold text-red-600 hover:text-red-700"
                                >
                                  Remove
                                </button>

                              </div>

                              <div className="mt-2 space-y-2">

                                {Object.entries(
                                  variant.options ||
                                    {}
                                ).map(
                                  ([
                                    optionKey,
                                    optionValue,
                                  ]) => (

                                    <div
                                      key={
                                        optionKey
                                      }
                                      className="flex gap-2"
                                    >

                                      <input
                                        className="w-1/3 rounded-lg border border-[#ded6c9] px-2.5 py-2 text-[10px] outline-none focus:border-[#0f766e]"
                                        placeholder="Option"
                                        value={
                                          optionKey
                                        }
                                        readOnly
                                      />

                                      <input
                                        className="min-w-0 flex-1 rounded-lg border border-[#ded6c9] px-2.5 py-2 text-[10px] outline-none focus:border-[#0f766e]"
                                        placeholder="Value"
                                        value={
                                          optionValue
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          updateVariantOption(
                                            variantIndex,
                                            optionKey,
                                            e
                                              .target
                                              .value,
                                            false
                                          )
                                        }
                                      />

                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeVariantOption(
                                            variantIndex,
                                            optionKey,
                                            false
                                          )
                                        }
                                        className="rounded-lg bg-red-50 px-2 text-xs font-bold text-red-600 hover:bg-red-100"
                                        title="Remove option"
                                      >
                                        ×
                                      </button>

                                    </div>

                                  )
                                )}

                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  addVariantOption(
                                    variantIndex,
                                    false
                                  )
                                }
                                className="mt-2 rounded-lg bg-[#edf7f5] px-2.5 py-1.5 text-[10px] font-semibold text-[#0f766e] hover:bg-[#dff1ee]"
                              >
                                + Add Option
                              </button>

                              <div className="mt-3 grid grid-cols-2 gap-2">

                                <div>
                                  <label className="mb-1 block text-[9px] font-semibold text-[#81786d]">
                                    Variant Price
                                  </label>

                                  <input
                                    type="number"
                                    min="0"
                                    value={
                                      variant.price
                                    }
                                    onChange={(e) =>
                                      updateVariantField(
                                        variantIndex,
                                        "price",
                                        e.target
                                          .value,
                                        false
                                      )
                                    }
                                    className="w-full rounded-lg border border-[#ded6c9] px-2.5 py-2 text-[10px] outline-none focus:border-[#0f766e]"
                                  />
                                </div>

                                <div>
                                  <label className="mb-1 block text-[9px] font-semibold text-[#81786d]">
                                    Variant Stock
                                  </label>

                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={
                                      variant.stock
                                    }
                                    onChange={(e) =>
                                      updateVariantField(
                                        variantIndex,
                                        "stock",
                                        e.target
                                          .value,
                                        false
                                      )
                                    }
                                    className="w-full rounded-lg border border-[#ded6c9] px-2.5 py-2 text-[10px] outline-none focus:border-[#0f766e]"
                                  />
                                </div>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    )}

                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#0f766e] py-2.5 text-xs font-bold text-white transition hover:bg-[#115e59]"
                  >
                    + Create Product
                  </button>

                </form>

              </div>

            </div>

          )}

          {/* =================================================
              STORES
          ================================================= */}

          {activeTab === "stores" && (

            <div>

              <div className="mb-4">

                <h2 className="text-sm font-bold text-[#3f382f]">
                  My Stores
                </h2>

                <p className="mt-0.5 text-xs text-[#81786d]">
                  {stores.length} stores under your
                  account
                </p>

              </div>

              {stores.length === 0 ? (

                <div className="rounded-xl border border-[#ded6c9] bg-white py-14 text-center shadow-sm">

                  <p className="text-3xl">🏬</p>

                  <h3 className="mt-3 text-lg font-bold text-[#3f382f]">
                    No stores yet
                  </h3>

                  <p className="mt-1 text-xs text-[#81786d]">
                    Create your first store below.
                  </p>

                </div>

              ) : (

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                  {stores.map(
                    (currentStore) => (

                      <div
                        key={currentStore._id}
                        className="rounded-xl border border-[#ded6c9] bg-white p-4 shadow-sm transition hover:shadow-md"
                      >

                        {editingStoreId ===
                        currentStore._id ? (

                          <form
                            onSubmit={updateStore}
                            className="space-y-2.5"
                          >

                            <h3 className="text-sm font-bold text-[#3f382f]">
                              Edit Store
                            </h3>

                            <input
                              className="w-full rounded-lg border border-[#ded6c9] px-3 py-2 text-xs outline-none focus:border-[#0f766e]"
                              placeholder="Store name"
                              value={
                                editStore.name
                              }
                              onChange={(e) =>
                                setEditStore({
                                  ...editStore,
                                  name: e.target
                                    .value,
                                })
                              }
                            />

                            <input
                              className="w-full rounded-lg border border-[#ded6c9] px-3 py-2 text-xs outline-none focus:border-[#0f766e]"
                              placeholder="store-slug"
                              value={
                                editStore.slug
                              }
                              onChange={(e) =>
                                setEditStore({
                                  ...editStore,
                                  slug: e.target
                                    .value,
                                })
                              }
                            />

                            <textarea
                              className="w-full rounded-lg border border-[#ded6c9] px-3 py-2 text-xs outline-none focus:border-[#0f766e]"
                              placeholder="Description"
                              rows="2"
                              value={
                                editStore.description
                              }
                              onChange={(e) =>
                                setEditStore({
                                  ...editStore,
                                  description:
                                    e.target
                                      .value,
                                })
                              }
                            />

                            <div className="grid gap-3 sm:grid-cols-2">

                              <div>
                                <label className="mb-1.5 block text-[10px] font-semibold text-[#5f574e]">
                                  Store Logo
                                </label>

                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    setEditStore({
                                      ...editStore,
                                      logo: e.target.files?.[0] || "",
                                    })
                                  }
                                  className="w-full rounded-lg border border-[#ded6c9] bg-white px-3 py-2 text-xs text-[#5f574e] outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#edf7f5] file:px-2.5 file:py-1.5 file:text-[10px] file:font-semibold file:text-[#0f766e] hover:border-[#8fc9c1]"
                                />
                              </div>

                              <div>
                                <label className="mb-1.5 block text-[10px] font-semibold text-[#5f574e]">
                                  Store Banner
                                </label>

                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    setEditStore({
                                      ...editStore,
                                      banner: e.target.files?.[0] || "",
                                    })
                                  }
                                  className="w-full rounded-lg border border-[#ded6c9] bg-white px-3 py-2 text-xs text-[#5f574e] outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#edf7f5] file:px-2.5 file:py-1.5 file:text-[10px] file:font-semibold file:text-[#0f766e] hover:border-[#8fc9c1]"
                                />
                              </div>

                            </div>

                            <div className="flex gap-2 pt-1">

                              <button
                                type="submit"
                                className="flex-1 rounded-lg bg-[#0f766e] py-2 text-xs font-semibold text-white hover:bg-[#115e59]"
                              >
                                Save
                              </button>

                              <button
                                type="button"
                                onClick={
                                  cancelEditingStore
                                }
                                className="flex-1 rounded-lg bg-[#eee8de] py-2 text-xs font-semibold text-[#5f574e] hover:bg-[#e3dbcf]"
                              >
                                Cancel
                              </button>

                            </div>

                          </form>

                        ) : (

                          <>

                            <div className="flex items-start justify-between gap-3">

                              <div className="min-w-0">

                                <h3 className="truncate text-sm font-bold text-[#3f382f]">
                                  {
                                    currentStore.name
                                  }
                                </h3>

                                <p className="mt-0.5 truncate text-[10px] text-[#9a9084]">
                                  /
                                  {
                                    currentStore.slug
                                  }
                                </p>

                              </div>

                              <span
                                className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${
                                  currentStore.status ===
                                  "SUSPENDED"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-[#edf7f5] text-[#0f766e]"
                                }`}
                              >
                                {currentStore.status ||
                                  "ACTIVE"}
                              </span>

                            </div>

                            <p className="mt-3 line-clamp-3 text-[11px] leading-5 text-[#81786d]">
                              {currentStore.description ||
                                "No description available."}
                            </p>

                            <div className="mt-4 grid grid-cols-2 gap-2">

                              <button
                                onClick={() =>
                                  startEditingStore(
                                    currentStore
                                  )
                                }
                                className="rounded-lg bg-[#edf7f5] py-2 text-xs font-semibold text-[#0f766e] hover:bg-[#dff1ee]"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  deleteStore(
                                    currentStore._id
                                  )
                                }
                                className="rounded-lg bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                              >
                                Delete
                              </button>

                            </div>

                          </>

                        )}

                      </div>

                    )
                  )}

                </div>

              )}

              <div className="mt-6 rounded-xl border border-[#ded6c9] bg-white p-5 shadow-sm">

                <div className="mb-4">

                  <h2 className="text-sm font-bold text-[#3f382f]">
                    Create New Store
                  </h2>

                  <p className="mt-0.5 text-xs text-[#81786d]">
                    Set up another store under your
                    vendor account
                  </p>

                </div>

                <form
                  onSubmit={createStore}
                  className="space-y-3"
                >

                  <input
                    className="w-full rounded-lg border border-[#ded6c9] px-3 py-2.5 text-xs outline-none focus:border-[#0f766e]"
                    placeholder="Store name"
                    value={store.name}
                    onChange={(e) =>
                      setStore({
                        ...store,
                        name: e.target.value,
                      })
                    }
                  />

                  <input
                    className="w-full rounded-lg border border-[#ded6c9] px-3 py-2.5 text-xs outline-none focus:border-[#0f766e]"
                    placeholder="store-slug"
                    value={store.slug}
                    onChange={(e) =>
                      setStore({
                        ...store,
                        slug: e.target.value,
                      })
                    }
                  />

                  <textarea
                    className="w-full rounded-lg border border-[#ded6c9] px-3 py-2.5 text-xs outline-none focus:border-[#0f766e]"
                    placeholder="Description"
                    rows="2"
                    value={store.description}
                    onChange={(e) =>
                      setStore({
                        ...store,
                        description:
                          e.target.value,
                      })
                    }
                  />

                  <div className="grid gap-3 sm:grid-cols-2">

                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold text-[#5f574e]">
                        Store Logo
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setStore({
                            ...store,
                            logo: e.target.files?.[0] || "",
                          })
                        }
                        className="w-full rounded-lg border border-[#ded6c9] bg-white px-3 py-2 text-xs text-[#5f574e] outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#edf7f5] file:px-2.5 file:py-1.5 file:text-[10px] file:font-semibold file:text-[#0f766e] hover:border-[#8fc9c1]"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold text-[#5f574e]">
                        Store Banner
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setStore({
                            ...store,
                            banner: e.target.files?.[0] || "",
                          })
                        }
                        className="w-full rounded-lg border border-[#ded6c9] bg-white px-3 py-2 text-xs text-[#5f574e] outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#edf7f5] file:px-2.5 file:py-1.5 file:text-[10px] file:font-semibold file:text-[#0f766e] hover:border-[#8fc9c1]"
                      />
                    </div>

                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#6f4e37] py-2.5 text-xs font-bold text-white transition hover:bg-[#5c3f2d]"
                  >
                    + Create Store
                  </button>

                </form>

              </div>

            </div>

          )}

          {/* =================================================
              ANALYTICS
          ================================================= */}

          {activeTab === "analytics" && (

            <div className="space-y-5">

              <div className="rounded-xl border border-[#ded6c9] bg-white p-5 shadow-sm">

                <div>

                  <h2 className="text-sm font-bold text-[#3f382f]">
                    Revenue Trend
                  </h2>

                  <p className="mt-0.5 text-xs text-[#81786d]">
                    Paid revenue over the last 7 days
                  </p>

                </div>

                <div className="mt-4 h-64">

                  {chartData.length > 0 ? (

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <LineChart
                        data={chartData}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#ded6c9"
                        />

                        <XAxis
                          dataKey="dateLabel"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#81786d",
                          }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#81786d",
                          }}
                        />

                        <Tooltip
                          formatter={(value) =>
                            formatCurrency(value)
                          }
                          contentStyle={{
                            borderRadius: "10px",
                            border: "none",
                            fontSize: "12px",
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#0f766e"
                          strokeWidth={2.5}
                          dot={{
                            r: 3,
                            fill: "#0f766e",
                          }}
                        />

                      </LineChart>

                    </ResponsiveContainer>

                  ) : (

                    <div className="flex h-full items-center justify-center text-xs text-[#9a9084]">
                      No data available
                    </div>

                  )}

                </div>

              </div>

              <div className="rounded-xl border border-[#ded6c9] bg-white p-5 shadow-sm">

                <div>

                  <h2 className="text-sm font-bold text-[#3f382f]">
                    Order Trend
                  </h2>

                  <p className="mt-0.5 text-xs text-[#81786d]">
                    Orders received in the last 7 days
                  </p>

                </div>

                <div className="mt-4 h-64">

                  {chartData.length > 0 ? (

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <BarChart
                        data={chartData}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#ded6c9"
                        />

                        <XAxis
                          dataKey="dateLabel"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#81786d",
                          }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#81786d",
                          }}
                        />

                        <Tooltip />

                        <Bar
                          dataKey="orders"
                          fill="#0f766e"
                          radius={[5, 5, 0, 0]}
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  ) : (

                    <div className="flex h-full items-center justify-center text-xs text-[#9a9084]">
                      No data available
                    </div>

                  )}

                </div>

              </div>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}