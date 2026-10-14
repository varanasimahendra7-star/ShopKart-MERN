# ShopKart-MERN 🛒

A full-stack e-commerce web application built using the MERN stack (MongoDB, Express.js, React, and Node.js). ShopKart provides a shopping experience with customer authentication, product browsing, wishlist management, cart operations, and checkout using Razorpay Test Mode.

## ✨ Features

- **User Authentication** — Customer registration, login, JWT-based authentication, and protected routes.
- **Product Catalog** — Browse products, view product details, and filter products by category or search.
- **Wishlist** — Add products to your wishlist, remove items, and manage saved products.
- **Shopping Cart** — Add products, update quantities, remove items, and view the subtotal.
- **Checkout** — Enter shipping details and review the order summary.
- **Payment Integration** — Razorpay Test Mode integration with server-side payment signature verification.
- **Order Management** — View orders and individual order details.
- **Stock Validation** — Validate product availability and stock before completing an order.
- **Responsive Interface** — React-based user interface for shopping and account management.

## 🛠️ Tech Stack

**Frontend**
- React
- Vite
- React Router
- Axios
- Context API

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt
- Cookie Parser
- CORS

**Payments**
- Razorpay Test Mode

## 📁 Project Structure

```text
my-mern-app/
├── client/                 # React frontend
│   └── src/
├── server/                 # Express backend
│   ├── config/             # Configuration
│   ├── controllers/        # Request handlers
│   ├── middlewares/        # Authentication middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── index.js            # Backend entry point
│   └── seedProducts.js     # Sample product data
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Install the following before running the application:

- Node.js and npm
- MongoDB database (local MongoDB or MongoDB Atlas)
- Git

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/varanasimahendra7-star/ShopKart-MERN.git
cd ShopKart-MERN
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory with the following variables:

```env
PORT=8085
dburl=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET
RAZORPAY_KEY_ID=YOUR_RAZORPAY_TEST_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_TEST_KEY_SECRET
```

Replace the placeholder values with your own credentials. Never commit real secrets to GitHub.

### 3. Start the backend

```bash
npm start
```

If your backend does not define a `start` script, use the start command configured in `server/package.json`.

The backend currently uses port `8085` by default.

### 4. Configure the frontend

Open another terminal:

```bash
cd client
npm install
```

Configure the frontend API base URL if your application uses an environment variable for it. For local development, the backend API runs at:

```text
http://localhost:8085
```

Use the environment variable name expected by your frontend code; for Vite, client-side environment variables generally use the `VITE_` prefix.

### 5. Start the frontend

```bash
npm run dev
```

Open the local URL printed by Vite, typically:

```text
http://localhost:5173
```

## 🔑 API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/customers/register` | Register a customer |
| POST | `/customers/login` | Log in |
| GET | `/customers/me` | Get the authenticated customer |
| POST | `/customers/logout` | Log out |
| GET | `/products` | List products |
| POST | `/wishlist/:productId` | Add a product to the wishlist |
| GET | `/wishlist` | Retrieve the wishlist |
| POST | `/cart/:productId` | Add a product to the cart |
| GET | `/cart` | Retrieve the cart |
| POST | `/orders/create-payment-order` | Create a pending order and payment |
| POST | `/orders/verify-payment` | Verify payment |
| GET | `/orders` | Retrieve customer orders |
| GET | `/orders/:id` | Retrieve an order's details |

Protected endpoints require valid customer authentication. Exact request formats and other available endpoints are defined in the backend source code.

## 💳 Payment Information

ShopKart integrates with Razorpay in **Test Mode**. Configure valid Razorpay test credentials in the backend environment before testing checkout.

Payment verification is performed on the backend before an order is marked as paid. Do not use real payment credentials in public source code.

## 🔒 Security Notes

- Keep `.env` files out of version control.
- Never publish database passwords, JWT secrets, or payment secret keys.
- Use HTTPS and production-appropriate cookie and CORS settings when deploying.
- Use Razorpay Test Mode for development and testing.

## 🗺️ Future Deployment

The application is being prepared for deployment using:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

Deployment URLs will be added here once the application is live.

## 👨‍💻 Author

Developed as a full-stack MERN e-commerce project.
