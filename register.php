<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$email = $_POST["email"];
$password = $_POST["password"];

$hashAndSalt = password_hash($password, PASSWORD_BCRYPT);

$db = new SQLite3('user.db');
$db->query('create table if not exists user(email varchar(255), password varchar(255), primary key(email))');
$queryResult = $db->querySingle("select * from user where email='$email';");
if ($queryResult) {
	printf("failure");
} else {
	$db->query("insert into user(email, password) values('$email', '$hashAndSalt');");
	printf("success", $email);
}
$db->close();
?>

