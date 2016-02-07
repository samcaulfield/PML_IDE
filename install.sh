projectName=$1
projectPath=/var/www/html/$projectName

mkdir $projectPath
cp index.html $projectPath
cp StyleSheet.css $projectPath
cp check.php $projectPath
cp -R thirdparty/ $projectPath

