<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$userEmailAddress = $_POST['email'];
$uploadFileName = $_POST['fileName'];

/* Create entry in db. */
$db = new SQLite3('../file.db');
$db->query('create table if not exists file(email varchar(255), fileName varchar(255), primary key(email, fileName))');
$queryResult = $db->querySingle("insert into file(email, fileName) values('$userEmailAddress', '$uploadFileName');");
$db->close();

/* Save string as file to disk. */
if(is_dir("../userdata/$userEmailAddress") === false) {
    mkdir("../userdata/$userEmailAddress");
}
file_put_contents("../userdata/$userEmailAddress/$uploadFileName", $_POST['fileContents']);
?>

