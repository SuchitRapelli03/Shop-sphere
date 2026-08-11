import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api.js";
import { setCart } from "../redux/slices/cartSlice.js";

export default function Cart() {
  const [cart, setLocal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    async function loadCart() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/cart");

        console.log("CART RESPONSE:", response.data);

        const cartData = response.data.cart;

        setLocal(cartData);
        dispatch(setCart(cartData?.items || []));
      } catch (error) {
        console.error("CART ERROR:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load cart."
        );
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadCart();
    } else {
      setLoading(false);
    }
  }, [user, dispatch]);

  async function checkout() {
  try {
    const response = await api.post("/orders");

    alert(
      response.data.message || "Order placed successfully!"
    );

    const { data } = await api.get("/cart");

    setLocal(data.cart);
    dispatch(setCart(data.cart?.items || []));
  } catch (error) {
    console.error("CHECKOUT ERROR:", error);

    alert(
      error.response?.data?.message ||
        "Unable to place order."
    );
  }
}

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl border bg-white p-8 text-center">
          <h1 className="text-2xl font-bold">
            Please login as a customer
          </h1>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-2xl font-bold">
          Loading cart...
        </h1>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl border bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">
            {error}
          </h1>
        </div>
      </main>
    );
  }

  const items = cart?.items || [];

  const total = items.reduce(
    (sum, item) =>
      sum +
      (item.productId?.price || 0) *
        item.quantity,
    0
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-4xl font-black">
        Your Cart
      </h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border bg-white p-8 text-center">
          <h2 className="text-xl font-bold">
            Your cart is empty
          </h2>

          <p className="mt-2 text-slate-600">
            Go to Products and add something to your cart.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId?._id}
                className="flex items-center justify-between rounded-xl border bg-white p-4"
              >
                <div>
                  <h2 className="font-bold">
                    {item.productId?.name}
                  </h2>

                  <p className="text-sm text-slate-500">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <span className="font-bold">
                  ₹
                  {(item.productId?.price || 0) *
                    item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between text-2xl font-black">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          <button
            onClick={checkout}
            className="mt-6 w-full rounded-xl bg-indigo-600 p-4 font-bold text-white hover:bg-indigo-700"
          >
            Place Order
          </button>
        </>
      )}
    </main>
  );
}