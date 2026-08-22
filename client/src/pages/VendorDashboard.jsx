import React, { useEffect, useState } from "react";
import api from "../services/api.js";

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
    price: 0,
    stock: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
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

      // Only show vendor's stores
      const allStores = storesResponse.data.stores || [];

      setStores(allStores);

      // Get products
      const allProducts = productsResponse.data.products || [];

      setProducts(allProducts);

      // Select first store automatically
      if (allStores.length > 0) {
        const mine = allStores[0];

        setProduct((current) => ({
          ...current,
          storeId: current.storeId || mine._id,
        }));
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------
  // CREATE STORE
  // -----------------------------

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
    } catch (error) {
      console.error("Create store error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to create store"
      );
    }
  }

  // -----------------------------
  // DELETE STORE
  // -----------------------------

  async function deleteStore(storeId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this store?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/stores/${storeId}`);

      alert("Store deleted successfully!");

      await loadDashboard();
    } catch (error) {
      console.error("Delete store error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete store"
      );
    }
  }

  // -----------------------------
  // CREATE PRODUCT
  // -----------------------------

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
        price: 0,
        stock: 0,
      }));

      await loadDashboard();
    } catch (error) {
      console.error("Create product error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to create product"
      );
    }
  }

  // -----------------------------
  // DELETE PRODUCT
  // -----------------------------

  async function deleteProduct(productId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/products/${productId}`);

      alert("Product deleted successfully!");

      await loadDashboard();
    } catch (error) {
      console.error("Delete product error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete product"
      );
    }
  }

  // -----------------------------
  // UPDATE ORDER STATUS
  // -----------------------------

  async function updateOrderStatus(orderId, status) {
    try {
      await api.put(`/orders/${orderId}/status`, {
        status,
      });

      await loadDashboard();

      alert("Order status updated successfully!");
    } catch (error) {
      console.error("Order status update error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to update order status"
      );
    }
  }

  // -----------------------------
  // LOADING
  // -----------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="text-3xl font-black">
            Loading Vendor Dashboard...
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* Header */}
        <div>
          <p className="font-semibold text-indigo-600">
            ShopSphere
          </p>

          <h1 className="mt-1 text-4xl font-black">
            Vendor Dashboard
          </h1>

          <p className="mt-2 text-slate-600">
            Manage your stores, products and customer orders.
          </p>
        </div>

        {/* ----------------------------- */}
        {/* ANALYTICS */}
        {/* ----------------------------- */}

        {data && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Stores", data.stores || 0],
              ["Products", data.products || 0],
              ["Orders", data.orders || 0],
              ["Revenue", `₹${data.revenue || 0}`],
            ].map(([key, value]) => (
              <div
                key={key}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-500">
                  {key}
                </p>

                <p className="mt-2 text-3xl font-black">
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ----------------------------- */}
        {/* MY STORES */}
        {/* ----------------------------- */}

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">
                My Stores
              </h2>

              <p className="mt-1 text-slate-600">
                Manage the stores you own.
              </p>
            </div>

            <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700">
              {stores.length} Stores
            </span>
          </div>

          {stores.length === 0 ? (
            <div className="mt-6 rounded-2xl border bg-white p-8 text-center">
              <h3 className="text-xl font-bold">
                No stores yet
              </h3>

              <p className="mt-2 text-slate-600">
                Create your first store below.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {stores.map((currentStore) => (
                <div
                  key={currentStore._id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold">
                        {currentStore.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        /{currentStore.slug}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      ACTIVE
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-slate-600">
                    {currentStore.description ||
                      "No description available."}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      deleteStore(currentStore._id)
                    }
                    className="mt-5 w-full rounded-xl bg-red-50 px-4 py-3 font-bold text-red-600 transition hover:bg-red-100"
                  >
                    Delete Store
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ----------------------------- */}
        {/* MY PRODUCTS */}
        {/* ----------------------------- */}

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">
                My Products
              </h2>

              <p className="mt-1 text-slate-600">
                Manage products available in your stores.
              </p>
            </div>

            <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-bold text-purple-700">
              {products.length} Products
            </span>
          </div>

          {products.length === 0 ? (
            <div className="mt-6 rounded-2xl border bg-white p-8 text-center">
              <h3 className="text-xl font-bold">
                No products yet
              </h3>

              <p className="mt-2 text-slate-600">
                Create a product using the form below.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {products.map((currentProduct) => (
                <div
                  key={currentProduct._id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <h3 className="text-xl font-bold">
                    {currentProduct.name}
                  </h3>

                  <p className="mt-2 text-lg font-black text-indigo-600">
                    ₹{currentProduct.price}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                      Stock: {currentProduct.stock}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      deleteProduct(currentProduct._id)
                    }
                    className="mt-5 w-full rounded-xl bg-red-50 px-4 py-3 font-bold text-red-600 transition hover:bg-red-100"
                  >
                    Delete Product
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ----------------------------- */}
        {/* CUSTOMER ORDERS */}
        {/* ----------------------------- */}

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">
                Customer Orders
              </h2>

              <p className="mt-1 text-slate-600">
                Manage orders placed in your store.
              </p>
            </div>

            <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700">
              {orders.length} Orders
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="mt-6 rounded-2xl border bg-white p-8 text-center">
              <h3 className="text-xl font-bold">
                No orders yet
              </h3>

              <p className="mt-2 text-slate-600">
                Customer orders will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-2xl border bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                    <div>
                      <p className="text-sm text-slate-500">
                        Order #{order._id.slice(-8)}
                      </p>
                        
                      <p className="mt-1 text-sm text-slate-500">
                        Placed on{" "}
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "Date unavailable"}
                      </p>

                      <h3 className="mt-1 text-xl font-bold">
                        ₹{order.total}
                      </h3>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Payment
                      </p>

                      <p className="font-bold">
                        {order.paymentStatus}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Current Status
                      </p>

                      <span className="mt-1 inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mt-5 border-t pt-5">
                    <h4 className="font-bold">
                      Items
                    </h4>

                    <div className="mt-3 space-y-2">
                      {order.items?.map((item) => (
                        <div
                          key={item.productId}
                          className="flex justify-between rounded-lg bg-slate-50 p-3"
                        >
                          <div>
                            <p className="font-semibold">
                              {item.name}
                            </p>

                            <p className="text-sm text-slate-500">
                              Quantity: {item.quantity}
                            </p>
                          </div>

                          <p className="font-semibold">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Update status */}
                  <div className="mt-5 border-t pt-5">
                    <label className="text-sm font-semibold text-slate-600">
                      Update Order Status
                    </label>

                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(
                          order._id,
                          e.target.value
                        )
                      }
                      className="mt-2 w-full rounded-xl border bg-white p-3 md:w-72"
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
              ))}
            </div>
          )}
        </section>

        {/* ----------------------------- */}
        {/* CREATE STORE + PRODUCT */}
        {/* ----------------------------- */}

        <div className="mt-10 grid gap-8 md:grid-cols-2">

          {/* CREATE STORE */}
          <form
            onSubmit={createStore}
            className="rounded-2xl border bg-white p-6 shadow-sm"
          >
            <h2 className="text-2xl font-bold">
              Create Store
            </h2>

            <input
              className="mt-4 w-full rounded-xl border p-3 outline-none focus:border-indigo-500"
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
              className="mt-3 w-full rounded-xl border p-3 outline-none focus:border-indigo-500"
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
              className="mt-3 w-full rounded-xl border p-3 outline-none focus:border-indigo-500"
              placeholder="Description"
              rows="4"
              value={store.description}
              onChange={(e) =>
                setStore({
                  ...store,
                  description: e.target.value,
                })
              }
            />

            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
            >
              + Create Store
            </button>
          </form>

          {/* CREATE PRODUCT */}
          <form
            onSubmit={createProduct}
            className="rounded-2xl border bg-white p-6 shadow-sm"
          >
            <h2 className="text-2xl font-bold">
              Create Product
            </h2>

            <select
              className="mt-4 w-full rounded-xl border bg-white p-3"
              value={product.storeId}
              onChange={(e) =>
                setProduct({
                  ...product,
                  storeId: e.target.value,
                })
              }
            >
              <option value="">
                Select Store
              </option>

              {stores.map((currentStore) => (
                <option
                  key={currentStore._id}
                  value={currentStore._id}
                >
                  {currentStore.name}
                </option>
              ))}
            </select>

            <input
              className="mt-3 w-full rounded-xl border p-3 outline-none focus:border-indigo-500"
              placeholder="Product name"
              value={product.name}
              onChange={(e) =>
                setProduct({
                  ...product,
                  name: e.target.value,
                })
              }
            />

            <input
              className="mt-3 w-full rounded-xl border p-3 outline-none focus:border-indigo-500"
              placeholder="Price"
              type="number"
              min="0"
              value={product.price}
              onChange={(e) =>
                setProduct({
                  ...product,
                  price: e.target.value,
                })
              }
            />

            <input
              className="mt-3 w-full rounded-xl border p-3 outline-none focus:border-indigo-500"
              placeholder="Stock"
              type="number"
              min="0"
              value={product.stock}
              onChange={(e) =>
                setProduct({
                  ...product,
                  stock: e.target.value,
                })
              }
            />

            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700"
            >
              + Create Product
            </button>
          </form>

        </div>

      </div>
    </main>
  );
}