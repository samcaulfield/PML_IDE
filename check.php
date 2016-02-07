<?php
$temp = tempnam("/tmp", "PML_IDE");
file_put_contents($temp, $_POST["value"]);
echo shell_exec("/var/www/html/thirdparty/pmlcheck/pmlcheck $temp");
?>

