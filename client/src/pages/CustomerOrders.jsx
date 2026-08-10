import { useEffect, useState } from "react";
import api from "../services/api.js";

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { api.get("/orders/my").then((r) => setOrders(r.data.orders)); }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-black">My Orders</h1>
      <div className="mt-8 space-y-4">
        {orders.map((o) => (
          <div key={o._id} className="rounded-xl border bg-white p-5">
            <div className="flex justify-between">
              <b>#{o._id.slice(-8)}</b><span>{o.status}</span>
            </div>
            <p className="mt-2">Total: ₹{o.total}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
