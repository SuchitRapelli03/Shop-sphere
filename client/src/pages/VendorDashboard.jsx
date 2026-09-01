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
  });

  const [product, setProduct] = useState({
    storeId: "",
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    images: [],
  });

  const [editingStoreId, setEditingStoreId] = useState(null);

  const [editStore, setEditStore] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const [editingProductId, setEditingProductId] = useState(null);

  const [editProduct, setEditProduct] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    images: [],
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
        api.get("/stores"),
        api.get("/products"),
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

  async function createStore(e) {
    e.preventDefault();

    if (!store.name || !store.slug) {
      alert("Please enter store name and slug.");
      return;
    }

    try {
      const response = await api.post("/stores", store);

      alert("Store created successfully!");

      setStore({
        name: "",
        slug: "",
        description: "",
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
    });
  }

  function cancelEditingStore() {
    setEditingStoreId(null);

    setEditStore({
      name: "",
      slug: "",
      description: "",
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
      await api.put(`/stores/${editingStoreId}`, {
        name: editStore.name.trim(),
        slug: editStore.slug.trim().toLowerCase(),
        description: editStore.description.trim(),
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
      images: Array.isArray(currentProduct.images)
        ? currentProduct.images
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
      images: [],
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

    try {
      await api.put(`/products/${editingProductId}`, {
        name: editProduct.name.trim(),
        description: editProduct.description.trim(),
        price: Number(editProduct.price),
        stock: Number(editProduct.stock),
        category: editProduct.category.trim(),
        images: editProduct.images,
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

    if (!product.name) {
      alert("Please enter product name.");
      return;
    }

    try {
      await api.post("/products", {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
      });

      alert("Product created successfully!");

      setProduct((current) => ({
        ...current,
        name: "",
        description: "",
        price: 0,
        stock: 0,
        category: "",
        images: [],
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
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f6]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />

          <p className="mt-3 text-sm font-medium text-slate-600">
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
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7f6] p-6">
        <div className="w-full max-w-sm rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-red-600">
            Failed to Load Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {error}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-5 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f6]">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/10 bg-[#0d3b2e] text-white transition-all duration-500 ${
          sidebarOpen
            ? "w-30"
            : "w-0 overflow-hidden"
        }`}
      >

        {/* Logo */}

        <div className="flex h-[68px] items-center gap-3 border-b border-white/10 px-5">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300">

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

            <p className="text-[11px] text-emerald-200/60">
              Vendor Panel
            </p>
          </div>

        </div>

        {/* Navigation */}

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
                  ? "bg-emerald-400/15 text-white"
                  : "text-emerald-100/65 hover:bg-white/5 hover:text-white"
              }`}
            >

              <span className="flex items-center gap-3">

                <span className="flex h-5 w-5 items-center justify-center text-base">
                  {item.icon}
                </span>

                {item.label}

              </span>

              {item.badge > 0 && (
                <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
                  {item.badge}
                </span>
              )}

            </button>

          ))}

        </nav>

        {/* Account */}

        <div className="border-t border-white/10 p-3">

          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20 text-xs font-bold text-emerald-100">
              V
            </div>

            <div className="min-w-0">

              <p className="truncate text-xs font-semibold">
                Vendor Account
              </p>

              <p className="truncate text-[10px] text-emerald-200/50">
                Store Admin
              </p>

            </div>

          </div>

        </div>

      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <main
        className={`min-h-screen transition-all duration-500 ${
          sidebarOpen
            ? "ml-56"
            : "ml-0"
        }`}
      >

        {/* ===================================================
            TOP NAVBAR
        =================================================== */}

        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-slate-200/70 bg-white/90 px-5 backdrop-blur-md lg:px-6">

          <div className="flex min-w-0 items-center gap-3">

            {/* Sidebar Toggle */}

            <button
              onClick={() =>
                setSidebarOpen(!sidebarOpen)
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
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

              <h1 className="truncate text-lg font-bold text-slate-900">
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

              <p className="hidden text-xs text-slate-500 sm:block">
                Manage your stores, products & orders
              </p>

            </div>

          </div>

          <button
            onClick={loadDashboard}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <span className="text-sm">↻</span>
            Refresh
          </button>

        </header>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <div className="p-5 lg:p-6">

          {/* =================================================
              OVERVIEW
          ================================================= */}

          {activeTab === "overview" && (
            <>

              {/* Metric Cards */}

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
                    className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:shadow-md"
                  >

                    <div className="flex items-center justify-between">

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-700">
                        {card.icon}
                      </div>

                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
                        {card.change}
                      </span>

                    </div>

                    <p className="mt-4 text-xs font-medium text-slate-500">
                      {card.label}
                    </p>

                    <p className="mt-0.5 text-xl font-bold text-slate-900">
                      {card.value}
                    </p>

                  </div>

                ))}

              </div>

              {/* Chart + Status */}

              <div className="mt-5 grid gap-5 lg:grid-cols-3">

                {/* Revenue Chart */}

                <div className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm lg:col-span-2">

                  <div className="flex items-center justify-between">

                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Sales Overview
                      </h2>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Last 7 days revenue
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
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
                                stopColor="#059669"
                                stopOpacity={0.25}
                              />

                              <stop
                                offset="95%"
                                stopColor="#059669"
                                stopOpacity={0}
                              />

                            </linearGradient>

                          </defs>

                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e2e8f0"
                          />

                          <XAxis
                            dataKey="dateLabel"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#94a3b8",
                              fontSize: 10,
                            }}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "#94a3b8",
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
                            stroke="#059669"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                          />

                        </AreaChart>

                      </ResponsiveContainer>

                    ) : (

                      <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        No revenue data yet
                      </div>

                    )}

                  </div>

                </div>

                {/* Order Status */}

                <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">

                  <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">

                    <p className="text-xs font-medium text-slate-500">
                      Pending Orders
                    </p>

                    <p className="mt-1 text-2xl font-bold text-amber-500">
                      {data?.pendingOrders || 0}
                    </p>

                  </div>

                  <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">

                    <p className="text-xs font-medium text-slate-500">
                      Completed
                    </p>

                    <p className="mt-1 text-2xl font-bold text-emerald-600">
                      {data?.completedOrders || 0}
                    </p>

                  </div>

                  <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">

                    <p className="text-xs font-medium text-slate-500">
                      Cancelled
                    </p>

                    <p className="mt-1 text-2xl font-bold text-red-500">
                      {data?.cancelledOrders || 0}
                    </p>

                  </div>

                </div>

              </div>

              {/* Recent Orders */}

              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                  <div>

                    <h2 className="text-sm font-bold text-slate-900">
                      Recent Orders
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Latest customer purchases
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setActiveTab("orders")
                    }
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    View all →
                  </button>

                </div>

                <div className="overflow-x-auto">

                  <table className="w-full text-left text-xs">

                    <thead className="bg-slate-50 text-slate-500">

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

                    <tbody className="divide-y divide-slate-100">

                      {orders.slice(0, 5).map(
                        (order) => (

                          <tr
                            key={order._id}
                            className="transition hover:bg-emerald-50/20"
                          >

                            <td className="px-5 py-3 font-semibold text-slate-900">
                              #
                              {order._id
                                .slice(-8)
                                .toUpperCase()}
                            </td>

                            <td className="px-5 py-3 text-slate-500">
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

                            <td className="px-5 py-3 font-semibold text-slate-900">
                              {formatCurrency(
                                order.total
                              )}
                            </td>

                            <td className="px-5 py-3">

                              <span
                                className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                  order.status ===
                                  "DELIVERED"
                                    ? "bg-emerald-50 text-emerald-700"
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
                                    ? "bg-emerald-50 text-emerald-700"
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
                            className="px-5 py-10 text-center text-xs text-slate-400"
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

                <div className="rounded-xl border border-slate-200/70 bg-white py-14 text-center shadow-sm">

                  <p className="text-3xl">📦</p>

                  <h3 className="mt-3 text-lg font-bold text-slate-900">
                    No orders yet
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Customer orders will appear here.
                  </p>

                </div>

              ) : (

                orders.map((order) => (

                  <div
                    key={order._id}
                    className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm"
                  >

                    {/* Order Header */}

                    <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 md:flex-row md:items-center md:justify-between">

                      <div>

                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Order ID
                        </p>

                        <p className="mt-0.5 text-sm font-bold text-slate-900">
                          #
                          {order._id
                            .slice(-8)
                            .toUpperCase()}
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-500">
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

                          <p className="mb-1 text-[10px] text-slate-400">
                            Status
                          </p>

                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                            {order.status}
                          </span>

                        </div>

                        <div>

                          <p className="mb-1 text-[10px] text-slate-400">
                            Payment
                          </p>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              order.paymentStatus ===
                              "PAID"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* Shipping */}

                    {order.shippingAddress && (

                      <div className="mt-4 rounded-lg bg-slate-50 p-3">

                        <p className="text-xs font-semibold text-slate-700">
                          Delivery Details
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-900">
                          {
                            order.shippingAddress
                              .fullName
                          }
                        </p>

                        <p className="text-[11px] text-slate-500">
                          📞{" "}
                          {
                            order.shippingAddress
                              .phone
                          }
                        </p>

                        <p className="mt-1 text-[11px] text-slate-500">
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

                    {/* Items */}

                    <div className="mt-4 space-y-1.5">

                      {order.items?.map(
                        (item, index) => (

                          <div
                            key={
                              item.productId ||
                              index
                            }
                            className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5"
                          >

                            <div>

                              <p className="text-xs font-semibold text-slate-800">
                                {item.name}
                              </p>

                              <p className="text-[10px] text-slate-500">
                                Qty: {item.quantity}
                              </p>

                            </div>

                            <p className="text-xs font-semibold text-slate-900">
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

                    {/* Total */}

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

                      <span className="text-sm font-bold text-slate-900">
                        Total
                      </span>

                      <span className="text-lg font-bold text-emerald-700">
                        {formatCurrency(
                          order.total
                        )}
                      </span>

                    </div>

                    {/* Status */}

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                      <label className="text-xs font-medium text-slate-500">
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
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-emerald-500 sm:w-52"
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

                  <h2 className="text-sm font-bold text-slate-900">
                    Products
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {products.length} products in your
                    catalog
                  </p>

                </div>

              </div>

              {products.length === 0 ? (

                <div className="rounded-xl border border-slate-200/70 bg-white py-14 text-center shadow-sm">

                  <p className="text-3xl">🛍️</p>

                  <h3 className="mt-3 text-lg font-bold">
                    No products yet
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Create your first product below.
                  </p>

                </div>

              ) : (

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                  {products.map(
                    (currentProduct) => (

                      <div
                        key={currentProduct._id}
                        className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:shadow-md"
                      >

                        {editingProductId ===
                        currentProduct._id ? (

                          <form
                            onSubmit={
                              updateProduct
                            }
                            className="space-y-2.5"
                          >

                            <h3 className="text-sm font-bold">
                              Edit Product
                            </h3>

                            <input
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
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
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
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
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                                placeholder="Price"
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
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                                placeholder="Stock"
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

                            <input
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
                              placeholder="Category"
                              value={
                                editProduct.category
                              }
                              onChange={(e) =>
                                setEditProduct({
                                  ...editProduct,
                                  category:
                                    e.target
                                      .value,
                                })
                              }
                            />

                            <div className="flex gap-2 pt-1">

                              <button
                                type="submit"
                                className="flex-1 rounded-lg bg-emerald-700 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                              >
                                Save
                              </button>

                              <button
                                type="button"
                                onClick={
                                  cancelEditingProduct
                                }
                                className="flex-1 rounded-lg bg-slate-100 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                              >
                                Cancel
                              </button>

                            </div>

                          </form>

                        ) : (

                          <>

                            <div className="flex items-start justify-between gap-3">

                              <div className="min-w-0">

                                <h3 className="truncate text-sm font-bold text-slate-900">
                                  {
                                    currentProduct.name
                                  }
                                </h3>

                                <p className="mt-1 text-base font-bold text-emerald-700">
                                  {formatCurrency(
                                    currentProduct.price
                                  )}
                                </p>

                              </div>

                              <span
                                className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${
                                  currentProduct
                                    .stock >
                                  0
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-red-50 text-red-600"
                                }`}
                              >
                                {currentProduct.stock >
                                0
                                  ? "In stock"
                                  : "Out"}
                              </span>

                            </div>

                            {currentProduct.description && (

                              <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-slate-500">
                                {
                                  currentProduct.description
                                }
                              </p>

                            )}

                            <div className="mt-3 flex flex-wrap gap-1.5">

                              {currentProduct.category && (

                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-medium text-emerald-700">
                                  {
                                    currentProduct.category
                                  }
                                </span>

                              )}

                              <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-500">
                                Stock:{" "}
                                {
                                  currentProduct.stock
                                }
                              </span>

                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">

                              <button
                                onClick={() =>
                                  startEditingProduct(
                                    currentProduct
                                  )
                                }
                                className="rounded-lg bg-emerald-50 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
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

                    )
                  )}

                </div>

              )}

              {/* Create Product */}

              <div className="mt-6 rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm">

                <div className="mb-4">

                  <h2 className="text-sm font-bold text-slate-900">
                    Create New Product
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Add a product to one of your stores
                  </p>

                </div>

                <form
                  onSubmit={createProduct}
                  className="space-y-3"
                >

                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
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
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
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
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
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
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
                      placeholder="Price"
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
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
                      placeholder="Stock"
                      value={product.stock}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          stock: e.target.value,
                        })
                      }
                    />

                  </div>

                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
                    placeholder="Category"
                    value={product.category}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        category:
                          e.target.value,
                      })
                    }
                  />

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-emerald-700 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800"
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

                <h2 className="text-sm font-bold text-slate-900">
                  My Stores
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {stores.length} stores under your
                  account
                </p>

              </div>

              {stores.length === 0 ? (

                <div className="rounded-xl border border-slate-200/70 bg-white py-14 text-center shadow-sm">

                  <p className="text-3xl">🏬</p>

                  <h3 className="mt-3 text-lg font-bold">
                    No stores yet
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Create your first store below.
                  </p>

                </div>

              ) : (

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                  {stores.map(
                    (currentStore) => (

                      <div
                        key={currentStore._id}
                        className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:shadow-md"
                      >

                        {editingStoreId ===
                        currentStore._id ? (

                          <form
                            onSubmit={updateStore}
                            className="space-y-2.5"
                          >

                            <h3 className="text-sm font-bold">
                              Edit Store
                            </h3>

                            <input
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
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
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
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
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
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

                            <div className="flex gap-2 pt-1">

                              <button
                                type="submit"
                                className="flex-1 rounded-lg bg-emerald-700 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                              >
                                Save
                              </button>

                              <button
                                type="button"
                                onClick={
                                  cancelEditingStore
                                }
                                className="flex-1 rounded-lg bg-slate-100 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                              >
                                Cancel
                              </button>

                            </div>

                          </form>

                        ) : (

                          <>

                            <div className="flex items-start justify-between gap-3">

                              <div className="min-w-0">

                                <h3 className="truncate text-sm font-bold text-slate-900">
                                  {
                                    currentStore.name
                                  }
                                </h3>

                                <p className="mt-0.5 truncate text-[10px] text-slate-400">
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
                                    : "bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                {currentStore.status ||
                                  "ACTIVE"}
                              </span>

                            </div>

                            <p className="mt-3 line-clamp-3 text-[11px] leading-5 text-slate-500">
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
                                className="rounded-lg bg-emerald-50 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
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

              {/* Create Store */}

              <div className="mt-6 rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm">

                <div className="mb-4">

                  <h2 className="text-sm font-bold text-slate-900">
                    Create New Store
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Set up another store under your
                    vendor account
                  </p>

                </div>

                <form
                  onSubmit={createStore}
                  className="space-y-3"
                >

                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
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
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
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
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-emerald-500"
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

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
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

              {/* Revenue */}

              <div className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm">

                <div>

                  <h2 className="text-sm font-bold text-slate-900">
                    Revenue Trend
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
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
                          stroke="#e2e8f0"
                        />

                        <XAxis
                          dataKey="dateLabel"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#94a3b8",
                          }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#94a3b8",
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
                          stroke="#059669"
                          strokeWidth={2.5}
                          dot={{
                            r: 3,
                            fill: "#059669",
                          }}
                        />

                      </LineChart>

                    </ResponsiveContainer>

                  ) : (

                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      No data available
                    </div>

                  )}

                </div>

              </div>

              {/* Orders */}

              <div className="rounded-xl border border-slate-200/70 bg-white p-5 shadow-sm">

                <div>

                  <h2 className="text-sm font-bold text-slate-900">
                    Order Trend
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
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
                          stroke="#e2e8f0"
                        />

                        <XAxis
                          dataKey="dateLabel"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#94a3b8",
                          }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fill: "#94a3b8",
                          }}
                        />

                        <Tooltip />

                        <Bar
                          dataKey="orders"
                          fill="#059669"
                          radius={[5, 5, 0, 0]}
                        />

                      </BarChart>

                    </ResponsiveContainer>

                  ) : (

                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
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