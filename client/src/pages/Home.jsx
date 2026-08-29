import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingStores, setLoadingStores] = useState(true);

  /* =========================================================
     FETCH PRODUCTS
  ========================================================= */

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");

        const data =
          response.data?.products ||
          response.data?.data ||
          response.data ||
          [];

        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  /* =========================================================
     FETCH STORES
  ========================================================= */

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await api.get("/stores");

        const data =
          response.data?.stores ||
          response.data?.data ||
          response.data ||
          [];

        setStores(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load stores:", error);
        setStores([]);
      } finally {
        setLoadingStores(false);
      }
    };

    fetchStores();
  }, []);

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories = [
    {
      name: "Electronics",
      icon: "🎧",
      color: "bg-[#d8edf0]",
    },
    {
      name: "Fashion",
      icon: "👕",
      color: "bg-[#e8ddd2]",
    },
    {
      name: "Beauty",
      icon: "💄",
      color: "bg-[#e4dce5]",
    },
    {
      name: "Grocery",
      icon: "🥑",
      color: "bg-[#dce8dc]",
    },
    {
      name: "Home",
      icon: "🏠",
      color: "bg-[#e5dfd6]",
    },
    {
      name: "Sports",
      icon: "⚽",
      color: "bg-[#d9e7e3]",
    },
    {
      name: "Shoes",
      icon: "👟",
      color: "bg-[#e8ddd5]",
    },
    {
      name: "Accessories",
      icon: "⌚",
      color: "bg-[#d9e9ec]",
    },
  ];

  const featuredProducts = useMemo(
    () => products.slice(0, 8),
    [products]
  );

  const trendingProducts = useMemo(
    () => products.slice(8, 16),
    [products]
  );

  return (
    <main className="min-h-screen bg-[#f3efe8] text-[#30251f]">

      {/* =====================================================
          OFFER STRIP
      ===================================================== */}

      <div className="bg-[#047857] px-4 py-2 text-center text-[11px] font-bold tracking-wide text-[#f7f0e7]">
        ✨ One marketplace · Multiple stores · Endless discoveries
      </div>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="border-b border-[#d8d0c5] bg-[#dcecef]">

        <div className="mx-auto max-w-7xl px-5 py-9 lg:px-8 lg:py-11">

          <div className="grid gap-7 lg:grid-cols-[1.15fr_.85fr] lg:items-center">

            {/* HERO COPY */}

            <div>

              <span className="inline-flex items-center gap-2 rounded-full border border-[#a8cbd0] bg-[#edf7f8] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#557d84]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#638f97]" />
                Welcome to ShopSphere
              </span>

              <h1 className="mt-4 max-w-2xl text-4xl font-black leading-[1.03] tracking-tight text-[#022C22] sm:text-5xl">

                Everything you want.

                <span className="block text-[#047857]">
                  One shopping sphere.
                </span>

              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-[#6d6259] sm:text-base">
                Discover products from different stores, compare your
                favourites and shop everything from one connected marketplace.
              </p>


              {/* SEARCH BAR */}

              <Link
                to="/products"
                className="mt-6 flex max-w-2xl items-center gap-3 rounded-xl border border-[#bdd6da] bg-[#edf7f8] px-4 py-3.5 shadow-sm transition hover:border-[#91bbc2] hover:shadow-md"
              >

                <span className="text-lg">
                  🔎
                </span>

                <span className="flex-1 text-xs font-semibold text-[#82766e] sm:text-sm">
                  Search products, stores & categories
                </span>

                <span className="rounded-lg bg-[#674936] px-4 py-2 text-[10px] font-black uppercase tracking-wide text-[#f7f0e8]">
                  Explore
                </span>

              </Link>


              {/* QUICK CATEGORIES */}

              <div className="mt-5 flex flex-wrap gap-2">

                {["Electronics", "Fashion", "Beauty", "Home", "Sports"].map(
                  (category) => (
                    <Link
                      key={category}
                      to={`/products?category=${encodeURIComponent(category)}`}
                      className="rounded-full border border-[#b8d1d5] bg-[#e9f3f4] px-3 py-1.5 text-[10px] font-bold text-[#55767d] transition hover:border-[#8ebbc2] hover:bg-[#d9ebee]"
                    >
                      {category}
                    </Link>
                  )
                )}

              </div>

            </div>


            {/* HERO SHOPPING PANEL */}

            <div className="relative">

              <div className="absolute -inset-5 rounded-[3rem] bg-[#8fbfc7]/20 blur-3xl" />

              <div className="relative rounded-[1.5rem] border border-[#bdd5d8] bg-[#cfe4e7] p-2.5 shadow-lg">

                <div className="rounded-[1.15rem] bg-[#f0eee7] p-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#7e624e]">
                        ShopSphere
                      </p>

                      <h2 className="mt-0.5 text-lg font-black">
                        Today's picks
                      </h2>

                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#674936] text-base">
                      🛒
                    </div>

                  </div>


                  <div className="mt-4 grid grid-cols-2 gap-2.5">

                    <HeroTile emoji="👟" bg="bg-[#e7d9cd]" />
                    <HeroTile emoji="🎧" bg="bg-[#d5e9ec]" />
                    <HeroTile emoji="⌚" bg="bg-[#dce7df]" />
                    <HeroTile emoji="💄" bg="bg-[#e8dadd]" />

                  </div>


                  <div className="mt-3 rounded-xl bg-[#674936] px-4 py-3 text-[#f7f0e8]">

                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#d7c0ad]">
                      The marketplace
                    </p>

                    <div className="mt-0.5 flex items-center justify-between">

                      <p className="text-xs font-black">
                        Many stores. One cart.
                      </p>

                      <span>
                        →
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          TRUST / BENEFITS
      ===================================================== */}

      <section className="border-b border-[#d8d0c5] bg-[#ebe6dd]">

        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4 lg:px-8">

          <Benefit
            icon="🏪"
            title="Multiple stores"
            text="Shop different vendors"
          />

          <Benefit
            icon="🔒"
            title="Secure checkout"
            text="Protected shopping"
          />

          <Benefit
            icon="📦"
            title="Easy ordering"
            text="Simple experience"
          />

          <Benefit
            icon="🌐"
            title="One marketplace"
            text="Everything together"
          />

        </div>

      </section>


      {/* =====================================================
          SHOP BY CATEGORY
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-9 lg:px-8">

        <SectionHeading
          eyebrow="Browse"
          title="Shop by category"
          description="Find your next favourite without digging through the entire marketplace."
          linkText="View all →"
          linkTo="/products"
        />


        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">

          {categories.map((category) => (

            <Link
              key={category.name}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="group rounded-xl border border-[#d9d1c7] bg-[#ebe7df] p-3 transition duration-200 hover:-translate-y-0.5 hover:border-[#a6cbd0] hover:bg-[#e5f1f2] hover:shadow-md"
            >

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${category.color} text-2xl transition group-hover:scale-105`}
              >
                {category.icon}
              </div>

              <h3 className="mt-3 text-xs font-black text-[#3b2e26]">
                {category.name}
              </h3>

              <p className="mt-1 text-[9px] text-[#81766d]">
                Explore →
              </p>

            </Link>

          ))}

        </div>

      </section>


      {/* =====================================================
          PROMOTIONAL STRIP
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 lg:px-8">

        <div className="relative overflow-hidden rounded-2xl bg-[#674936] px-6 py-6 text-[#f8f1e8] shadow-md">

          <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[#a9d7dd]/15 blur-3xl" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c9dfe2]">
                ShopSphere spotlight
              </p>

              <h2 className="mt-1 text-xl font-black sm:text-2xl">
                New stores. New products. New reasons to browse.
              </h2>

              <p className="mt-1.5 max-w-xl text-xs leading-5 text-[#ded1c6]">
                Explore what's available across the marketplace and discover
                something you didn't know you needed.
              </p>

            </div>

            <Link
              to="/products"
              className="shrink-0 rounded-lg bg-[#cce8eb] px-5 py-2.5 text-xs font-black text-[#466a72] transition hover:bg-[#e0f2f4]"
            >
              Shop now →
            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURED PRODUCTS
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-9 lg:px-8">

        <SectionHeading
          eyebrow="Fresh picks"
          title="Popular products"
          description="A few things shoppers are checking out across the sphere."
          linkText="See everything →"
          linkTo="/products"
        />

        {loadingProducts ? (

          <ProductSkeleton />

        ) : products.length === 0 ? (

          <EmptyState
            icon="📦"
            title="Products are arriving"
            description="Once vendors add products, they'll appear here."
          />

        ) : (

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

            {featuredProducts.map((product) => (

              <ProductCard
                key={product._id}
                product={product}
              />

            ))}

          </div>

        )}

      </section>


      {/* =====================================================
          STORES
      ===================================================== */}

      <section className="border-y border-[#d8d0c5] bg-[#e7e2d9]">

        <div className="mx-auto max-w-7xl px-5 py-9 lg:px-8">

          <SectionHeading
            eyebrow="Marketplace"
            title="Explore stores"
            description="Different vendors, different products, one connected shopping experience."
            linkText="All stores →"
            linkTo="/stores"
          />


          {loadingStores ? (

            <StoreSkeleton />

          ) : stores.length === 0 ? (

            <EmptyState
              icon="🏪"
              title="Stores are getting ready"
              description="Vendor stores will appear here once they are created."
            />

          ) : (

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {stores.slice(0, 6).map((store) => (

                <Link
                  key={store._id}
                  to={`/store/${store.slug}`}
                  className="group rounded-xl border border-[#d5cdc2] bg-[#eeeae3] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#a4c9cf] hover:bg-[#e4eff0] hover:shadow-md"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#d6e9eb] text-2xl">

                      {store.logo ? (
                        <img
                          src={store.logo}
                          alt={store.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        "🏪"
                      )}

                    </div>

                    <div className="min-w-0">

                      <h3 className="truncate text-sm font-black text-[#3b2e26]">
                        {store.name || "Store"}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#81766d]">
                        {store.description ||
                          "Discover products from this store."}
                      </p>

                    </div>

                  </div>


                  <div className="mt-4 flex items-center justify-between border-t border-[#d9d0c5] pt-3">

                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#8a7c71]">
                      Visit store
                    </span>

                    <span className="text-sm font-black text-[#5d8f99] transition group-hover:translate-x-1">
                      →
                    </span>

                  </div>

                </Link>

              ))}

            </div>

          )}

        </div>

      </section>


      {/* =====================================================
          TRENDING
      ===================================================== */}

      {trendingProducts.length > 0 && (

        <section className="mx-auto max-w-7xl px-5 py-9 lg:px-8">

          <SectionHeading
            eyebrow="Trending now"
            title="More to discover"
            description="Keep exploring. Your next favourite might be hiding here."
            linkText="Browse all →"
            linkTo="/products"
          />

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

            {trendingProducts.map((product) => (

              <ProductCard
                key={product._id}
                product={product}
              />

            ))}

          </div>

        </section>

      )}


      {/* =====================================================
          WHY SHOPSPHERE
      ===================================================== */}

      <section className="bg-[#18372f]">

        <div className="mx-auto max-w-7xl px-5 py-9 lg:px-8">

          <div className="grid gap-7 lg:grid-cols-[.85fr_1.15fr] lg:items-center">

            <div>

              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a8d7dc]">
                Why ShopSphere?
              </p>

              <h2 className="mt-2 text-2xl font-black leading-tight text-[#f2eee7] sm:text-3xl">

                Shopping shouldn't feel
                <span className="block text-[#a8dce2]">
                  scattered everywhere.
                </span>

              </h2>

              <p className="mt-3 max-w-md text-xs leading-5 text-[#b9c9c3]">
                ShopSphere brings different stores together so you can
                discover, compare and shop from one marketplace.
              </p>

            </div>


            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">

              <DarkStat value="100+" label="Products" />
              <DarkStat value="20+" label="Stores" />
              <DarkStat value="24/7" label="Shopping" />
              <DarkStat value="1" label="Marketplace" />

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-9 lg:px-8">

        <div className="relative overflow-hidden rounded-2xl bg-[#c9e2e5] px-6 py-7 shadow-sm">

          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#91bec5]/25 blur-3xl" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#577a81]">
                Ready when you are
              </p>

              <h2 className="mt-1 text-xl font-black text-[#30251f] sm:text-2xl">
                Find something worth bringing home.
              </h2>

              <p className="mt-1.5 text-xs text-[#70665e]">
                Browse products or explore stores across ShopSphere.
              </p>

            </div>


            <div className="flex flex-wrap gap-2">

              <Link
                to="/products"
                className="rounded-lg bg-[#674936] px-5 py-2.5 text-xs font-black text-[#f8f1e8] transition hover:bg-[#543a2c]"
              >
                Start shopping
              </Link>

              <Link
                to="/stores"
                className="rounded-lg border border-[#9dbfc4] bg-[#e2f0f1] px-5 py-2.5 text-xs font-black text-[#4d737b] transition hover:bg-[#d5e9eb]"
              >
                Browse stores
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[#d0c8bd] bg-[#ded8ce]">

        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#674936] text-sm font-black text-[#f7f0e7]">
                  S
                </div>

                <span className="text-lg font-black">
                  Shop<span className="text-[#5d8f99]">Sphere</span>
                </span>

              </div>

              <p className="mt-2 max-w-xs text-xs leading-5 text-[#766b62]">
                One marketplace. Many stores. Endless discoveries.
              </p>

            </div>


            <FooterColumn
              title="Shop"
              links={[
                ["Products", "/products"],
                ["Categories", "/products"],
                ["Stores", "/stores"],
                ["New arrivals", "/products"],
              ]}
            />


            <FooterColumn
              title="Account"
              links={[
                ["Login", "/login"],
                ["Cart", "/cart"],
                ["Orders", "/orders"],
                ["Wishlist", "/wishlist"],
              ]}
            />


            <div>

              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#674936]">
                ShopSphere
              </p>

              <p className="mt-2 text-xs leading-5 text-[#766b62]">
                A connected marketplace bringing products and vendors
                together in one shopping experience.
              </p>

            </div>

          </div>


          <div className="mt-7 border-t border-[#c9c0b5] pt-4 text-[10px] text-[#82766d]">

            © 2026 ShopSphere. Built for discovering more.

          </div>

        </div>

      </footer>

    </main>
  );
}


