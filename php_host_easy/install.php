<?php
/**
 * One-click web installer
 * Visit http://yoursite.com/install.php once after uploading files.
 * DELETE this file after setup is complete.
 */

$step    = $_POST['step'] ?? 'check';
$errors  = [];
$success = [];

// ── Check requirements ────────────────────────────────────────────────────────
function checkReq(): array {
    $checks = [];
    $checks[] = ['PHP Version >= 8.1', version_compare(PHP_VERSION, '8.1.0', '>='), PHP_VERSION];
    $checks[] = ['ext-mongodb installed', extension_loaded('mongodb'), extension_loaded('mongodb') ? 'Yes' : 'Missing — install php-mongodb'];
    $checks[] = ['Composer autoload exists', file_exists(__DIR__ . '/vendor/autoload.php'), file_exists(__DIR__ . '/vendor/autoload.php') ? 'Yes' : 'Run: composer install'];
    $checks[] = ['uploads/ writable', is_writable(__DIR__ . '/uploads') || mkdir(__DIR__ . '/uploads', 0755, true), 'OK'];
    return $checks;
}

if ($step === 'seed' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $uri    = trim($_POST['mongo_uri'] ?? 'mongodb://localhost:27017');
    $db     = trim($_POST['mongo_db']  ?? 'purchase_approval');
    $secret = trim($_POST['jwt_secret'] ?? bin2hex(random_bytes(24)));

    // Write .env
    $env = "MONGO_URI=$uri\nMONGO_DB=$db\nJWT_SECRET=$secret\n";
    if (file_put_contents(__DIR__ . '/.env', $env) === false) {
        $errors[] = 'Cannot write .env file — check folder permissions';
    } else {
        $success[] = '.env file written';
        // Run seeder
        putenv("MONGO_URI=$uri"); putenv("MONGO_DB=$db"); putenv("JWT_SECRET=$secret");
        ob_start();
        try {
            require_once __DIR__ . '/includes/config.php';
            require_once __DIR__ . '/includes/auth.php';
            require_once __DIR__ . '/includes/seed.php';
            $seedOutput = ob_get_clean();
            $success[] = 'Database seeded successfully';
            $success[] = nl2br(htmlspecialchars($seedOutput));
            $step = 'done';
        } catch (Throwable $e) {
            ob_end_clean();
            $errors[] = 'Seed error: ' . htmlspecialchars($e->getMessage());
        }
    }
}

