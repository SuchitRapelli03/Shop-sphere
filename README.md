# 🛒 ShopSphere

## Multi-Tenant E-Commerce SaaS Platform

ShopSphere is a full-stack **Multi-Tenant E-Commerce SaaS Platform** that enables multiple independent vendors to create and manage their own digital storefronts within a single unified marketplace.

The platform provides separate experiences for **Customers, Vendors, and Super Administrators**, with secure role-based access control, tenant-aware data management, product variants, cart and order management, online payments, media uploads, email notifications, and analytics dashboards.

---

## ✨ Features

### 👤 Authentication & Authorization

- Secure user registration and login
- JWT-based authentication
- Password hashing using Bcrypt
- Role-Based Access Control (RBAC)
- Three user roles:
  - Customer
  - Vendor
  - Super Admin
- Protected API routes
- Secure authorization middleware

---

### 🏪 Multi-Tenant Store Management

- Vendors can create and manage their own stores
- Store ownership validation
- Tenant-aware product management
- Vendors cannot access or modify another vendor's stores
- Store activation and suspension controls
- Public store browsing

---

### 📦 Product & Inventory Management

- Create, update, and delete products
- Product categories and search
- Price filtering
- Pagination support
- Active/inactive product management
- Store ownership validation
- Product stock management

#### Product Variants

ShopSphere supports products with multiple variants.

Examples include:

- Size
- Color
- Storage
- Other product-specific options

The system supports:

- Variant-specific pricing
- Variant-specific stock
- Duplicate variant combination validation
- Variant selection in the cart
- Separate cart items for different variants
- Variant stock restoration after order cancellation

---

### 🛍️ Customer Shopping Experience

Customers can:

- Browse active stores
- Browse products
- Search products
- Filter products by category and price
- View product details
- Add products to their cart
- Select product variants
- Update cart quantities
- Remove cart items
- Checkout and place orders
- View their order history
- Cancel eligible orders

---

### 🛒 Cart Management

- Persistent customer carts
- Add simple products
- Add variant products
- Quantity validation
- Stock validation
- Automatic merging of identical cart items
- Separate cart items for different variants
- Cart item updates
- Cart item removal

Cart access is restricted to customers.

---

### 📦 Order Management

The order system supports:

- Order creation from cart items
- Shipping address validation
- Customer order history
- Vendor order management
- Order status updates
- Customer order cancellation
- Stock restoration after cancellation
- Variant stock restoration after cancellation

Supported order workflow includes statuses such as:

- Placed
- Processing
- Shipped
- Delivered
- Cancelled

---

### 💳 Payment Integration

ShopSphere includes payment processing functionality for secure online transactions.

The payment workflow includes:

- Payment order/session creation
- Payment verification
- Secure server-side validation
- Order creation after successful payment
- Payment error handling

---

### 🖼️ Media Uploads

- Cloud-based image storage
- Cloudinary integration
- Product image uploads
- Secure upload handling

---

### 📧 Email Notifications

Nodemailer is used for transactional email functionality.

The platform supports email notifications for important events such as:

- Order confirmation
- Transaction-related communication

---

### 📊 Analytics Dashboards

ShopSphere provides analytics for platform management.

#### Vendor Analytics

Vendors can monitor:

- Revenue
- Orders
- Product performance
- Store activity

#### Super Admin Analytics

Administrators can monitor:

- Users
- Vendors
- Stores
- Orders
- Platform-level activity

Interactive charts and visualizations are implemented using modern React charting tools.

---

## 👥 User Roles

### 🛍️ Customer

Customers can:

- Browse stores and products
- Search and filter products
- Manage their cart
- Place orders
- Make payments
- View order history
- Cancel eligible orders

---

### 🏪 Vendor

Vendors can:

- Create and manage stores
- Manage products
- Manage product variants
- Control inventory
- View and manage orders
- Update order statuses
- Access vendor analytics

Vendors are isolated from other vendors' data.

---

### 🛡️ Super Admin

Super Admins can:

- Manage users
- Manage vendors
- Manage stores
- Monitor orders
- Suspend or activate vendors
- Suspend or activate stores
- Access platform analytics
- Maintain administrative oversight of the marketplace

---

# 🧱 Tech Stack

## Frontend

- React.js
- Redux Toolkit
- React Router DOM
- Tailwind CSS
- Vite
- Recharts

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Authentication & Security

- JSON Web Tokens (JWT)
- Bcrypt.js
- Helmet
- CORS

## Third-Party Integrations

