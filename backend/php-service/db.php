<?php
// Reads its own flavour of config: MYSQL_HOST / MYSQL_USER / MYSQL_PASS / MYSQL_DATABASE.
function db_connect(): mysqli
{
    mysqli_report(MYSQLI_REPORT_OFF);
    $conn = mysqli_init();
    $conn->options(MYSQLI_OPT_CONNECT_TIMEOUT, 3);
    $ok = @$conn->real_connect(
        getenv('MYSQL_HOST'),
        getenv('MYSQL_USER'),
        getenv('MYSQL_PASS'),
        getenv('MYSQL_DATABASE')
    );
    if (!$ok) {
        throw new RuntimeException('db connect failed');
    }
    return $conn;
}
