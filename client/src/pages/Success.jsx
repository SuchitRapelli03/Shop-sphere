import { Link } from "react-router-dom";

export default function Success() {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <div className="rounded-3xl border bg-white p-10">
        <div className="text-5xl">✓</div>
        <h1 className="mt-4 text-4xl font-black">Payment successful</h1>
        <p className="mt-3 text-slate-500">Stripe has completed the checkout flow.</p>
        <Link className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-3 text-white" to="/orders">View orders</Link>
      </div>
    </main>
  );
}
