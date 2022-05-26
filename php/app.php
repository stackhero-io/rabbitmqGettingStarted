<?php

// Load credentials from the ".env" file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$s3_bucket = $_ENV['S3_BUCKET'];

?>