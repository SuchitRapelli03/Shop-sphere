import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCart } from "../redux/slices/cartSlice.js";
import api from "../services/api.js";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  async function add() {
    if (adding || isOutOfStock) return;

    try {
      setAdding(true);

      const { data } = await api.post("/cart/items", {
        productId: product._id,
        quantity,
      });

      dispatch(setCart(data.cart.items));

      alert("Added to cart successfully!");
    } catch (error) {
      console.error("Add to cart error:", error);

      alert(
        error.response?.data?.message ||
          "Please login as a customer to add items."
      );
    } finally {
      setAdding(false);
    }
  }

  function openProduct() {
    navigate(`/product/${product._id}`);
  }

  const image =
    product.images?.[0] ||
    "https://placehold.co/600x400?text=Product";

  const stock =
    product.stock ??
    product.inventory ??
    null;

  const isOutOfStock =
    stock !== null && Number(stock) <= 0;

  const maxQuantity =
    stock !== null
      ? Number(stock)
      : 99;

  function increaseQuantity(e) {
    e.stopPropagation();

    setQuantity((current) =>
      Math.min(current + 1, maxQuantity)
    );
  }

  function decreaseQuantity(e) {
    e.stopPropagation();

    setQuantity((current) =>
      Math.max(current - 1, 1)
    );
  }

  return (
    <article
      onClick={openProduct}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#d8d0c5] bg-[#ebe7df] shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#a5cbd0] hover:bg-[#e6f0f1] hover:shadow-lg"
    >
      {/* IMAGE */}

      <div className="relative h-52 overflow-hidden bg-[#d7e7e8] sm:h-56">
        <img
          src={image}
          alt={product.name || "Product"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Category */}

        <div className="absolute left-2.5 top-2.5 rounded-full bg-[#674936] px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-[#f7f0e7] shadow-sm">
          {product.category || "Featured"}
        </div>

        {/* Stock */}

        {isOutOfStock && (
          <div className="absolute right-2.5 top-2.5 rounded-full bg-[#30251f] px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-white">
            Out of stock
          </div>
        )}

        {/* View product */}

        <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-black text-[#674936] opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100">
          View details →
        </div>
      </div>

      {/* INFORMATION */}

      <div className="flex flex-1 flex-col p-4">

        {/* Store */}

        <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#64939c]">
          {product.storeId?.name || "ShopSphere"}
        </p>

        {/* Product name */}

        <h2 className="mt-1.5 line-clamp-2 min-h-[40px] text-sm font-black leading-5 text-[#392d26]">
          {product.name || "Product"}
        </h2>

        {/* Description */}

        <p className="mt-2 line-clamp-2 min-h-[36px] text-[10px] leading-4 text-[#81766d]">
          {product.description || "No description available."}
        </p>

        {/* PRICE */}

        <div className="mt-auto pt-4">

          <div className="flex items-end justify-between gap-2">

            <div>
              <p className="text-[8px] text-[#91867c]">
                Price
              </p>

              <p className="mt-0.5 text-lg font-black text-[#30251f]">
                ₹{Number(product.price || 0).toLocaleString("en-IN")}
              </p>
            </div>

            {/* CART CONTROLS */}

            {isOutOfStock ? (
              <button
                type="button"
                disabled
                onClick={(e) => e.stopPropagation()}
                className="rounded-lg bg-[#30251f] px-3 py-2 text-[9px] font-black text-white opacity-50"
              >
                Unavailable
              </button>
            ) : (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex h-9 items-center overflow-hidden rounded-lg border border-[#b9aaa0] bg-white"
              >
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || adding}
                  className="flex h-full w-8 items-center justify-center text-base font-black text-[#674936] transition hover:bg-[#e5f1f3] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  −
                </button>

                <span className="flex h-full min-w-7 items-center justify-center border-x border-[#ddd3ca] text-[10px] font-black text-[#30251f]">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={
                    quantity >= maxQuantity ||
                    adding
                  }
                  className="flex h-full w-8 items-center justify-center text-base font-black text-[#174c3c] transition hover:bg-[#e5f1f3] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  +
                </button>
              </div>
            )}

          </div>

          {/* ADD BUTTON */}

          {!isOutOfStock && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                add();
              }}
              disabled={adding}
              className="mt-3 w-full rounded-lg bg-[#174c3c] px-3 py-2.5 text-[10px] font-black text-white transition hover:bg-[#123c30] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {adding
                ? "Adding..."
                : `Add ${quantity} to Cart`}
            </button>
          )}

        </div>
      </div>
    </article>
  );
}