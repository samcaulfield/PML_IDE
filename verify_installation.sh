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
	[ ! -f $projectPath/php/check.php ] ||
	[ ! -f $projectPath/php/login.php ] ||
	[ ! -f $projectPath/php/register.php ] ||
	[ ! -f $projectPath/php/retrieve.php ] ||
	[ ! -f $projectPath/php/retrieveFile.php ] ||
	[ ! -f $projectPath/php/uploadFile.php ] ||
	[ ! -f $projectPath/script.js ] ||
	[ ! -d $projectPath/userdata/ ] ||
	[ ! -d $projectPath/thirdparty/ ]; then

	echo "\
There is a problem with the installation. Try reinstalling the program.";
	exit 1
fi

echo "Everything seems to be OK.";