$checks = checkReq();
$allPassed = array_reduce($checks, fn($c, $i) => $c && $i[1], true);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ProcureFlow Installer</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:#f0fdfa;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
    .card{background:#fff;border-radius:1.25rem;box-shadow:0 8px 32px rgba(0,0,0,.1);width:100%;max-width:560px;overflow:hidden}
    .header{background:linear-gradient(135deg,#0d9488,#0f766e);color:#fff;padding:2rem;text-align:center}
    .header h1{font-size:1.5rem;font-weight:800}
    .header p{font-size:.85rem;opacity:.8;margin-top:.25rem}
    .body{padding:2rem}
    .check-row{display:flex;align-items:center;gap:.75rem;padding:.625rem .875rem;border-radius:.5rem;margin-bottom:.375rem;font-size:.875rem}
    .check-row.pass{background:#f0fdf4;color:#065f46}
    .check-row.fail{background:#fef2f2;color:#991b1b}
    .icon{font-size:1.1rem;flex-shrink:0}
    label{display:block;font-size:.8rem;font-weight:600;color:#334155;margin-bottom:.375rem;margin-top:1rem}
    input{width:100%;border:1px solid #e2e8f0;border-radius:.5rem;padding:.625rem .875rem;font-size:.875rem;font-family:inherit}
    input:focus{outline:none;border-color:#0d9488;box-shadow:0 0 0 3px rgba(13,148,136,.12)}
    .btn{display:block;width:100%;padding:.75rem;border-radius:.625rem;font-size:.9rem;font-weight:700;cursor:pointer;border:none;margin-top:1.25rem;color:#fff;background:#0d9488;font-family:inherit}
    .btn:hover{background:#0f766e}
    .btn:disabled{opacity:.5;cursor:not-allowed}
    .alert{padding:.875rem;border-radius:.625rem;margin-top:.75rem;font-size:.875rem}
    .alert-error{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca}
    .alert-success{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0}
    .done-box{text-align:center;padding:1.5rem 0}
    .done-box .emoji{font-size:3.5rem;margin-bottom:.75rem}
    .done-box h2{font-size:1.2rem;font-weight:800;margin-bottom:.5rem}
    .cred-table{width:100%;border-collapse:collapse;margin-top:1rem;font-size:.8rem}
    .cred-table td{padding:.5rem .75rem;border-bottom:1px solid #f1f5f9}
    .cred-table td:first-child{font-weight:600;color:#64748b;width:40%}
  </style>
</head>
<body>
<div class="card">
  <div class="header">
    <div style="font-size:2.5rem;margin-bottom:.5rem">🛒</div>
    <h1>ProcureFlow Installer</h1>
    <p>Purchase Approval System — PHP + MongoDB</p>
  </div>
  <div class="body">

    <?php if ($step === 'done'): ?>
    <div class="done-box">
      <div class="emoji">🎉</div>
      <h2>Installation Complete!</h2>
      <p style="color:#64748b;font-size:.875rem">Your system is ready to use.</p>
      <table class="cred-table">
        <tr><td>URL</td><td><a href="index.html" style="color:#0d9488">index.html</a></td></tr>
        <tr><td>Admin Email</td><td>admin@company.com</td></tr>
        <tr><td>Admin Password</td><td>admin123</td></tr>
        <tr><td>Demo Password</td><td>demo123 (for other users)</td></tr>
      </table>
      <?php foreach ($success as $s): ?>
        <div class="alert alert-success" style="text-align:left;margin-top:.5rem"><?= $s ?></div>
      <?php endforeach; ?>
      <div class="alert alert-error" style="margin-top:1.25rem;text-align:left">
        ⚠️ <strong>Security:</strong> Delete <code>install.php</code> from your server after setup!
      </div>
    </div>

    <?php else: ?>

    <h3 style="font-weight:700;font-size:.95rem;margin-bottom:.75rem">System Requirements</h3>
    <?php foreach ($checks as [$label, $pass, $detail]): ?>
      <div class="check-row <?= $pass ? 'pass' : 'fail' ?>">
        <span class="icon"><?= $pass ? '✅' : '❌' ?></span>
        <div style="flex:1"><strong><?= htmlspecialchars($label) ?></strong></div>
        <span style="font-size:.75rem;opacity:.8"><?= htmlspecialchars((string)$detail) ?></span>
      </div>
    <?php endforeach; ?>

    <?php foreach ($errors as $e): ?>
      <div class="alert alert-error"><?= $e ?></div>
    <?php endforeach; ?>

    <?php if ($allPassed): ?>
    <form method="POST">
      <input type="hidden" name="step" value="seed" />
      <label>MongoDB URI</label>
      <input name="mongo_uri" value="mongodb://localhost:27017" placeholder="mongodb://localhost:27017" required />
      <label>Database Name</label>
      <input name="mongo_db" value="purchase_approval" placeholder="purchase_approval" required />
      <label>JWT Secret Key</label>
      <input name="jwt_secret" value="<?= htmlspecialchars(bin2hex(random_bytes(24))) ?>" required />
      <button type="submit" class="btn">🚀 Install &amp; Seed Database</button>
    </form>
    <?php else: ?>
      <p style="color:#b91c1c;font-size:.85rem;margin-top:1rem">Fix the failing requirements above, then refresh this page.</p>
    <?php endif; ?>

    <?php endif; ?>
  </div>
</div>
</body>
</html>
