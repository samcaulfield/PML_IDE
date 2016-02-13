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
cp StyleSheet.css $projectPath
cp login_style.css $projectPath
cp check.php $projectPath
cp -R thirdparty/ $projectPath

