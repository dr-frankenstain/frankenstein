<?php
ini_set('display_errors', '0');
require __DIR__ . '/db.php';

header('Content-Type: application/json');

function respond(int $code, array $body): void
{
    http_response_code($code);
    echo json_encode($body);
    exit;
}

$expected = (string) getenv('API_KEY');
$given = $_SERVER['HTTP_X_API_KEY'] ?? '';
if ($expected === '' || !hash_equals($expected, $given)) {
    respond(401, ['status' => 'error', 'detail' => 'bad api key']);
}

try {
    $conn = db_connect();
    if (!$conn->query('SELECT 1')) {
        throw new RuntimeException('query failed');
    }
    $conn->close();
} catch (RuntimeException $e) {
    respond(503, ['status' => 'error', 'detail' => 'db unavailable']);
}
respond(200, ['status' => 'ok', 'db' => 'ok']);
