import React from "react";
import { useDispatch } from "react-redux";
import { setCart } from "../redux/slices/cartSlice.js";
import api from "../services/api.js";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  async function add() {
    try {
      const { data } = await api.post("/cart/items", {
        productId: product._id,
        quantity: 1,
      });

      dispatch(setCart(data.cart.items));

      alert("Added to cart successfully!");
    } catch (error) {
      console.error("Add to cart error:", error);

      alert(
        error.response?.data?.message ||
          "Please login as a customer to add items."
      );
    }
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

      {/* Product Image */}
      <div className="relative flex h-56 items-center justify-center overflow-hidden bg-slate-100">

        <img
          src={
            product.images?.[0] ||
            "https://placehold.co/600x400?text=Product"
          }
          alt={product.name || "Product"}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 rounded-md bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          ShopSphere
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-5">

        {/* Store */}
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {product.storeId?.name || "ShopSphere Store"}
        </p>

        {/* Name */}
        <h2 className="mt-2 line-clamp-2 min-h-[3.5rem] text-lg font-bold leading-7 text-slate-900">
          {product.name || "Product"}
        </h2>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {product.description || "No description available."}
        </p>

        {/* Price + Action */}
        <div className="mt-auto pt-5">

          <div className="flex items-center justify-between gap-4">

            <div>
              <p className="text-xs text-slate-400">
                Price
              </p>

              <p className="mt-1 text-xl font-black text-slate-900">
                ₹{product.price ?? "—"}
              </p>
            </div>

            <button
              type="button"
              onClick={add}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 active:scale-95"
            >
              Add to Cart
            </button>

          </div>

        </div>
      </div>
    </article>
  );
}