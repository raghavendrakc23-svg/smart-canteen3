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

© Smart Canteen · Aurix Nexus
