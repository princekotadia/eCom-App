# MERN E-Commerce Web Application

A full-stack E-Commerce application built with the MERN stack (MongoDB, Express, React, Node.js) featuring customer authentication, product catalog, wishlist, cart management, and Razorpay payment integration.

---

## 🚀 Features

- **Authentication & Authorization**: Secure customer registration and login with bcrypt password hashing and JWT stored in HTTP-only cookies.
- **Product Catalog**: Browse products with live search, category filtering, and detailed product view.
- **Wishlist**: Add and remove favorite items with real-time UI updates.
- **Shopping Cart**: Real-time cart state synchronized with authentication, stock limit checking, and quantity adjustments.
- **Checkout & Payments**: Full Razorpay standard checkout integration with server-side HMAC-SHA256 signature verification.
- **Order Management**: Order history screen, order status tracking, and order success confirmation.

---

## 📁 Project Structure

```text
mern-term5/
├── backend/                  # Express.js REST API & MongoDB models
│   ├── config/               # Configuration (Razorpay, etc.)
│   ├── controllers/          # Request handlers (auth, cart, orders, etc.)
│   ├── middlewares/          # Auth verification middleware
│   ├── models/               # Mongoose schemas (Customer, Product, Order)
│   ├── routes/               # Express route definitions
│   ├── .env.example          # Sample environment variables
│   ├── index.js              # Server entry point
│   └── package.json
├── frontend/                 # React 19 SPA built with Vite
│   ├── src/
│   │   ├── axiosCalls/       # Axios instance with credentials
│   │   ├── components/       # Reusable UI components (NavBar, Routes)
│   │   ├── context/          # Auth and Cart React context providers
│   │   ├── pages/            # Page components (Home, Products, Cart, Checkout, etc.)
│   │   ├── App.jsx           # Routing configuration
│   │   └── main.jsx          # React DOM entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── .gitignore                # Root gitignore for dependencies, secrets, & build outputs
```

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (local or MongoDB Atlas connection URI)
- [Razorpay Test Account](https://razorpay.com/) (for payment gateway testing)

---

### 1. Backend Setup

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file from the example template:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` variables:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

5. Start the backend server:
   ```bash
   npm start
   ```
   *The server will run on `http://localhost:5000`.*

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client application will run on `http://localhost:5173`.*

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection URI string |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens |
| `PORT` | Port number for the Express server (default: `5000`) |
| `RAZORPAY_KEY_ID` | Razorpay API Key ID (public test key) |
| `RAZORPAY_KEY_SECRET` | Razorpay API Key Secret (private key) |
### Backend (`backend/.env`)

> ⚠️ **Note:** Never commit `.env` files to source control. Use `.env.example` as a template.
| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Port number for Express server | `5000` |
| `NODE_ENV` | Environment mode (`production` sets secure, cross-site cookies) | `development` or `production` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing customer JWT tokens | `your_secret_key` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | `your_razorpay_secret` |
| `CLIENT_URL` | Frontend URL allowed by CORS in production | `https://your-frontend.vercel.app` |

### Frontend (`frontend/.env`)

| Variable | Description | Example / Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000` or `https://your-backend.onrender.com` |

---

## 🌐 Production Deployment Guide

### 1. Deploy Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New** > **Web Service**.
2. Connect your GitHub repository (`mern-term5`).
3. Configure the service settings:
   - **Name**: e.g., `ecom-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add the **Environment Variables** in the Render dashboard:
   - `NODE_ENV` = `production`
   - `MONGO_URI` = *(your MongoDB Atlas connection URI)*
   - `JWT_SECRET` = *(your secure random JWT secret)*
   - `RAZORPAY_KEY_ID` = *(your Razorpay test key ID)*
   - `RAZORPAY_KEY_SECRET` = *(your Razorpay test key secret)*
   - `CLIENT_URL` = `https://your-app.vercel.app` *(update after deploying to Vercel)*
5. Click **Create Web Service**. Once deployed, copy your Render service URL (e.g., `https://ecom-backend-xxxx.onrender.com`).

---

### 2. Deploy Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New** > **Project**.
2. Import your GitHub repository (`mern-term5`).
3. In the project setup screen:
   - **Root Directory**: Click **Edit** and select `frontend`.
   - **Framework Preset**: `Vite` (auto-detected).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL` = `https://ecom-backend-xxxx.onrender.com` *(your Render backend URL from Step 1)*
5. Click **Deploy**.
6. Once deployed, copy your Vercel deployment URL (e.g., `https://your-app.vercel.app`) and set it as `CLIENT_URL` in your Render backend settings so CORS and cross-site cookies are matched.


