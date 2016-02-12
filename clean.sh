#!/bin/bash

if [ $# -eq 0 ]; then
	echo "No arguments supplied."
	echo "Usage: # clean.sh <projectName>"
	exit 1
fi

if [[ $EUID -ne 0 ]]; then
	echo "This script must be run as root."
	exit 1
fi



projectName=$1
projectPath=/var/www/html/$projectName

rm -rf $projectPath

