import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { setCart } from "../redux/slices/cartSlice.js";

export default function Cart() {
  const [cart, setLocal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    async function loadCart() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/cart");

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

  async function loadRazorpayScript() {
    if (window.Razorpay) {
      return true;
    }

    return new Promise((resolve) => {
      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }

  async function checkout() {
    try {
      setPaymentLoading(true);
      setError("");

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay Checkout."
        );
      }

      const { data } = await api.post(
        "/payments/create-razorpay-order"
      );

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ShopSphere",
        description: "ShopSphere Order",
        order_id: data.razorpayOrderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || ""
        },
        theme: {
          color: "#4f46e5"
        },

        handler: async function (response) {
          try {
            setPaymentLoading(true);

            const verificationResponse = await api.post(
              "/payments/verify",
              {
                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature
              }
            );

            alert(
              verificationResponse.data.message ||
                "Payment successful!"
            );

            const cartResponse = await api.get("/cart");

            setLocal(cartResponse.data.cart);
            dispatch(
              setCart(
                cartResponse.data.cart?.items || []
              )
            );

            navigate("/checkout/success");
          } catch (error) {
            console.error(
              "PAYMENT VERIFICATION ERROR:",
              error
            );

            alert(
              error.response?.data?.message ||
                "Payment verification failed."
            );
          } finally {
            setPaymentLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Razorpay payment failed:",
            response.error
          );

          alert(
            response.error?.description ||
              "Payment failed. Please try again."
          );

          setPaymentLoading(false);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Unable to start payment."
      );

      setPaymentLoading(false);
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
            disabled={paymentLoading}
            className="mt-6 w-full rounded-xl bg-indigo-600 p-4 font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {paymentLoading
              ? "Processing..."
              : "Pay with Razorpay"}
          </button>
        </>
      )}
    </main>
  );
}