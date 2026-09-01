import React from "react";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ShopSphereIntro from "./components/ShopSphereIntro.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Stores from "./pages/Stores.jsx";
import Store from "./pages/Store.jsx";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";
import CustomerOrders from "./pages/CustomerOrders.jsx";
import VendorDashboard from "./pages/VendorDashboard.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminVendors from "./pages/AdminVendors.jsx";
import AdminStores from "./pages/AdminStores.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";

import Success from "./pages/Success.jsx";

export default function App() {
  const [showIntro, setShowIntro] = React.useState(true);
  return (
    <BrowserRouter>
    {showIntro && (
    <ShopSphereIntro
      onComplete={() => setShowIntro(false)}
    />
  )}
      <Navbar />

      <Routes>
        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/stores"
          element={<Stores />}
        />

        <Route
          path="/store/:slug"
          element={<Store />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/checkout/success"
          element={<Success />}
        />

        {/* =========================
            CUSTOMER ROUTES
        ========================= */}

        <Route
          element={
            <ProtectedRoute
              roles={["CUSTOMER"]}
            />
          }
        >
          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/orders"
            element={<CustomerOrders />}
          />
        </Route>

        {/* =========================
            VENDOR ROUTES
        ========================= */}

        <Route
          element={
            <ProtectedRoute
              roles={["VENDOR"]}
            />
          }
        >
          <Route
            path="/vendor"
            element={<VendorDashboard />}
          />
        </Route>

        {/* =========================
            SUPER ADMIN ROUTES
        ========================= */}

        <Route
          element={
            <ProtectedRoute
              roles={["SUPER_ADMIN"]}
            />
          }
        >
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

          <Route
            path="/admin/vendors"
            element={<AdminVendors />}
          />

          <Route
            path="/admin/stores"
            element={<AdminStores />}
          />

          <Route
            path="/admin/orders"
            element={<AdminOrders />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}