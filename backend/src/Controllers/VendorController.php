<?php

class VendorController {

    // Admin: list all vendors
    public static function index(): void {
        $user = Middleware::auth();
        Middleware::requireRole($user, ['admin']);

        $docs = DB::col('vendors')->find([], ['sort' => ['created_at' => -1]]);
        respond(normalizeMany($docs));
    }

    // Public: register a vendor (multipart/form-data with file uploads)
    public static function store(): void {
        $required = ['company_name', 'vat_number', 'contact_number', 'sales_person', 'address', 'email', 'password'];
        foreach ($required as $f) {
            if (empty($_POST[$f])) {
                respond(['error' => "Field '{$f}' is required"], 400);
            }
        }

        if (DB::col('vendors')->countDocuments(['email' => $_POST['email']]) > 0) {
            respond(['error' => 'Email already registered'], 409);
        }

        // Handle file uploads
        $uploadDir = __DIR__ . '/../../uploads/vendors/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0775, true);

        $attachments = [];
        $types = ['trade_license', 'vat_certificate', 'bank_document'];
        foreach ($types as $type) {
            if (!empty($_FILES[$type]['tmp_name'])) {
                $ext      = pathinfo($_FILES[$type]['name'], PATHINFO_EXTENSION);
                $filename = uniqid($type . '_') . '.' . $ext;
                move_uploaded_file($_FILES[$type]['tmp_name'], $uploadDir . $filename);
                $attachments[] = ['type' => $type, 'filename' => $filename, 'original' => $_FILES[$type]['name']];
            }
        }

        $result = DB::col('vendors')->insertOne([
            'company_name'   => $_POST['company_name'],
            'vat_number'     => $_POST['vat_number'],
            'contact_number' => $_POST['contact_number'],
            'sales_person'   => $_POST['sales_person'],
            'address'        => $_POST['address'],
            'email'          => $_POST['email'],
            'password_hash'  => password_hash($_POST['password'], PASSWORD_BCRYPT),
            'bank_details'   => [
                'bank_name'       => $_POST['bank_name']       ?? '',
                'account_name'    => $_POST['account_name']    ?? '',
                'account_number'  => $_POST['account_number']  ?? '',
                'iban'            => $_POST['iban']            ?? '',
                'swift_code'      => $_POST['swift_code']      ?? '',
                'branch'          => $_POST['branch']          ?? '',
            ],
            'attachments'    => $attachments,
            'status'         => 'pending', // admin approves vendors
            'created_at'     => utcNow(),
        ]);

        respond(['id' => (string)$result->getInsertedId(), 'message' => 'Vendor registered successfully. Awaiting admin approval.'], 201);
    }

    // Vendor login
    public static function login(array $body): void {
        $email = trim($body['email'] ?? '');
        $pwd   = $body['password'] ?? '';

        if (!$email || !$pwd) respond(['error' => 'Email and password required'], 400);

        $vendor = DB::col('vendors')->findOne(['email' => $email]);
        if (!$vendor || !password_verify($pwd, (string)$vendor['password_hash'])) {
            respond(['error' => 'Invalid email or password'], 401);
        }
        if ((string)$vendor['status'] !== 'approved') {
            respond(['error' => 'Your account is pending admin approval'], 403);
        }

        $token = JWT::encode([
            'id'           => (string)$vendor['_id'],
            'email'        => (string)$vendor['email'],
            'company_name' => (string)$vendor['company_name'],
            'role'         => 'vendor',
            'type'         => 'vendor',
        ]);

        $row = normalize($vendor);
        unset($row['password_hash']);
        respond(['token' => $token, 'vendor' => $row]);
    }

    // Admin: get single vendor
    public static function show(string $id): void {
        $user = Middleware::auth();
        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }

        // Allow vendor themselves or admin
        if ($user->role !== 'admin' && $user->id !== $id) {
            respond(['error' => 'Access denied'], 403);
        }

        $doc = DB::col('vendors')->findOne(['_id' => $oid]);
        if (!$doc) respond(['error' => 'Vendor not found'], 404);

        $row = normalize($doc);
        unset($row['password_hash']);
        respond($row);
    }

    // Admin: update vendor (approve/reject/edit)
    public static function update(string $id, array $body): void {
        $user = Middleware::auth();
        Middleware::requireRole($user, ['admin']);

        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }

        $set = [];
        foreach (['status', 'company_name', 'vat_number', 'contact_number', 'sales_person', 'address'] as $f) {
            if (isset($body[$f])) $set[$f] = $body[$f];
        }
        if (empty($set)) respond(['error' => 'Nothing to update'], 400);

        DB::col('vendors')->updateOne(['_id' => $oid], ['$set' => $set]);
        respond(['message' => 'Vendor updated']);
    }

    // Admin: approve vendor directly
    public static function approve(string $id): void {
        $user = Middleware::auth();
        Middleware::requireRole($user, ['admin']);

        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }
        DB::col('vendors')->updateOne(['_id' => $oid], ['$set' => ['status' => 'approved']]);
        respond(['message' => 'Vendor approved']);
    }
}
