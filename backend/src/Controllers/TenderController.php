<?php

class TenderController {

    // GET /api/tenders — internal users see all, vendors see open ones
    public static function index(): void {
        $user = Middleware::auth();

        $filter = [];
        if ($user->role === 'vendor') {
            $filter['status'] = 'open';
        }

        $docs = DB::col('tenders')->find($filter, ['sort' => ['created_at' => -1]]);
        $rows = [];
        foreach ($docs as $doc) {
            $row = normalize($doc);
            $row['quote_count'] = DB::col('quotes')->countDocuments(['tender_id' => $doc['_id']]);
            $rows[] = $row;
        }
        respond($rows);
    }

    // POST /api/tenders — internal users create tenders
    public static function store(array $body): void {
        $user = Middleware::auth();
        Middleware::requireRole($user, ['admin', 'ceo', 'department_head', 'manager', 'employee']);

        $title = trim($body['title'] ?? '');
        if (!$title) respond(['error' => 'Title is required'], 400);

        $result = DB::col('tenders')->insertOne([
            'title'         => $title,
            'description'   => $body['description'] ?? '',
            'category'      => $body['category'] ?? '',
            'department'    => $body['department'] ?? '',
            'deadline'      => $body['deadline'] ?? null,
            'budget'        => isset($body['budget']) ? (float)$body['budget'] : null,
            'specifications'=> $body['specifications'] ?? '',
            'status'        => 'open',
            'created_by'    => objectId($user->id),
            'creator_name'  => $user->name,
            'created_at'    => utcNow(),
            'updated_at'    => utcNow(),
        ]);

        $doc = DB::col('tenders')->findOne(['_id' => $result->getInsertedId()]);
        respond(normalize($doc), 201);
    }

    // GET /api/tenders/:id
    public static function show(string $id): void {
        $user = Middleware::auth();
        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }

        $doc = DB::col('tenders')->findOne(['_id' => $oid]);
        if (!$doc) respond(['error' => 'Tender not found'], 404);

        $row = normalize($doc);
        $row['quote_count'] = DB::col('quotes')->countDocuments(['tender_id' => $oid]);

        // If vendor, show their quote if submitted
        if ($user->role === 'vendor') {
            $myQuote = DB::col('quotes')->findOne([
                'tender_id' => $oid,
                'vendor_id' => objectId($user->id),
            ]);
            $row['my_quote'] = $myQuote ? normalize($myQuote) : null;
        }

        respond($row);
    }

    // PUT /api/tenders/:id — update tender status (open/closed)
    public static function update(string $id, array $body): void {
        $user = Middleware::auth();
        Middleware::requireRole($user, ['admin']);

        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }

        $set = [];
        if (isset($body['status']))   $set['status']   = $body['status'];
        if (isset($body['deadline'])) $set['deadline']  = $body['deadline'];
        $set['updated_at'] = utcNow();

        DB::col('tenders')->updateOne(['_id' => $oid], ['$set' => $set]);
        respond(['message' => 'Tender updated']);
    }

    // POST /api/tenders/:id/quote — vendor submits a quote
    public static function submitQuote(string $id, array $body): void {
        $user = Middleware::auth();
        if ($user->role !== 'vendor') respond(['error' => 'Only vendors can submit quotes'], 403);

        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }

        $tender = DB::col('tenders')->findOne(['_id' => $oid]);
        if (!$tender) respond(['error' => 'Tender not found'], 404);
        if ($tender['status'] !== 'open') respond(['error' => 'This tender is closed'], 400);

        // Check if vendor already quoted
        $existing = DB::col('quotes')->findOne([
            'tender_id' => $oid,
            'vendor_id' => objectId($user->id),
        ]);

        $quoteData = [
            'tender_id'     => $oid,
            'tender_title'  => (string)$tender['title'],
            'vendor_id'     => objectId($user->id),
            'vendor_name'   => $user->company_name ?? $user->name,
            'unit_price'    => (float)($body['unit_price'] ?? 0),
            'total_amount'  => (float)($body['total_amount'] ?? 0),
            'currency'      => $body['currency'] ?? 'AED',
            'delivery_days' => (int)($body['delivery_days'] ?? 0),
            'validity_days' => (int)($body['validity_days'] ?? 30),
            'payment_terms' => $body['payment_terms'] ?? '',
            'warranty'      => $body['warranty'] ?? '',
            'notes'         => $body['notes'] ?? '',
            'submitted_at'  => utcNow(),
        ];

        if ($existing) {
            DB::col('quotes')->updateOne(['_id' => $existing['_id']], ['$set' => $quoteData]);
            respond(['message' => 'Quote updated successfully']);
        } else {
            DB::col('quotes')->insertOne($quoteData);
            respond(['message' => 'Quote submitted successfully'], 201);
        }
    }

    // GET /api/tenders/:id/quotes — get all quotes for a tender (internal users)
    public static function getQuotes(string $id): void {
        $user = Middleware::auth();
        Middleware::requireRole($user, ['admin', 'ceo', 'department_head', 'manager', 'employee']);

        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }

        $docs = DB::col('quotes')->find(['tender_id' => $oid], ['sort' => ['total_amount' => 1]]);
        respond(normalizeMany($docs));
    }

    // GET /api/tenders/:id/comparison — side-by-side quote comparison
    public static function comparison(string $id): void {
        $user = Middleware::auth();
        Middleware::requireRole($user, ['admin', 'ceo', 'department_head', 'manager', 'employee']);

        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }

        $tender = DB::col('tenders')->findOne(['_id' => $oid]);
        if (!$tender) respond(['error' => 'Tender not found'], 404);

        $quotes = DB::col('quotes')->find(['tender_id' => $oid], ['sort' => ['total_amount' => 1]])->toArray();
        $rows   = normalizeMany($quotes);

        // Mark lowest price
        if (!empty($rows)) {
            $minAmount = min(array_column($rows, 'total_amount'));
            foreach ($rows as &$q) {
                $q['is_lowest'] = ($q['total_amount'] === $minAmount);
            }
        }

        respond([
            'tender' => normalize($tender),
            'quotes' => $rows,
        ]);
    }
}
