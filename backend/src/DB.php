<?php

class DB {
    private static ?\MongoDB\Client $client = null;
    private static string $dbName = 'purchase_approval';

    public static function get(): \MongoDB\Database {
        if (!self::$client) {
            $uri = getenv('MONGODB_URI') ?: 'mongodb://localhost:27017';
            self::$client = new \MongoDB\Client($uri);
            self::seed();
        }
        return self::$client->{self::$dbName};
    }

    public static function col(string $name): \MongoDB\Collection {
        return self::get()->selectCollection($name);
    }

    private static function seed(): void {
        $users = self::$client->{self::$dbName}->selectCollection('users');
        if ($users->countDocuments(['email' => 'admin@company.com']) > 0) return;

        $demoUsers = [
            ['System Admin',    'admin@company.com',    'admin123',    'admin',           'IT'],
            ['John CEO',        'ceo@company.com',       'password123', 'ceo',             'Executive'],
            ['Sarah Head',      'depthead@company.com',  'password123', 'department_head', 'Finance'],
            ['Mike Manager',    'manager@company.com',   'password123', 'manager',         'Operations'],
            ['Alice Employee',  'alice@company.com',     'password123', 'employee',        'Operations'],
            ['Bob Employee',    'bob@company.com',       'password123', 'employee',        'Finance'],
        ];

        foreach ($demoUsers as [$name, $email, $pwd, $role, $dept]) {
            $users->insertOne([
                'name'          => $name,
                'email'         => $email,
                'password_hash' => password_hash($pwd, PASSWORD_BCRYPT),
                'role'          => $role,
                'department'    => $dept,
                'is_active'     => true,
                'created_at'    => utcNow(),
            ]);
        }

        // Seed demo company
        $adminUser = self::$client->{self::$dbName}->selectCollection('users')->findOne(['email' => 'admin@company.com']);
        self::$client->{self::$dbName}->selectCollection('companies')->insertMany([
            [
                'name'             => 'Alpha Trading LLC',
                'trade_license_no' => 'DED-2024-001',
                'vat_number'       => '100234567890003',
                'address'          => 'Office 401, Tower A, Business Bay',
                'city'             => 'Dubai',
                'country'          => 'UAE',
                'phone'            => '+971 4 123 4567',
                'email'            => 'info@alphatrading.ae',
                'website'          => 'www.alphatrading.ae',
                'logo_filename'    => null,
                'owner_id'         => $adminUser ? (string)$adminUser['_id'] : 'admin',
                'created_at'       => utcNow(),
            ],
            [
                'name'             => 'Beta Supplies FZE',
                'trade_license_no' => 'JAFZA-2024-088',
                'vat_number'       => '100456789012003',
                'address'          => 'Warehouse 12, Jebel Ali Free Zone',
                'city'             => 'Dubai',
                'country'          => 'UAE',
                'phone'            => '+971 4 987 6543',
                'email'            => 'info@betasupplies.ae',
                'website'          => 'www.betasupplies.ae',
                'logo_filename'    => null,
                'owner_id'         => $adminUser ? (string)$adminUser['_id'] : 'admin',
                'created_at'       => utcNow(),
            ],
        ]);

        self::$client->{self::$dbName}->selectCollection('approval_levels')->insertMany([
            ['role' => 'manager',         'label' => 'Manager',         'max_amount' => 5000,      'updated_at' => utcNow()],
            ['role' => 'department_head', 'label' => 'Department Head', 'max_amount' => 25000,     'updated_at' => utcNow()],
            ['role' => 'ceo',             'label' => 'CEO',             'max_amount' => 999999999, 'updated_at' => utcNow()],
        ]);
    }
}
