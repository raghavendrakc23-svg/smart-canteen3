# Smart Canteen — AI-Powered Campus Food Intelligence

**Smart Canteen** (Aurix Nexus) connects students, canteen staff, and college administrators using live ordering, inventory intelligence, demand forecasting, and integrated payment checkout.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Seed the database
Populates menu items, default users, and 3 weeks of historical orders/wastage data in SQLite:
```bash
node seed.js
```

### 3. Start the server
```bash
node server.js
```
The server will run on **http://localhost:3000**.

---

## 🔑 Demo Credentials

| Role | Username / Email | Password | Destination Portal |
|---|---|---|---|
| **Student** | `student@smartcanteen.local` | `student123` | `/student.html` (Menu & Cart) |
| **Staff** | `staff@smartcanteen.local` (or `staff`) | `staff123` | `/staff.html` (Live Operations) |
| **Admin** | `admin@smartcanteen.local` (or `admin`) | `admin123` | `/admin.html` (Analytics Overview) |

---

## 📱 Portals & Features

1. **Overview & Access Portal** (`/index.html` or `/`)
   - Campus pulse with live metrics & order volume chart.
   - Core flow explanation (Student orders &rarr; Kitchen intake &rarr; AI forecasting &rarr; Ready pickup).
   - Role-based login with auto-redirect.

2. **Student Portal** (`/student.html`)
   - Live orders, Ready alerts, and Student queue wait indicators.
   - Categorized menu cards with price, availability, and item wait times.
   - Persistent cart sidebar with quantity controls and pickup slot selector.
   - Integrated with payment checkout and real-time order tracking.

3. **Payment & Checkout** (`/payment.html`)
   - Order summary with itemized costs, tax calculation (5%), and free delivery.
   - Multiple payment options: Debit/Credit Card, UPI, Net Banking, and Digital Wallet.
   - Encrypted payment badge and interactive confirmation flow.

4. **Staff Dashboard** (`/staff.html`)
   - Live Operations: incoming orders counter, low-stock alerts, and predicted total.
   - Order pipeline with status switcher (`Placed` &rarr; `Cooking` &rarr; `Ready` &rarr; `Completed`).
   - Inventory levels with health status badges (`Healthy`, `Low stock`, `Out of stock`).
   - Daily preparation recommendations and wastage entry logger.
   - **Genie Q&A**: Plain-English AI query engine for demand, peak hours, and wastage trends.

5. **Admin Analytics** (`/admin.html`)
   - KPI metrics: Today's Orders, Weekly Orders, Food Waste (kg), and Average Wait Time.
   - Popular food progress charts.
   - Peak lunch hours bar chart.
   - Revenue & wastage audit log.

---

## 🛠️ Architecture & Tech Stack

- **Backend**: Node.js, Express, SQLite (`better-sqlite3`), JWT Authentication (`jsonwebtoken`), `bcryptjs`.
- **Frontend**: Clean Vanilla JavaScript, CSS3 Design System with responsive grid and teal branding.
- **AI / Forecasting Engine**: Rule-based intelligence engine parsing demand patterns across weekdays, peak lunch slots, and food waste history.

---

## 🌐 Deployment Guide (e.g. Render / Railway)

Because this app uses an Express backend and SQLite (`node:sqlite`), it should be deployed as a **Web Service** (not static-only hosting).

### Deploying to [Render.com](https://render.com) (Recommended & Free):

1. Push your repository to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** &rarr; **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your `smart-canteen` GitHub repo.
4. Configure service settings:
   - **Name**: `smart-canteen`
   - **Environment**: `Node`
   - **Region**: Nearest to your users
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. In **Environment Variables**, add:
   - `JWT_SECRET`: `your_random_secure_secret_string`
   - `NODE_VERSION`: `22` (Render supports Node 22+)
6. Click **Create Web Service**. Render will build and launch your live site with an `https://...onrender.com` URL!

---

© Smart Canteen · Aurix Nexus

