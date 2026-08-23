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

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

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

  function handleAddressChange(e) {
    const { name, value } = e.target;

    setShippingAddress((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function validateShippingAddress() {
    const {
      fullName,
      phone,
      addressLine,
      city,
      state,
      pincode,
    } = shippingAddress;

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !addressLine.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim()
    ) {
      return "Please complete all delivery details.";
    }

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      return "Please enter a valid 10-digit Indian phone number.";
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      return "Please enter a valid 6-digit pincode.";
    }

    return "";
  }

  async function loadRazorpayScript() {
    if (window.Razorpay) {
      return true;
    }

    return new Promise((resolve) => {
      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }

  async function checkout() {
    const addressError = validateShippingAddress();

    if (addressError) {
      alert(addressError);
      return;
    }

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
          name:
            shippingAddress.fullName ||
            user?.name ||
            "",
          email: user?.email || "",
          contact: shippingAddress.phone || "",
        },

        theme: {
          color: "#4f46e5",
        },

        handler: async function (response) {
          try {
            setPaymentLoading(true);

            const verificationResponse =
              await api.post("/payments/verify", {
                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature,

                shippingAddress,
              });

            alert(
              verificationResponse.data.message ||
                "Payment successful!"
            );

            const cartResponse =
              await api.get("/cart");

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
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

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
          {/* CART ITEMS */}

          <section className="mt-8">
            <h2 className="text-2xl font-black">
              Cart Items
            </h2>

            <div className="mt-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId?._id}
                  className="flex items-center justify-between rounded-xl border bg-white p-4"
                >
                  <div>
                    <h3 className="font-bold">
                      {item.productId?.name}
                    </h3>

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
          </section>

          {/* DELIVERY DETAILS */}

          <section className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
            <div>
              <p className="font-semibold text-indigo-600">
                Delivery
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Delivery Details
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Enter the details where you want your order
                delivered.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {/* FULL NAME */}

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <input
                  name="fullName"
                  type="text"
                  value={shippingAddress.fullName}
                  onChange={handleAddressChange}
                  placeholder="Enter recipient name"
                  className="mt-2 w-full rounded-xl border p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* PHONE */}

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Phone Number
                </label>

                <input
                  name="phone"
                  type="tel"
                  maxLength="10"
                  value={shippingAddress.phone}
                  onChange={handleAddressChange}
                  placeholder="10-digit mobile number"
                  className="mt-2 w-full rounded-xl border p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* PINCODE */}

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Pincode
                </label>

                <input
                  name="pincode"
                  type="text"
                  maxLength="6"
                  value={shippingAddress.pincode}
                  onChange={handleAddressChange}
                  placeholder="6-digit pincode"
                  className="mt-2 w-full rounded-xl border p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* ADDRESS */}

              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">
                  Address
                </label>

                <textarea
                  name="addressLine"
                  rows="3"
                  value={shippingAddress.addressLine}
                  onChange={handleAddressChange}
                  placeholder="House number, street, area, landmark..."
                  className="mt-2 w-full rounded-xl border p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* CITY */}

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  City
                </label>

                <input
                  name="city"
                  type="text"
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  placeholder="City"
                  className="mt-2 w-full rounded-xl border p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* STATE */}

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  State
                </label>

                <input
                  name="state"
                  type="text"
                  value={shippingAddress.state}
                  onChange={handleAddressChange}
                  placeholder="State"
                  className="mt-2 w-full rounded-xl border p-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </section>

          {/* TOTAL + PAYMENT */}

          <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-2xl font-black">
              <span>Total</span>

              <span className="text-indigo-600">
                ₹{total}
              </span>
            </div>

            <button
              onClick={checkout}
              disabled={paymentLoading}
              className="mt-6 w-full rounded-xl bg-indigo-600 p-4 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paymentLoading
                ? "Processing..."
                : "Pay with Razorpay"}
            </button>

            <p className="mt-3 text-center text-xs text-slate-500">
              Your delivery details will be securely attached
              to this order.
            </p>
          </section>
        </>
      )}
    </main>
  );
}