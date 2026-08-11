import React, { useEffect, useState } from "react";
import api from "../services/api.js";

export default function VendorDashboard() {
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);

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
        ordersResponse,
      ] = await Promise.all([
        api.get("/analytics/vendor"),
        api.get("/stores"),
        api.get("/orders/vendor"),
      ]);

      setData(analyticsResponse.data);
      setOrders(ordersResponse.data.orders || []);

      const stores = storesResponse.data.stores || [];

      if (stores.length > 0) {
        const mine = stores[0];

        setStore({
          name: mine.name || "",
          slug: mine.slug || "",
          description: mine.description || "",
        });

        setProduct((p) => ({
          ...p,
          storeId: mine._id,
        }));
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createStore(e) {
    e.preventDefault();

    try {
      const response = await api.post("/stores", store);

      setStore(response.data.store);

      setProduct((p) => ({
        ...p,
        storeId: response.data.store._id,
      }));

      alert("Store created successfully!");

      await loadDashboard();
    } catch (error) {
      console.error("Create store error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to create store"
      );
    }
  }

  async function createProduct(e) {
    e.preventDefault();

    if (!product.storeId) {
      alert("Please create a store first.");
      return;
    }

    try {
      await api.post("/products", {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
      });

      alert("Product created successfully!");

      setProduct({
        storeId: product.storeId,
        name: "",
        price: 0,
        stock: 0,
      });

      await loadDashboard();
    } catch (error) {
      console.error("Create product error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to create product"
      );
    }
  }

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

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-3xl font-black">
          Loading Vendor Dashboard...
        </h1>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-4xl font-black">
        Vendor Dashboard
      </h1>

      {/* Analytics */}
      {data && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Stores", data.stores || 0],
            ["Products", data.products || 0],
            ["Orders", data.orders || 0],
            [`Revenue`, `₹${data.revenue || 0}`],
          ].map(([key, value]) => (
            <div
              key={key}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-slate-500">
                {key}
              </p>

              <p className="mt-2 text-3xl font-black">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Orders */}
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

                    <h3 className="mt-1 text-xl font-bold">
                      ₹{order.total}
                    </h3>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Payment
                    </p>

                    <p className="font-bold text-green-600">
                      {order.paymentStatus}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Current Status
                    </p>

                    <p className="font-bold">
                      {order.status}
                    </p>
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

                {/* Status controls */}
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
                    className="mt-2 w-full rounded-xl border p-3 md:w-72"
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

      {/* Store and Product */}
      <div className="mt-10 grid gap-8 md:grid-cols-2">

        {/* Create Store */}
        <form
          onSubmit={createStore}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <h2 className="text-2xl font-bold">
            Create Store
          </h2>

          <input
            className="mt-4 w-full rounded-lg border p-3"
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
            className="mt-3 w-full rounded-lg border p-3"
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
            className="mt-3 w-full rounded-lg border p-3"
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
            className="mt-4 rounded-lg bg-slate-900 px-5 py-3 font-bold text-white"
          >
            Create Store
          </button>
        </form>

        {/* Create Product */}
        <form
          onSubmit={createProduct}
          className="rounded-2xl border bg-white p-6 shadow-sm"
        >
          <h2 className="text-2xl font-bold">
            Create Product
          </h2>

          <input
            className="mt-4 w-full rounded-lg border p-3"
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
            className="mt-3 w-full rounded-lg border p-3"
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
            className="mt-3 w-full rounded-lg border p-3"
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
            className="mt-4 rounded-lg bg-indigo-600 px-5 py-3 font-bold text-white"
          >
            Create Product
          </button>
        </form>
      </div>
    </main>
  );
}