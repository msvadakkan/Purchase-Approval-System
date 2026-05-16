const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

const VALID_ROLES = ['admin', 'ceo', 'department_head', 'manager', 'employee'];

router.get('/', authenticateToken, requireRole('admin'), (req, res) => {
  const users = db.prepare(
    'SELECT id, name, email, role, department, is_active, created_at FROM users ORDER BY created_at DESC'
  ).all();
  res.json(users);
});

router.post('/', authenticateToken, requireRole('admin'), (req, res) => {
  const { name, email, password, role, department } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const result = db.prepare(
      'INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)'
    ).run(name, email, bcrypt.hashSync(password, 10), role, department || null);

    res.status(201).json({ id: result.lastInsertRowid, name, email, role, department: department || null });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { name, email, role, department, is_active, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updated = {
    name:       name       ?? user.name,
    email:      email      ?? user.email,
    role:       role       ?? user.role,
    department: department !== undefined ? department : user.department,
    is_active:  is_active  !== undefined ? (is_active ? 1 : 0) : user.is_active,
  };

  if (password) {
    db.prepare(
      'UPDATE users SET name=?, email=?, role=?, department=?, is_active=?, password_hash=? WHERE id=?'
    ).run(updated.name, updated.email, updated.role, updated.department, updated.is_active, bcrypt.hashSync(password, 10), req.params.id);
  } else {
    db.prepare(
      'UPDATE users SET name=?, email=?, role=?, department=?, is_active=? WHERE id=?'
    ).run(updated.name, updated.email, updated.role, updated.department, updated.is_active, req.params.id);
  }

  res.json({ message: 'User updated successfully' });
});

router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User deleted successfully' });
});

module.exports = router;
