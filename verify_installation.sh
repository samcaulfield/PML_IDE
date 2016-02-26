#!/bin/bash

if [ $# -eq 0 ]; then
	echo "No arguments supplied."
	echo "Usage: $ verify_installation.sh <projectName>"
	exit 1
fi

projectName=$1
projectPath=/var/www/html/$projectName

if [ ! -f $projectPath/index.html ] ||
	[ ! -f $projectpath/menuStyle.css ] ||
	[ ! -f $projectpath/modalstyle.css ] ||
	[ ! -f $projectPath/StyleSheet.css ] ||
	[ ! -f $projectPath/check.php ] ||
	[ ! -f $projectPath/login.php ] ||
	[ ! -f $projectPath/register.php ] ||
	[ ! -f $projectPath/retrieve.php ] ||
	[ ! -f $projectPath/retrieveFile.php ] ||
	[ ! -f $projectPath/uploadFile.php ] ||
	[ ! -d $projectPath/thirdparty/ ]; then
	echo "There is a problem with the installation. Run clean.sh and then try install.sh again.";
	exit
fi

echo "Everything seems to be OK.";

