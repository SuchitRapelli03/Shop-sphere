import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import { Link } from "react-router-dom";
import api from "../services/api.js";

const statusOptions = [
  "",
  "PLACED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED"
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (status) {
        params.set("status", status);
      }

      const { data } = await api.get(
        `/admin/orders?${params.toString()}`
      );

      setOrders(data.orders || []);
    } catch (error) {
      console.error("ADMIN ORDERS ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return orders;
    }

    return orders.filter((order) => {
      const orderId =
        order._id?.toLowerCase() || "";

      const customerName =
        order.customerId?.name?.toLowerCase() || "";

      const customerEmail =
        order.customerId?.email?.toLowerCase() || "";

      const vendorName =
        order.vendorId?.name?.toLowerCase() || "";

      const vendorEmail =
        order.vendorId?.email?.toLowerCase() || "";

      const storeName =
        order.storeId?.name?.toLowerCase() || "";

      const storeSlug =
        order.storeId?.slug?.toLowerCase() || "";

      return (
        orderId.includes(query) ||
        customerName.includes(query) ||
        customerEmail.includes(query) ||
        vendorName.includes(query) ||
        vendorEmail.includes(query) ||
        storeName.includes(query) ||
        storeSlug.includes(query)
      );
    });
  }, [orders, search]);

  function getStatusStyle(orderStatus) {
    switch (orderStatus) {
      case "PLACED":
        return "bg-yellow-100 text-yellow-700";

      case "PROCESSING":
        return "bg-blue-100 text-blue-700";

      case "SHIPPED":
        return "bg-purple-100 text-purple-700";

      case "DELIVERED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  function getPaymentStyle(paymentStatus) {
    switch (paymentStatus) {
      case "PAID":
        return "bg-green-100 text-green-700";

      case "FAILED":
        return "bg-red-100 text-red-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="font-semibold text-indigo-600">
              ShopSphere Admin
            </p>

            <h1 className="mt-1 text-4xl font-black">
              Order Management
            </h1>

            <p className="mt-2 text-slate-600">
              View and monitor all ShopSphere orders.
            </p>
          </div>

          <Link
            to="/admin"
            className="rounded-xl border bg-white px-5 py-3 font-semibold shadow-sm transition hover:bg-slate-50"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* FILTERS */}
        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by order, customer, vendor or store..."
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-indigo-500"
            >
              {statusOptions.map((item) => (
                <option
                  key={item || "ALL"}
                  value={item}
                >
                  {item || "All Statuses"}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 text-sm text-slate-500">
            {filteredOrders.length}{" "}
            {filteredOrders.length === 1
              ? "order"
              : "orders"}{" "}
            found
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* ORDERS */}
        <section className="mt-8">
          {loading ? (
            <div className="rounded-2xl border bg-white p-10 text-center text-slate-500">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-2xl border bg-white p-10 text-center">
              <div className="text-5xl">
                📦
              </div>

              <h2 className="mt-4 text-2xl font-black">
                No orders found
              </h2>

              <p className="mt-2 text-slate-500">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <article
                  key={order._id}
                  className="rounded-2xl border bg-white p-6 shadow-sm"
                >
                  {/* ORDER HEADER */}
                  <div className="flex flex-col justify-between gap-5 border-b pb-5 lg:flex-row lg:items-start">
                    <div>
                      <p className="text-sm text-slate-500">
                        Order ID
                      </p>

                      <p className="mt-1 font-black text-slate-900">
                        #{order._id
                          ?.slice(-8)
                          .toUpperCase()}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleString(
                              "en-IN",
                              {
                                dateStyle: "medium",
                                timeStyle: "short"
                              }
                            )
                          : "Date unavailable"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Order Status
                      </p>

                      <span
                        className={`mt-1 inline-block rounded-full px-4 py-2 text-xs font-bold ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status ||
                          "UNKNOWN"}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Payment
                      </p>

                      <span
                        className={`mt-1 inline-block rounded-full px-4 py-2 text-xs font-bold ${getPaymentStyle(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus ||
                          "UNKNOWN"}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Total
                      </p>

                      <p className="mt-1 text-2xl font-black text-indigo-600">
                        ₹
                        {(order.total || 0).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* CUSTOMER / VENDOR / STORE */}
                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {/* CUSTOMER */}
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Customer
                      </p>

                      <p className="mt-2 font-bold text-slate-900">
                        {order.customerId?.name ||
                          "Customer unavailable"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {order.customerId?.email ||
                          "Email unavailable"}
                      </p>
                    </div>

                    {/* VENDOR */}
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Vendor
                      </p>

                      <p className="mt-2 font-bold text-slate-900">
                        {order.vendorId?.name ||
                          "Vendor unavailable"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {order.vendorId?.email ||
                          "Email unavailable"}
                      </p>
                    </div>

                    {/* STORE */}
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Store
                      </p>

                      <p className="mt-2 font-bold text-slate-900">
                        {order.storeId?.name ||
                          "Store unavailable"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {order.storeId?.slug
                          ? `/${order.storeId.slug}`
                          : "Slug unavailable"}
                      </p>
                    </div>
                  </div>

                  {/* SHIPPING */}
                  <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-5">
                    <h3 className="font-black text-slate-900">
                      📦 Shipping Address
                    </h3>

                    {order.shippingAddress ? (
                      <div className="mt-3 space-y-1 text-sm text-slate-700">
                        <p className="font-bold">
                          {
                            order.shippingAddress
                              .fullName
                          }
                        </p>

                        <p>
                          📞{" "}
                          {
                            order.shippingAddress
                              .phone
                          }
                        </p>

                        <p>
                          {
                            order.shippingAddress
                              .addressLine
                          }
                        </p>

                        <p>
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
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">
                        Shipping details unavailable.
                      </p>
                    )}
                  </div>

                  {/* ITEMS */}
                  <div className="mt-6">
                    <h3 className="text-lg font-black">
                      Items
                    </h3>

                    <div className="mt-3 space-y-2">
                      {order.items?.map(
                        (item, index) => (
                          <div
                            key={
                              item.productId ||
                              `${order._id}-${index}`
                            }
                            className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                          >
                            <div>
                              <p className="font-semibold">
                                {item.name}
                              </p>

                              <p className="mt-1 text-sm text-slate-500">
                                Quantity:{" "}
                                {item.quantity}
                              </p>
                            </div>

                            <p className="font-bold">
                              ₹
                              {(
                                (item.price || 0) *
                                (item.quantity || 0)
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}