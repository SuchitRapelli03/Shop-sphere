import React from "react";
import { Link } from "react-router-dom";

export default function Success() {
  return (
    <main className="min-h-screen bg-[#f5f1e9] px-6 py-16 text-[#30251f]">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">

        <section className="w-full overflow-hidden rounded-3xl border border-[#ded5ca] bg-white shadow-sm">

          {/* Top accent */}
          <div className="h-2 bg-[#674936]" />

          <div className="px-6 py-12 text-center sm:px-12 sm:py-16">

            {/* Success icon */}
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#e7f3e8]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#397344] text-3xl font-black text-white">
                ✓
              </div>
            </div>

            <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-[#6a9aa2]">
              ShopSphere Checkout
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Payment successful
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#81766d] sm:text-base">
              Your payment has been verified successfully and
              your order has been placed. We'll keep you updated
              as your order moves from preparation to delivery.
            </p>

            {/* Confirmation card */}
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-[#c7dfe2] bg-[#e5f1f3] p-5 text-left">
              <div className="flex gap-4">
                <div className="text-2xl">
                  🔒
                </div>

                <div>
                  <p className="font-black text-[#365f66]">
                    Payment securely verified
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#55777d]">
                    Your order is now available in your
                    order history. You can track its status
                    from the My Orders page.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/orders"
                className="rounded-xl bg-[#674936] px-7 py-3.5 text-sm font-black text-white transition hover:bg-[#543a2b]"
              >
                View My Orders
              </Link>

              <Link
                to="/products"
                className="rounded-xl border border-[#d8cec2] bg-white px-7 py-3.5 text-sm font-black text-[#674936] transition hover:bg-[#faf8f4]"
              >
                Continue Shopping
              </Link>
            </div>

            <p className="mt-7 text-xs text-[#9a8f85]">
              Thank you for shopping with ShopSphere.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
