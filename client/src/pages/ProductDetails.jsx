import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get(`/products/${id}`);

        const fetchedProduct = data.product;

        setProduct(fetchedProduct);

        if (fetchedProduct?.images?.length) {
          setSelectedImage(fetchedProduct.images[0]);
        }
      } catch (err) {
        console.error("PRODUCT DETAILS ERROR:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load this product."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  function increaseQuantity() {
    if (!product) return;

    setQuantity((current) =>
      Math.min(current + 1, product.stock)
    );
  }

  function decreaseQuantity() {
    setQuantity((current) =>
      Math.max(current - 1, 1)
    );
  }

  async function addToCart() {
    try {
      setAdding(true);
      setError("");

      await api.post("/cart/items", {
        productId: product._id,
        quantity,
      });

      alert("Product added to cart successfully 🛒");

      navigate("/cart");
    } catch (err) {
      console.error("ADD TO CART ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to add this product to cart."
      );
    } finally {
      setAdding(false);
    }
  }

  async function buyNow() {
    try {
      setBuying(true);
      setError("");

      await api.post("/cart/items", {
        productId: product._id,
        quantity,
      });

      navigate("/cart");
    } catch (err) {
      console.error("BUY NOW ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to proceed with checkout."
      );
    } finally {
      setBuying(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f6f6] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-4 w-64 rounded bg-slate-200" />

          <div className="mt-6 grid gap-5 lg:grid-cols-[58%_42%]">
            <div className="rounded-xl bg-white p-5">
              <div className="h-[520px] rounded-lg bg-slate-200" />
            </div>

            <div className="space-y-4 rounded-xl bg-white p-6">
              <div className="h-7 w-4/5 rounded bg-slate-200" />
              <div className="h-5 w-1/3 rounded bg-slate-200" />
              <div className="h-10 w-1/3 rounded bg-slate-200" />
              <div className="h-28 rounded bg-slate-200" />
              <div className="h-14 rounded bg-slate-200" />
              <div className="h-14 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !product) {
    return (
      <main className="min-h-screen bg-[#f6f6f6] px-4 py-16">
        <div className="mx-auto max-w-xl rounded-xl bg-white p-10 text-center shadow-sm">
          <div className="text-6xl">📦</div>

          <h1 className="mt-5 text-2xl font-black text-slate-900">
            Product unavailable
          </h1>

          <p className="mt-3 text-slate-500">
            {error}
          </p>

          <Link
            to="/products"
            className="mt-6 inline-flex rounded-lg bg-[#174c3c] px-6 py-3 font-bold text-white hover:bg-[#123c30]"
          >
            ← Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  if (!product) return null;

  const images = product.images?.length
    ? product.images
    : [];

  const isOutOfStock = product.stock <= 0;

  const price = Number(product.price || 0);

  const originalPrice =
    Number(product.originalPrice || 0) > price
      ? Number(product.originalPrice)
      : null;

  const discount = originalPrice
    ? Math.round(
        ((originalPrice - price) / originalPrice) * 100
      )
    : null;

  const totalPrice = price * quantity;

  const rating = Number(product.rating || 4.2);

  const reviewCount = Number(
    product.reviewCount ||
      product.reviewsCount ||
      0
  );

  return (
    <main className="min-h-screen bg-[#f6f6f6] pb-16">

      {/* =========================
          BREADCRUMB
      ========================= */}

      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">

          <Link
            to="/"
            className="hover:text-[#174c3c]"
          >
            Home
          </Link>

          <span>›</span>

          <Link
            to="/products"
            className="hover:text-[#174c3c]"
          >
            Products
          </Link>

          {product.category && (
            <>
              <span>›</span>

              <span>
                {product.category}
              </span>
            </>
          )}

          <span>›</span>

          <span className="max-w-[220px] truncate font-semibold text-slate-700">
            {product.name}
          </span>
        </div>
      </div>

      {/* =========================
          MAIN PRODUCT SECTION
      ========================= */}

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[58%_42%]">

          {/* =========================
              PRODUCT GALLERY
          ========================= */}

          <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">

            <div className="flex flex-col gap-4 sm:flex-row">

              {/* Thumbnails */}

              {images.length > 1 && (
                <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:w-20 sm:flex-col">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(image)
                      }
                      className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition ${
                        selectedImage === image
                          ? "border-[#174c3c]"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}

              <div className="order-1 flex-1 sm:order-2">

                <div className="relative flex h-[380px] items-center justify-center overflow-hidden rounded-lg bg-[#fafafa] sm:h-[520px]">

                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={product.name}
                      className="h-full w-full object-contain p-5 transition duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="text-8xl">
                      📦
                    </div>
                  )}

                  <button
                    type="button"
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border bg-white text-xl shadow-sm hover:bg-slate-50"
                    aria-label="Wishlist"
                  >
                    ♡
                  </button>
                </div>

                {/* Image count */}

                {images.length > 0 && (
                  <p className="mt-3 text-center text-xs text-slate-400">
                    {images.length} product{" "}
                    {images.length === 1
                      ? "image"
                      : "images"}
                  </p>
                )}
              </div>
            </div>

            {/* Mobile Action Buttons */}

            {!isOutOfStock && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:hidden">

                <button
                  type="button"
                  onClick={addToCart}
                  disabled={adding || buying}
                  className="rounded-lg border-2 border-[#174c3c] py-3 font-black text-[#174c3c] disabled:opacity-50"
                >
                  {adding
                    ? "Adding..."
                    : "🛒 Add to Cart"}
                </button>

                <button
                  type="button"
                  onClick={buyNow}
                  disabled={adding || buying}
                  className="rounded-lg bg-[#174c3c] py-3 font-black text-white disabled:opacity-50"
                >
                  {buying
                    ? "Processing..."
                    : "⚡ Buy Now"}
                </button>

              </div>
            )}
          </div>

          {/* =========================
              PRODUCT INFORMATION
          ========================= */}

          <div className="space-y-4">

            {/* Product Info Card */}

            <div className="rounded-xl bg-white p-5 shadow-sm sm:p-6">

              {product.category && (
                <p className="text-xs font-bold uppercase tracking-wider text-[#174c3c]">
                  {product.category}
                </p>
              )}

              <h1 className="mt-2 text-2xl font-semibold leading-snug text-slate-900 sm:text-3xl">
                {product.name}
              </h1>

              {/* Rating */}

              <div className="mt-4 flex flex-wrap items-center gap-3">

                <span className="inline-flex items-center gap-1 rounded-md bg-[#174c3c] px-2.5 py-1 text-sm font-bold text-white">
                  {rating.toFixed(1)} ★
                </span>

                <span className="text-sm font-semibold text-slate-600">
                  {reviewCount > 0
                    ? `${reviewCount.toLocaleString(
                        "en-IN"
                      )} Ratings & Reviews`
                    : "Ratings & Reviews"}
                </span>

              </div>

              <div className="my-5 border-t border-slate-100" />

              {/* Price */}

              <div>
                <div className="flex flex-wrap items-end gap-3">

                  <span className="text-4xl font-black text-slate-900">
                    ₹{price.toLocaleString("en-IN")}
                  </span>

                  {originalPrice && (
                    <>
                      <span className="pb-1 text-lg text-slate-400 line-through">
                        ₹{originalPrice.toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      <span className="pb-1 text-sm font-bold text-[#174c3c]">
                        {discount}% OFF
                      </span>
                    </>
                  )}

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  inclusive of applicable taxes
                </p>
              </div>

              {/* Deal */}

              <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">

                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    🏷️
                  </span>

                  <span className="font-black text-emerald-800">
                    Special Deal
                  </span>
                </div>

                <p className="mt-1 text-sm text-emerald-700">
                  Get the best price on this product
                  today.
                </p>

              </div>

              {/* Delivery */}

              <div className="mt-5 border-t border-slate-100 pt-5">

                <h3 className="font-black text-slate-900">
                  🚚 Delivery
                </h3>

                <div className="mt-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3">

                  <span className="text-xl">
                    📍
                  </span>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Delivery available
                    </p>

                    <p className="text-xs text-slate-500">
                      Reliable doorstep delivery
                    </p>
                  </div>

                </div>

              </div>

              {/* Stock */}

              <div className="mt-5">

                {isOutOfStock ? (
                  <span className="inline-flex rounded-md bg-red-100 px-3 py-2 text-sm font-bold text-red-700">
                    Out of stock
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="inline-flex rounded-md bg-orange-100 px-3 py-2 text-sm font-bold text-orange-700">
                    🔥 Only {product.stock} left
                  </span>
                ) : (
                  <span className="inline-flex rounded-md bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-700">
                    ✓ In stock
                  </span>
                )}

              </div>

              {/* Quantity */}

              {!isOutOfStock && (
                <div className="mt-6">

                  <p className="mb-2 text-sm font-bold text-slate-800">
                    Quantity
                  </p>

                  <div className="flex h-11 w-fit overflow-hidden rounded-lg border border-slate-300">

                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={
                        quantity <= 1 ||
                        adding ||
                        buying
                      }
                      className="w-11 text-lg font-bold hover:bg-slate-100 disabled:opacity-40"
                    >
                      −
                    </button>

                    <span className="flex w-14 items-center justify-center border-x border-slate-300 font-bold">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={
                        quantity >= product.stock ||
                        adding ||
                        buying
                      }
                      className="w-11 text-lg font-bold hover:bg-slate-100 disabled:opacity-40"
                    >
                      +
                    </button>

                  </div>

                </div>
              )}

              {/* Desktop Buttons */}

              {!isOutOfStock && (
                <div className="mt-6 hidden grid-cols-2 gap-3 sm:grid">

                  <button
                    type="button"
                    onClick={addToCart}
                    disabled={adding || buying}
                    className="rounded-lg border-2 border-[#174c3c] py-4 font-black text-[#174c3c] transition hover:bg-[#eef6f2] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {adding
                      ? "Adding to Cart..."
                      : "🛒 Add to Cart"}
                  </button>

                  <button
                    type="button"
                    onClick={buyNow}
                    disabled={adding || buying}
                    className="rounded-lg bg-[#174c3c] py-4 font-black text-white transition hover:bg-[#123c30] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {buying
                      ? "Processing..."
                      : "⚡ Buy Now"}
                  </button>

                </div>
              )}

              {/* Total */}

              {!isOutOfStock && (
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

                  <span className="text-sm text-slate-500">
                    Total for {quantity} item
                    {quantity > 1 ? "s" : ""}
                  </span>

                  <span className="text-xl font-black text-[#174c3c]">
                    ₹{totalPrice.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>
              )}

              {/* Error */}

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

            </div>

            {/* =========================
                SELLER CARD
            ========================= */}

            <div className="rounded-xl bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e7f2f4] text-2xl">
                    🏪
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Sold by
                    </p>

                    <p className="font-black text-slate-900">
                      {product.storeId?.name ||
                        "ShopSphere Seller"}
                    </p>
                  </div>

                </div>

                {product.storeId?.slug && (
                  <Link
                    to={`/store/${product.storeId.slug}`}
                    className="rounded-lg border border-[#174c3c] px-4 py-2 text-sm font-bold text-[#174c3c] hover:bg-[#eef6f2]"
                  >
                    View Shop
                  </Link>
                )}

              </div>

              <div className="mt-4 grid grid-cols-3 divide-x border-t pt-4">

                <div className="text-center">
                  <p className="font-black text-slate-900">
                    4.2 ★
                  </p>
                  <p className="text-xs text-slate-500">
                    Seller Rating
                  </p>
                </div>

                <div className="text-center">
                  <p className="font-black text-slate-900">
                    ✓
                  </p>
                  <p className="text-xs text-slate-500">
                    Verified
                  </p>
                </div>

                <div className="text-center">
                  <p className="font-black text-slate-900">
                    Fast
                  </p>
                  <p className="text-xs text-slate-500">
                    Dispatch
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================
          PRODUCT DETAILS
      ========================= */}

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="rounded-xl bg-white shadow-sm">

          <div className="border-b px-5 py-5 sm:px-7">
            <h2 className="text-xl font-black text-slate-900">
              Product Details
            </h2>
          </div>

          <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[1fr_1fr]">

            {/* Description */}

            <div>
              <h3 className="font-black text-slate-900">
                Description
              </h3>

              <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
                {product.description ||
                  "No description has been provided for this product."}
              </p>
            </div>

            {/* Highlights */}

            <div>
              <h3 className="font-black text-slate-900">
                Product Highlights
              </h3>

              <div className="mt-4 overflow-hidden rounded-lg border">

                <div className="flex border-b">
                  <span className="w-1/2 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Category
                  </span>

                  <span className="w-1/2 px-4 py-3 text-sm font-semibold text-slate-800">
                    {product.category || "General"}
                  </span>
                </div>

                <div className="flex border-b">
                  <span className="w-1/2 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Availability
                  </span>

                  <span className="w-1/2 px-4 py-3 text-sm font-semibold text-slate-800">
                    {isOutOfStock
                      ? "Out of Stock"
                      : "In Stock"}
                  </span>
                </div>

                <div className="flex">
                  <span className="w-1/2 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Seller
                  </span>

                  <span className="w-1/2 px-4 py-3 text-sm font-semibold text-slate-800">
                    {product.storeId?.name ||
                      "ShopSphere Seller"}
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================
          RATINGS & REVIEWS
      ========================= */}

      <section className="mx-auto mt-5 max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="rounded-xl bg-white shadow-sm">

          <div className="border-b px-5 py-5 sm:px-7">
            <h2 className="text-xl font-black text-slate-900">
              Ratings & Reviews
            </h2>
          </div>

          <div className="p-5 sm:p-7">

            <div className="grid gap-8 md:grid-cols-[220px_1fr]">

              <div className="border-r border-slate-100 text-center md:text-left">

                <div className="text-4xl font-black text-slate-900">
                  {rating.toFixed(1)}
                </div>

                <div className="mt-1 text-xl text-[#174c3c]">
                  ★★★★★
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {reviewCount > 0
                    ? `${reviewCount} Ratings`
                    : "No reviews yet"}
                </p>

              </div>

              <div className="space-y-3">

                {[
                  ["5", "Excellent"],
                  ["4", "Very Good"],
                  ["3", "Good"],
                  ["2", "Average"],
                  ["1", "Poor"],
                ].map(([stars, label]) => (
                  <div
                    key={stars}
                    className="flex items-center gap-3"
                  >

                    <span className="w-5 text-sm font-bold text-slate-600">
                      {stars}★
                    </span>

                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#174c3c]"
                        style={{
                          width:
                            stars === "5"
                              ? "75%"
                              : stars === "4"
                              ? "55%"
                              : stars === "3"
                              ? "30%"
                              : stars === "2"
                              ? "15%"
                              : "8%",
                        }}
                      />
                    </div>

                    <span className="w-20 text-xs text-slate-500">
                      {label}
                    </span>

                  </div>
                ))}

              </div>

            </div>

            <div className="mt-7 rounded-lg border border-dashed border-slate-200 p-6 text-center">

              <p className="font-bold text-slate-700">
                Customer reviews will appear here
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Reviews and ratings will be available once customers start reviewing products.
              </p>

            </div>

          </div>

        </div>
      </section>

      {/* =========================
          TRUST FEATURES
      ========================= */}

      <section className="mx-auto mt-5 max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="grid gap-3 sm:grid-cols-3">

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="text-2xl">🚚</div>
            <h3 className="mt-3 font-black text-slate-900">
              Fast Delivery
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Reliable doorstep delivery
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="text-2xl">🔒</div>
            <h3 className="mt-3 font-black text-slate-900">
              Secure Payment
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Safe and secure checkout
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="text-2xl">↩️</div>
            <h3 className="mt-3 font-black text-slate-900">
              Easy Returns
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Hassle-free shopping experience
            </p>
          </div>

        </div>
      </section>

    </main>
  );
}