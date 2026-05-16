<?php

class AuthController {
    public static function login(array $body): void {
        $email    = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';

        if (!$email || !$password) {
            respond(['error' => 'Email and password are required'], 400);
        }

        $user = DB::col('users')->findOne(['email' => $email, 'is_active' => true]);
        if (!$user || !password_verify($password, (string)$user['password_hash'])) {
            respond(['error' => 'Invalid email or password'], 401);
        }

        $token = JWT::encode([
            'id'    => (string)$user['_id'],
            'email' => (string)$user['email'],
            'role'  => (string)$user['role'],
            'name'  => (string)$user['name'],
            'type'  => 'user',
        ]);

        respond([
            'token' => $token,
            'user'  => [
                'id'         => (string)$user['_id'],
                'name'       => (string)$user['name'],
                'email'      => (string)$user['email'],
                'role'       => (string)$user['role'],
                'department' => (string)($user['department'] ?? ''),
            ],
        ]);
    }
}
