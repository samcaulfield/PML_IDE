var editor = ace.edit("textEditor");
editor.getSession().setMode("ace/mode/c_cpp");
editor.getSession().setTabSize(8);
editor.getSession().setUseSoftTabs(false);
editor.setKeyboardHandler("ace/keyboard/vim");
editor.setBehavioursEnabled(false);
editor.focus();

window.onload = function() {
	document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
	document.getElementById("fileInput").addEventListener("change", readFile, false);
	$(function() {
		$("#openFileInput").on('click', function(e) {
			e.preventDefault();
			$("#fileInput:hidden").trigger('click');
		});
	});
}

//
//
//
function attemptLogin(emailAddress, password) {
	alert('Attempting login');
	var attempt = login(emailAddress, password);
	if (attempt) {
		$('#signInModal').modal('hide');
	} else {
	}
}

function attemptOpenFromServer() {
	if (isLoggedIn()) {
	} else {
		$('#signInModal').modal('show');
	}
}

function attemptRegister(emailAddress, password) {

}

//
// Populate the editor's gutter with warnings and errors returned by pmlcheck.
//
function error_annot() {
	var arrayOfAnnos = [];
	$.post(
		"check.php",
		{value: editor.getSession().getValue()},
		function(data, status) {
			var arrr = data.split("/tmp/");
			for(var i=1; i< arrr.length; i++) {
				var start_pos = arrr[i].indexOf(':') + 1;
				var end_pos = arrr[i].indexOf(':',start_pos);
				var text_to_get = arrr[i].substring(start_pos,end_pos)
				var error_text = arrr[i].split(":").pop().split(";").shift();
				var arrStr = arrr[i].split(/[:]/);
				var error_words_arr = error_text.split(" ");
				var type = "warning";
				if(error_words_arr[2] == "error") {
					type = "error";
				}
				var gutterAnno = {
					row: text_to_get-1,	
					column: 10,
					text: error_text,
					type: type
				}
				arrayOfAnnos.push(gutterAnno);
			}
			editor.getSession().setAnnotations(arrayOfAnnos);
		}
	);
}

//
/* Taken from http://www.sitepoint.com/how-to-deal-with-cookies-in-javascript/ */
//
function getCookie(name) {
	var regexp = new RegExp("(?:^" + name + "|;\s*"+ name + ")=(.*?)(?:;|$)", "g");
	var result = regexp.exec(document.cookie);
	return (result === null) ? null : result[1];
}

//
//
//
function isLoggedIn() {
	if (getCookie('username')) {
		return true;
	} else {
		return false;
	}
}

//
//
//
function login(emailAddress, password) {
	alert('Logging in');
	$.post('login.php', {email: emailAddress, password: password},
		function(response) {
			// Remove the NULL-terminator.
			var trimmedResponse =
				response.substring(0, response.length - 1);
			if (trimmedResponse == "success") {
				alert('Login success!');
				// Set the login cookie.
				// XXX Append instead of replace.
				document.cookie =
					'username=' + emailAddress + ';path=/;';
				return true;
			} else {
				alert('Login failed!');
				return false;
			}
		}
	);
}

//
// Opens Ace's settings menu.
//
function openAceMenu() {
	editor.execCommand('showSettingsMenu');
}

//
//
//
function promptToSave() {
	download(editor.getValue(), 'file.pml', 'text/plain');
}

//
//
//
function readFile(evt) {
	var files = evt.target.files;
	if (files) {
		var file = files[0]; // Only consider the first file.
		var reader = new FileReader();
		reader.onload = (
			function (file) {
				return function (e) {
					editor.setValue(e.target.result);
				};
			}
		)(file);
		reader.readAsText(file);
	} else {
		alert('No file!');
	}
}


//
// Register the email address without any form of verification.
//
function register(emailAddress, password) {
	$.post('register.php', {email: emailAddress, password: password},
		function(response) {
			// Remove the NULL-terminator.
			var trimmedResponse =
				response.substring(0, response.length - 1);
			if (trimmedResponse == "success") {
				alert('register success!');
				// Set the login cookie.
				// XXX Append instead of replace.
				document.cookie =
					'username=' + emailAddress + ';path=/;';
				return true;
			} else {
				alert('register failed!');
				return false;
			}

		}
	);
}

