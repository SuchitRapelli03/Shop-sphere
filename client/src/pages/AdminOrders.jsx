import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import AdminLayout from "../components/AdminLayout.jsx";
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
  <AdminLayout
    title="Order Management"
    subtitle="Monitor all ShopSphere marketplace orders"
    search={search}
    onSearchChange={setSearch}
    searchPlaceholder="Search orders, customers, vendors..."
    actions={
      <button
        type="button"
        onClick={loadOrders}
        className="flex items-center gap-2 rounded-2xl bg-white/80 px-3 py-2.5 text-xs font-bold text-slate-500 shadow-[4px_4px_10px_rgba(163,177,198,0.2),-4px_-4px_10px_rgba(255,255,255,0.9)] transition hover:bg-white hover:text-violet-500"
      >
        <span className="text-base">↻</span>
        <span className="hidden sm:inline">Refresh</span>
      </button>
    }
  >
    {/* PAGE HEADER */}
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">
          Operations
        </p>

        <h2 className="mt-1 text-2xl font-black text-slate-800 md:text-3xl">
          Order Management
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          View and monitor all ShopSphere orders.
        </p>
      </div>

      <div className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-xs font-bold text-slate-600 shadow-[4px_4px_10px_rgba(163,177,198,0.25),-4px_-4px_10px_rgba(255,255,255,0.9)]">
        <span className="h-2 w-2 rounded-full bg-violet-400" />
        {filteredOrders.length} orders found
      </div>
    </div>

    {/* FILTERS */}
    <section className="mb-6 rounded-[2rem] border border-white/60 bg-[#e6ebf5] p-5 shadow-[10px_10px_20px_rgba(163,177,198,0.3),-10px_-10px_20px_rgba(255,255,255,0.9)]">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 items-center rounded-2xl bg-white/80 px-4 py-3 shadow-sm md:hidden">
          <span className="mr-2 text-xs text-slate-400">🔎</span>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order, customer, vendor or store..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-xs font-bold text-slate-500 outline-none shadow-sm focus:ring-2 focus:ring-violet-100"
        >
          {statusOptions.map((item) => (
            <option key={item || "ALL"} value={item}>
              {item || "All Statuses"}
            </option>
          ))}
        </select>
      </div>
    </section>

    {/* ERROR */}
    {error && (
      <div className="mb-6 rounded-[2rem] border border-rose-200 bg-rose-50/80 p-5 shadow-sm">
        <p className="font-bold text-rose-600">
          Failed to load orders
        </p>

        <p className="mt-1 text-sm text-slate-600">
          {error}
        </p>
      </div>
    )}

    {/* ORDERS */}
    {loading ? (
      <div className="rounded-[2rem] border border-white/60 bg-[#e6ebf5] p-12 text-center shadow-[10px_10px_20px_rgba(163,177,198,0.3),-10px_-10px_20px_rgba(255,255,255,0.9)]">
        <p className="text-sm font-semibold text-slate-400">
          Loading orders...
        </p>
      </div>
    ) : filteredOrders.length === 0 ? (
      <div className="rounded-[2rem] border border-white/60 bg-[#e6ebf5] p-14 text-center shadow-[10px_10px_20px_rgba(163,177,198,0.3),-10px_-10px_20px_rgba(255,255,255,0.9)]">
        <div className="text-5xl">📦</div>

        <h2 className="mt-4 text-xl font-black text-slate-800">
          No orders found
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Try changing your search or status filter.
        </p>
      </div>
    ) : (
      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <article
            key={order._id}
            className="overflow-hidden rounded-[2rem] border border-white/60 bg-[#e6ebf5] shadow-[10px_10px_20px_rgba(163,177,198,0.3),-10px_-10px_20px_rgba(255,255,255,0.9)]"
          >
            {/* ORDER HEADER */}
            <div className="border-b border-slate-200/60 px-5 py-5 lg:px-6">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Order ID
                  </p>

                  <p className="mt-2 font-black text-slate-800">
                    #{order._id?.slice(-8).toUpperCase()}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString(
                          "en-IN",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }
                        )
                      : "Date unavailable"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Order Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-[9px] font-black tracking-wide ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status || "UNKNOWN"}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Payment
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-[9px] font-black tracking-wide ${getPaymentStyle(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus || "UNKNOWN"}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Total
                  </p>

                  <p className="mt-1 text-2xl font-black text-violet-600">
                    ₹{Number(order.total || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            {/* CUSTOMER / VENDOR / STORE */}
            <div className="grid gap-4 px-5 pt-5 md:grid-cols-3 lg:px-6">
              {[
                {
                  title: "Customer",
                  name: order.customerId?.name || "Customer unavailable",
                  sub: order.customerId?.email || "Email unavailable",
                  icon: "👤",
                },
                {
                  title: "Vendor",
                  name: order.vendorId?.name || "Vendor unavailable",
                  sub: order.vendorId?.email || "Email unavailable",
                  icon: "🏪",
                },
                {
                  title: "Store",
                  name: order.storeId?.name || "Store unavailable",
                  sub: order.storeId?.slug
                    ? `/${order.storeId.slug}`
                    : "Slug unavailable",
                  icon: "🏬",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl bg-white/60 p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-sm shadow-sm">
                      {item.icon}
                    </span>

                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {item.title}
                    </p>
                  </div>

                  <p className="mt-3 font-bold text-slate-800">
                    {item.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {item.sub}
                  </p>
                </div>
              ))}
            </div>

            {/* SHIPPING */}
            <div className="mx-5 mt-5 rounded-2xl border border-violet-100 bg-violet-50/70 p-5 lg:mx-6">
              <h3 className="font-black text-slate-800">
                📦 Shipping Address
              </h3>

              {order.shippingAddress ? (
                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  <p className="font-bold">
                    {order.shippingAddress.fullName}
                  </p>

                  <p>📞 {order.shippingAddress.phone}</p>

                  <p>{order.shippingAddress.addressLine}</p>

                  <p>
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.state} -{" "}
                    {order.shippingAddress.pincode}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">
                  Shipping details unavailable.
                </p>
              )}
            </div>

            {/* ITEMS */}
            <div className="px-5 py-5 lg:px-6">
              <h3 className="text-base font-black text-slate-800">
                Items
              </h3>

              <div className="mt-3 space-y-2">
                {order.items?.map((item, index) => (
                  <div
                    key={
                      item.productId ||
                      `${order._id}-${index}`
                    }
                    className="flex items-center justify-between rounded-2xl bg-white/60 p-4 shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-800">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <p className="font-black text-slate-800">
                      ₹
                      {(
                        (item.price || 0) *
                        (item.quantity || 0)
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    )}
  </AdminLayout>
);}