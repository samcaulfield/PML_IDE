#!/bin/bash

# Install pmlcheck if it's not already in the path.
if [ ! -x pmlcheck ]; then
	git clone https://github.com/jnoll/peos.git
	# Install peos dependencies.
	sudo apt-get install tcl tcl-dev check expect libxml2 bison flex
	if [ -d peos ]; then
		cd peos/pml/ && make && cp check/pmlcheck ../../thirdparty/pmlcheck/pmlcheck
	fi
fi

# Install the backend dependencies.
sudo apt-get install apache2 php5 php5-sqlite

