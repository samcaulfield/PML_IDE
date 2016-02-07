projectName=$1
projectPath=/var/www/html/$projectName

if [ ! -f $projectPath/index.html ] ||
	[ ! -f $projectPath/check.php ] ||
	[ ! -f $projectPath/StyleSheet.css ] ||
	[ ! -d $projectPath/thirdparty/ ]; then
	echo "There is a problem with the installation. Run clean.sh and then try install.sh again.";
fi

