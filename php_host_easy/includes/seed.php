<?php
/**
 * Database seeder — run once to create the default admin account
 * and initial approval levels.
 *
 * Usage:  php includes/seed.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';

echo "Seeding database...\n";

// ── Approval Levels ───────────────────────────────────────────────────────────
$levels = [
    ['role' => 'employee',        'label' => 'Employee',        'max_amount' => 500],
    ['role' => 'manager',         'label' => 'Manager',         'max_amount' => 5000],
    ['role' => 'department_head', 'label' => 'Department Head', 'max_amount' => 20000],
    ['role' => 'ceo',             'label' => 'CEO',             'max_amount' => PHP_INT_MAX],
];
foreach ($levels as $level) {
    db()->approval_levels->updateOne(
        ['role' => $level['role']],
        ['$set' => $level],
        ['upsert' => true]
    );
}
echo "✓ Approval levels seeded\n";

// ── Default Admin User ────────────────────────────────────────────────────────
$existing = db()->users->findOne(['email' => 'admin@magenta-investments.com']);
if (!$existing) {
    db()->users->insertOne([
        '_id'        => new_id(),
        'name'       => 'System Admin',
        'email'      => 'admin@magenta-investments.com',
        'password'   => hash_password('admin123'),
        'role'       => 'admin',
        'department' => 'Management',
        'is_active'  => 1,
        'created_at' => now_iso(),
    ]);
    echo "✓ Admin user created (admin@magenta-investments.com / admin123)\n";
} else {
    echo "- Admin user already exists\n";
}

// ── Demo Users ────────────────────────────────────────────────────────────────
$demo_users = [
    ['name' => 'John CEO',          'email' => 'ceo@magenta-investments.com',      'role' => 'ceo',             'department' => 'Executive'],
    ['name' => 'Sarah Dept Head',   'email' => 'depthead@magenta-investments.com', 'role' => 'department_head', 'department' => 'Operations'],
    ['name' => 'Mike Manager',      'email' => 'manager@magenta-investments.com',  'role' => 'manager',         'department' => 'Procurement'],
    ['name' => 'Alice Employee',    'email' => 'employee@magenta-investments.com', 'role' => 'employee',        'department' => 'Finance'],
];
foreach ($demo_users as $u) {
    if (!db()->users->findOne(['email' => $u['email']])) {
        db()->users->insertOne([
            '_id'        => new_id(),
            'name'       => $u['name'],
            'email'      => $u['email'],
            'password'   => hash_password('demo123'),
            'role'       => $u['role'],
            'department' => $u['department'],
            'is_active'  => 1,
            'created_at' => now_iso(),
        ]);
        echo "✓ Created {$u['role']}: {$u['email']}\n";
    }
}

// ── Default Company ───────────────────────────────────────────────────────────
$admin = db()->users->findOne(['email' => 'admin@magenta-investments.com']);
if ($admin && !db()->companies->findOne(['name' => 'Magenta Investments LLC'])) {
    db()->companies->insertOne([
        '_id'          => new_id(),
        'name'         => 'Magenta Investments LLC',
        'trade_name'   => 'Magenta Investments',
        'vat_number'   => '100234567890003',
        'address'      => 'Office 401, Tower A, Business Bay, Dubai, UAE',
        'phone'        => '+971 4 123 4567',
        'email'        => 'info@magenta-investments.com',
        'website'      => 'www.magenta-investments.com',
        'is_active'    => true,
        'created_at'   => now_iso(),
    ]);
    echo "✓ Company created: Magenta Investments LLC\n";
}

// ── MongoDB Indexes ───────────────────────────────────────────────────────────
db()->users->createIndex(['email' => 1], ['unique' => true]);
db()->vendors->createIndex(['email' => 1], ['unique' => true]);
db()->requests->createIndex(['status' => 1]);
db()->requests->createIndex(['requester_id' => 1]);
db()->tenders->createIndex(['status' => 1]);
db()->quotes->createIndex(['tender_id' => 1, 'vendor_id' => 1], ['unique' => true]);
echo "✓ Indexes created\n";

echo "\nSeed complete! Default passwords: admin123 (admin), demo123 (others)\n";
