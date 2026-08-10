import { useEffect, useState } from "react";
import api from "../services/api.js";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/analytics/admin").then((r) => setData(r.data)); }, []);

  if (!data) return <main className="p-10">Loading...</main>;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="text-4xl font-black">Super Admin Dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {[
          ["Users", data.users], ["Vendors", data.vendors], ["Stores", data.stores],
          ["Products", data.products], ["Orders", data.orders], ["Revenue", `₹${data.revenue}`]
        ].map(([k, v]) => <div className="rounded-2xl border bg-white p-5" key={k}><p className="text-sm text-slate-500">{k}</p><p className="mt-2 text-2xl font-black">{v}</p></div>)}
      </div>
    </main>
  );
}
