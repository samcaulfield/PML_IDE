<?php
$temp = tempnam("/tmp", "cs4098");
file_put_contents($temp, $_POST["value"]);
echo shell_exec("/var/www/html/thirdparty/pmlcheck/pmlcheck $temp");
?>