- Payment Gateway Integration
- Cloudinary
- Nodemailer

## Testing

- Vitest
- Supertest

---

# 🏗️ Project Architecture

```text
ShopSphere
│
├── client/                     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── ...
│   ├── index.html
│   └── package.json
│
├── server/                     # Node.js Backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── tests/
│   │   ├── api.integration.test.js
│   │   ├── auth.integration.test.js
│   │   ├── orderService.test.js
│   │   └── paymentController.test.js
│   │
│   └── package.json
│
└── README.md
```

---

# 🔐 Security Features

ShopSphere implements several security practices:

- JWT authentication
- Password hashing using Bcrypt
- Role-Based Access Control
- Protected API routes
- Tenant ownership validation
- Helmet security middleware
- CORS configuration
- Environment variable protection
- Server-side stock validation
- Payment verification
- Input validation and error handling

---

# 🧪 Testing

The backend includes comprehensive automated testing for major platform functionality.

## Test Coverage

The automated test suite covers:

- Authentication
- Authorization
- Store APIs
- Product APIs
- Product variants
- Cart functionality
- Order creation
- Order cancellation
- Stock restoration
- Variant stock restoration
- Payment workflows
- Vendor permissions
- Customer permissions
- Super Admin permissions
- Global error handling

### Latest Test Result

```text
Test Files: 4 passed
Tests: 147 passed
```

Run all tests:

```bash
cd server
npm test
```

Run the API integration tests:

```bash
npm test -- --run tests/api.integration.test.js
```

---

# ⚙️ Installation & Setup

## Prerequisites

Make sure you have:

- Node.js 20+
- MongoDB
- npm

You may also need credentials for configured third-party services such as:

- Payment provider
- Cloudinary
- SMTP email service

---

## 🔧 Backend Setup

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create your environment file:

### Windows

```bash
copy .env.example .env
```

### Linux/macOS

```bash
cp .env.example .env
```

Configure your environment variables.

Start the development server:

```bash
npm run dev
```

---

## 🎨 Frontend Setup

Open another terminal and navigate to the client directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create the environment file:

### Windows

```bash
copy .env.example .env
```

Start the frontend:

```bash
npm run dev
```

---

# 🔑 Environment Variables

Never commit your `.env` files.

Typical environment variables may include:

```env
MONGODB_URI=
JWT_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

PAYMENT_GATEWAY_KEY_ID=
PAYMENT_GATEWAY_KEY_SECRET=
```

The exact variables depend on your local configuration.

---

# 🚀 Core API Modules

## Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

## Stores

```text
POST   /api/stores
GET    /api/stores
GET    /api/stores/:slug
PUT    /api/stores/:id
DELETE /api/stores/:id
```

## Products

```text
POST   /api/products
GET    /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
```

## Cart

```text
GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/:productId
DELETE /api/cart/items/:productId
```

## Orders

```text
POST   /api/orders
GET    /api/orders/my
GET    /api/orders/vendor
```

---

# 🎯 Multi-Tenant Data Isolation

One of the core principles of ShopSphere is tenant isolation.

Each vendor operates independently within the shared platform.

The backend ensures that:

- Vendors can only manage their own stores
- Vendors can only manage products belonging to their stores
- Vendors cannot modify another vendor's resources
- Vendor orders are restricted to relevant products
- Administrative controls remain exclusive to Super Admin users

This approach allows multiple businesses to operate inside one centralized SaaS platform while maintaining logical data separation.

---

# 🌟 Key Highlights

- Full-stack MERN application
- Multi-tenant architecture
- Three-level role system
- Product variants
- Inventory management
- Cart and checkout workflow
- Payment integration
- Cloud-based image storage
- Email notifications
- Analytics dashboards
- Automated testing
- **147 automated tests passing**

---

# 🔮 Future Improvements

Potential future enhancements include:

- Product reviews and ratings
- Wishlist functionality
- Discount coupons
- Advanced recommendation system
- Real-time notifications
- Multi-language support
- Advanced vendor subscription plans
- Improved analytics and reporting
- Mobile application
- AI-powered product recommendations

---

# 👨‍💻 Development

ShopSphere was developed as a full-stack academic and practical project demonstrating modern web development concepts including:

- SaaS architecture
- Multi-tenancy
- RESTful APIs
- Role-Based Access Control
- Authentication and authorization
- Database modeling
- State management
- Payment workflows
- Automated testing
- Dashboard development

---

## 🛒 ShopSphere

**Your Marketplace. Your Sphere.**