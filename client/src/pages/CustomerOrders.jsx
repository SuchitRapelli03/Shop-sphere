import React, { useCallback, useEffect, useState } from "react";
import api from "../services/api.js";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);

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
      console.error("ORDERS LOADING ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders(true);
  }, [loadOrders]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [loadOrders]);

  function getStatusLabel(status) {
    switch (status?.toUpperCase()) {
      case "PLACED":
        return "Order placed";

      case "PROCESSING":
        return "Processing";

      case "SHIPPED":
        return "Shipped";

      case "DELIVERED":
        return "Delivered";

      case "CANCELLED":
        return "Cancelled";

      default:
        return "Status unavailable";
    }
  }

  function getStatusMessage(status) {
    switch (status?.toUpperCase()) {
      case "PLACED":
        return "Your order has been placed successfully.";

      case "PROCESSING":
        return "The seller is preparing your order.";

      case "SHIPPED":
        return "Your order is on its way.";

      case "DELIVERED":
        return "Your order has been delivered.";

      case "CANCELLED":
        return "This order has been cancelled.";

      default:
        return "We're checking the latest order status.";
    }
  }

  function getStatusColors(status) {
    switch (status?.toUpperCase()) {
      case "DELIVERED":
        return {
          badge: "bg-[#e7f3e8] text-[#397344]",
          dot: "bg-[#397344]",
        };

      case "SHIPPED":
        return {
          badge: "bg-[#e5f1f3] text-[#365f66]",
          dot: "bg-[#4f858e]",
        };

      case "PROCESSING":
        return {
          badge: "bg-[#f8efe2] text-[#916b38]",
          dot: "bg-[#b4864b]",
        };

      case "CANCELLED":
        return {
          badge: "bg-[#fceaea] text-[#a34646]",
          dot: "bg-[#a34646]",
        };

      default:
        return {
          badge: "bg-[#f5eee3] text-[#80603d]",
          dot: "bg-[#80603d]",
        };
    }
  }

  function canCancel(order) {
    return ["PLACED", "PROCESSING"].includes(
      order.status?.toUpperCase()
    );
  }

  async function cancelOrder(orderId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingOrder(orderId);
      setError("");

      const { data } = await api.put(
        `/orders/${orderId}/cancel`
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === orderId
            ? data.order
            : order
        )
      );
    } catch (error) {
      console.error("CANCEL ORDER ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to cancel this order."
      );
    } finally {
      setCancellingOrder(null);
    }
  }

  function toggleOrder(orderId) {
    setExpandedOrder((current) =>
      current === orderId ? null : orderId
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "ALL") {
      return true;
    }

    return (
      order.status?.toUpperCase() ===
      activeFilter
    );
  });

  const filterCounts = {
    ALL: orders.length,
    PLACED: orders.filter(
      (order) => order.status === "PLACED"
    ).length,
    PROCESSING: orders.filter(
      (order) => order.status === "PROCESSING"
    ).length,
    SHIPPED: orders.filter(
      (order) => order.status === "SHIPPED"
    ).length,
    DELIVERED: orders.filter(
      (order) => order.status === "DELIVERED"
    ).length,
  };

  function formatDate(date) {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatDateTime(date) {
    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  function getProgressIndex(status) {
    const statuses = [
      "PLACED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
    ];

    return statuses.indexOf(
      status?.toUpperCase()
    );
  }

  function renderProgress(status) {
    if (status?.toUpperCase() === "CANCELLED") {
      return (
        <div className="mt-5 rounded-xl border border-[#efcaca] bg-[#fceaea] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#a34646] text-sm font-black text-white">
              ×
            </div>

            <div>
              <p className="text-sm font-black text-[#8d3939]">
                Order cancelled
              </p>

              <p className="mt-0.5 text-xs text-[#a85b5b]">
                This order will not be delivered.
              </p>
            </div>
          </div>
        </div>
      );
    }

    const steps = [
      "PLACED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
    ];

    const currentIndex =
      getProgressIndex(status);

    return (
      <div className="mt-5">
        <div className="flex items-center">
          {steps.map((step, index) => {
            const completed =
              currentIndex >= index;

            return (
              <React.Fragment key={step}>
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                    completed
                      ? "bg-[#674936] text-white"
                      : "border border-[#d8cec2] bg-white text-[#aaa096]"
                  }`}
                >
                  {completed ? "✓" : index + 1}
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      currentIndex > index
                        ? "bg-[#674936]"
                        : "bg-[#ded5ca]"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="mt-2 flex justify-between text-[10px] font-bold text-[#81766d]">
          <span>Placed</span>
          <span>Processing</span>
          <span>Shipped</span>
          <span>Delivered</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f1e9]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="animate-pulse">
            <div className="h-4 w-24 rounded bg-[#d8cec2]" />
            <div className="mt-3 h-10 w-56 rounded bg-[#ded5ca]" />
            <div className="mt-3 h-5 w-80 max-w-full rounded bg-[#e5ddd3]" />

            <div className="mt-8 h-14 rounded-xl bg-white" />

            <div className="mt-5 space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-52 rounded-2xl bg-white"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error && orders.length === 0) {
    return (
      <main className="min-h-screen bg-[#f5f1e9]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">⚠️</div>

            <h1 className="mt-5 text-2xl font-black">
              Unable to load your orders
            </h1>

            <p className="mt-2 text-sm text-[#81766d]">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadOrders(true)}
              className="mt-6 rounded-xl bg-[#674936] px-6 py-3 text-sm font-black text-white hover:bg-[#543a2b]"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f1e9] text-[#30251f]">

      {/* PAGE HEADER */}
      <section className="border-b border-[#ded5ca] bg-white">
        <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6a9aa2]">
                ShopSphere
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight">
                My Orders
              </h1>

              <p className="mt-1 text-sm text-[#81766d]">
                Track your purchases and delivery updates.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadOrders(false)}
              disabled={refreshing}
              className="rounded-xl border border-[#d8cec2] bg-white px-4 py-2.5 text-sm font-black text-[#674936] shadow-sm transition hover:bg-[#faf8f4] disabled:opacity-50"
            >
              {refreshing
                ? "Updating..."
                : "↻ Refresh"}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">

        {/* ERROR */}
        {error && orders.length > 0 && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* FILTERS */}
        <div className="overflow-x-auto rounded-2xl border border-[#ded5ca] bg-white shadow-sm">
          <div className="flex min-w-max">
            {[
              ["ALL", "All Orders"],
              ["PLACED", "Placed"],
              ["PROCESSING", "Processing"],
              ["SHIPPED", "Shipped"],
              ["DELIVERED", "Delivered"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveFilter(value)}
                className={`border-b-2 px-5 py-4 text-sm font-black transition ${
                  activeFilter === value
                    ? "border-[#674936] text-[#674936]"
                    : "border-transparent text-[#81766d] hover:text-[#674936]"
                }`}
              >
                {label}

                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-[10px] ${
                    activeFilter === value
                      ? "bg-[#e5f1f3] text-[#365f66]"
                      : "bg-[#f5f1e9] text-[#9a8f85]"
                  }`}
                >
                  {filterCounts[value]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* AUTO REFRESH */}
        {orders.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-xs text-[#81766d]">
            <span className="text-[#6a9aa2]">↻</span>
            Order status refreshes automatically every 15 seconds.
          </div>
        )}

        {/* EMPTY */}
        {filteredOrders.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-[#ded5ca] bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e5f1f3] text-4xl">
              📦
            </div>

            <h2 className="mt-5 text-xl font-black">
              {orders.length === 0
                ? "You haven't placed any orders yet"
                : "No orders in this category"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#81766d]">
              {orders.length === 0
                ? "Your completed purchases will appear here."
                : "Try another filter to see your orders."}
            </p>
          </div>
        ) : (
          /* ORDER LIST */
          <div className="mt-6 space-y-4">
            {filteredOrders.map((order) => {
              const colors = getStatusColors(
                order.status
              );

              const expanded =
                expandedOrder === order._id;

              const firstItem =
                order.items?.[0];

              const extraItems =
                Math.max(
                  (order.items?.length || 1) - 1,
                  0
                );

              const itemCount =
                order.items?.reduce(
                  (sum, item) =>
                    sum +
                    Number(item.quantity || 0),
                  0
                ) || 0;

              return (
                <article
                  key={order._id}
                  className="overflow-hidden rounded-2xl border border-[#ded5ca] bg-white shadow-sm"
                >
                  {/* ORDER META */}
                  <div className="flex flex-col gap-3 border-b border-[#eee7de] bg-[#faf8f4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                      <div>
                        <span className="text-[#9a8f85]">
                          Order ID
                        </span>

                        <span className="ml-2 font-black text-[#30251f]">
                          #
                          {order._id
                            .slice(-8)
                            .toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <span className="text-[#9a8f85]">
                          Ordered
                        </span>

                        <span className="ml-2 font-bold text-[#30251f]">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>

                      {order.storeId?.name && (
                        <div>
                          <span className="text-[#9a8f85]">
                            Store
                          </span>

                          <span className="ml-2 font-bold text-[#30251f]">
                            {order.storeId.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-black ${colors.badge}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  {/* MAIN ORDER */}
                  <div className="p-5">
                    <div className="flex flex-col gap-6 lg:flex-row">

                      {/* PRODUCT */}
                      <div className="flex min-w-0 flex-1 gap-4">
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#e5f1f3] sm:h-28 sm:w-28">
                          {firstItem?.productId?.images?.[0] ? (
                            <img
                              src={
                                firstItem
                                  .productId
                                  .images[0]
                              }
                              alt={
                                firstItem.name ||
                                "Product"
                              }
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-4xl">
                              📦
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 pt-1">
                          <h2 className="font-black text-[#30251f]">
                            {firstItem?.name ||
                              "Product"}
                          </h2>

                          <p className="mt-2 text-sm text-[#81766d]">
                            ₹
                            {Number(
                              firstItem?.price || 0
                            ).toLocaleString("en-IN")}{" "}
                            ×{" "}
                            {firstItem?.quantity || 0}
                          </p>

                          {extraItems > 0 && (
                            <p className="mt-1 text-xs font-bold text-[#6a9aa2]">
                              + {extraItems} more{" "}
                              {extraItems === 1
                                ? "product"
                                : "products"}
                            </p>
                          )}

                          <p className="mt-3 text-xs text-[#9a8f85]">
                            {itemCount}{" "}
                            {itemCount === 1
                              ? "item"
                              : "items"}{" "}
                            in this order
                          </p>
                        </div>
                      </div>

                      {/* DELIVERY STATUS */}
                      <div className="min-w-0 lg:w-80 lg:border-l lg:border-[#eee7de] lg:pl-6">
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${colors.dot}`}
                          />

                          <div>
                            <p className="font-black text-[#30251f]">
                              {getStatusLabel(
                                order.status
                              )}
                            </p>

                            <p className="mt-1 text-sm leading-5 text-[#81766d]">
                              {getStatusMessage(
                                order.status
                              )}
                            </p>
                          </div>
                        </div>

                        {renderProgress(
                          order.status
                        )}
                      </div>
                    </div>

                    {/* PRICE / ACTIONS */}
                    <div className="mt-6 flex flex-col gap-4 border-t border-[#eee7de] pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs text-[#9a8f85]">
                            Total amount
                          </p>

                          <p className="mt-1 text-xl font-black text-[#674936]">
                            ₹
                            {Number(
                              order.total || 0
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#9a8f85]">
                            Payment
                          </p>

                          <p className="mt-1 text-sm font-black text-[#397344]">
                            {order.paymentStatus ||
                              "PENDING"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {canCancel(order) && (
                          <button
                            type="button"
                            onClick={() =>
                              cancelOrder(
                                order._id
                              )
                            }
                            disabled={
                              cancellingOrder ===
                              order._id
                            }
                            className="rounded-xl border border-[#efcaca] px-4 py-2.5 text-xs font-black text-[#a34646] transition hover:bg-[#fceaea] disabled:opacity-50"
                          >
                            {cancellingOrder ===
                            order._id
                              ? "Cancelling..."
                              : "Cancel Order"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            toggleOrder(
                              order._id
                            )
                          }
                          className="rounded-xl border border-[#d8cec2] px-4 py-2.5 text-xs font-black text-[#674936] transition hover:bg-[#f5f1e9]"
                        >
                          {expanded
                            ? "Hide Details"
                            : "View Details"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED DETAILS */}
                  {expanded && (
                    <div className="border-t border-[#ded5ca] bg-[#faf8f4] px-5 py-6">

                      <div className="grid gap-6 lg:grid-cols-2">

                        {/* ALL ITEMS */}
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-wider text-[#674936]">
                            Order Items
                          </h3>

                          <div className="mt-4 space-y-3">
                            {order.items?.map(
                              (item, index) => (
                                <div
                                  key={
                                    item.productId ||
                                    index
                                  }
                                  className="flex items-center justify-between gap-4 rounded-xl border border-[#eee7de] bg-white p-3"
                                >
                                  <div className="min-w-0">
                                    <p className="text-sm font-black">
                                      {item.name}
                                    </p>

                                    <p className="mt-1 text-xs text-[#81766d]">
                                      ₹
                                      {Number(
                                        item.price ||
                                          0
                                      ).toLocaleString(
                                        "en-IN"
                                      )}{" "}
                                      ×{" "}
                                      {item.quantity}
                                    </p>
                                  </div>

                                  <p className="shrink-0 text-sm font-black text-[#674936]">
                                    ₹
                                    {(
                                      Number(
                                        item.price ||
                                          0
                                      ) *
                                      Number(
                                        item.quantity ||
                                          0
                                      )
                                    ).toLocaleString(
                                      "en-IN"
                                    )}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* DELIVERY DETAILS */}
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-wider text-[#674936]">
                            Delivery Details
                          </h3>

                          <div className="mt-4 rounded-xl border border-[#eee7de] bg-white p-4">
                            <p className="font-black">
                              {order.shippingAddress
                                ?.fullName ||
                                "Customer"}
                            </p>

                            <p className="mt-2 text-sm leading-6 text-[#81766d]">
                              {order.shippingAddress
                                ?.addressLine ||
                                "Address unavailable"}
                              <br />

                              {order.shippingAddress
                                ?.city || ""}
                              {order.shippingAddress
                                ?.city &&
                              order.shippingAddress
                                ?.state
                                ? ", "
                                : ""}
                              {order.shippingAddress
                                ?.state || ""}
                              {order.shippingAddress
                                ?.pincode
                                ? ` - ${order.shippingAddress.pincode}`
                                : ""}
                            </p>

                            {order.shippingAddress
                              ?.phone && (
                              <p className="mt-3 text-sm font-bold text-[#30251f]">
                                📞{" "}
                                {
                                  order
                                    .shippingAddress
                                    .phone
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* TIMELINE */}
                      <div className="mt-6 rounded-xl border border-[#c7dfe2] bg-[#e5f1f3] p-5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-black text-[#365f66]">
                              Current status
                            </p>

                            <p className="mt-1 text-xs text-[#55777d]">
                              {getStatusMessage(
                                order.status
                              )}
                            </p>
                          </div>

                          <p className="text-xs font-bold text-[#55777d]">
                            Updated{" "}
                            {formatDateTime(
                              order.updatedAt ||
                                order.createdAt
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
