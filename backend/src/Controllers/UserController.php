<?php

class UserController {
    private static array $validRoles = ['admin', 'ceo', 'department_head', 'manager', 'employee'];

    public static function index(): void {
        $user = Middleware::auth();
        Middleware::requireRole($user, ['admin']);

        $docs = DB::col('users')->find([], ['sort' => ['created_at' => -1]]);
        $rows = [];
        foreach ($docs as $doc) {
            $rows[] = self::safe($doc);
        }
        respond($rows);
    }

    public static function store(array $body): void {
        $user = Middleware::auth();
        Middleware::requireRole($user, ['admin']);

        ['name' => $name, 'email' => $email, 'password' => $pwd, 'role' => $role] = $body + ['name'=>'','email'=>'','password'=>'','role'=>''];
        if (!$name || !$email || !$pwd || !$role) {
            respond(['error' => 'Name, email, password, and role are required'], 400);
        }
        if (!in_array($role, self::$validRoles)) {
            respond(['error' => 'Invalid role'], 400);
        }
        if (DB::col('users')->countDocuments(['email' => $email]) > 0) {
            respond(['error' => 'Email already exists'], 409);
        }

        $result = DB::col('users')->insertOne([
            'name'          => $name,
            'email'         => $email,
            'password_hash' => password_hash($pwd, PASSWORD_BCRYPT),
            'role'          => $role,
            'department'    => $body['department'] ?? null,
            'is_active'     => true,
            'created_at'    => utcNow(),
        ]);

        respond(['id' => (string)$result->getInsertedId(), 'name' => $name, 'email' => $email, 'role' => $role], 201);
    }

    public static function update(string $id, array $body): void {
        $user = Middleware::auth();
        Middleware::requireRole($user, ['admin']);

        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }

        $set = [];
        foreach (['name', 'email', 'role', 'department'] as $f) {
            if (isset($body[$f])) $set[$f] = $body[$f];
        }
        if (isset($body['is_active'])) $set['is_active'] = (bool)$body['is_active'];
        if (!empty($body['password'])) $set['password_hash'] = password_hash($body['password'], PASSWORD_BCRYPT);

        if (empty($set)) respond(['error' => 'Nothing to update'], 400);

        DB::col('users')->updateOne(['_id' => $oid], ['$set' => $set]);
        respond(['message' => 'User updated successfully']);
    }

    public static function destroy(string $id): void {
        $user = Middleware::auth();
        Middleware::requireRole($user, ['admin']);

        if ($id === $user->id) respond(['error' => 'Cannot delete your own account'], 400);

        try { $oid = objectId($id); } catch (\Throwable $e) { respond(['error' => 'Invalid ID'], 400); }

        $result = DB::col('users')->deleteOne(['_id' => $oid]);
        if ($result->getDeletedCount() === 0) respond(['error' => 'User not found'], 404);
        respond(['message' => 'User deleted']);
    }

    private static function safe($doc): array {
        return [
            'id'         => (string)$doc['_id'],
            'name'       => (string)$doc['name'],
            'email'      => (string)$doc['email'],
            'role'       => (string)$doc['role'],
            'department' => (string)($doc['department'] ?? ''),
            'is_active'  => (bool)$doc['is_active'],
            'created_at' => ($doc['created_at'] instanceof \MongoDB\BSON\UTCDateTime)
                ? $doc['created_at']->toDateTime()->format('c')
                : (string)$doc['created_at'],
        ];
    }
}
