<?php
// Put the PML into a temp file.
$pmlTempFile = tempnam("/tmp", "PML_IDE");
file_put_contents($pmlTempFile, $_POST["value"]);

// Return the DOT data.
$graphvizTempFile = tempnam("/tmp", "pml-studio");
echo shell_exec("../thirdparty/simpleTraverse/simpletraverse $pmlTempFile 2>&1");
?>
