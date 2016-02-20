<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$email = $_POST["email"];
$fileName = $_POST["fileName"];

echo file_get_contents("userdata/$email/$fileName");

?>

