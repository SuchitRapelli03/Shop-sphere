import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { setCart } from "../redux/slices/cartSlice.js";

export default function Cart() {
  const [cart, setLocal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [updatingProductId, setUpdatingProductId] =
    useState(null);
  const [removingProductId, setRemovingProductId] =
    useState(null);
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

  const user = useSelector(
    (state) => state.auth.user
  );

  /* =========================================================
     LOAD CART
  ========================================================= */

  useEffect(() => {
    async function loadCart() {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/cart");

        const cartData = response.data.cart;

        setLocal(cartData);

        dispatch(
          setCart(cartData?.items || [])
        );
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

  /* =========================================================
     ADDRESS
  ========================================================= */

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

  /* =========================================================
     UPDATE QUANTITY
  ========================================================= */

  async function updateQuantity(productId, quantity) {
    if (!productId) return;

    try {
      setUpdatingProductId(productId);
      setError("");

      const response = await api.put(
        `/cart/items/${productId}`,
        {
          quantity,
        }
      );

      const updatedCart =
        response.data.cart;

      setLocal(updatedCart);

      dispatch(
        setCart(
          updatedCart?.items || []
        )
      );
    } catch (error) {
      console.error(
        "UPDATE CART ITEM ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to update cart quantity."
      );
    } finally {
      setUpdatingProductId(null);
    }
  }

  function increaseQuantity(item) {
    const product = item.productId;

    if (!product) return;

    const currentQuantity = item.quantity;
    const stock = Number(product.stock || 0);

    if (currentQuantity >= stock) {
      setError(
        `Only ${stock} item${
          stock === 1 ? "" : "s"
        } available in stock.`
      );

      return;
    }

    updateQuantity(
      product._id,
      currentQuantity + 1
    );
  }

  function decreaseQuantity(item) {
    const product = item.productId;

    if (!product) return;

    const currentQuantity = item.quantity;

    if (currentQuantity <= 1) {
      return;
    }

    updateQuantity(
      product._id,
      currentQuantity - 1
    );
  }

  /* =========================================================
     REMOVE ITEM
  ========================================================= */

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

      const updatedCart =
        response.data.cart;

      setLocal(updatedCart);

      dispatch(
        setCart(
          updatedCart?.items || []
        )
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

  /* =========================================================
     RAZORPAY
  ========================================================= */

  async function loadRazorpayScript() {
    if (window.Razorpay) {
      return true;
    }

    return new Promise((resolve) => {
      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () =>
        resolve(true);

      script.onerror = () =>
        resolve(false);

      document.body.appendChild(
        script
      );
    });
  }

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

      const { data } =
        await api.post(
          "/payments/create-razorpay-order"
        );

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ShopSphere",
        description: "ShopSphere Order",
        order_id:
          data.razorpayOrderId,

        prefill: {
          name:
            shippingAddress.fullName ||
            user?.name ||
            "",

          email:
            user?.email || "",

          contact:
            shippingAddress.phone || "",
        },

        theme: {
          color: "#674936",
        },

        handler: async function (
          response
        ) {
          try {
            setPaymentLoading(true);

            const verificationResponse =
              await api.post(
                "/payments/verify",
                {
                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_signature:
                    response.razorpay_signature,

                  shippingAddress,
                }
              );

            alert(
              verificationResponse
                .data.message ||
                "Payment successful!"
            );

            const cartResponse =
              await api.get("/cart");

            setLocal(
              cartResponse.data.cart
            );

            dispatch(
              setCart(
                cartResponse.data
                  .cart?.items || []
              )
            );

            navigate(
              "/checkout/success"
            );
          } catch (error) {
            console.error(
              "PAYMENT VERIFICATION ERROR:",
              error
            );

            alert(
              error.response?.data
                ?.message ||
                "Payment verification failed."
            );
          } finally {
            setPaymentLoading(
              false
            );
          }
        },

        modal: {
          ondismiss: function () {
            setPaymentLoading(
              false
            );
          },
        },
      };

      const razorpay =
        new window.Razorpay(
          options
        );

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

          setPaymentLoading(
            false
          );
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

  /* =========================================================
     AUTH
  ========================================================= */

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f5f1e9] px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#ded5ca] bg-white p-10 text-center shadow-sm">

          <div className="text-6xl">
            🛒
          </div>

          <h1 className="mt-5 text-2xl font-black text-[#30251f]">
            Please login as a customer
          </h1>

        </div>
      </main>
    );
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f1e9] px-6 py-16">
        <div className="mx-auto max-w-4xl">

          <div className="animate-pulse">
            <div className="h-10 w-48 rounded bg-[#ded5ca]" />

            <div className="mt-8 space-y-4">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-32 rounded-2xl bg-[#eee9e0]"
                />
              ))}
            </div>

          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     CART ERROR
  ========================================================= */

  if (
    error &&
    !cart?.items?.length
  ) {
    return (
      <main className="min-h-screen bg-[#f5f1e9] px-6 py-16">

        <div className="mx-auto max-w-4xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">

          <div className="text-5xl">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-black text-red-600">
            Unable to load cart
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            {error}
          </p>

        </div>

      </main>
    );
  }

  const items = cart?.items || [];

  /* =========================================================
     TOTAL
  ========================================================= */

  const total = items.reduce(
    (sum, item) =>
      sum +
      Number(
        item.productId?.price || 0
      ) *
        item.quantity,
    0
  );

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f5f1e9] text-[#30251f]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-[#ded5ca] bg-[#e5f1f3]">

        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6a9aa2]">
            ShopSphere
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight">
            Your Cart
          </h1>

          <p className="mt-2 text-sm text-[#81766d]">
            Review your items before checkout.
          </p>

        </div>

      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {items.length === 0 ? (

          /* =================================================
             EMPTY CART
          ================================================= */

          <div className="rounded-3xl border border-[#ded5ca] bg-white px-6 py-16 text-center shadow-sm">

            <div className="text-7xl">
              🛒
            </div>

            <h2 className="mt-6 text-2xl font-black">
              Your cart is empty
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#81766d]">
              Looks like you haven't added
              anything yet.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/products")
              }
              className="mt-7 rounded-xl bg-[#674936] px-6 py-3 font-black text-white transition hover:bg-[#543a2b]"
            >
              Browse Products
            </button>

          </div>

        ) : (

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

            {/* =================================================
                LEFT
            ================================================= */}

            <div>

              <div className="flex items-end justify-between">

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6a9aa2]">
                    Shopping Bag
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    Cart Items
                  </h2>
                </div>

                <span className="text-sm font-bold text-[#81766d]">
                  {items.length}{" "}
                  {items.length === 1
                    ? "item"
                    : "items"}
                </span>

              </div>

              {/* =================================================
                  ITEMS
              ================================================= */}

              <div className="mt-5 space-y-4">

                {items.map((item) => {

                  const product =
                    item.productId;

                  const productId =
                    product?._id;

                  const price =
                    Number(
                      product?.price || 0
                    );

                  const itemTotal =
                    price *
                    item.quantity;

                  const stock =
                    Number(
                      product?.stock || 0
                    );

                  const updating =
                    updatingProductId ===
                    productId;

                  const removing =
                    removingProductId ===
                    productId;

                  return (
                    <article
                      key={productId}
                      className="rounded-2xl border border-[#ded5ca] bg-white p-4 shadow-sm sm:p-5"
                    >

                      <div className="flex flex-col gap-5 sm:flex-row">

                        {/* IMAGE */}

                        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#e5f1f3]">

                          {product?.images
                            ?.length ? (

                            <img
                              src={
                                product
                                  .images[0]
                              }
                              alt={
                                product.name
                              }
                              className="h-full w-full object-contain"
                            />

                          ) : (
                            <span className="text-4xl">
                              📦
                            </span>
                          )}

                        </div>

                        {/* INFO */}

                        <div className="flex min-w-0 flex-1 flex-col">

                          <div className="flex flex-col justify-between gap-3 sm:flex-row">

                            <div>

                              <h3 className="text-lg font-black text-[#30251f]">
                                {product?.name ||
                                  "Product"}
                              </h3>

                              <p className="mt-1 text-sm text-[#81766d]">
                                ₹
                                {price.toLocaleString(
                                  "en-IN"
                                )}{" "}
                                each
                              </p>

                            </div>

                            <p className="text-xl font-black text-[#674936]">
                              ₹
                              {itemTotal.toLocaleString(
                                "en-IN"
                              )}
                            </p>

                          </div>

                          {/* QUANTITY */}

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                            <div>

                              <p className="mb-2 text-xs font-black uppercase tracking-wider text-[#81766d]">
                                Quantity
                              </p>

                              <div className="flex h-10 w-fit items-center overflow-hidden rounded-xl border border-[#d8cec2]">

                                <button
                                  type="button"
                                  onClick={() =>
                                    decreaseQuantity(
                                      item
                                    )
                                  }
                                  disabled={
                                    item.quantity <=
                                      1 ||
                                    updating ||
                                    removing ||
                                    paymentLoading
                                  }
                                  className="h-full w-10 font-black text-[#674936] transition hover:bg-[#f5f1e9] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  −
                                </button>

                                <span className="flex h-full w-12 items-center justify-center border-x border-[#d8cec2] text-sm font-black">
                                  {updating
                                    ? "..."
                                    : item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    increaseQuantity(
                                      item
                                    )
                                  }
                                  disabled={
                                    item.quantity >=
                                      stock ||
                                    updating ||
                                    removing ||
                                    paymentLoading
                                  }
                                  className="h-full w-10 font-black text-[#674936] transition hover:bg-[#f5f1e9] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  +
                                </button>

                              </div>

                              <p className="mt-2 text-xs text-[#9a8f85]">
                                {stock}{" "}
                                available
                              </p>

                            </div>

                            {/* REMOVE */}

                            <button
                              type="button"
                              onClick={() =>
                                removeItem(
                                  productId
                                )
                              }
                              disabled={
                                removing ||
                                updating ||
                                paymentLoading
                              }
                              className="rounded-xl border border-red-200 px-4 py-2 text-xs font-black text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {removing
                                ? "Removing..."
                                : "Remove"}
                            </button>

                          </div>

                        </div>

                      </div>

                    </article>
                  );
                })}

              </div>

              {/* =================================================
                  DELIVERY DETAILS
              ================================================= */}

              <section className="mt-8 rounded-2xl border border-[#ded5ca] bg-white p-6 shadow-sm">

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6a9aa2]">
                    Delivery
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    Delivery Details
                  </h2>

                  <p className="mt-2 text-sm text-[#81766d]">
                    Enter the details where you
                    want your order delivered.
                  </p>

                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">

                  {/* NAME */}

                  <div className="md:col-span-2">

                    <label className="text-sm font-semibold text-slate-700">
                      Full Name
                    </label>

                    <input
                      name="fullName"
                      type="text"
                      value={
                        shippingAddress.fullName
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="Enter recipient name"
                      className="mt-2 w-full rounded-xl border border-[#d8cec2] p-3 outline-none transition focus:border-[#674936] focus:ring-2 focus:ring-[#eadfd4]"
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
                      value={
                        shippingAddress.phone
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="10-digit mobile number"
                      className="mt-2 w-full rounded-xl border border-[#d8cec2] p-3 outline-none transition focus:border-[#674936] focus:ring-2 focus:ring-[#eadfd4]"
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
                      value={
                        shippingAddress.pincode
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="6-digit pincode"
                      className="mt-2 w-full rounded-xl border border-[#d8cec2] p-3 outline-none transition focus:border-[#674936] focus:ring-2 focus:ring-[#eadfd4]"
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
                      value={
                        shippingAddress.addressLine
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="House number, street, area, landmark..."
                      className="mt-2 w-full rounded-xl border border-[#d8cec2] p-3 outline-none transition focus:border-[#674936] focus:ring-2 focus:ring-[#eadfd4]"
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
                      value={
                        shippingAddress.city
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="City"
                      className="mt-2 w-full rounded-xl border border-[#d8cec2] p-3 outline-none transition focus:border-[#674936] focus:ring-2 focus:ring-[#eadfd4]"
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
                      value={
                        shippingAddress.state
                      }
                      onChange={
                        handleAddressChange
                      }
                      placeholder="State"
                      className="mt-2 w-full rounded-xl border border-[#d8cec2] p-3 outline-none transition focus:border-[#674936] focus:ring-2 focus:ring-[#eadfd4]"
                    />

                  </div>

                </div>

              </section>

            </div>

            {/* =================================================
                RIGHT: ORDER SUMMARY
            ================================================= */}

            <aside className="h-fit rounded-2xl border border-[#ded5ca] bg-white p-6 shadow-sm lg:sticky lg:top-24">

              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6a9aa2]">
                Checkout
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Order Summary
              </h2>

              {/* ITEM COUNT */}

              <div className="mt-6 flex items-center justify-between border-b border-[#eee7de] pb-4">

                <span className="text-sm font-semibold text-[#81766d]">
                  Items
                </span>

                <span className="font-black">
                  {items.length}
                </span>

              </div>

              {/* INDIVIDUAL ITEMS */}

              <div className="mt-5 space-y-4">

                {items.map((item) => {

                  const product =
                    item.productId;

                  const price =
                    Number(
                      product?.price || 0
                    );

                  const itemTotal =
                    price *
                    item.quantity;

                  return (
                    <div
                      key={product?._id}
                      className="flex items-start justify-between gap-4"
                    >

                      <div className="min-w-0">

                        <p className="text-sm font-bold text-[#30251f]">
                          {product?.name ||
                            "Product"}
                        </p>

                        <p className="mt-1 text-xs text-[#81766d]">
                          ₹
                          {price.toLocaleString(
                            "en-IN"
                          )}{" "}
                          ×{" "}
                          {item.quantity}
                        </p>

                      </div>

                      <span className="shrink-0 text-sm font-black text-[#30251f]">
                        ₹
                        {itemTotal.toLocaleString(
                          "en-IN"
                        )}
                      </span>

                    </div>
                  );
                })}

              </div>

              {/* PRICE BREAKDOWN */}

              <div className="mt-6 space-y-3 border-t border-[#eee7de] pt-5">

                <div className="flex items-center justify-between">

                  <span className="text-sm font-semibold text-[#81766d]">
                    Subtotal
                  </span>

                  <span className="text-sm font-bold">
                    ₹
                    {total.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

                <div className="flex items-center justify-between">

                  <span className="text-sm font-semibold text-[#81766d]">
                    Delivery
                  </span>

                  <span className="text-sm font-black text-[#4f7e85]">
                    Free
                  </span>

                </div>

                <div className="flex items-center justify-between border-t border-[#eee7de] pt-4">

                  <span className="text-xl font-black">
                    Total
                  </span>

                  <span className="text-2xl font-black text-[#674936]">
                    ₹
                    {total.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

              </div>

              {/* PAYMENT */}

              <button
                type="button"
                onClick={checkout}
                disabled={paymentLoading}
                className="mt-6 w-full rounded-xl bg-[#674936] p-4 font-black text-[#f8f1e9] transition hover:bg-[#543a2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paymentLoading
                  ? "Processing..."
                  : "Pay Securely with Razorpay"}
              </button>

              {/* SECURITY */}

              <div className="mt-5 rounded-xl border border-[#c7dfe2] bg-[#e5f1f3] p-4">

                <div className="flex items-start gap-3">

                  <span className="text-xl">
                    🔒
                  </span>

                  <div>

                    <p className="text-sm font-black text-[#365f66]">
                      Secure Checkout
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#55777d]">
                      Your payment is securely
                      processed through Razorpay.
                    </p>

                  </div>

                </div>

              </div>

              <p className="mt-4 text-center text-xs text-[#81766d]">
                Your delivery details will be
                securely attached to this order.
              </p>

            </aside>

          </div>

        )}

      </section>

    </main>
  );
}
