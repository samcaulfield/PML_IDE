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
cp index.html $projectPath
cp login.html $projectPath
cp register.html $projectPath
cp StyleSheet.css $projectPath
cp login_style.css $projectPath
cp check.php $projectPath
cp register.php $projectPath
cp -R thirdparty/ $projectPath

# Create the database.
touch $projectPath/user.db
# Make it writeable to the server's PHP scripts (all users).
chmod a+w $projectPath/user.db

chmod +777 $projectPath

