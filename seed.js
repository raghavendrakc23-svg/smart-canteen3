// seed.js — Populate SQLite with menu items + 3 weeks of fake historical data + default users
// Run once with: npm run seed  (or: node seed.js)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const slots = ['12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM'];
const students = ['Ashitha', 'Harshit', 'Punya', 'Harini', 'Rahul', 'Sneha', 'Kiran', 'Divya', 'Vishal', 'Meera'];

const itemDefs = [
  { name: 'Masala Dosa',   price: 40, stock: 30, category: 'Breakfast' },
  { name: 'Idli Sambar',   price: 30, stock: 40, category: 'Breakfast' },
  { name: 'Veg Biryani',   price: 70, stock: 25, category: 'Lunch'     },
  { name: 'Chapati Curry', price: 50, stock: 35, category: 'Lunch'     },
  { name: 'Samosa',        price: 15, stock: 60, category: 'Snacks'    },
  { name: 'Cold Coffee',   price: 35, stock: 45, category: 'Beverages' },
  { name: 'Rice',          price: 25, stock: 50, category: 'Lunch'     },
  { name: 'Paneer Curry',  price: 60, stock: 20, category: 'Lunch'     },
];

function seedDatabase() {
  // Wipe existing data for a clean re-seed
  db.exec('DELETE FROM wastage');
  db.exec('DELETE FROM orders');
  db.exec('DELETE FROM items');
  db.exec('DELETE FROM users');

  // Prepared statements
  const insertUser    = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
  const insertItem    = db.prepare('INSERT INTO items (name, price, stock, category) VALUES (?, ?, ?, ?)');
  const insertOrder   = db.prepare(`
    INSERT INTO orders (student_name, item_id, quantity, slot, status, created_at, day_of_week)
    VALUES (?, ?, ?, ?, 'Completed', ?, ?)`);
  const insertWastage = db.prepare('INSERT INTO wastage (item_id, quantity_wasted, date) VALUES (?, ?, ?)');

  db.exec('BEGIN');
  try {
    // ---- Users ----
    insertUser.run('admin',                    bcrypt.hashSync('admin123',   10), 'admin');
    insertUser.run('staff',                    bcrypt.hashSync('staff123',   10), 'staff');
    insertUser.run('student@smartcanteen.local', bcrypt.hashSync('student123', 10), 'student');

    // ---- Items ----
    const items = itemDefs.map(it => {
      const result = insertItem.run(it.name, it.price, it.stock, it.category);
      return { id: Number(result.lastInsertRowid), ...it };
    });

    // ---- Historical orders + wastage (3 weeks) ----
    let orderCount = 0;
    let wastageCount = 0;

    for (let d = 21; d >= 1; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dow = days[date.getDay()];
      const dateStr  = date.toISOString().slice(0, 19).replace('T', ' ');
      const dateOnly = date.toISOString().slice(0, 10);

      items.forEach(item => {
        let baseOrders = Math.floor(Math.random() * 8) + 3;
        if (item.name === 'Masala Dosa') baseOrders += 4;
        if (dow === 'Friday' && (item.name === 'Veg Biryani' || item.name === 'Paneer Curry')) baseOrders += 6;

        for (let i = 0; i < baseOrders; i++) {
          const student = students[Math.floor(Math.random() * students.length)];
          const qty  = Math.floor(Math.random() * 2) + 1;
          const slot = slots[Math.floor(Math.random() * slots.length)];
          insertOrder.run(student, item.id, qty, slot, dateStr, dow);
          orderCount++;
        }

        let wasted = Math.floor(Math.random() * 3);
        if (item.name === 'Samosa')      wasted += 3;
        if (item.name === 'Idli Sambar') wasted += 2;
        if (wasted > 0) {
          insertWastage.run(item.id, wasted, dateOnly);
          wastageCount++;
        }
      });
    }

    db.exec('COMMIT');
    console.log('\n✅ Seed complete!');
    console.log(`   ${items.length} menu items`);
    console.log(`   ${orderCount} historical orders`);
    console.log(`   ${wastageCount} wastage logs`);
    console.log('\n👤 Default accounts:');
    console.log('   admin / admin123                      (role: admin)');
    console.log('   staff / staff123                      (role: staff)');
    console.log('   student@smartcanteen.local / student123 (role: student)\n');
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('Seed failed:', err.message);
    if (require.main === module) {
      process.exit(1);
    }
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
