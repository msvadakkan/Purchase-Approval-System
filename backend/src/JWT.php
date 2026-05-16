<?php

use Firebase\JWT\JWT as FirebaseJWT;
use Firebase\JWT\Key;

class JWT {
    private static string $secret = 'purchase-approval-secret-2024';
    private static string $algo   = 'HS256';

    public static function encode(array $payload): string {
        $payload['iat'] = time();
        $payload['exp'] = time() + 86400; // 24 hours
        return FirebaseJWT::encode($payload, self::$secret, self::$algo);
    }

    public static function decode(string $token): ?object {
        try {
            return FirebaseJWT::decode($token, new Key(self::$secret, self::$algo));
        } catch (\Throwable $e) {
            return null;
        }
    }
}
