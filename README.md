# ShopSphere — Multi-Tenant SaaS E-Commerce Platform

Enterprise-grade, secure, multi-tenant e-commerce platform built with **React.js, Redux Toolkit, Tailwind CSS, Node.js, Express.js, MongoDB, JWT, Stripe, and Cloudinary**.

---

## 🌟 Key Architecture & Features

### 1. Multi-Tenant Isolation
- **Tenant Separation**: Products, inventory, storefront branding, and order fulfillment are strictly scoped to the authenticated vendor's tenant ID (`storeId` / `vendorId`).
- **Storefront Directory**: Customers can browse by individual vendor store profiles or search across the entire marketplace.

### 2. Role-Based Access Control (RBAC)
- **Super Admin (`super_admin`)**: Global marketplace administration, platform statistics, user management, and the **Vendor Approval Workflow Queue**.
- **Vendor (`vendor`)**: Tenant dashboard, store branding configuration, product CRUD with Cloudinary image upload, stock management, and tenant-specific order tracking.
- **Customer (`customer`)**: Marketplace browsing, cart management, checkout with Stripe integration, and order tracking.

### 3. Vendor Self-Registration (Requirement 6)
- **Self-Registration Portal (`/vendor/register`)**: Vendors register with full business details, store name, phone, address, and password.
- **Pending Moderation Queue**: New vendors are automatically assigned `status: "pending"` and barred from merchant privileges until approved by Super Admin.
- **Super Admin Review**: Admins review pending vendor applications in real-time, with one-click **Approve** or **Reject** (with feedback reason) actions.

---

## 🚀 Production Deployment Guide

### A. Backend Deployment (Render)

1. **Create Web Service on Render**:
   - Connect your GitHub repository.
   - Set **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`

2. **Configure Environment Variables in Render Dashboard**:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopsphere?retryWrites=true&w=majority
   JWT_SECRET=your_production_secure_jwt_secret_key_32_chars
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=your_smtp_user
   SMTP_PASSWORD=your_smtp_password
   FRONTEND_URL=https://shopsphere-app.vercel.app
   ```

3. **Verify Health Endpoint**:
   - URL: `https://<your-render-service>.onrender.com/api/health`
   - Expected Response: `{"success": true, "message": "ShopSphere API is running"}`

---

### B. Frontend Deployment (Vercel)

1. **Deploy to Vercel**:
   - Import the GitHub repository in Vercel.
   - Set **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

2. **Configure Environment Variables in Vercel**:
   ```env
   VITE_API_URL=https://<your-render-service>.onrender.com/api
   ```

3. **SPA Routing**:
   - `frontend/vercel.json` is preconfigured with client-side routing rewrites for all single-page application routes.

---

## 🔑 Demo & Test Accounts

Run the database seed script to populate test accounts:
```bash
cd backend
npm run dev # or: node seed.js
```

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@shopsphere.com` | `AdminPass123!` | Full admin access, pending vendor approval queue, platform statistics |
| **Active Vendor** | `vendor@shopsphere.com` | `VendorPass123!` | Active vendor dashboard, product management, store customization |
| **Pending Vendor** | `pending.vendor@shopsphere.com` | `VendorPass123!` | Under review state, demonstrates pending approval UI guard |
| **Customer** | `customer@shopsphere.com` | `CustomerPass123!` | Marketplace shopping, cart, checkout, order tracking |

---

## 📡 Core API Reference

### Health
- `GET /api/health` — Public health check status

### Authentication & Vendor Registration
- `POST /api/auth/register` — Customer account creation
- `POST /api/auth/vendor/register` — **Vendor Self-Registration** (Creates vendor in `pending` status & initial store record)
- `POST /api/auth/login` — Universal login (Customer, Vendor, Admin)
- `GET /api/auth/me` — Current user profile & linked store

### Super Admin (Requires `super_admin` role)
- `GET /api/admin/vendors/pending` — List vendor applications awaiting review
- `GET /api/admin/vendors` — List all registered vendors
- `PATCH /api/admin/vendors/:id/approve` — Approve pending vendor & activate store
- `PATCH /api/admin/vendors/:id/reject` — Reject vendor application with reason
- `PATCH /api/admin/vendors/:id/status` — Activate / Deactivate vendor account
- `GET /api/admin/stats` — Platform metrics & revenue analytics

### Vendor Hub (Requires active `vendor` role)
- `GET /api/vendor/store` — Get own store settings
- `PUT /api/vendor/store` — Update store details & branding
- `GET /api/vendor/products` — Get tenant's products
- `GET /api/vendor/orders` — Get tenant-specific customer orders
- `GET /api/vendor/stats` — Get store revenue and stock metrics

### Products & Stores (Public & Vendor CRUD)
- `GET /api/products` — Browse products with search, category, and price filters
- `GET /api/products/:id` — Get product detail with vendor info
- `POST /api/products` — Create new product (Vendor only)
- `PUT /api/products/:id` — Update product (Vendor only)
- `DELETE /api/products/:id` — Delete product (Vendor only)
- `GET /api/stores` — Browse vendor store directory
- `GET /api/stores/:idOrSlug` — Storefront page with products

### Orders & Checkout
- `POST /api/orders` — Create new order & initialize Stripe payment intent
- `POST /api/orders/:id/pay` — Confirm payment and update product stock
- `GET /api/orders/my-orders` — Customer order history
- `GET /api/orders/:id` — Order details

### Media Upload
- `POST /api/upload` — Multipart Cloudinary image upload for products and store logos
