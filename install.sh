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
# CSS.
cp menuStyle.css $projectPath
cp modalStyle.css $projectPath
cp StyleSheet.css $projectPath
# JS.
cp script.js $projectPath
# PHP.
cp check.php $projectPath
cp login.php $projectPath
cp register.php $projectPath
cp uploadFile.php $projectPath
cp retrieve.php $projectPath
cp retrieveFile.php $projectPath
# Other.
cp -R thirdparty/ $projectPath

# Create the database.
touch $projectPath/user.db
mkdir $projectPath/userdata
# Make it writeable to the server's PHP scripts (all users).
chmod a+w $projectPath/user.db
chmod a+w $projectPath/userdata
chmod +777 $projectPath

