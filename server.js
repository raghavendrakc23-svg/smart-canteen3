// server.js — Smart Canteen Express application
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const db = require('./db');
const seedDatabase = require('./seed');

// Auto-seed database with default users and menu items if empty
try {
  const userCheck = db.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (!userCheck || userCheck.count === 0) {
    console.log('Database empty. Running initial database seed...');
    seedDatabase();
  }
} catch (e) {
  console.warn('Auto-seed check failed:', e.message);
}

// ---------- Global Middleware ----------
app.use(cors());
app.use(express.json());

// ---------- API Routes ----------
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/items',   require('./routes/items'));
app.use('/api/orders',  require('./routes/orders'));
app.use('/api/wastage', require('./routes/wastage'));
app.use('/api/genie',   require('./routes/genie'));

// ---------- Static Files ----------
// Serve the public/ folder (index.html, staff.html, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Fallback: any unmatched route that looks like a page → serve index.html
// (keeps deep links working in case a SPA is added later)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`\n🍽️  Smart Canteen running on http://localhost:${PORT}`);
  console.log(`   Student view : http://localhost:${PORT}/index.html`);
  console.log(`   Staff view   : http://localhost:${PORT}/staff.html\n`);
});
