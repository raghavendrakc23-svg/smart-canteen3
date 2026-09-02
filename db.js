// db.js — SQLite connection using Node.js built-in node:sqlite (available in Node v22.5+).
// No npm package needed — zero external dependency for the database layer.
require('dotenv').config();
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, 'canteen.db');
const db = new DatabaseSync(DB_PATH);

// Performance pragmas
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// ---------- Schema ----------
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT    NOT NULL,
    price    REAL    NOT NULL,
    stock    INTEGER NOT NULL DEFAULT 0,
    category TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'staff'
  );

  CREATE TABLE IF NOT EXISTS orders (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    student_name TEXT    NOT NULL,
    item_id      INTEGER NOT NULL REFERENCES items(id),
    quantity     INTEGER NOT NULL,
    slot         TEXT    NOT NULL,
    status       TEXT    NOT NULL DEFAULT 'Placed',
    created_at   TEXT    NOT NULL,
    day_of_week  TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wastage (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id         INTEGER NOT NULL REFERENCES items(id),
    quantity_wasted INTEGER NOT NULL,
    date            TEXT    NOT NULL
  );
`);

module.exports = db;
