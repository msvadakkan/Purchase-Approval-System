<?php

class Middleware {
    public static function auth(): object {
        $headers = getallheaders();
        $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!preg_match('/Bearer\s+(.+)/i', $auth, $m)) {
            respond(['error' => 'Access token required'], 401);
        }

        $payload = JWT::decode($m[1]);
        if (!$payload) {
            respond(['error' => 'Invalid or expired token'], 403);
        }

        return $payload;
    }

    public static function requireRole(object $user, array $roles): void {
        if (!in_array($user->role, $roles)) {
            respond(['error' => 'Insufficient permissions'], 403);
        }
    }
}
