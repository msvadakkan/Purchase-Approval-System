<?php

class RequestController {
    private static array $approverRoles = ['admin', 'ceo', 'department_head', 'manager'];

    private static function getApproverRole(float $amount): string {
        $levels = DB::col('approval_levels')->find([], ['sort' => ['max_amount' => 1]])->toArray();
        foreach ($levels as $l) {
            if ($amount <= $l['max_amount']) return (string)$l['role'];
        }
        $last = end($levels);
        return $last ? (string)$last['role'] : 'ceo';
    }

    public static function index(): void {
        $user = Middleware::auth();
        $col  = DB::col('purchase_requests');

        if ($user->role === 'admin') {
            $docs = $col->find([], ['sort' => ['created_at' => -1]]);
        } elseif (in_array($user->role, self::$approverRoles)) {
            $myId  = objectId($user->id);
            $acted = DB::col('approval_history')
                ->distinct('request_id', ['approver_id' => $myId]);
            $actedOids = array_map(fn($id) => $id instanceof \MongoDB\BSON\ObjectId ? $id : objectId((string)$id), $acted);

            $docs = $col->find([
                '$or' => [
                    ['current_approver_role' => $user->role],
                    ['requester_id'           => $myId],
                    ['_id'                    => ['$in' => $actedOids]],
                ],
            ], ['sort' => ['created_at' => -1]]);
        } else {
            $docs = $col->find(['requester_id' => objectId($user->id)], ['sort' => ['created_at' => -1]]);
        }

        respond(self::enrichMany($docs));
    }

    public static function pending(): void {
        $user = Middleware::auth();
        if (!in_array($user->role, self::$approverRoles)) respond([]);

        $filter = $user->role === 'admin'
            ? ['status' => 'pending']
            : ['status' => 'pending', 'current_approver_role' => $user->role];

        $docs = DB::col('purchase_requests')->find($filter, ['sort' => ['created_at' => -1]]);
        respond(self::enrichMany($docs));
    }

    public static function show(string $id): void {
        $user = Middleware::auth();
        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }

        $doc = DB::col('purchase_requests')->findOne(['_id' => $oid]);
        if (!$doc) respond(['error' => 'Request not found'], 404);

        if ($user->role === 'employee' && (string)$doc['requester_id'] !== $user->id) {
            respond(['error' => 'Access denied'], 403);
        }

        $row = self::enrich($doc);

        // Approval history
        $hist = DB::col('approval_history')->find(
            ['request_id' => $oid],
            ['sort' => ['created_at' => 1]]
        );
        $row['history'] = normalizeMany($hist);

        respond($row);
    }

    public static function store(array $body): void {
        $user = Middleware::auth();

        $title    = trim($body['title'] ?? '');
        $amount   = (float)($body['amount'] ?? 0);
        $category = trim($body['category'] ?? '');

        if (!$title || !$amount || !$category) {
            respond(['error' => 'Title, amount, and category are required'], 400);
        }
        if ($amount <= 0) respond(['error' => 'Amount must be positive'], 400);

        $approverRole = self::getApproverRole($amount);
        $result = DB::col('purchase_requests')->insertOne([
            'title'                => $title,
            'description'          => $body['description'] ?? null,
            'amount'               => $amount,
            'category'             => $category,
            'requester_id'         => objectId($user->id),
            'status'               => 'pending',
            'current_approver_role' => $approverRole,
            'created_at'           => utcNow(),
            'updated_at'           => utcNow(),
        ]);

        $doc = DB::col('purchase_requests')->findOne(['_id' => $result->getInsertedId()]);
        respond(self::enrich($doc), 201);
    }

    public static function approve(string $id, array $body): void {
        self::action($id, 'approved', $body['comments'] ?? null);
    }

    public static function reject(string $id, array $body): void {
        self::action($id, 'rejected', $body['comments'] ?? null);
    }

    private static function action(string $id, string $action, ?string $comments): void {
        $user = Middleware::auth();
        if (!in_array($user->role, self::$approverRoles)) respond(['error' => 'Not authorized'], 403);

        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }

        $doc = DB::col('purchase_requests')->findOne(['_id' => $oid]);
        if (!$doc) respond(['error' => 'Request not found'], 404);
        if ($doc['status'] !== 'pending') respond(['error' => 'Request is not pending'], 400);
        if ($user->role !== 'admin' && $doc['current_approver_role'] !== $user->role) {
            respond(['error' => 'This request is not assigned to your approval level'], 403);
        }

        DB::col('purchase_requests')->updateOne(
            ['_id' => $oid],
            ['$set' => ['status' => $action, 'current_approver_role' => null, 'updated_at' => utcNow()]]
        );

        DB::col('approval_history')->insertOne([
            'request_id'    => $oid,
            'approver_id'   => objectId($user->id),
            'approver_name' => $user->name,
            'approver_role' => $user->role,
            'action'        => $action,
            'comments'      => $comments,
            'created_at'    => utcNow(),
        ]);

        respond(['message' => 'Request ' . $action . ' successfully']);
    }

    public static function cancel(string $id): void {
        $user = Middleware::auth();
        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }

        $doc = DB::col('purchase_requests')->findOne(['_id' => $oid]);
        if (!$doc) respond(['error' => 'Request not found'], 404);
        if ((string)$doc['requester_id'] !== $user->id && $user->role !== 'admin') {
            respond(['error' => 'Can only cancel your own requests'], 403);
        }
        if ($doc['status'] !== 'pending') respond(['error' => 'Can only cancel pending requests'], 400);

        DB::col('purchase_requests')->updateOne(
            ['_id' => $oid],
            ['$set' => ['status' => 'cancelled', 'updated_at' => utcNow()]]
        );
        respond(['message' => 'Request cancelled']);
    }

    private static function enrich($doc): array {
        $row = normalize($doc);
        $requester = DB::col('users')->findOne(['_id' => $doc['requester_id']]);
        $row['requester_name'] = $requester ? (string)$requester['name'] : 'Unknown';
        $row['department']     = $requester ? (string)($requester['department'] ?? '') : '';
        return $row;
    }

    private static function enrichMany(iterable $docs): array {
        $rows = [];
        foreach ($docs as $doc) {
            $rows[] = self::enrich($doc);
        }
        return $rows;
    }
}
