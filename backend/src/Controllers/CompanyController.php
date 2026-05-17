<?php

class CompanyController {

    public static function index(): void {
        $user = Middleware::auth();
        $filter = $user->role === 'admin' ? [] : ['owner_id' => $user->id];
        respond(normalizeMany(DB::col('companies')->find($filter, ['sort' => ['created_at' => -1]])));
    }

    public static function store(): void {
        $user = Middleware::auth();

        $name  = trim($_POST['name']  ?? '');
        $email = trim($_POST['email'] ?? '');
        if (!$name)  respond(['error' => 'Company name is required'], 400);
        if (!$email) respond(['error' => 'Email is required'], 400);

        $logoFilename = null;
        if (!empty($_FILES['logo']['tmp_name'])) {
            $dir = __DIR__ . '/../../uploads/companies/';
            if (!is_dir($dir)) mkdir($dir, 0775, true);
            $ext          = strtolower(pathinfo($_FILES['logo']['name'], PATHINFO_EXTENSION));
            $logoFilename = uniqid('logo_') . '.' . $ext;
            move_uploaded_file($_FILES['logo']['tmp_name'], $dir . $logoFilename);
        }

        $result = DB::col('companies')->insertOne([
            'name'             => $name,
            'trade_license_no' => $_POST['trade_license_no'] ?? '',
            'vat_number'       => $_POST['vat_number']       ?? '',
            'address'          => $_POST['address']          ?? '',
            'city'             => $_POST['city']             ?? '',
            'country'          => $_POST['country']          ?? 'UAE',
            'phone'            => $_POST['phone']            ?? '',
            'email'            => $email,
            'website'          => $_POST['website']          ?? '',
            'logo_filename'    => $logoFilename,
            'owner_id'         => $user->id,
            'created_at'       => utcNow(),
        ]);

        respond(['id' => (string)$result->getInsertedId(), 'name' => $name], 201);
    }

    public static function show(string $id): void {
        Middleware::auth();
        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }
        $doc = DB::col('companies')->findOne(['_id' => $oid]);
        if (!$doc) respond(['error' => 'Company not found'], 404);
        respond(normalize($doc));
    }

    public static function update(string $id, array $body): void {
        $user = Middleware::auth();
        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }

        $set = [];
        foreach (['name','trade_license_no','vat_number','address','city','country','phone','email','website'] as $f) {
            if (isset($body[$f])) $set[$f] = $body[$f];
        }
        if (empty($set)) respond(['error' => 'Nothing to update'], 400);

        DB::col('companies')->updateOne(['_id' => $oid], ['$set' => $set]);
        respond(['message' => 'Company updated']);
    }

    public static function destroy(string $id): void {
        $user = Middleware::auth();
        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }

        $result = DB::col('companies')->deleteOne(['_id' => $oid]);
        if ($result->getDeletedCount() === 0) respond(['error' => 'Company not found'], 404);
        respond(['message' => 'Company deleted']);
    }
}
