if [ ! -f /var/www/html/index.html ] ||
	[ ! -f /var/www/html/check.php ] ||
	[ ! -f /var/www/html/StyleSheet.css ] ||
	[ ! -d /var/www/html/thirdparty/ ]; then
	echo "There is a problem with the installation. Run clean.sh and then try install.sh again.";
fi

