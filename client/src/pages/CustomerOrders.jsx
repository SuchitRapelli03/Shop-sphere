import React, { useEffect, useState } from "react";
import api from "../services/api.js";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);

        const { data } = await api.get("/orders/my");

        setOrders(data.orders || []);
      } catch (error) {
        console.error("Orders loading error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-black">
          My Orders
        </h1>

        <p className="mt-4 text-slate-600">
          Loading your orders...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl font-black">
          My Orders
        </h1>

        <div className="mt-8 rounded-2xl border bg-white p-6 text-red-600">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-4xl font-black">
        My Orders
      </h1>

      <p className="mt-2 text-slate-600">
        View your recent ShopSphere orders.
      </p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border bg-white p-10 text-center">
          <h2 className="text-xl font-bold">
            No orders yet
          </h2>

          <p className="mt-2 text-slate-600">
            Your completed orders will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
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

                  <h2 className="mt-1 text-xl font-bold">
                    {order.status}
                  </h2>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm text-slate-500">
                    Payment
                  </p>

                  <p className="font-bold text-green-600">
                    {order.paymentStatus}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t pt-5">
                <div className="space-y-3">
                  {order.items?.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between"
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

              <div className="mt-5 flex items-center justify-between border-t pt-5">
                <span className="text-lg font-bold">
                  Total
                </span>

                <span className="text-xl font-black">
                  ₹{order.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}