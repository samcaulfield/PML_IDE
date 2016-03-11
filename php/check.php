<?php
$temp = tempnam("/tmp", "PML_IDE");
file_put_contents($temp, $_POST["value"]);
echo shell_exec("../thirdparty/pmlcheck/pmlcheck $temp 2>&1");
?>

