<?php

class AdminController {
    public static function getLevels(): void {
        $user = Middleware::auth();
        Middleware::requireRole($user, ['admin']);

        $docs = DB::col('approval_levels')->find([], ['sort' => ['max_amount' => 1]]);
        respond(normalizeMany($docs));
    }

    public static function updateLevels(array $body): void {
        $user = Middleware::auth();
        Middleware::requireRole($user, ['admin']);

        if (!isset($body['levels']) || !is_array($body['levels'])) {
            respond(['error' => 'levels must be an array'], 400);
        }

        foreach ($body['levels'] as $level) {
            DB::col('approval_levels')->updateOne(
                ['role' => $level['role']],
                ['$set' => ['max_amount' => (float)$level['max_amount'], 'updated_at' => utcNow()]]
            );
        }

        $updated = DB::col('approval_levels')->find([], ['sort' => ['max_amount' => 1]]);
        respond(normalizeMany($updated));
    }

    public static function stats(): void {
        $user = Middleware::auth();
        Middleware::requireRole($user, ['admin']);

        $col = DB::col('purchase_requests');
        $approvedSum = $col->aggregate([
            ['$match'  => ['status' => 'approved']],
            ['$group'  => ['_id' => null, 'total' => ['$sum' => '$amount']]],
        ])->toArray();

        respond([
            'total_requests'        => $col->countDocuments(),
            'pending'               => $col->countDocuments(['status' => 'pending']),
            'approved'              => $col->countDocuments(['status' => 'approved']),
            'rejected'              => $col->countDocuments(['status' => 'rejected']),
            'total_users'           => DB::col('users')->countDocuments(),
            'total_approved_amount' => isset($approvedSum[0]) ? $approvedSum[0]['total'] : 0,
            'total_vendors'         => DB::col('vendors')->countDocuments(),
            'total_tenders'         => DB::col('tenders')->countDocuments(),
        ]);
    }
}
