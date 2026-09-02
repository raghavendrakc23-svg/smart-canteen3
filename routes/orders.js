// routes/orders.js — Order management routes
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * GET /api/orders
 * Staff+ — returns the last 50 orders with item name joined.
 */
router.get('/', requireAuth, (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, i.name AS item_name
    FROM orders o
    LEFT JOIN items i ON i.id = o.item_id
    ORDER BY o.id DESC
    LIMIT 50
  `).all();
  res.json(orders);
});

/**
 * POST /api/orders
 * Public — place a new order. Decrements stock atomically.
 * Body: { student_name, item_id, quantity, slot }
 */
router.post('/', (req, res) => {
  const { student_name, item_id, quantity, slot } = req.body;
  if (!student_name || !item_id || !quantity || !slot) {
    return res.status(400).json({ error: 'student_name, item_id, quantity and slot are required' });
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ error: 'quantity must be a positive integer' });
  }

  try {
    db.exec('BEGIN');

    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(Number(item_id));
    if (!item) {
      db.exec('ROLLBACK');
      return res.status(404).json({ error: 'Item not found' });
    }
    if (item.stock < qty) {
      db.exec('ROLLBACK');
      return res.status(400).json({ error: 'Not enough stock' });
    }

    db.prepare('UPDATE items SET stock = stock - ? WHERE id = ?').run(qty, item.id);

    const now = new Date();
    const created_at = now.toISOString().slice(0, 19).replace('T', ' ');
    const day_of_week = days[now.getDay()];

    const result = db.prepare(`
      INSERT INTO orders (student_name, item_id, quantity, slot, status, created_at, day_of_week)
      VALUES (?, ?, ?, ?, 'Placed', ?, ?)
    `).run(student_name, item.id, qty, slot, created_at, day_of_week);

    db.exec('COMMIT');
    res.json({ order_id: Number(result.lastInsertRowid), status: 'Placed' });
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch (_) {}
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Staff+ — update order status.
 * Body: { status } — one of 'Placed' | 'Cooking' | 'Ready' | 'Completed'
 */
router.patch('/:id/status', requireAuth, (req, res) => {
  const { status } = req.body;
  const allowed = ['Placed', 'Cooking', 'Ready', 'Completed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
  }
  const info = db
    .prepare('UPDATE orders SET status = ? WHERE id = ?')
    .run(status, Number(req.params.id));
  if (info.changes === 0) return res.status(404).json({ error: 'Order not found' });
  res.json({ ok: true });
});

module.exports = router;
