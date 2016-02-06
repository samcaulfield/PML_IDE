<?php
$temp = tmpfile() or die ("Unable to open temp file!");
fwrite($temp, $_POST["value"]);
fseek($temp, 0);

echo shell_exec("./pmlcheck $temp 2>&1") or die("SHELL_EXEC ERROR!");

fclose($temp);
?>

