<?php
require_once __DIR__ . '/../includes/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id']     ?? null;
$action = $_GET['action'] ?? null;

function mongo_doc($doc): array {
    if (!$doc) return [];
    $arr = iterator_to_array($doc) ?: (array)$doc;
    $arr['id'] = (string)($arr['_id'] ?? $arr['id'] ?? '');
    return $arr;
}

// GET /api/requests/pending
if ($method === 'GET' && !$id && $_GET['pending'] ?? false) {
    $claims = require_auth();
    $role = $claims['role'];
    $uid  = $claims['sub'];
    $filter = $role === 'admin'
        ? ['status' => 'pending']
        : ['status' => 'pending', 'required_role' => $role];
    $rows = iterator_to_array(db()->purchase_requests->find($filter, ['sort' => ['created_at' => -1]]));
    json_ok(array_map('mongo_doc', $rows));
}

// GET /api/requests
if ($method === 'GET' && !$id) {
    $claims = require_auth();
    $uid    = $claims['sub'];
    $role   = $claims['role'];
    $filter = in_array($role, ['admin', 'ceo', 'department_head', 'manager'])
        ? []
        : ['requester_id' => $uid];
    $rows = iterator_to_array(db()->purchase_requests->find($filter, ['sort' => ['created_at' => -1]]));
    json_ok(array_map('mongo_doc', $rows));
}

// POST /api/requests
if ($method === 'POST' && !$id) {
    $claims = require_auth();
    $b      = body();
    if (empty($b['title']) || empty($b['amount'])) json_err('title and amount required');

    $amount = floatval($b['amount']);
    // Determine required_role based on approval levels
    $levels = iterator_to_array(db()->approval_levels->find());
    usort($levels, fn($a, $b) => $a['max_amount'] <=> $b['max_amount']);
    $required_role = 'ceo';
    foreach ($levels as $l) {
        if ($l['role'] === 'ceo') continue;
        if ($amount <= floatval($l['max_amount'])) { $required_role = $l['role']; break; }
    }

    $doc = [
        '_id'           => new_id(),
        'title'         => $b['title'],
        'description'   => $b['description'] ?? '',
        'amount'        => $amount,
        'currency'      => 'AED',
        'category'      => $b['category'] ?? '',
        'company_id'    => $b['company_id'] ?? null,
        'company_name'  => $b['company_name'] ?? null,
        'requester_id'  => $claims['sub'],
        'requester_name'=> $claims['name'],
        'required_role' => $required_role,
        'status'        => 'pending',
        'history'       => [],
        'created_at'    => now_iso(),
        'updated_at'    => now_iso(),
    ];
    db()->purchase_requests->insertOne($doc);
    json_ok(mongo_doc($doc), 201);
}

// GET /api/requests/:id
if ($method === 'GET' && $id && !$action) {
    require_auth();
    $doc = db()->purchase_requests->findOne(['_id' => $id]);
    if (!$doc) json_err('Not found', 404);
    json_ok(mongo_doc($doc));
}

// POST /api/requests/:id/approve
if ($method === 'POST' && $id && $action === 'approve') {
    $claims = require_auth();
    $b      = body();
    $doc    = db()->purchase_requests->findOne(['_id' => $id]);
    if (!$doc) json_err('Not found', 404);
    if ($doc['status'] !== 'pending') json_err('Request is not pending');

    $history_entry = [
        'action'    => 'approved',
        'by_id'     => $claims['sub'],
        'by_name'   => $claims['name'],
        'by_role'   => $claims['role'],
        'comment'   => $b['comment'] ?? '',
        'timestamp' => now_iso(),
    ];
    db()->purchase_requests->updateOne(['_id' => $id], [
        '$set'  => ['status' => 'approved', 'updated_at' => now_iso()],
        '$push' => ['history' => $history_entry],
    ]);
    json_ok(['success' => true]);
}

// POST /api/requests/:id/reject
if ($method === 'POST' && $id && $action === 'reject') {
    $claims = require_auth();
    $b      = body();
    $doc    = db()->purchase_requests->findOne(['_id' => $id]);
    if (!$doc) json_err('Not found', 404);

    $history_entry = [
        'action'    => 'rejected',
        'by_id'     => $claims['sub'],
        'by_name'   => $claims['name'],
        'by_role'   => $claims['role'],
        'comment'   => $b['comment'] ?? '',
        'timestamp' => now_iso(),
    ];
    db()->purchase_requests->updateOne(['_id' => $id], [
        '$set'  => ['status' => 'rejected', 'updated_at' => now_iso()],
        '$push' => ['history' => $history_entry],
    ]);
    json_ok(['success' => true]);
}

// POST /api/requests/:id/cancel
if ($method === 'POST' && $id && $action === 'cancel') {
    $claims = require_auth();
    $doc    = db()->purchase_requests->findOne(['_id' => $id]);
    if (!$doc) json_err('Not found', 404);
    if ($doc['requester_id'] !== $claims['sub'] && $claims['role'] !== 'admin') json_err('Forbidden', 403);

    db()->purchase_requests->updateOne(['_id' => $id], [
        '$set' => ['status' => 'cancelled', 'updated_at' => now_iso()],
    ]);
    json_ok(['success' => true]);
}

json_err('Not found', 404);
