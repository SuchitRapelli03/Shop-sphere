import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import ProductCard from "../components/ProductCard.jsx";

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
        const response = await api.get("/products?limit=50");

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
     QUICK CATEGORIES
  ========================================================= */

  const quickCategories = [
    { name: "Men", icon: "♂" },
    { name: "Women", icon: "♀" },
    { name: "Kids", icon: "🧸" },
    { name: "Food", icon: "🍽️" },
    { name: "Grocery", icon: "🥑" },
    { name: "Electronics", icon: "💻" },
    { name: "Beauty", icon: "💄" },
    { name: "Home Appliances", icon: "🏠" },
    { name: "Stationery", icon: "✏️" },
    { name: "Tools", icon: "🔧" },
    { name: "Arts", icon: "🎨" },
  ];

  /* =========================================================
     SHOPPING DEPARTMENTS
  ========================================================= */

  const departments = [
    {
      name: "Fashion",
      icon: "👕",
      description: "Everyday styles",
      bg: "bg-[#eadfd5]",
    },
    {
      name: "Electronics",
      icon: "🎧",
      description: "Tech & gadgets",
      bg: "bg-[#d9ecef]",
    },
    {
      name: "Home & Living",
      icon: "🏠",
      description: "Make it yours",
      bg: "bg-[#e7e0d5]",
    },
    {
      name: "Beauty",
      icon: "💄",
      description: "Care & glow",
      bg: "bg-[#e7dfe7]",
    },
    {
      name: "Sports",
      icon: "⚽",
      description: "Move better",
      bg: "bg-[#dce8df]",
    },
    {
      name: "Food & Grocery",
      icon: "🥑",
      description: "Daily essentials",
      bg: "bg-[#dfe8d9]",
    },
    {
      name: "Stationery",
      icon: "✏️",
      description: "Study & create",
      bg: "bg-[#e3e1d6]",
    },
    {
      name: "Accessories",
      icon: "⌚",
      description: "Little details",
      bg: "bg-[#dce9ec]",
    },
  ];

  /* =========================================================
     PRODUCT GROUPS
  ========================================================= */

  const popularProducts = useMemo(
    () => products.slice(0, 8),
    [products]
  );

  const moreProducts = useMemo(
    () => products.slice(8, 16),
    [products]
  );

  const dealProducts = useMemo(
    () => [...products]
      .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
      .slice(0, 8),
    [products]
  );

  /* =========================================================
     COUNTS
  ========================================================= */

  const productCount = products.length;
  const storeCount = stores.length;

  return (
    <main className="min-h-screen bg-[#f3efe8] text-[#30251f]">

      {/* =====================================================
          QUICK CATEGORY NAVIGATION
          KEEPING YOUR VERSION
      ===================================================== */}

      <section className="border-b border-[#d8d0c5] bg-[#6EA7B7]">

        <div className="mx-auto max-w-7xl px-3 lg:px-8">

          <div className="overflow-x-auto scrollbar-hide">

            <div className="mx-auto flex w-max min-w-full justify-center">

              {quickCategories.map((category) => (

                <Link
                  key={category.name}
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="group relative flex min-w-[88px] shrink-0 items-center justify-center gap-2 border-r border-[#e1d9cf] px-3 py-3 transition duration-200 first:border-l hover:bg-[#e9f3f4]"
                >

                  <span className="text-sm grayscale transition duration-200 group-hover:grayscale-0">
                    {category.icon}
                  </span>

                  <span className="whitespace-nowrap text-[10px] font-black text-[#5f554d] transition group-hover:text-[#3f737c]">
                    {category.name}
                  </span>

                </Link>

              ))}

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          OFFER STRIP
      ===================================================== */}

      <div className="bg-[#047857] px-4 py-2 text-center text-[11px] font-bold tracking-wide text-[#f7f0e7]">
        ✨ One marketplace · Multiple stores · Endless discoveries
      </div>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="border-b border-[#d8d0c5] bg-gradient-to-r from-forest-900 to-forest-800 px-5 py-8 lg:px-8 lg:py-10">

        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">

          <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-stretch">

            {/* HERO COPY */}

            <div className="flex flex-col justify-center rounded-[1.5rem] border border-[#bdd5d8] bg-[#edf7f8] px-6 py-8 shadow-sm sm:px-8">

              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#a8cbd0] bg-white/60 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#557d84]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#047857]" />
                The ShopSphere marketplace
              </span>

              <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[1.02] tracking-tight text-[#022C22] sm:text-5xl lg:text-6xl">
                Find it.
                <span className="block text-[#047857]">
                  Love it.
                </span>
                <span className="block text-[#674936]">
                  Shop it.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-[#6d6259] sm:text-base">
                Discover products from multiple stores, compare your
                favourites and bring everything together in one connected
                marketplace.
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">

                <Link
                  to="/products"
                  className="rounded-xl bg-[#674936] px-5 py-3 text-xs font-black text-[#f8f1e8] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#543a2b]"
                >
                  Start shopping →
                </Link>

                <Link
                  to="/stores"
                  className="rounded-xl border border-[#a9cbd0] bg-white/70 px-5 py-3 text-xs font-black text-[#4d737b] transition duration-200 hover:bg-white"
                >
                  Explore stores
                </Link>

              </div>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[#779096]">
                <span>✓ Multiple stores</span>
                <span>✓ Secure shopping</span>
                <span>✓ One marketplace</span>
              </div>

            </div>


            {/* HERO SHOPPING PANEL */}

            <div className="relative">

              <div className="absolute -inset-5 rounded-[3rem] bg-[#8fbfc7]/20 blur-3xl" />

              <div className="relative h-full rounded-[1.5rem] border border-[#bdd5d8] bg-[#cfe4e7] p-2.5 shadow-lg">

                <div className="flex h-full flex-col rounded-[1.15rem] bg-[#f0eee7] p-4">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#7e624e]">
                        ShopSphere
                      </p>

                      <h2 className="mt-0.5 text-lg font-black">
                        Explore today's picks
                      </h2>

                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#674936] text-base">
                      🛒
                    </div>

                  </div>

                  <div className="mt-4 grid flex-1 grid-cols-2 gap-2.5">

                    <HeroTile emoji="👟" label="Fashion" bg="bg-[#e7d9cd]" />
                    <HeroTile emoji="🎧" label="Electronics" bg="bg-[#d5e9ec]" />
                    <HeroTile emoji="⌚" label="Accessories" bg="bg-[#dce7df]" />
                    <HeroTile emoji="💄" label="Beauty" bg="bg-[#e8dadd]" />

                  </div>

                  <div className="mt-3 rounded-xl bg-[#674936] px-4 py-3 text-[#f7f0e8]">

                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#d7c0ad]">
                      The marketplace
                    </p>

                    <div className="mt-0.5 flex items-center justify-between">

                      <p className="text-xs font-black">
                        Many stores. One cart.
                      </p>

                      <span className="text-sm">
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
            text="Different vendors, one place"
          />

          <Benefit
            icon="🔒"
            title="Secure checkout"
            text="Shop with confidence"
          />

          <Benefit
            icon="📦"
            title="Easy ordering"
            text="Simple shopping experience"
          />

          <Benefit
            icon="🌐"
            title="One marketplace"
            text="Everything connected"
          />

        </div>

      </section>


      {/* =====================================================
          SHOP BY DEPARTMENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">

        <SectionHeading
          eyebrow="Explore"
          title="Shop by department"
          description="Jump straight into the kind of things you're looking for."
          linkText="View all products →"
          linkTo="/products"
        />

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">

          {departments.map((department) => (

            <Link
              key={department.name}
              to={`/products?category=${encodeURIComponent(department.name)}`}
              className="group rounded-2xl border border-[#d9d1c7] bg-[#9A623D] p-3 transition duration-200 hover:-translate-y-1 hover:border-[#a6cbd0] hover:bg-[#D4B08A] hover:shadow-md"
            >

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${department.bg} text-2xl transition duration-200 group-hover:scale-105`}
              >
                {department.icon}
              </div>

              <h3 className="mt-3 text-[11px] font-black leading-4 text-[#3b2e26]">
                {department.name}
              </h3>

              <p className="mt-1 text-[9px] text-[#ffffff]">
                {department.description}
              </p>

            </Link>

          ))}

        </div>

      </section>


      {/* =====================================================
          DEALS
      ===================================================== */}

      <section className="border-y border-[#d8d0c5] bg-[#e7e2d9]">

        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">

          <div className="flex items-end justify-between gap-4">

            <div>

              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6597a0]">
                Worth a look
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight text-[#30251f] sm:text-2xl">
                Everyday deals
              </h2>

              <p className="mt-1.5 text-xs text-[#7b7169]">
                Some of the lowest-priced products currently available.
              </p>

            </div>

            <Link
              to="/products?sort=price-low"
              className="shrink-0 text-xs font-black text-[#674936] transition hover:text-[#4f382a]"
            >
              See all →
            </Link>

          </div>

          {loadingProducts ? (

            <ProductSkeleton />

          ) : dealProducts.length === 0 ? (

            <EmptyState
              icon="🏷️"
              title="Deals are coming"
              description="Products will appear here once vendors add them."
            />

          ) : (

            <ProductRail products={dealProducts} />

          )}

        </div>

      </section>


      {/* =====================================================
          POPULAR PRODUCTS
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">

        <SectionHeading
          eyebrow="Popular now"
          title="Products worth discovering"
          description="Explore products available across the ShopSphere marketplace."
          linkText="Browse everything →"
          linkTo="/products"
        />

        {loadingProducts ? (

          <ProductSkeleton />

        ) : popularProducts.length === 0 ? (

          <EmptyState
            icon="📦"
            title="Products are arriving"
            description="Once vendors add products, they'll appear here."
          />

        ) : (

          <ProductRail products={popularProducts} />

        )}

      </section>


      {/* =====================================================
          STORES
      ===================================================== */}

      <section className="border-y border-[#d8d0c5] bg-[#ebe6dd]">

        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">

          <SectionHeading
            eyebrow="Marketplace"
            title="Discover stores"
            description="Meet the vendors behind the products you can shop on ShopSphere."
            linkText="View all stores →"
            linkTo="/stores"
          />

          {loadingStores ? (

            <StoreSkeleton />

          ) : stores.length === 0 ? (

            <EmptyState
              icon="🏪"
              title="Stores are getting ready"
              description="Vendor stores will appear here once they are active."
            />

          ) : (

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {stores.slice(0, 6).map((store) => (

                <Link
                  key={store._id}
                  to={`/store/${store.slug}`}
                  className="group rounded-2xl border border-[#d5cdc2] bg-[#f0ece5] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#a4c9cf] hover:bg-[#e4eff0] hover:shadow-md"
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
          MORE PRODUCTS
      ===================================================== */}

      {moreProducts.length > 0 && (

        <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">

          <SectionHeading
            eyebrow="Keep exploring"
            title="More to discover"
            description="There is always another product waiting around the corner."
            linkText="See all products →"
            linkTo="/products"
          />

          <ProductRail products={moreProducts} />

        </section>

      )}


      {/* =====================================================
          MARKETPLACE STATS
      ===================================================== */}

      <section className="bg-[#18372f]">

        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">

          <div className="grid gap-7 lg:grid-cols-[.8fr_1.2fr] lg:items-center">

            <div>

              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a8d7dc]">
                Why ShopSphere?
              </p>

              <h2 className="mt-2 text-2xl font-black leading-tight text-[#f2eee7] sm:text-3xl">
                One place.
                <span className="block text-[#a8dce2]">
                  Plenty to discover.
                </span>
              </h2>

              <p className="mt-3 max-w-md text-xs leading-5 text-[#b9c9c3]">
                Different vendors and products come together in one
                connected shopping experience.
              </p>

            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">

              <DarkStat
                value={productCount}
                label="Products loaded"
              />

              <DarkStat
                value={storeCount}
                label="Stores available"
              />

              <DarkStat
                value="24/7"
                label="Shopping"
              />

              <DarkStat
                value="1"
                label="Marketplace"
              />

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">

        <div className="relative overflow-hidden rounded-[1.5rem] bg-[#c9e2e5] px-6 py-8 shadow-sm sm:px-8">

          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#91bec5]/25 blur-3xl" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#577a81]">
                Ready when you are
              </p>

              <h2 className="mt-1 text-xl font-black text-[#30251f] sm:text-2xl">
                Your next favourite is somewhere in the sphere.
              </h2>

              <p className="mt-1.5 max-w-xl text-xs text-[#70665e]">
                Browse products, discover stores and find something worth
                bringing home.
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

function HeroTile({ emoji, label, bg }) {
  return (
    <div
      className={`group relative flex min-h-[115px] items-center justify-center overflow-hidden rounded-xl ${bg} text-4xl shadow-sm transition duration-200 hover:scale-[1.02]`}
    >
      <span className="transition duration-200 group-hover:scale-110">
        {emoji}
      </span>

      <span className="absolute bottom-2 left-2.5 rounded-md bg-white/70 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-[#5e554d] backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}


/* =========================================================
   PRODUCT RAIL
========================================================= */

function ProductRail({ products }) {
  return (
    <div className="mt-6 flex gap-3 overflow-x-auto pb-3 scrollbar-hide">

      {products.map((product) => (

        <ProductCard
          key={product._id}
          product={product}
        />

      ))}

    </div>
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
    <div className="mt-6 flex gap-3 overflow-hidden">

      {[1, 2, 3, 4, 5, 6].map((item) => (

        <div
          key={item}
          className="h-72 w-[190px] shrink-0 animate-pulse rounded-2xl bg-[#dfd9cf] sm:w-[210px]"
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
          className="h-32 animate-pulse rounded-2xl bg-[#dcd6cc]"
        />

      ))}

    </div>
  );
}
