import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api.js";
import { setCart } from "../redux/slices/cartSlice.js";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  const buyNowItem =
    location.state?.buyNowItem || null;

  const isBuyNow = Boolean(buyNowItem);

  const [cart, setLocalCart] = useState(null);
  const [loading, setLoading] = useState(!isBuyNow);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  /*
  =========================================================
  LOAD CART
  =========================================================
  */

  useEffect(() => {
    if (isBuyNow) {
      setLoading(false);
      return;
    }

    async function loadCart() {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get("/cart");

        const loadedCart = data?.cart || null;

        setLocalCart(loadedCart);

        dispatch(
          setCart(
            loadedCart?.items || []
          )
        );
      } catch (err) {
        console.error(
          "CHECKOUT CART LOAD ERROR:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load your cart."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCart();
  }, [dispatch, isBuyNow]);

  /*
  =========================================================
  DELIVERY ADDRESS
  =========================================================
  */

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

  /*
  =========================================================
  CHECKOUT ITEMS
  =========================================================
  */

  const checkoutItems = useMemo(() => {
    if (isBuyNow) {
      if (!buyNowItem?.product) {
        return [];
      }

      return [
        {
          productId:
            buyNowItem.productId ||
            buyNowItem.product._id,

          product: buyNowItem.product,

          quantity:
            Number(buyNowItem.quantity) || 1,
        },
      ];
    }

    return (
      cart?.items?.map((item) => ({
        productId:
          item.productId?._id ||
          item.productId,

        product:
          item.productId,

        quantity:
          Number(item.quantity) || 1,
      })) || []
    );
  }, [buyNowItem, cart, isBuyNow]);

  /*
  =========================================================
  ORDER TOTAL
  =========================================================
  */

  const subtotal = useMemo(() => {
    return checkoutItems.reduce(
      (total, item) => {
        const price =
          Number(item.product?.price) || 0;

        return (
          total +
          price * item.quantity
        );
      },
      0
    );
  }, [checkoutItems]);

  const deliveryFee = 0;

  const total = subtotal + deliveryFee;

  /*
  =========================================================
  RAZORPAY SCRIPT
  =========================================================
  */

  async function loadRazorpayScript() {
    if (window.Razorpay) {
      return true;
    }

    return new Promise((resolve) => {
      const existingScript =
        document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(true)
        );

        existingScript.addEventListener(
          "error",
          () => resolve(false)
        );

        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  }

  /*
  =========================================================
  RAZORPAY CHECKOUT
  =========================================================
  */

  async function handlePayment() {
    const addressError =
      validateShippingAddress();

    if (addressError) {
      setError(addressError);
      return;
    }

    if (!checkoutItems.length) {
      setError(
        isBuyNow
          ? "This product is no longer available."
          : "Your cart is empty."
      );

      return;
    }

    try {
      setPaymentLoading(true);
      setError("");

      /*
      -------------------------------------------------------
      Load Razorpay
      -------------------------------------------------------
      */

      const scriptLoaded =
        await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error(
          "Unable to load Razorpay Checkout."
        );
      }

      /*
      -------------------------------------------------------
      Create Razorpay order
      -------------------------------------------------------

      For Buy Now:
        send productId + quantity

      For Cart:
        send checkoutType = CART

      The backend calculates the real amount.
      -------------------------------------------------------
      */

      const requestBody = isBuyNow
        ? {
            checkoutType: "BUY_NOW",

            productId:
              buyNowItem.productId ||
              buyNowItem.product?._id,

            quantity:
              Number(
                buyNowItem.quantity
              ) || 1,
          }
        : {
            checkoutType: "CART",
          };

      const { data } =
        await api.post(
          "/payments/create-razorpay-order",
          requestBody
        );

      /*
      -------------------------------------------------------
      Razorpay options
      -------------------------------------------------------
      */

      const options = {
        key: data.keyId,

        amount: data.amount,

        currency: data.currency,

        name: "ShopSphere",

        description: isBuyNow
          ? "ShopSphere Buy Now Order"
          : "ShopSphere Cart Order",

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
            setError("");

            /*
            -------------------------------------------------
            Verify payment on backend
            -------------------------------------------------
            */

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

            /*
            -------------------------------------------------
            Cart checkout:
              backend clears cart.

            Buy Now:
              backend leaves cart untouched.

            Refresh Redux cart only for cart checkout.
            -------------------------------------------------
            */

            if (!isBuyNow) {
              try {
                const cartResponse =
                  await api.get("/cart");

                const updatedCart =
                  cartResponse.data.cart;

                setLocalCart(
                  updatedCart
                );

                dispatch(
                  setCart(
                    updatedCart?.items || []
                  )
                );
              } catch (cartError) {
                console.error(
                  "CART REFRESH AFTER PAYMENT ERROR:",
                  cartError
                );
              }
            }

            alert(
              verificationResponse.data
                ?.message ||
                "Payment successful!"
            );

            navigate(
              "/checkout/success"
            );
          } catch (error) {
            console.error(
              "PAYMENT VERIFICATION ERROR:",
              error
            );

            setError(
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

      /*
      -------------------------------------------------------
      Open Razorpay
      -------------------------------------------------------
      */

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "RAZORPAY PAYMENT FAILED:",
            response.error
          );

          setError(
            response.error?.description ||
              "Payment failed. Please try again."
          );

          setPaymentLoading(false);
        }
      );

      razorpay.open();
    } catch (err) {
      console.error(
        "CHECKOUT PAYMENT ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start payment."
      );

      setPaymentLoading(false);
    }
  }

  /*
  =========================================================
  LOADING
  =========================================================
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f1e9] px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[1.75rem] border border-[#ded5ca] bg-[#fffdf9] p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#d9cbbd] border-t-[#674936]" />

            <p className="mt-5 text-sm font-bold text-[#746a62]">
              Preparing your checkout...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
  =========================================================
  EMPTY CHECKOUT
  =========================================================
  */

  if (!checkoutItems.length) {
    return (
      <main className="min-h-screen bg-[#f5f1e9] px-5 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[2rem] border border-[#ded5ca] bg-[#fffdf9] p-10 text-center shadow-sm">
            <div className="text-5xl">
              🛒
            </div>

            <h1 className="mt-5 text-2xl font-black text-[#30251f]">
              Nothing to checkout
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#746a62]">
              {isBuyNow
                ? "This product may no longer be available."
                : "Your cart is empty. Add some products before proceeding to checkout."}
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex rounded-xl bg-[#674936] px-6 py-3 text-sm font-black text-white transition hover:bg-[#563b2b]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
  =========================================================
  MAIN CHECKOUT UI
  =========================================================
  */

  return (
    <main className="min-h-screen bg-[#f5f1e9]">
      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="border-b border-[#ded5ca] bg-[#fffdf9]">
        <div className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link
                to={
                  isBuyNow
                    ? `/product/${buyNowItem?.productId || buyNowItem?.product?._id}`
                    : "/cart"
                }
                className="text-xs font-black text-[#64939c] transition hover:text-[#4f7e85]"
              >
                ←{" "}
                {isBuyNow
                  ? "Back to Product"
                  : "Back to Cart"}
              </Link>

              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#6a9aa2]">
                ShopSphere Checkout
              </p>

              <h1 className="mt-1 text-3xl font-black tracking-tight text-[#30251f] sm:text-4xl">
                Secure Checkout
              </h1>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#c7dfe2] bg-[#f0f7f8] px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[#6a9aa2]" />

              <span className="text-[10px] font-black uppercase tracking-wider text-[#55777d]">
                {isBuyNow
                  ? "Buy Now"
                  : "Cart Checkout"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="space-y-7">
            {/* =================================================
                DELIVERY DETAILS
            ================================================= */}

            <section className="rounded-[1.75rem] border border-[#ded5ca] bg-[#fffdf9] p-6 shadow-sm sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6a9aa2]">
                    Step 1
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#30251f]">
                    Delivery Details
                  </h2>

                  <p className="mt-1 text-sm text-[#746a62]">
                    Where should we deliver your order?
                  </p>
                </div>

                <div className="rounded-xl bg-[#f0f7f8] px-3 py-2 text-xl">
                  📍
                </div>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                {/* Full Name */}

                <div>
                  <label className="text-xs font-black text-[#493a31]">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={
                      shippingAddress.fullName
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="Enter full name"
                    className="mt-2 w-full rounded-xl border border-[#d9cec2] bg-[#faf7f1] px-4 py-3 text-sm font-medium text-[#30251f] outline-none transition placeholder:text-[#a79d94] focus:border-[#6a9aa2] focus:ring-2 focus:ring-[#c7dfe2]"
                  />
                </div>

                {/* Phone */}

                <div>
                  <label className="text-xs font-black text-[#493a31]">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={
                      shippingAddress.phone
                    }
                    onChange={
                      handleAddressChange
                    }
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className="mt-2 w-full rounded-xl border border-[#d9cec2] bg-[#faf7f1] px-4 py-3 text-sm font-medium text-[#30251f] outline-none transition placeholder:text-[#a79d94] focus:border-[#6a9aa2] focus:ring-2 focus:ring-[#c7dfe2]"
                  />
                </div>

                {/* Address */}

                <div className="sm:col-span-2">
                  <label className="text-xs font-black text-[#493a31]">
                    Address
                  </label>

                  <textarea
                    name="addressLine"
                    value={
                      shippingAddress.addressLine
                    }
                    onChange={
                      handleAddressChange
                    }
                    rows={3}
                    placeholder="House no., street, area"
                    className="mt-2 w-full resize-none rounded-xl border border-[#d9cec2] bg-[#faf7f1] px-4 py-3 text-sm font-medium text-[#30251f] outline-none transition placeholder:text-[#a79d94] focus:border-[#6a9aa2] focus:ring-2 focus:ring-[#c7dfe2]"
                  />
                </div>

                {/* City */}

                <div>
                  <label className="text-xs font-black text-[#493a31]">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={
                      shippingAddress.city
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="City"
                    className="mt-2 w-full rounded-xl border border-[#d9cec2] bg-[#faf7f1] px-4 py-3 text-sm font-medium text-[#30251f] outline-none transition placeholder:text-[#a79d94] focus:border-[#6a9aa2] focus:ring-2 focus:ring-[#c7dfe2]"
                  />
                </div>

                {/* State */}

                <div>
                  <label className="text-xs font-black text-[#493a31]">
                    State
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={
                      shippingAddress.state
                    }
                    onChange={
                      handleAddressChange
                    }
                    placeholder="State"
                    className="mt-2 w-full rounded-xl border border-[#d9cec2] bg-[#faf7f1] px-4 py-3 text-sm font-medium text-[#30251f] outline-none transition placeholder:text-[#a79d94] focus:border-[#6a9aa2] focus:ring-2 focus:ring-[#c7dfe2]"
                  />
                </div>

                {/* Pincode */}

                <div className="sm:max-w-xs">
                  <label className="text-xs font-black text-[#493a31]">
                    Pincode
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={
                      shippingAddress.pincode
                    }
                    onChange={
                      handleAddressChange
                    }
                    maxLength={6}
                    placeholder="6-digit pincode"
                    className="mt-2 w-full rounded-xl border border-[#d9cec2] bg-[#faf7f1] px-4 py-3 text-sm font-medium text-[#30251f] outline-none transition placeholder:text-[#a79d94] focus:border-[#6a9aa2] focus:ring-2 focus:ring-[#c7dfe2]"
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                ORDER ITEMS
            ================================================= */}

            <section className="rounded-[1.75rem] border border-[#ded5ca] bg-[#fffdf9] p-6 shadow-sm sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6a9aa2]">
                    Step 2
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#30251f]">
                    Order Items
                  </h2>

                  <p className="mt-1 text-sm text-[#746a62]">
                    Review what you're buying before payment.
                  </p>
                </div>

                <div className="rounded-xl bg-[#f8efe5] px-3 py-2 text-xl">
                  📦
                </div>
              </div>

              <div className="mt-6 divide-y divide-[#eee6dd]">
                {checkoutItems.map(
                  (item, index) => {
                    const product =
                      item.product;

                    const image =
                      product?.images?.[0];

                    const price =
                      Number(
                        product?.price
                      ) || 0;

                    return (
                      <div
                        key={
                          item.productId ||
                          index
                        }
                        className="flex gap-4 py-5 first:pt-0 last:pb-0"
                      >
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#e4dbd1] bg-[#f3eee7]">
                          {image ? (
                            <img
                              src={image}
                              alt={
                                product?.name ||
                                "Product"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl">
                              🛍️
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 text-sm font-black text-[#30251f]">
                            {product?.name ||
                              "Product"}
                          </h3>

                          <p className="mt-2 text-xs font-semibold text-[#8a7d72]">
                            Quantity:{" "}
                            {item.quantity}
                          </p>

                          <p className="mt-2 text-base font-black text-[#674936]">
                            ₹
                            {price.toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>

                        <div className="hidden text-right sm:block">
                          <p className="text-[10px] font-black uppercase tracking-wider text-[#9b9087]">
                            Item Total
                          </p>

                          <p className="mt-1 text-base font-black text-[#30251f]">
                            ₹
                            {(
                              price *
                              item.quantity
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>

            {/* =================================================
                PAYMENT INFO
            ================================================= */}

            <section className="rounded-[1.75rem] border border-[#ded5ca] bg-[#fffdf9] p-6 shadow-sm sm:p-7">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-[#f0f7f8] px-3 py-2 text-xl">
                  🔐
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6a9aa2]">
                    Step 3
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#30251f]">
                    Secure Payment
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#746a62]">
                    Your payment will be processed securely through Razorpay. ShopSphere does not store your card or payment credentials.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#ded5ca] bg-[#faf7f1] px-3 py-1.5 text-[10px] font-black text-[#746a62]">
                      🔒 Secure
                    </span>

                    <span className="rounded-full border border-[#ded5ca] bg-[#faf7f1] px-3 py-1.5 text-[10px] font-black text-[#746a62]">
                      💳 Razorpay
                    </span>

                    <span className="rounded-full border border-[#ded5ca] bg-[#faf7f1] px-3 py-1.5 text-[10px] font-black text-[#746a62]">
                      🇮🇳 INR
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-[1.75rem] border border-[#ded5ca] bg-[#fffdf9] p-6 shadow-sm sm:p-7">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#6a9aa2]">
                Final Review
              </p>

              <h2 className="mt-1 text-xl font-black text-[#30251f]">
                Price Details
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#746a62]">
                    Price (
                    {checkoutItems.reduce(
                      (
                        count,
                        item
                      ) =>
                        count +
                        item.quantity,
                      0
                    )}{" "}
                    item
                    {checkoutItems.reduce(
                      (
                        count,
                        item
                      ) =>
                        count +
                        item.quantity,
                      0
                    ) !== 1
                      ? "s"
                      : ""}
                    )
                  </span>

                  <span className="font-black text-[#30251f]">
                    ₹
                    {subtotal.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#746a62]">
                    Delivery
                  </span>

                  <span className="font-black text-[#5d858c]">
                    FREE
                  </span>
                </div>

                <div className="border-t border-dashed border-[#d9cec2] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-[#30251f]">
                      Total Amount
                    </span>

                    <span className="text-xl font-black text-[#674936]">
                      ₹
                      {total.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-6 rounded-xl border border-[#e7c9c2] bg-[#fff4f1] px-4 py-3 text-xs font-bold leading-5 text-[#a34f42]">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={
                  handlePayment
                }
                disabled={
                  paymentLoading
                }
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#674936] px-5 py-4 text-sm font-black text-white shadow-sm transition hover:bg-[#563b2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paymentLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                    Processing...
                  </>
                ) : (
                  <>
                    <span>
                      🔒
                    </span>

                    Pay ₹
                    {total.toLocaleString(
                      "en-IN"
                    )}
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-[10px] font-semibold leading-5 text-[#9b9087]">
                By continuing, you agree to place this order and proceed with secure payment.
              </p>

              <div className="mt-6 rounded-xl border border-[#c7dfe2] bg-[#f0f7f8] p-4">
                <div className="flex gap-3">
                  <span className="text-lg">
                    🛡️
                  </span>

                  <div>
                    <p className="text-xs font-black text-[#55777d]">
                      Safe & Secure Checkout
                    </p>

                    <p className="mt-1 text-[10px] font-semibold leading-5 text-[#6d8589]">
                      Your payment details are handled securely by Razorpay.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}