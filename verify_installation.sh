#!/bin/bash

if [ $# -eq 0 ]; then
	echo "No arguments supplied."
	echo "Usage: verify_installation.sh <project name>"
	exit 1
fi

projectName=$1
projectPath=/var/www/html/$projectName

if [ ! -f $projectPath/index.html ] ||
	[ ! -f $projectPath/user.db ] ||
	[ ! -f $projectPath/menuStyle.css ] ||
	[ ! -f $projectPath/modalStyle.css ] ||
	[ ! -f $projectPath/StyleSheet.css ] ||
	[ ! -f $projectPath/check.php ] ||
	[ ! -f $projectPath/login.php ] ||
	[ ! -f $projectPath/register.php ] ||
	[ ! -f $projectPath/retrieve.php ] ||
	[ ! -f $projectPath/retrieveFile.php ] ||
	[ ! -f $projectPath/uploadFile.php ] ||
	[ ! -f $projectPath/script.js ] ||
	[ ! -d $projectPath/userdata/ ] ||
	[ ! -d $projectPath/thirdparty/ ]; then

	echo "\
There is a problem with the installation. Try reinstalling the program.";
	exit 1
fi

echo "Everything seems to be OK.";

