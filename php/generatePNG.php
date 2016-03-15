<?php
// Put the PML into a temp file.
$pmlTempFile = tempnam("/tmp", "PML_IDE");
file_put_contents($pmlTempFile, $_POST["value"]);

// Generate the graphviz file.
$graphvizTempFile = tempnam("/tmp", "pml-studio");
file_put_contents($graphvizTempFile, shell_exec("../thirdparty/traverse/traverse $pmlTempFile"));

// Generate the image.
$pngTempFile = tempnam("../images", "pml-studio");
file_put_contents($pngTempFile, shell_exec("dot -Tpng $graphvizTempFile"));

// Make it accessible.
chmod($pngTempFile, 0755);

// Return the relative file name of the image.
echo "images/" . basename($pngTempFile);?>
