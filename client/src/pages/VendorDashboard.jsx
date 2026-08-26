import React, {
  useEffect,
  useState
} from "react";

import api from "../services/api.js";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

export default function VendorDashboard() {

  const [data, setData] = useState(null);

  const [orders, setOrders] = useState([]);

  const [stores, setStores] = useState([]);

  const [products, setProducts] = useState([]);

  const [store, setStore] = useState({
    name: "",
    slug: "",
    description: ""
  });

  const [product, setProduct] = useState({
    storeId: "",
    name: "",
    price: 0,
    stock: 0
  });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =========================
     LOAD DASHBOARD
  ========================= */

  useEffect(() => {
    loadDashboard();
  }, []);


  async function loadDashboard() {

    try {

      setError("");

      const [
        analyticsResponse,
        storesResponse,
        productsResponse,
        ordersResponse
      ] = await Promise.all([

        api.get(
          "/analytics/vendor"
        ),

        api.get(
          "/stores"
        ),

        api.get(
          "/products"
        ),

        api.get(
          "/orders/vendor"
        )
      ]);


      setData(
        analyticsResponse.data
      );

      setOrders(
        ordersResponse.data.orders ||
          []
      );


      const allStores =
        storesResponse.data.stores ||
        [];

      setStores(allStores);


      const allProducts =
        productsResponse.data.products ||
        [];

      setProducts(allProducts);


      if (allStores.length > 0) {

        const firstStore =
          allStores[0];

        setProduct(
          current => ({
            ...current,

            storeId:
              current.storeId ||
              firstStore._id
          })
        );
      }

    } catch (err) {

      console.error(
        "VENDOR DASHBOARD ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load vendor dashboard"
      );

    } finally {

      setLoading(false);
    }
  }


  /* =========================
     CREATE STORE
  ========================= */

  async function createStore(e) {

    e.preventDefault();

    if (
      !store.name ||
      !store.slug
    ) {

      alert(
        "Please enter store name and slug."
      );

      return;
    }


    try {

      const response =
        await api.post(
          "/stores",
          store
        );


      alert(
        "Store created successfully!"
      );


      setStore({
        name: "",
        slug: "",
        description: ""
      });


      setProduct(
        current => ({
          ...current,

          storeId:
            response.data.store._id
        })
      );


      await loadDashboard();

    } catch (err) {

      console.error(
        "CREATE STORE ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to create store"
      );
    }
  }


  /* =========================
     DELETE STORE
  ========================= */

  async function deleteStore(
    storeId
  ) {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this store?"
      );


    if (!confirmed) {
      return;
    }


    try {

      await api.delete(
        `/stores/${storeId}`
      );


      alert(
        "Store deleted successfully!"
      );


      await loadDashboard();

    } catch (err) {

      console.error(
        "DELETE STORE ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to delete store"
      );
    }
  }


  /* =========================
     CREATE PRODUCT
  ========================= */

  async function createProduct(e) {

    e.preventDefault();


    if (!product.storeId) {

      alert(
        "Please create a store first."
      );

      return;
    }


    if (!product.name) {

      alert(
        "Please enter product name."
      );

      return;
    }


    try {

      await api.post(
        "/products",
        {
          ...product,

          price:
            Number(product.price),

          stock:
            Number(product.stock)
        }
      );


      alert(
        "Product created successfully!"
      );


      setProduct(
        current => ({
          ...current,

          name: "",
          price: 0,
          stock: 0
        })
      );


      await loadDashboard();

    } catch (err) {

      console.error(
        "CREATE PRODUCT ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to create product"
      );
    }
  }


  /* =========================
     DELETE PRODUCT
  ========================= */

  async function deleteProduct(
    productId
  ) {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this product?"
      );


    if (!confirmed) {
      return;
    }


    try {

      await api.delete(
        `/products/${productId}`
      );


      alert(
        "Product deleted successfully!"
      );


      await loadDashboard();

    } catch (err) {

      console.error(
        "DELETE PRODUCT ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to delete product"
      );
    }
  }


  /* =========================
     UPDATE ORDER STATUS
  ========================= */

  async function updateOrderStatus(
    orderId,
    status
  ) {

    try {

      await api.put(
        `/orders/${orderId}/status`,
        {
          status
        }
      );


      await loadDashboard();


      alert(
        "Order status updated successfully!"
      );

    } catch (err) {

      console.error(
        "ORDER STATUS ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to update order status"
      );
    }
  }


  /* =========================
     FORMAT CURRENCY
  ========================= */

  function formatCurrency(
    value
  ) {

    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  }


  /* =========================
     FORMAT DATE
  ========================= */

  function formatDate(
    date
  ) {

    if (!date) {
      return "";
    }

    const parts =
      date.split("-");

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}/${parts[1]}`;
  }


  /* =========================
     CHART DATA
  ========================= */

  const chartData =
    (data?.revenueTrend || [])
      .map(item => ({
        ...item,

        dateLabel:
          formatDate(
            item.date
          )
      }));


  /* =========================
     LOADING
  ========================= */

  if (loading) {

    return (
      <main className="min-h-screen bg-slate-50">

        <div className="mx-auto max-w-7xl px-6 py-12">

          <h1 className="text-3xl font-black">

            Loading Vendor Dashboard...

          </h1>

        </div>

      </main>
    );
  }


  /* =========================
     ERROR
  ========================= */

  if (error) {

    return (
      <main className="min-h-screen bg-slate-50">

        <div className="mx-auto max-w-7xl px-6 py-12">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">

            <h2 className="text-xl font-bold">
              Failed to Load Dashboard
            </h2>

            <p className="mt-2">
              {error}
            </p>

            <button
              onClick={loadDashboard}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white"
            >
              Try Again
            </button>

          </div>

        </div>

      </main>
    );
  }


  return (

    <main className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-7xl px-6 py-12">


        {/* =========================
            HEADER
        ========================= */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <p className="font-semibold text-indigo-600">
              ShopSphere Vendor
            </p>

            <h1 className="mt-1 text-4xl font-black text-slate-900">
              Vendor Dashboard
            </h1>

            <p className="mt-2 text-slate-600">
              Manage your stores, products,
              orders and business analytics.
            </p>

          </div>


          <button
            onClick={loadDashboard}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            ↻ Refresh
          </button>

        </div>


        {/* =========================
            REVENUE
        ========================= */}

        <section className="mt-8">

          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-7 text-white shadow-lg">

            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-100">
              Total Revenue
            </p>

            <h2 className="mt-2 text-4xl font-black">
              {formatCurrency(
                data?.revenue
              )}
            </h2>

            <p className="mt-2 text-sm text-indigo-100">
              Paid, non-cancelled orders
            </p>

          </div>

        </section>


        {/* =========================
            BASIC ANALYTICS
        ========================= */}

        <section className="mt-8">

          <h2 className="text-2xl font-black text-slate-900">
            Business Statistics
          </h2>


          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {[
              [
                "Stores",
                data?.stores,
                "🏬",
                "bg-orange-100"
              ],

              [
                "Products",
                data?.products,
                "🛍️",
                "bg-purple-100"
              ],

              [
                "Orders",
                data?.orders,
                "📦",
                "bg-blue-100"
              ],

              [
                "Revenue",
                formatCurrency(
                  data?.revenue
                ),
                "₹",
                "bg-green-100"
              ]

            ].map(
              ([
                label,
                value,
                icon,
                bg
              ]) => (

                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >

                  <div className="flex items-center justify-between">

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} text-2xl`}
                    >
                      {icon}
                    </div>

                    <p className="text-2xl font-black text-slate-900">
                      {value ?? 0}
                    </p>

                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-500">
                    {label}
                  </p>

                </div>

              )
            )}

          </div>

        </section>


        {/* =========================
            ORDER ANALYTICS
        ========================= */}

        <section className="mt-8">

          <h2 className="text-2xl font-black text-slate-900">
            Order Analytics
          </h2>


          <div className="mt-5 grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border bg-white p-6 shadow-sm">

              <p className="text-sm text-slate-500">
                Pending Orders
              </p>

              <p className="mt-2 text-3xl font-black text-yellow-600">
                {data?.pendingOrders || 0}
              </p>

            </div>


            <div className="rounded-2xl border bg-white p-6 shadow-sm">

              <p className="text-sm text-slate-500">
                Completed Orders
              </p>

              <p className="mt-2 text-3xl font-black text-green-600">
                {data?.completedOrders || 0}
              </p>

            </div>


            <div className="rounded-2xl border bg-white p-6 shadow-sm">

              <p className="text-sm text-slate-500">
                Cancelled Orders
              </p>

              <p className="mt-2 text-3xl font-black text-red-600">
                {data?.cancelledOrders || 0}
              </p>

            </div>

          </div>

        </section>


        {/* =========================
            REVENUE CHART
        ========================= */}

        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="text-2xl font-black text-slate-900">
            Revenue Trend
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your paid revenue during the last 7 days.
          </p>


          <div className="mt-6 h-80">

            {chartData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={chartData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="dateLabel"
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#4f46e5"
                    strokeWidth={3}
                  />

                </LineChart>

              </ResponsiveContainer>

            ) : (

              <div className="flex h-full items-center justify-center text-slate-500">
                No revenue data available.
              </div>

            )}

          </div>

        </section>


        {/* =========================
            ORDERS CHART
        ========================= */}

        <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">

          <h2 className="text-2xl font-black text-slate-900">
            Order Trend
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Orders received during the last 7 days.
          </p>


          <div className="mt-6 h-80">

            {chartData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={chartData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="dateLabel"
                  />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="orders"
                    name="Orders"
                    fill="#6366f1"
                    radius={[
                      6,
                      6,
                      0,
                      0
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div className="flex h-full items-center justify-center text-slate-500">
                No order data available.
              </div>

            )}

          </div>

        </section>


        {/* =========================
            MY STORES
        ========================= */}

        <section className="mt-10">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-black">
                My Stores
              </h2>

              <p className="mt-1 text-slate-600">
                Manage the stores you own.
              </p>

            </div>

            <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700">
              {stores.length} Stores
            </span>

          </div>


          {stores.length === 0 ? (

            <div className="mt-6 rounded-2xl border bg-white p-8 text-center">

              <h3 className="text-xl font-bold">
                No stores yet
              </h3>

              <p className="mt-2 text-slate-600">
                Create your first store below.
              </p>

            </div>

          ) : (

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {stores.map(
                currentStore => (

                  <div
                    key={currentStore._id}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="text-xl font-bold">
                          {currentStore.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          /{currentStore.slug}
                        </p>

                      </div>

                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        currentStore.status === "SUSPENDED"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {currentStore.status || "ACTIVE"}
                      </span>

                    </div>


                    <p className="mt-4 text-sm text-slate-600">
                      {currentStore.description ||
                        "No description available."}
                    </p>


                    <button
                      type="button"
                      onClick={() =>
                        deleteStore(
                          currentStore._id
                        )
                      }
                      className="mt-5 w-full rounded-xl bg-red-50 px-4 py-3 font-bold text-red-600 hover:bg-red-100"
                    >
                      Delete Store
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* =========================
            MY PRODUCTS
        ========================= */}

        <section className="mt-10">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-black">
                My Products
              </h2>

              <p className="mt-1 text-slate-600">
                Manage products available in your stores.
              </p>

            </div>

            <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-bold text-purple-700">
              {products.length} Products
            </span>

          </div>


          {products.length === 0 ? (

            <div className="mt-6 rounded-2xl border bg-white p-8 text-center">

              <h3 className="text-xl font-bold">
                No products yet
              </h3>

              <p className="mt-2 text-slate-600">
                Create a product using the form below.
              </p>

            </div>

          ) : (

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {products.map(
                currentProduct => (

                  <div
                    key={currentProduct._id}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                  >

                    <h3 className="text-xl font-bold">
                      {currentProduct.name}
                    </h3>

                    <p className="mt-2 text-lg font-black text-indigo-600">
                      ₹{currentProduct.price}
                    </p>

                    <div className="mt-3 flex gap-2">

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                        Stock: {currentProduct.stock}
                      </span>

                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        deleteProduct(
                          currentProduct._id
                        )
                      }
                      className="mt-5 w-full rounded-xl bg-red-50 px-4 py-3 font-bold text-red-600 hover:bg-red-100"
                    >
                      Delete Product
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* =========================
            CUSTOMER ORDERS
        ========================= */}

        <section className="mt-10">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-black">
                Customer Orders
              </h2>

              <p className="mt-1 text-slate-600">
                Manage orders placed in your store.
              </p>

            </div>

            <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700">
              {orders.length} Orders
            </span>

          </div>


          {orders.length === 0 ? (

            <div className="mt-6 rounded-2xl border bg-white p-8 text-center">

              <h3 className="text-xl font-bold">
                No orders yet
              </h3>

              <p className="mt-2 text-slate-600">
                Customer orders will appear here.
              </p>

            </div>

          ) : (

            <div className="mt-6 space-y-5">

              {orders.map(
                order => (

                  <div
                    key={order._id}
                    className="rounded-2xl border bg-white p-6 shadow-sm"
                  >

                    <div className="flex flex-col justify-between gap-4 md:flex-row">

                      <div>

                        <p className="text-sm text-slate-500">
                          Order ID
                        </p>

                        <p className="mt-1 text-lg font-black">
                          #
                          {order._id
                            .slice(-8)
                            .toUpperCase()}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          🕐{" "}
                          {order.createdAt
                            ? new Date(
                                order.createdAt
                              ).toLocaleString(
                                "en-IN",
                                {
                                  dateStyle:
                                    "medium",
                                  timeStyle:
                                    "short"
                                }
                              )
                            : "Date unavailable"}
                        </p>

                        <p className="mt-3 text-2xl font-black">
                          ₹{order.total}
                        </p>

                      </div>


                      <div>

                        <p className="text-sm text-slate-500">
                          Current Status
                        </p>

                        <span className="mt-1 inline-block rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700">
                          {order.status}
                        </span>

                      </div>


                      <div>

                        <p className="text-sm text-slate-500">
                          💳 Payment
                        </p>

                        <span
                          className={`mt-1 inline-block rounded-full px-4 py-2 text-sm font-bold ${
                            order.paymentStatus ===
                            "PAID"
                              ? "bg-green-100 text-green-700"
                              : order.paymentStatus ===
                                "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>

                      </div>

                    </div>


                    {/* DELIVERY */}

                    <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">

                      <h3 className="text-lg font-black">
                        📦 Delivery Details
                      </h3>

                      {order.shippingAddress ? (

                        <div className="mt-4 space-y-2 text-sm text-slate-700">

                          <p className="font-bold">
                            {order.shippingAddress.fullName}
                          </p>

                          <p>
                            📞{" "}
                            {order.shippingAddress.phone}
                          </p>

                          <p>
                            {order.shippingAddress.addressLine}
                          </p>

                          <p>
                            {
                              order.shippingAddress.city
                            }
                            ,{" "}
                            {
                              order.shippingAddress.state
                            }{" "}
                            -{" "}
                            {
                              order.shippingAddress.pincode
                            }
                          </p>

                        </div>

                      ) : (

                        <p className="mt-3 text-sm text-slate-500">
                          Delivery details unavailable.
                        </p>

                      )}

                    </div>


                    {/* ITEMS */}

                    <div className="mt-6 border-t pt-5">

                      <h4 className="text-lg font-bold">
                        Items
                      </h4>

                      <div className="mt-3 space-y-2">

                        {order.items?.map(
                          (item, index) => (

                            <div
                              key={
                                item.productId ||
                                index
                              }
                              className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
                            >

                              <div>

                                <p className="font-semibold">
                                  {item.name}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                  Quantity:{" "}
                                  {item.quantity}
                                </p>

                              </div>

                              <p className="font-bold">
                                ₹
                                {Number(
                                  item.price
                                ) *
                                  Number(
                                    item.quantity
                                  )}
                              </p>

                            </div>

                          )
                        )}

                      </div>

                    </div>


                    {/* TOTAL */}

                    <div className="mt-5 flex items-center justify-between border-t pt-5">

                      <span className="text-lg font-bold">
                        Total
                      </span>

                      <span className="text-2xl font-black text-indigo-600">
                        ₹{order.total}
                      </span>

                    </div>


                    {/* UPDATE STATUS */}

                    <div className="mt-5 border-t pt-5">

                      <label className="text-sm font-semibold text-slate-600">
                        Update Order Status
                      </label>

                      <select
                        value={
                          order.status
                        }
                        onChange={e =>
                          updateOrderStatus(
                            order._id,
                            e.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border bg-white p-3 md:w-72"
                      >

                        <option value="PLACED">
                          Placed
                        </option>

                        <option value="PROCESSING">
                          Processing
                        </option>

                        <option value="SHIPPED">
                          Shipped
                        </option>

                        <option value="DELIVERED">
                          Delivered
                        </option>

                        <option value="CANCELLED">
                          Cancelled
                        </option>

                      </select>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* =========================
            CREATE STORE / PRODUCT
        ========================= */}

        <div className="mt-10 grid gap-8 md:grid-cols-2">


          {/* CREATE STORE */}

          <form
            onSubmit={createStore}
            className="rounded-2xl border bg-white p-6 shadow-sm"
          >

            <h2 className="text-2xl font-bold">
              Create Store
            </h2>


            <input
              className="mt-4 w-full rounded-xl border p-3 outline-none focus:border-indigo-500"
              placeholder="Store name"
              value={store.name}
              onChange={e =>
                setStore({
                  ...store,
                  name:
                    e.target.value
                })
              }
            />


            <input
              className="mt-3 w-full rounded-xl border p-3 outline-none focus:border-indigo-500"
              placeholder="store-slug"
              value={store.slug}
              onChange={e =>
                setStore({
                  ...store,
                  slug:
                    e.target.value
                })
              }
            />


            <textarea
              className="mt-3 w-full rounded-xl border p-3 outline-none focus:border-indigo-500"
              placeholder="Description"
              rows="4"
              value={
                store.description
              }
              onChange={e =>
                setStore({
                  ...store,
                  description:
                    e.target.value
                })
              }
            />


            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800"
            >
              + Create Store
            </button>

          </form>


          {/* CREATE PRODUCT */}

          <form
            onSubmit={createProduct}
            className="rounded-2xl border bg-white p-6 shadow-sm"
          >

            <h2 className="text-2xl font-bold">
              Create Product
            </h2>


            <select
              className="mt-4 w-full rounded-xl border bg-white p-3"
              value={
                product.storeId
              }
              onChange={e =>
                setProduct({
                  ...product,
                  storeId:
                    e.target.value
                })
              }
            >

              <option value="">
                Select Store
              </option>

              {stores.map(
                currentStore => (

                  <option
                    key={
                      currentStore._id
                    }
                    value={
                      currentStore._id
                    }
                  >
                    {
                      currentStore.name
                    }
                  </option>

                )
              )}

            </select>


            <input
              className="mt-3 w-full rounded-xl border p-3 outline-none focus:border-indigo-500"
              placeholder="Product name"
              value={
                product.name
              }
              onChange={e =>
                setProduct({
                  ...product,
                  name:
                    e.target.value
                })
              }
            />


            <input
              className="mt-3 w-full rounded-xl border p-3 outline-none focus:border-indigo-500"
              placeholder="Price"
              type="number"
              min="0"
              value={
                product.price
              }
              onChange={e =>
                setProduct({
                  ...product,
                  price:
                    e.target.value
                })
              }
            />


            <input
              className="mt-3 w-full rounded-xl border p-3 outline-none focus:border-indigo-500"
              placeholder="Stock"
              type="number"
              min="0"
              value={
                product.stock
              }
              onChange={e =>
                setProduct({
                  ...product,
                  stock:
                    e.target.value
                })
              }
            />


            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700"
            >
              + Create Product
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}