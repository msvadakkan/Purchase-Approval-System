<?php
declare(strict_types=1);

// Allow PHP built-in server to serve uploaded files directly
if (PHP_SAPI === 'cli-server') {
    $file = __DIR__ . $_SERVER['REQUEST_URI'];
    $file = strtok($file, '?');
    if (is_file($file)) return false;
}

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');

// Bootstrap
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/src/helpers.php';
require_once __DIR__ . '/src/DB.php';
require_once __DIR__ . '/src/JWT.php';
require_once __DIR__ . '/src/Middleware.php';
require_once __DIR__ . '/src/Controllers/AuthController.php';
require_once __DIR__ . '/src/Controllers/UserController.php';
require_once __DIR__ . '/src/Controllers/RequestController.php';
require_once __DIR__ . '/src/Controllers/AdminController.php';
require_once __DIR__ . '/src/Controllers/VendorController.php';
require_once __DIR__ . '/src/Controllers/TenderController.php';

// Parse URL
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = preg_replace('/^\/api/', '', $uri);
$uri    = trim($uri, '/');
$parts  = $uri !== '' ? explode('/', $uri) : [];
$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];

$r  = $parts[0] ?? '';
$p1 = $parts[1] ?? null;
$p2 = $parts[2] ?? null;

try {
    switch ($r) {
        case 'health':
            respond(['status' => 'ok', 'timestamp' => date('c')]);

        // ── Serve uploaded vendor documents ─────────────────────
        case 'uploads':
            $filePath = __DIR__ . '/' . implode('/', array_map('rawurldecode', $parts));
            if (is_file($filePath)) {
                $mime = mime_content_type($filePath) ?: 'application/octet-stream';
                header('Content-Type: ' . $mime);
                header('Content-Disposition: inline');
                readfile($filePath);
                exit;
            }
            respond(['error' => 'File not found'], 404);

        // ── Auth ────────────────────────────────────────────────
        case 'auth':
            if ($p1 === 'login' && $method === 'POST') AuthController::login($body);
            respond(['error' => 'Not found'], 404);

        // ── Internal Users ──────────────────────────────────────
        case 'users':
            if ($p1 === null) {
                if ($method === 'GET')  UserController::index();
                if ($method === 'POST') UserController::store($body);
            } else {
                if ($method === 'PUT')    UserController::update($p1, $body);
                if ($method === 'DELETE') UserController::destroy($p1);
            }
            break;

        // ── Purchase Requests ───────────────────────────────────
        case 'requests':
            if ($p1 === null) {
                if ($method === 'GET')  RequestController::index();
                if ($method === 'POST') RequestController::store($body);
            } elseif ($p1 === 'pending') {
                RequestController::pending();
            } elseif ($p2 !== null) {
                match ($p2) {
                    'approve' => RequestController::approve($p1, $body),
                    'reject'  => RequestController::reject($p1, $body),
                    'cancel'  => RequestController::cancel($p1),
                    default   => respond(['error' => 'Not found'], 404),
                };
            } else {
                if ($method === 'GET') RequestController::show($p1);
            }
            break;

        // ── Admin ───────────────────────────────────────────────
        case 'admin':
            match ($p1) {
                'approval-levels' => $method === 'GET'
                    ? AdminController::getLevels()
                    : AdminController::updateLevels($body),
                'stats'           => AdminController::stats(),
                default           => respond(['error' => 'Not found'], 404),
            };
            break;

        // ── Vendors ─────────────────────────────────────────────
        case 'vendors':
            if ($p1 === null) {
                if ($method === 'GET')  VendorController::index();
                if ($method === 'POST') VendorController::store(); // multipart
            } elseif ($p1 === 'login') {
                VendorController::login($body);
            } elseif ($p2 === 'approve' && $method === 'POST') {
                VendorController::approve($p1);
            } else {
                if ($method === 'GET')  VendorController::show($p1);
                if ($method === 'PUT')  VendorController::update($p1, $body);
            }
            break;

        // ── Tenders / Requirements ──────────────────────────────
        case 'tenders':
            if ($p1 === null) {
                if ($method === 'GET')  TenderController::index();
                if ($method === 'POST') TenderController::store($body);
            } elseif ($p2 !== null) {
                match ($p2) {
                    'quote'      => TenderController::submitQuote($p1, $body),
                    'quotes'     => TenderController::getQuotes($p1),
                    'comparison' => TenderController::comparison($p1),
                    default      => respond(['error' => 'Not found'], 404),
                };
            } else {
                if ($method === 'GET') TenderController::show($p1);
                if ($method === 'PUT') TenderController::update($p1, $body);
            }
            break;

        default:
            respond(['error' => 'Not found'], 404);
    }
} catch (\MongoDB\Driver\Exception\Exception $e) {
    respond(['error' => 'Database error: ' . $e->getMessage()], 500);
} catch (\Throwable $e) {
    respond(['error' => $e->getMessage()], 500);
}
