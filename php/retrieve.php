<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$email = $_POST["email"];

$db = new SQLite3('../file.db');
$db->query('create table if not exists file(email varchar(255), fileName varchar(255), primary key(email, fileName))');
$queryResult = $db->query("select fileName from file where email='$email';");

while ($row = $queryResult->fetchArray()) {
	echo $row["fileName"] . ",";
}

$db->close();

?>

