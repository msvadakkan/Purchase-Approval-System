const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, '../../database.db'));

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'ceo', 'department_head', 'manager', 'employee')),
    department TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS approval_levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT UNIQUE NOT NULL,
    max_amount REAL NOT NULL,
    label TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS purchase_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    requester_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'cancelled')),
    current_approver_role TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS approval_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    approver_id INTEGER NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('approved', 'rejected')),
    comments TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES purchase_requests(id),
    FOREIGN KEY (approver_id) REFERENCES users(id)
  );
`);

function seedData() {
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@company.com');
  if (adminExists) return;

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)
  `);

  const demoUsers = [
    ['System Admin',    'admin@company.com',    'admin123',    'admin',           'IT'],
    ['John CEO',        'ceo@company.com',       'password123', 'ceo',             'Executive'],
    ['Sarah Head',      'depthead@company.com',  'password123', 'department_head', 'Finance'],
    ['Mike Manager',    'manager@company.com',   'password123', 'manager',         'Operations'],
    ['Alice Employee',  'alice@company.com',     'password123', 'employee',        'Operations'],
    ['Bob Employee',    'bob@company.com',       'password123', 'employee',        'Finance'],
  ];

  for (const [name, email, password, role, dept] of demoUsers) {
    insertUser.run(name, email, bcrypt.hashSync(password, 10), role, dept);
  }

  const insertLevel = db.prepare(`
    INSERT INTO approval_levels (role, max_amount, label) VALUES (?, ?, ?)
  `);
  insertLevel.run('manager',         5000,      'Manager');
  insertLevel.run('department_head', 25000,     'Department Head');
  insertLevel.run('ceo',             999999999, 'CEO');
}

seedData();

module.exports = db;
