<?php
/**
 * Database seeder — seeds structure only (approval levels, indexes, company).
 * Admin user is created by the install wizard (install.php).
 * Run via: php includes/seed.php  OR called by install.php
 */
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth.php';

echo "Seeding database...\n";

// ── Approval Levels ───────────────────────────────────────────────────────────
$levels = [
    ['role' => 'manager',         'label' => 'Manager',         'max_amount' => 5000],
    ['role' => 'department_head', 'label' => 'Department Head', 'max_amount' => 25000],
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

// ── Default Company ───────────────────────────────────────────────────────────
if (!db()->companies->findOne(['name' => 'Magenta Investments LLC'])) {
    db()->companies->insertOne([
        '_id'        => new_id(),
        'name'       => 'Magenta Investments LLC',
        'trade_name' => 'Magenta Investments',
        'vat_number' => '100234567890003',
        'address'    => '4903 Aspin Commercial Tower, Sheikh Zayed Road, P.O. Box 33233, Dubai, UAE',
        'phone'      => '+971 4 222 2500',
        'email'      => 'info@magenta-investments.com',
        'website'    => 'magenta-investments.com',
        'is_active'  => true,
        'created_at' => now_iso(),
    ]);
    echo "✓ Company created: Magenta Investments LLC\n";
} else {
    echo "- Company already exists\n";
}

// ── MongoDB Indexes ───────────────────────────────────────────────────────────
db()->users->createIndex(['email' => 1], ['unique' => true]);
db()->vendors->createIndex(['email' => 1], ['unique' => true]);
db()->requests->createIndex(['status' => 1]);
db()->requests->createIndex(['requester_id' => 1]);
db()->tenders->createIndex(['status' => 1, 'department' => 1]);
db()->quotes->createIndex(['tender_id' => 1, 'vendor_id' => 1], ['unique' => true]);
echo "✓ Indexes created\n";

echo "\nSeed complete!\n";