/* =========================================================
   HERO TILE
========================================================= */

function HeroTile({ emoji, bg }) {
  return (
    <div
      className={`flex h-28 items-center justify-center rounded-xl ${bg} text-4xl shadow-sm transition duration-200 hover:scale-[1.02]`}
    >
      {emoji}
    </div>
  );
}


/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({ product }) {
  return (
    <Link
      to="/products"
      className="group overflow-hidden rounded-xl border border-[#d8d0c5] bg-[#ebe7df] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#a5cbd0] hover:bg-[#e6f0f1] hover:shadow-md"
    >

      <div className="relative h-40 overflow-hidden bg-[#d7e7e8] sm:h-44">

        {product.images?.[0] ? (

          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

        ) : (

          <div className="flex h-full items-center justify-center text-5xl">
            🛍️
          </div>

        )}

        <span className="absolute left-2.5 top-2.5 rounded-full bg-[#674936] px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-[#f7f0e7]">
          {product.category || "Featured"}
        </span>

      </div>


      <div className="p-3">

        <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#64939c]">
          ShopSphere
        </p>

        <h3 className="mt-1 line-clamp-1 text-xs font-black text-[#392d26] sm:text-sm">
          {product.name || "Product"}
        </h3>

        <div className="mt-3 flex items-end justify-between gap-2">

          <div>

            <p className="text-[8px] text-[#91867c]">
              Price
            </p>

            <p className="mt-0.5 text-base font-black text-[#30251f]">
              ₹{product.price ?? "—"}
            </p>

          </div>

          <span className="rounded-md bg-[#674936] px-2.5 py-1.5 text-[8px] font-black text-[#f8f1e8] transition group-hover:bg-[#543a2b]">
            View
          </span>

        </div>

      </div>

    </Link>
  );
}


