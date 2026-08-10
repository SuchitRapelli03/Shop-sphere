# ShopSphere - Multi-Tenant E-Commerce SaaS

A MERN starter project for a multi-tenant e-commerce platform with:
- Super Admin, Vendor and Customer roles
- JWT authentication + bcrypt password hashing
- Tenant-aware Store/Product APIs
- Customer cart and orders
- Stripe Checkout integration
- Cloudinary upload endpoint
- Nodemailer order emails
- Vendor/Admin analytics
- React + Redux Toolkit + Tailwind CSS

## 1. Requirements
- Node.js 20+
- MongoDB (local or Atlas)
- Stripe account for payments
- Cloudinary account for images
- SMTP credentials for emails

## 2. Backend setup
```bash
cd server
npm install
copy .env.example .env
npm run dev
```

Linux/macOS:
```bash
cp .env.example .env
```

Edit `.env`.

## 3. Frontend setup
Open another terminal:
```bash
cd client
npm install
copy .env.example .env
npm run dev
```

## 4. First user
Register a normal user from the UI. To make a user a vendor/admin for development, change the `role` field in MongoDB or add an admin-only seed script later.

## 5. Main API
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/stores
- GET /api/stores
- GET /api/stores/:slug
- PUT /api/stores/:id
- DELETE /api/stores/:id
- POST /api/products
- GET /api/products
- GET /api/products/:id
- PUT /api/products/:id
- DELETE /api/products/:id
- GET /api/cart
- POST /api/cart/items
- PUT /api/cart/items/:productId
- DELETE /api/cart/items/:productId
- POST /api/orders
- GET /api/orders/my
- GET /api/orders/vendor
- POST /api/payments/create-checkout-session
- POST /api/uploads/image
- GET /api/analytics/vendor
- GET /api/analytics/admin

## Important
Never commit `.env`. Stripe secret keys, JWT secrets, Cloudinary secrets and SMTP passwords must stay in environment variables.
