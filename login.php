<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$email = $_POST["email"];
$password = $_POST["password"];

$db = new SQLite3('user.db');
$db->query('create table if not exists user(email varchar(255), password varchar(255), primary key(email))');
$queryResult = $db->querySingle("select * from user where email='$email' and password='$password';");
if ($queryResult) {
	printf("Logged in successfully!\n");
} else {
	printf("No account with those details exists.\n");
}
$db->close();
?>