/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
  linkText,
  linkTo,
}) {
  return (
    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">

      <div>

        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6597a0]">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-black tracking-tight text-[#30251f] sm:text-2xl">
          {title}
        </h2>

        <p className="mt-1.5 max-w-xl text-xs leading-5 text-[#7b7169]">
          {description}
        </p>

      </div>


      {linkText && linkTo && (

        <Link
          to={linkTo}
          className="shrink-0 text-xs font-black text-[#674936] transition hover:text-[#4f382a]"
        >
          {linkText}
        </Link>

      )}

    </div>
  );
}


/* =========================================================
   BENEFIT
========================================================= */

function Benefit({ icon, title, text }) {
  return (
    <div className="flex items-center gap-2.5 border-r border-[#d2c9bd] px-4 py-3.5 last:border-r-0 sm:px-5">

      <div className="text-lg">
        {icon}
      </div>

      <div>

        <p className="text-[10px] font-black text-[#44372f]">
          {title}
        </p>

        <p className="mt-0.5 text-[9px] text-[#877c73]">
          {text}
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   DARK STAT
========================================================= */

function DarkStat({ value, label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-4">

      <p className="text-xl font-black text-[#c5e6e9]">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-semibold text-[#aabdb7]">
        {label}
      </p>

    </div>
  );
}


/* =========================================================
   FOOTER COLUMN
========================================================= */

function FooterColumn({ title, links }) {
  return (
    <div>

      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#674936]">
        {title}
      </p>

      <div className="mt-2.5 flex flex-col gap-1.5">

        {links.map(([label, path]) => (

          <Link
            key={label}
            to={path}
            className="w-fit text-xs text-[#766b62] transition hover:text-[#5c91a0]"
          >
            {label}
          </Link>

        ))}

      </div>

    </div>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  title,
  description,
}) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-[#c9c0b5] bg-[#e5e0d7] px-5 py-8 text-center">

      <div className="text-3xl">
        {icon}
      </div>

      <h3 className="mt-2 text-base font-black text-[#392d26]">
        {title}
      </h3>

      <p className="mt-1 text-xs text-[#81766d]">
        {description}
      </p>

    </div>
  );
}


/* =========================================================
   PRODUCT SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (

        <div
          key={item}
          className="h-64 animate-pulse rounded-xl bg-[#dfd9cf]"
        />

      ))}

    </div>
  );
}


/* =========================================================
   STORE SKELETON
========================================================= */

function StoreSkeleton() {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

      {[1, 2, 3].map((item) => (

        <div
          key={item}
          className="h-32 animate-pulse rounded-xl bg-[#dcd6cc]"
        />

      ))}

    </div>
  );
}
