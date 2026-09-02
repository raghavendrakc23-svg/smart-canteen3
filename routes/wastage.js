// routes/wastage.js — Wastage logging routes
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/wastage
 * Staff+ — list all wastage records with item names.
 */
router.get('/', requireAuth, (req, res) => {
  const records = db.prepare(`
    SELECT w.*, i.name AS item_name
    FROM wastage w
    LEFT JOIN items i ON i.id = w.item_id
    ORDER BY w.date DESC, w.id DESC
  `).all();
  res.json(records);
});

/**
 * POST /api/wastage
 * Staff+ — log a wastage entry.
 * Body: { item_id, quantity_wasted, date? }
 */
router.post('/', requireAuth, (req, res) => {
  const { item_id, quantity_wasted, date } = req.body;
  if (!item_id || quantity_wasted == null) {
    return res.status(400).json({ error: 'item_id and quantity_wasted are required' });
  }
  const qty = Number(quantity_wasted);
  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ error: 'quantity_wasted must be a positive integer' });
  }

  const item = db.prepare('SELECT id FROM items WHERE id = ?').get(Number(item_id));
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const dateStr = date || new Date().toISOString().slice(0, 10);
  const result = db
    .prepare('INSERT INTO wastage (item_id, quantity_wasted, date) VALUES (?, ?, ?)')
    .run(item.id, qty, dateStr);

  const record = db.prepare('SELECT * FROM wastage WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(record);
});

module.exports = router;
