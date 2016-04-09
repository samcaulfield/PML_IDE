ServerPath=/var/www/html
ProjectPath=$(ServerPath)/$(ProjectName)

all:
	@echo "Nothing to build. Run make install to install the application.";

clean:
ifndef ProjectName
	$(error ProjectName is not set)
endif
	sudo rm -rf $(ProjectPath)

install: install-deps
ifndef ProjectName
	$(error ProjectName is not set)
endif
	@echo "Installing application to $(ServerPath)/$(ProjectName)"
	sudo mkdir $(ProjectPath)
	sudo cp index.html $(ProjectPath)
	sudo cp -R js $(ProjectPath)
	sudo cp -R js $(ProjectPath)
	sudo cp -R php $(ProjectPath)
	sudo cp -R thirdparty $(ProjectPath)
	sudo touch $(ProjectPath)/user.db
	sudo mkdir $(ProjectPath)/userdata
	sudo mkdir $(ProjectPath)/images
	sudo chown -R www-data $(ProjectPath)

install-deps:
	if [ ! -x pmlcheck ]; then \
		git clone https://github.com/jnoll/peos.git; \
		sudo apt-get install tcl tcl-dev check expect libxml2 bison \
		flex libreadline6-dev libncurses-dev; \
		sudo apt-get install python-pip; \
		sudo pip install selenium; \
		if [ -d peos ]; then \
			cd peos/pml/ && make && cp check/pmlcheck \
			../../thirdparty/pmlcheck/pmlcheck && cd ../..; \
		fi; \
		cp peos/pml/graph/traverse thirdparty/traverse; \
	fi; \
	sudo apt-get install apache2 php5 php5-sqlite

smoke-test:
ifndef ProjectName
	$(error ProjectName is not set)
endif
	@if [ ! -f $(ProjectPath)/index.html ] || \
	[ ! -f $(ProjectPath)/user.db ] || \
	[ ! -f $(ProjectPath)/php/check.php ] || \
	[ ! -f $(ProjectPath)/php/login.php ] || \
	[ ! -f $(ProjectPath)/php/register.php ] || \
	[ ! -f $(ProjectPath)/php/retrieve.php ] || \
	[ ! -f $(ProjectPath)/php/retrieveFile.php ] || \
	[ ! -f $(ProjectPath)/php/uploadFile.php ] || \
	[ ! -f $(ProjectPath)/js/script.js ] || \
	[ ! -d $(ProjectPath)/userdata/ ] || \
	[ ! -d $(ProjectPath)/thirdparty/ ]; then \
		echo "Smoke test failed."; \
		echo "PML Studio was not installed correctly."; \
	else \
		echo "Smoke test passed."; \
	fi;
test:
ifndef ProjectName
	$(error ProjectName is not set)
endif
	echo  "$(ProjectName)" > ./Test/property
	cd ./Test && \
	./test.sh && \
	cd ..
