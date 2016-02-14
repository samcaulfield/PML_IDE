#!/bin/bash

if [ $# -eq 0 ]; then
	echo "No arguments supplied."
	echo "Usage: # install.sh <projectName>"
	exit 1
fi

if [[ $EUID -ne 0 ]]; then
	echo "This script must be run as root."
	exit 1
fi

projectName=$1
projectPath=/var/www/html/$projectName

mkdir $projectPath
# HTML.
cp index.html $projectPath
cp login.html $projectPath
cp register.html $projectPath
# CSS.
cp login_style.css $projectPath
cp StyleSheet.css $projectPath
# PHP.
cp check.php $projectPath
cp login.php $projectPath
cp register.php $projectPath
# Other.
cp -R thirdparty/ $projectPath

# Create the database.
touch $projectPath/user.db
# Make it writeable to the server's PHP scripts (all users).
chmod a+w $projectPath/user.db
chmod +777 $projectPath

