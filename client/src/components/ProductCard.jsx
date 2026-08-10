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
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <img
        src={
          product.images?.[0] ||
          "https://placehold.co/600x400?text=Product"
        }
        className="h-48 w-full object-cover"
        alt={product.name}
      />

      <div className="p-5">
        <p className="text-sm font-semibold text-indigo-600">
          {product.storeId?.name || "ShopSphere Store"}
        </p>

        <h2 className="mt-2 text-xl font-bold">
          {product.name}
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          {product.description || "No description available."}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xl font-black">
            ₹{product.price}
          </span>

          <button
            onClick={add}
            className="rounded-lg bg-indigo-600 px-5 py-2 font-bold text-white hover:bg-indigo-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}