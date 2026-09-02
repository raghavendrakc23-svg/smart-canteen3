// routes/genie.js — Rule-based NL query engine
const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function findItem(text) {
  return db.prepare('SELECT * FROM items').all()
    .find(it => text.includes(it.name.toLowerCase())) || null;
}

function genieAnswer(questionRaw) {
  const q = questionRaw.toLowerCase();

  // "how many/much X should we prepare/stock tomorrow"
  const prepMatch = q.match(/how (much|many) (.+?) (should we prepare|to prepare|should we stock|to stock)/);
  if (prepMatch) {
    const item = findItem(prepMatch[2]);
    if (item) {
      const tomorrowDow = days[(new Date().getDay() + 1) % 7];
      const rows = db.prepare(
        `SELECT date(created_at) AS day, SUM(quantity) AS total
         FROM orders
         WHERE item_id = ? AND day_of_week = ?
         GROUP BY date(created_at)`
      ).all(item.id, tomorrowDow);
      const avg = rows.length ? rows.reduce((s, r) => s + r.total, 0) / rows.length : 0;
      return `Based on past ${tomorrowDow}s, prepare about ${Math.round(avg)} ${item.name}(s) for tomorrow.`;
    }
  }

  // wastage
  if (q.includes('wastage') && (q.includes('highest') || q.includes('most') || q.includes('which'))) {
    const rows = db.prepare(
      `SELECT item_id, SUM(quantity_wasted) AS total FROM wastage GROUP BY item_id ORDER BY total DESC LIMIT 1`
    ).all();
    if (rows.length) {
      const item = db.prepare('SELECT * FROM items WHERE id = ?').get(rows[0].item_id);
      return `${item.name} has the highest wastage — ${rows[0].total} units wasted in the recorded history.`;
    }
  }

  // busiest slot
  if (q.includes('busiest') || q.includes('peak hour') || q.includes('peak time')) {
    const row = db.prepare(
      `SELECT slot, COUNT(*) AS cnt FROM orders GROUP BY slot ORDER BY cnt DESC LIMIT 1`
    ).get();
    if (row) return `The busiest slot is ${row.slot}, with ${row.cnt} orders historically.`;
  }

  // popular on a specific day
  const dayHit = days.find(d => q.includes(d.toLowerCase()));
  if (q.includes('popular') && dayHit) {
    const row = db.prepare(
      `SELECT item_id, SUM(quantity) AS total FROM orders WHERE day_of_week = ? GROUP BY item_id ORDER BY total DESC LIMIT 1`
    ).get(dayHit);
    if (row) {
      const item = db.prepare('SELECT * FROM items WHERE id = ?').get(row.item_id);
      return `${item.name} is the most popular item on ${dayHit}s (${row.total} units ordered).`;
    }
  }

  // popular overall / best seller
  if (q.includes('popular') || q.includes('best seller') || q.includes('best-seller')) {
    const row = db.prepare(
      `SELECT item_id, SUM(quantity) AS total FROM orders GROUP BY item_id ORDER BY total DESC LIMIT 1`
    ).get();
    if (row) {
      const item = db.prepare('SELECT * FROM items WHERE id = ?').get(row.item_id);
      return `${item.name} is the overall best-seller, with ${row.total} units ordered.`;
    }
  }

  // stock lookup
  const item = findItem(q);
  if (item && (q.includes('stock') || q.includes('how much') || q.includes('how many'))) {
    return `Current stock of ${item.name} is ${item.stock} units.`;
  }

  return "I'm not sure how to answer that yet — try asking about demand, wastage, busiest hours, or popularity by day.";
}

/**
 * POST /api/genie
 * Staff+ — ask a plain-English question about the canteen data.
 * Body: { question }
 */
router.post('/', requireAuth, (req, res) => {
  const question = (req.body.question || '').trim();
  if (!question) return res.status(400).json({ error: 'question is required' });
  const answer = genieAnswer(question);
  res.json({ question, answer });
});

module.exports = router;
