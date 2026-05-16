const express = require('express');
const db = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/approval-levels', authenticateToken, requireRole('admin'), (req, res) => {
  const levels = db.prepare('SELECT * FROM approval_levels ORDER BY max_amount ASC').all();
  res.json(levels);
});

router.put('/approval-levels', authenticateToken, requireRole('admin'), (req, res) => {
  const { levels } = req.body;
  if (!Array.isArray(levels)) {
    return res.status(400).json({ error: 'levels must be an array' });
  }

  const update = db.prepare(
    'UPDATE approval_levels SET max_amount=?, updated_at=CURRENT_TIMESTAMP WHERE role=?'
  );

  db.transaction(() => {
    for (const { role, max_amount } of levels) {
      update.run(parseFloat(max_amount), role);
    }
  })();

  const updated = db.prepare('SELECT * FROM approval_levels ORDER BY max_amount ASC').all();
  res.json(updated);
});

router.get('/stats', authenticateToken, requireRole('admin'), (req, res) => {
  res.json({
    total_requests:       db.prepare('SELECT COUNT(*) as c FROM purchase_requests').get().c,
    pending:              db.prepare("SELECT COUNT(*) as c FROM purchase_requests WHERE status='pending'").get().c,
    approved:             db.prepare("SELECT COUNT(*) as c FROM purchase_requests WHERE status='approved'").get().c,
    rejected:             db.prepare("SELECT COUNT(*) as c FROM purchase_requests WHERE status='rejected'").get().c,
    total_users:          db.prepare('SELECT COUNT(*) as c FROM users').get().c,
    total_approved_amount: db.prepare("SELECT COALESCE(SUM(amount),0) as t FROM purchase_requests WHERE status='approved'").get().t,
  });
});

module.exports = router;
