// routes/items.js — Menu item routes
const express = require('express');
const db = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/items
 * Public — returns all menu items.
 */
router.get('/', (req, res) => {
  const items = db.prepare('SELECT * FROM items ORDER BY category, name').all();
  res.json(items);
});

/**
 * POST /api/items
 * Admin only — add a new menu item.
 * Body: { name, price, stock, category }
 */
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { name, price, stock, category } = req.body;
  if (!name || price == null || stock == null || !category) {
    return res.status(400).json({ error: 'name, price, stock and category are required' });
  }
  const result = db
    .prepare('INSERT INTO items (name, price, stock, category) VALUES (?, ?, ?, ?)')
    .run(name, Number(price), Number(stock), category);
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(item);
});

/**
 * PATCH /api/items/:id/stock
 * Staff+ — update the stock level of an item.
 * Body: { stock }
 */
router.patch('/:id/stock', requireAuth, (req, res) => {
  const { stock } = req.body;
  if (stock == null || isNaN(Number(stock))) {
    return res.status(400).json({ error: 'stock is required and must be a number' });
  }
  const info = db
    .prepare('UPDATE items SET stock = ? WHERE id = ?')
    .run(Number(stock), Number(req.params.id));
  if (info.changes === 0) return res.status(404).json({ error: 'Item not found' });
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(Number(req.params.id));
  res.json(item);
});

/**
 * DELETE /api/items/:id
 * Admin only — remove a menu item.
 */
router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const info = db.prepare('DELETE FROM items WHERE id = ?').run(Number(req.params.id));
  if (info.changes === 0) return res.status(404).json({ error: 'Item not found' });
  res.json({ ok: true });
});

module.exports = router;
