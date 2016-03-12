#!/bin/bash

if [ $# -eq 0 ]; then
	echo "No arguments supplied."
	echo "Usage: # install.sh <projectName>"
	exit 1
fi

projectName=$1
projectPath=/var/www/html/$projectName

if [ -d $projectPath ]; then
	echo "Error. The project directory already exists at $projectPath"
	echo ""
	echo "\
Are you reinstalling? If so, remove the current installation using clean.sh\
then try again."
	exit 1
fi

sudo mkdir $projectPath
# HTML.
sudo cp index.html $projectPath
# JS.
sudo cp -R js $projectPath
# PHP.
sudo cp -R php $projectPath
# Other.
sudo cp -R thirdparty $projectPath

# Create the database.
sudo touch $projectPath/user.db
sudo mkdir $projectPath/userdata
# Make it writeable to the server's PHP scripts.
sudo chown -R www-data $projectPath

