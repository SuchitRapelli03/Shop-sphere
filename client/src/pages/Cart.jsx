import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { setCart } from "../redux/slices/cartSlice.js";

export default function Cart() {
  const [cart, setLocal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [removingProductId, setRemovingProductId] = useState(null);
  const [updatingProductId, setUpdatingProductId] = useState(null);
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


  /* =========================
     ADDRESS
  ========================= */

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


  /* =========================
     UPDATE QUANTITY
  ========================= */

  async function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
      return;
    }

    try {
      setUpdatingProductId(productId);
      setError("");

      const response = await api.put(
        `/cart/items/${productId}`,
        {
          quantity: newQuantity,
        }
      );

      const updatedCart = response.data.cart;

      setLocal(updatedCart);

      dispatch(
        setCart(updatedCart?.items || [])
      );
    } catch (error) {
      console.error(
        "UPDATE CART QUANTITY ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update quantity."
      );
    } finally {
      setUpdatingProductId(null);
    }
  }


  /* =========================
     REMOVE ITEM
  ========================= */

  async function removeItem(productId) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this product from your cart?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setRemovingProductId(productId);
      setError("");

      const response = await api.delete(
        `/cart/items/${productId}`
      );

      const updatedCart = response.data.cart;

      setLocal(updatedCart);

      dispatch(
        setCart(updatedCart?.items || [])
      );
    } catch (error) {
      console.error(
        "REMOVE CART ITEM ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to remove product from cart."
      );
    } finally {
      setRemovingProductId(null);
    }
  }


  /* =========================
     RAZORPAY
  ========================= */

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


  /* =========================
     CHECKOUT
  ========================= */

  async function checkout() {
    const addressError =
      validateShippingAddress();

    if (addressError) {
      alert(addressError);
      return;
    }

    try {
      setPaymentLoading(true);
      setError("");

      const scriptLoaded =
        await loadRazorpayScript();

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
          contact:
            shippingAddress.phone || "",
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
                cartResponse.data.cart?.items ||
                  []
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
      console.error(
        "CHECKOUT ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.message ||
          "Unable to start payment."
      );

      setPaymentLoading(false);
    }
  }


  /* =========================
     LOGIN
  ========================= */

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


  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-2xl font-bold">
          Loading cart...
        </h1>
      </main>
    );
  }


  /* =========================
     ERROR
  ========================= */

  if (error && !cart?.items?.length) {
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


      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}


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
          {/* =========================
              CART ITEMS
          ========================= */}

          <section className="mt-8">

            <h2 className="text-2xl font-black">
              Cart Items
            </h2>


            <div className="mt-4 space-y-4">

              {items.map((item) => {

                const productId =
                  item.productId?._id;

                const productStock =
                  item.productId?.stock ?? 0;

                const isUpdating =
                  updatingProductId ===
                  productId;

                const isRemoving =
                  removingProductId ===
                  productId;

                return (
                  <div
                    key={productId}
                    className="flex flex-col gap-5 rounded-xl border bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
                  >

                    {/* PRODUCT DETAILS */}

                    <div className="flex-1">

                      <h3 className="font-bold">
                        {item.productId?.name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Price: ₹
                        {item.productId?.price || 0}
                      </p>

                    </div>


                    {/* QUANTITY + TOTAL */}

                    <div className="flex flex-wrap items-center gap-4">

                      {/* QUANTITY SELECTOR */}

                      <div className="flex items-center rounded-lg border border-slate-300">

                        {/* MINUS */}

                        <button
                          type="button"
                          disabled={
                            isUpdating ||
                            isRemoving ||
                            paymentLoading
                          }
                          onClick={() => {

                            if (
                              item.quantity === 1
                            ) {
                              removeItem(
                                productId
                              );
                            } else {
                              updateQuantity(
                                productId,
                                item.quantity - 1
                              );
                            }

                          }}
                          className="flex h-10 w-10 items-center justify-center text-xl font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          −
                        </button>


                        {/* QUANTITY */}

                        <div className="flex h-10 min-w-12 items-center justify-center border-x border-slate-300 px-3 font-bold text-slate-900">
                          {isUpdating
                            ? "..."
                            : item.quantity}
                        </div>


                        {/* PLUS */}

                        <button
                          type="button"
                          disabled={
                            isUpdating ||
                            isRemoving ||
                            paymentLoading ||
                            item.quantity >=
                              productStock
                          }
                          onClick={() =>
                            updateQuantity(
                              productId,
                              item.quantity + 1
                            )
                          }
                          className="flex h-10 w-10 items-center justify-center text-xl font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          +
                        </button>

                      </div>


                      {/* ITEM TOTAL */}

                      <span className="min-w-20 text-right font-bold">
                        ₹
                        {(item.productId?.price ||
                          0) *
                          item.quantity}
                      </span>


                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(productId)
                        }
                        disabled={
                          isRemoving ||
                          isUpdating ||
                          paymentLoading
                        }
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isRemoving
                          ? "Removing..."
                          : "Remove"}
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>

          </section>


          {/* =========================
              DELIVERY DETAILS
          ========================= */}

          <section className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">

            <div>

              <p className="font-semibold text-indigo-600">
                Delivery
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Delivery Details
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Enter the details where you want your order delivered.
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


          {/* =========================
              TOTAL + PAYMENT
          ========================= */}

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
              Your delivery details will be securely attached to this order.
            </p>

          </section>

        </>
      )}

    </main>
  );
}