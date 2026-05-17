<?php

class LPOController {

    public static function index(): void {
        $user = Middleware::auth();

        if ($user->role === 'admin') {
            $filter = [];
        } else {
            $companyDocs = DB::col('companies')->find(['owner_id' => $user->id], ['projection' => ['_id' => 1]]);
            $ids = [];
            foreach ($companyDocs as $c) $ids[] = (string)$c['_id'];
            $filter = $ids ? ['company_id' => ['$in' => $ids]] : ['company_id' => 'none'];
        }

        respond(normalizeMany(DB::col('lpos')->find($filter, ['sort' => ['created_at' => -1]])));
    }

    public static function store(array $body): void {
        $user = Middleware::auth();

        if (empty($body['company_id'])) respond(['error' => 'Company is required'], 400);
        if (empty($body['vendor_id']))  respond(['error' => 'Vendor is required'],  400);
        if (empty($body['items']) || !is_array($body['items'])) respond(['error' => 'At least one line item is required'], 400);

        try { $cOid = objectId($body['company_id']); } catch (\Throwable $e) { respond(['error' => 'Invalid company ID'], 400); }
        try { $vOid = objectId($body['vendor_id']);  } catch (\Throwable $e) { respond(['error' => 'Invalid vendor ID'],  400); }

        $company = DB::col('companies')->findOne(['_id' => $cOid]);
        if (!$company) respond(['error' => 'Company not found'], 404);

        $vendor = DB::col('vendors')->findOne(['_id' => $vOid]);
        if (!$vendor) respond(['error' => 'Vendor not found'], 404);

        // Sequential LPO number per company
        $seq     = DB::col('lpos')->countDocuments(['company_id' => $body['company_id']]);
        $lpoNum  = 'LPO-' . date('Y') . '-' . str_pad($seq + 1, 4, '0', STR_PAD_LEFT);

        $items    = [];
        $subtotal = 0.0;
        foreach ($body['items'] as $item) {
            $qty   = (float)($item['quantity']   ?? 1);
            $price = (float)($item['unit_price']  ?? 0);
            $line  = round($qty * $price, 2);
            $subtotal += $line;
            $items[] = [
                'description' => trim($item['description'] ?? ''),
                'quantity'    => $qty,
                'unit'        => $item['unit'] ?? 'pcs',
                'unit_price'  => $price,
                'total'       => $line,
            ];
        }

        $vatRate   = (float)($body['vat_rate'] ?? 5);
        $vatAmount = round($subtotal * ($vatRate / 100), 2);
        $total     = round($subtotal + $vatAmount, 2);

        $result = DB::col('lpos')->insertOne([
            'lpo_number'       => $lpoNum,
            'company_id'       => $body['company_id'],
            'company_snapshot' => normalize($company),
            'vendor_id'        => $body['vendor_id'],
            'vendor_snapshot'  => normalize($vendor),
            'request_id'       => $body['request_id'] ?? null,
            'issue_date'       => $body['issue_date']     ?? date('Y-m-d'),
            'delivery_date'    => $body['delivery_date']  ?? null,
            'payment_terms'    => $body['payment_terms']  ?? 'Net 30 days',
            'items'            => $items,
            'subtotal'         => $subtotal,
            'vat_rate'         => $vatRate,
            'vat_amount'       => $vatAmount,
            'total_amount'     => $total,
            'currency'         => $body['currency'] ?? 'AED',
            'notes'            => $body['notes'] ?? '',
            'status'           => 'draft',
            'created_by'       => $user->id,
            'created_by_name'  => $user->name ?? '',
            'created_at'       => utcNow(),
        ]);

        respond(['id' => (string)$result->getInsertedId(), 'lpo_number' => $lpoNum], 201);
    }

    public static function show(string $id): void {
        Middleware::auth();
        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }
        $doc = DB::col('lpos')->findOne(['_id' => $oid]);
        if (!$doc) respond(['error' => 'LPO not found'], 404);
        respond(normalize($doc));
    }

    public static function update(string $id, array $body): void {
        Middleware::auth();
        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }

        $set = [];
        foreach (['delivery_date','payment_terms','notes','status','currency'] as $f) {
            if (isset($body[$f])) $set[$f] = $body[$f];
        }

        if (!empty($body['items']) && is_array($body['items'])) {
            $items    = [];
            $subtotal = 0.0;
            foreach ($body['items'] as $item) {
                $qty   = (float)($item['quantity']  ?? 1);
                $price = (float)($item['unit_price'] ?? 0);
                $line  = round($qty * $price, 2);
                $subtotal += $line;
                $items[] = [
                    'description' => trim($item['description'] ?? ''),
                    'quantity'    => $qty,
                    'unit'        => $item['unit'] ?? 'pcs',
                    'unit_price'  => $price,
                    'total'       => $line,
                ];
            }
            $vatRate         = (float)($body['vat_rate'] ?? 5);
            $vatAmount       = round($subtotal * ($vatRate / 100), 2);
            $set['items']       = $items;
            $set['subtotal']    = $subtotal;
            $set['vat_rate']    = $vatRate;
            $set['vat_amount']  = $vatAmount;
            $set['total_amount']= round($subtotal + $vatAmount, 2);
        }

        if (empty($set)) respond(['error' => 'Nothing to update'], 400);
        DB::col('lpos')->updateOne(['_id' => $oid], ['$set' => $set]);
        respond(['message' => 'LPO updated']);
    }

    public static function destroy(string $id): void {
        $user = Middleware::auth();
        Middleware::requireRole($user, ['admin']);
        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }
        DB::col('lpos')->deleteOne(['_id' => $oid]);
        respond(['message' => 'LPO deleted']);
    }
}
