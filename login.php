<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$email = $_POST["email"];
$password = $_POST["password"];

$db = new SQLite3('user.db');
$db->query('create table if not exists user(email varchar(255), password varchar(255), primary key(email))');
$queryResult = $db->querySingle("select password from user where email='$email';");
if ($queryResult) {
	$loginResult = password_verify($password, $queryResult);
	if ($loginResult) {
		printf("success");
	} else {
		printf("failure");
	}
} else {
	printf("failure");
}
$db->close();
?>

