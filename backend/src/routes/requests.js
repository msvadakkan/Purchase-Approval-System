const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const APPROVER_ROLES = ['admin', 'ceo', 'department_head', 'manager'];

function getApproverRole(amount) {
  const levels = db.prepare('SELECT * FROM approval_levels ORDER BY max_amount ASC').all();
  for (const level of levels) {
    if (amount <= level.max_amount) return level.role;
  }
  return levels[levels.length - 1]?.role || 'ceo';
}

// All requests visible to the user
router.get('/', authenticateToken, (req, res) => {
  const { role, id } = req.user;

  let rows;
  if (role === 'admin') {
    rows = db.prepare(`
      SELECT pr.*, u.name as requester_name, u.department
      FROM purchase_requests pr JOIN users u ON pr.requester_id = u.id
      ORDER BY pr.created_at DESC
    `).all();
  } else if (APPROVER_ROLES.includes(role)) {
    rows = db.prepare(`
      SELECT pr.*, u.name as requester_name, u.department
      FROM purchase_requests pr JOIN users u ON pr.requester_id = u.id
      WHERE pr.current_approver_role = ? OR pr.requester_id = ?
         OR pr.id IN (SELECT request_id FROM approval_history WHERE approver_id = ?)
      ORDER BY pr.created_at DESC
    `).all(role, id, id);
  } else {
    rows = db.prepare(`
      SELECT pr.*, u.name as requester_name, u.department
      FROM purchase_requests pr JOIN users u ON pr.requester_id = u.id
      WHERE pr.requester_id = ?
      ORDER BY pr.created_at DESC
    `).all(id);
  }

  res.json(rows);
});

// Pending requests assigned to the caller's approval role
router.get('/pending', authenticateToken, (req, res) => {
  const { role } = req.user;
  if (!APPROVER_ROLES.includes(role)) return res.json([]);

  const rows = role === 'admin'
    ? db.prepare(`
        SELECT pr.*, u.name as requester_name, u.department
        FROM purchase_requests pr JOIN users u ON pr.requester_id = u.id
        WHERE pr.status = 'pending' ORDER BY pr.created_at DESC
      `).all()
    : db.prepare(`
        SELECT pr.*, u.name as requester_name, u.department
        FROM purchase_requests pr JOIN users u ON pr.requester_id = u.id
        WHERE pr.status = 'pending' AND pr.current_approver_role = ?
        ORDER BY pr.created_at DESC
      `).all(role);

  res.json(rows);
});

// Single request with approval history
router.get('/:id', authenticateToken, (req, res) => {
  const request = db.prepare(`
    SELECT pr.*, u.name as requester_name, u.email as requester_email, u.department
    FROM purchase_requests pr JOIN users u ON pr.requester_id = u.id
    WHERE pr.id = ?
  `).get(req.params.id);

  if (!request) return res.status(404).json({ error: 'Request not found' });

  const { role, id } = req.user;
  if (role === 'employee' && request.requester_id !== id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const history = db.prepare(`
    SELECT ah.*, u.name as approver_name, u.role as approver_role
    FROM approval_history ah JOIN users u ON ah.approver_id = u.id
    WHERE ah.request_id = ? ORDER BY ah.created_at ASC
  `).all(req.params.id);

  res.json({ ...request, history });
});

// Create purchase request
router.post('/', authenticateToken, (req, res) => {
  const { title, description, amount, category } = req.body;

  if (!title || !amount || !category) {
    return res.status(400).json({ error: 'Title, amount, and category are required' });
  }
  if (parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Amount must be positive' });
  }

  const approverRole = getApproverRole(parseFloat(amount));

  const result = db.prepare(`
    INSERT INTO purchase_requests (title, description, amount, category, requester_id, current_approver_role)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title, description || null, parseFloat(amount), category, req.user.id, approverRole);

  res.status(201).json(db.prepare('SELECT * FROM purchase_requests WHERE id = ?').get(result.lastInsertRowid));
});

// Approve
router.post('/:id/approve', authenticateToken, (req, res) => {
  const { comments } = req.body;
  const { role, id: userId } = req.user;

  if (!APPROVER_ROLES.includes(role)) {
    return res.status(403).json({ error: 'Not authorized to approve requests' });
  }

  const request = db.prepare('SELECT * FROM purchase_requests WHERE id = ?').get(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.status !== 'pending') return res.status(400).json({ error: 'Request is not pending' });
  if (role !== 'admin' && request.current_approver_role !== role) {
    return res.status(403).json({ error: 'This request is not assigned to your approval level' });
  }

  db.transaction(() => {
    db.prepare(
      "UPDATE purchase_requests SET status='approved', current_approver_role=NULL, updated_at=CURRENT_TIMESTAMP WHERE id=?"
    ).run(req.params.id);
    db.prepare(
      "INSERT INTO approval_history (request_id, approver_id, action, comments) VALUES (?, ?, 'approved', ?)"
    ).run(req.params.id, userId, comments || null);
  })();

  res.json({ message: 'Request approved successfully' });
});

// Reject
router.post('/:id/reject', authenticateToken, (req, res) => {
  const { comments } = req.body;
  const { role, id: userId } = req.user;

  if (!APPROVER_ROLES.includes(role)) {
    return res.status(403).json({ error: 'Not authorized to reject requests' });
  }

  const request = db.prepare('SELECT * FROM purchase_requests WHERE id = ?').get(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.status !== 'pending') return res.status(400).json({ error: 'Request is not pending' });
  if (role !== 'admin' && request.current_approver_role !== role) {
    return res.status(403).json({ error: 'This request is not assigned to your approval level' });
  }

  db.transaction(() => {
    db.prepare(
      "UPDATE purchase_requests SET status='rejected', current_approver_role=NULL, updated_at=CURRENT_TIMESTAMP WHERE id=?"
    ).run(req.params.id);
    db.prepare(
      "INSERT INTO approval_history (request_id, approver_id, action, comments) VALUES (?, ?, 'rejected', ?)"
    ).run(req.params.id, userId, comments || null);
  })();

  res.json({ message: 'Request rejected successfully' });
});

// Cancel (by requester or admin)
router.post('/:id/cancel', authenticateToken, (req, res) => {
  const request = db.prepare('SELECT * FROM purchase_requests WHERE id = ?').get(req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found' });
  if (request.requester_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Can only cancel your own requests' });
  }
  if (request.status !== 'pending') {
    return res.status(400).json({ error: 'Can only cancel pending requests' });
  }

  db.prepare(
    "UPDATE purchase_requests SET status='cancelled', updated_at=CURRENT_TIMESTAMP WHERE id=?"
  ).run(req.params.id);

  res.json({ message: 'Request cancelled' });
});

module.exports = router;
