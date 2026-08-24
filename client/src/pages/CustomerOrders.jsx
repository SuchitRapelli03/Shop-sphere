import React, { useCallback, useEffect, useState } from "react";
import api from "../services/api.js";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async (initial = false) => {
    try {
      if (initial) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const { data } = await api.get("/orders/my");

      setOrders(data.orders || []);
      setError("");
    } catch (error) {
      console.error("Orders loading error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadOrders(true);
  }, [loadOrders]);

  // Automatically check for updates every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [loadOrders]);

  // Cancel order
  async function handleCancelOrder(orderId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingOrderId(orderId);
      setError("");

      const { data } = await api.put(
        `/orders/${orderId}/cancel`
      );

      // Update the cancelled order immediately
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? data.order
            : order
        )
      );

    } catch (error) {
      console.error("Order cancellation error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to cancel the order."
      );
    } finally {
      setCancellingOrderId(null);
    }
  }

  // Status styling
  function getStatusStyle(status) {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";

      case "SHIPPED":
        return "bg-blue-100 text-blue-700";

      case "CONFIRMED":
        return "bg-indigo-100 text-indigo-700";

      case "PROCESSING":
        return "bg-purple-100 text-purple-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      case "PLACED":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  // Timeline
  function getStatusIndex(status) {
    const statuses = [
      "PLACED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED"
    ];

    return statuses.indexOf(status?.toUpperCase());
  }

  function renderTimeline(status) {
    if (status?.toUpperCase() === "CANCELLED") {
      return (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-lg">
              ✕
            </div>

            <div>
              <p className="font-bold text-red-700">
                Order Cancelled
              </p>

              <p className="mt-1 text-sm text-red-600">
                This order has been cancelled.
              </p>
            </div>
          </div>
        </div>
      );
    }

    const statuses = [
      {
        name: "PLACED",
        label: "Order Placed",
        icon: "🛒"
      },
      {
        name: "PROCESSING",
        label: "Processing",
<<<<<<< HEAD
        icon: "⚙️"
=======
        icon: "⚙️",
>>>>>>> abhay
      },
      
      {
        name: "SHIPPED",
        label: "Shipped",
        icon: "🚚"
      },
      {
        name: "DELIVERED",
        label: "Delivered",
        icon: "📦"
      }
    ];

    const currentIndex = getStatusIndex(status);

    return (
      <div className="mt-6">
        <h3 className="mb-5 text-lg font-bold">
          Order Tracking
        </h3>

        <div className="relative">
          {statuses.map((item, index) => {
            const completed =
              currentIndex >= index;

            const active =
              currentIndex === index;

            return (
              <div
                key={item.name}
                className="relative flex gap-4 pb-7 last:pb-0"
              >
                {/* Connecting line */}
                {index < statuses.length - 1 && (
                  <div
                    className={`absolute left-5 top-10 h-full w-0.5 ${
                      currentIndex > index
                        ? "bg-indigo-600"
                        : "bg-slate-200"
                    }`}
                  />
                )}

                {/* Circle */}
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    completed
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  } ${
                    active
                      ? "ring-4 ring-indigo-100"
                      : ""
                  }`}
                >
                  {item.icon}
                </div>

                {/* Text */}
                <div>
                  <p
                    className={`font-bold ${
                      completed
                        ? "text-slate-900"
                        : "text-slate-400"
                    }`}
                  >
                    {item.label}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {active
                      ? "Current order status"
                      : completed
                      ? "Completed"
                      : "Waiting"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="text-4xl font-black">
            My Orders
          </h1>

          <p className="mt-3 text-slate-600">
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  // Error
  if (error && orders.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <h1 className="text-4xl font-black">
            My Orders
          </h1>

          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
            {error}
          </div>

          <button
            onClick={() => loadOrders(true)}
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="font-semibold text-indigo-600">
              ShopSphere
            </p>

            <h1 className="mt-1 text-4xl font-black">
              My Orders
            </h1>

            <p className="mt-2 text-slate-600">
              Track your orders and see their latest status.
            </p>
          </div>

          <button
            onClick={() => loadOrders(false)}
            disabled={refreshing}
            className="rounded-xl border bg-white px-5 py-3 font-semibold shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            {refreshing
              ? "Updating..."
              : "↻ Refresh"}
          </button>
        </div>

        {/* Auto update */}
        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-3 text-sm text-indigo-700">
          🔄 Order status automatically updates every 15 seconds.
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Orders */}
        {orders.length === 0 ? (
          <div className="mt-8 rounded-3xl border bg-white p-12 text-center shadow-sm">
            <div className="text-6xl">
              🛍️
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              No orders yet
            </h2>

            <p className="mt-2 text-slate-500">
              Your orders will appear here after you complete a purchase.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {orders.map((order) => {

              const orderStatus =
                order.status?.toUpperCase();

              const canCancel =
                orderStatus === "PLACED" ||
                orderStatus === "PROCESSING";

              const isCancelling =
                cancellingOrderId === order._id;

              return (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-3xl border bg-white shadow-sm"
                >

<<<<<<< HEAD
                  {/* Order header */}
                  <div className="flex flex-col justify-between gap-5 border-b p-6 md:flex-row md:items-center">
=======
                    <p className="mt-1 font-bold">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                        Placed on{" "}
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "Date unavailable"}
                    </p>
                  </div>
>>>>>>> abhay

                    <div>
                      <p className="text-sm text-slate-500">
                        Order ID
                      </p>

                      <p className="mt-1 font-bold">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Status
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {order.status || "UNKNOWN"}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Payment
                      </p>

                      <p className="mt-1 font-bold">
                        {order.paymentStatus}
                      </p>
                    </div>

                  </div>

                  {/* Tracking */}
                  <div className="p-6">
                    {renderTimeline(order.status)}
                  </div>

                  {/* Items */}
                  <div className="border-t p-6">
                    <h3 className="text-lg font-bold">
                      Items
                    </h3>

                    <div className="mt-4 space-y-4">
                      {order.items?.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                        >
                          <div>
                            <p className="font-semibold">
                              {item.name}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              Quantity: {item.quantity}
                            </p>
                          </div>

                          <p className="font-bold">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total + Cancel */}
                  <div className="flex flex-col gap-4 border-t bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <span className="text-lg font-bold">
                        Total
                      </span>

                      <p className="text-2xl font-black text-indigo-600">
                        ₹{order.total}
                      </p>
                    </div>

                    {canCancel && (
                      <button
                        onClick={() =>
                          handleCancelOrder(order._id)
                        }
                        disabled={isCancelling}
                        className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isCancelling
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}