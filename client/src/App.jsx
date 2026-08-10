import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Stores from "./pages/Stores.jsx";
import Store from "./pages/Store.jsx";
import Products from "./pages/Products.jsx";
import Cart from "./pages/Cart.jsx";
import CustomerOrders from "./pages/CustomerOrders.jsx";
import VendorDashboard from "./pages/VendorDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Success from "./pages/Success.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/store/:slug" element={<Store />} />
        <Route path="/products" element={<Products />} />
        <Route path="/checkout/success" element={<Success />} />

        <Route element={<ProtectedRoute roles={["CUSTOMER"]} />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<CustomerOrders />} />
        </Route>

        <Route element={<ProtectedRoute roles={["VENDOR"]} />}>
          <Route path="/vendor" element={<VendorDashboard />} />
        </Route>

        <Route element={<ProtectedRoute roles={["SUPER_ADMIN"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}