var editor = ace.edit("textEditor");
editor.getSession().setMode("ace/mode/c_cpp");
editor.getSession().setTabSize(8);
editor.getSession().setUseSoftTabs(false);
editor.setKeyboardHandler("ace/keyboard/vim");
editor.setBehavioursEnabled(false);
editor.focus();
editor.setFontSize('12px');

window.onload = function() {
	// XXX
	document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";

	document.getElementById("fileInput").addEventListener("change", readFile, false);

	// A link is used to trigger the file input because IMO the link style
	// looks better than the file input button and I'd rather do this
	// than figure out how to style the button exactly like the rest of the
	// links.
	$("#openFileInput").on('click', function(e) {
		e.preventDefault();
		$("#fileInput:hidden").trigger('click');
	});

	$('#signInForm').on('submit', function(e) {
		e.preventDefault(); // This prevents unnecessary page reload.
		attemptLogin(document.getElementById('signInInputEmail').value,
			document.getElementById('signInInputPassword').value);
	});

	$('#registerForm').on('submit', function(e) {
		e.preventDefault(); // This prevents unnecessary page reload.
		attemptRegister(document.getElementById('registerInputEmail').value,
			document.getElementById('registerInputPassword').value);
	});

	$('#fileSaveForm').on('submit', function(e) {
		e.preventDefault(); // This prevents unnecessary page reload.
		$.ajax({
			type: 'POST',
			url: 'uploadFile.php',
			data: {email: getCookie('username'),
				fileName: document.getElementById('fileSaveNameInput').value,
				fileContents: editor.getValue()},
			success: function(response) {
			},
			dataType: 'text',
			async: false
		});
		$('#fileSaveToServerModal').modal('hide');
	});
}

//
//
//
function attemptLogin(emailAddress, password) {
	var attempt = login(emailAddress, password);
	if (attempt) {
		$('#signInModal').modal('hide');
		signInCommon();
	} else {
		alert('Sign in failed!');
	}
}


function retrieveFile(fileName) {
	$.ajax({
		type: 'POST',
		url: 'retrieveFile.php',
		data: {email: getCookie('username'), fileName: fileName},
		success: function(response) {
			editor.setValue(response);
		},
		dataType: 'text',
		async: false
	});
	$('#fileOpenFromServerModal').modal('hide');
}

function attemptOpenFromServer() {
	if (isLoggedIn()) {
		// Generate the inner HTML of the form.
		$.ajax({
			type: 'POST',
			url: 'retrieve.php',
			data: {email: getCookie('username')},
			success: function(response) {
				var resultList = response.split(',');
				document.getElementById('fileOpenForm').innerHTML = '';
				for (var i = 0; i < resultList.length - 1; i++) {
					document.getElementById('fileOpenForm').innerHTML =
						document.getElementById('fileOpenForm').
							innerHTML.concat('<button class="btn btn-default" type="button" onclick="retrieveFile(\'' + resultList[i] + '\')">' + resultList[i] + "</button></br>");
				}
				if (resultList.length == 1) {
					document.getElementById('fileOpenForm').innerHTML =
						document.getElementById('fileOpenForm').innerHTML.concat("<p>No files to open</p>");
				}
			},
			dataType: 'text',
			async: false
		});
		$('#fileOpenFromServerModal').modal('show');
	} else {
		$('#signInModal').modal('show');
	}
}

//
//
//
function attemptRegister(emailAddress, password) {
	var registerAttempt = register(emailAddress, password);
	if (registerAttempt) {
		$('#registerModal').modal('hide');
		signInCommon();
	} else {
		alert('Registration failed!');
	}
}

//
//
//
function attemptSaveToServer() {
	if (isLoggedIn()) {
		$('#fileSaveToServerModal').modal('show');
	} else {
		$('#signInModal').modal('show');
	}
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
// Taken from http://www.sitepoint.com/how-to-deal-with-cookies-in-javascript/
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
	var success = false;
	$.ajax({
		type: 'POST',
		url: 'login.php',
		data: {email: emailAddress, password: password},
		success: function(response) {
			// Remove the NULL-terminator.
			var trimmedResponse =
				response.substring(0, response.length - 1);
			if (trimmedResponse == "success") {
				// Set the login cookie.
				// XXX Append instead of replace.
				document.cookie =
					'username=' + emailAddress + ';path=/;';
				success = true;
			}
		},
		dataType: 'text',
		async: false
	});
	return success;
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
	}
}


//
// Register the email address without any form of verification.
//
function register(emailAddress, password) {
	var success = false;
	$.ajax({
		type: 'POST',
		url: 'register.php',
		data: {email: emailAddress, password: password},
		success: function(response) {
			// Remove the NULL-terminator.
			var trimmedResponse =
				response.substring(0, response.length - 1);
			if (trimmedResponse == "success") {
				// Set the login cookie.
				// XXX Append instead of replace.
				document.cookie =
					'username=' + emailAddress + ';path=/;';
				success = true;
			} else {
				success = false;
			}

		},
		dataType: 'text',
		async: false
	});
	return success;
}

//
// Performs UI updates for sign in.
//
function signInCommon() {
	document.getElementById('signInInfo').innerHTML =
		'Account (' + getCookie('username') + ') <span class="caret"></span>';
	document.getElementById('signInButtonList').className = 'disabled';
	$('#signInLink').prop('disabled', true);
	document.getElementById('signOutButtonList').className = '';
	$('#signOutLink').prop('disabled', false);
}

//
// Signs out the user by deleting the username cookie and resetting the UI.
//
function signOut() {
	document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
	document.getElementById('signInInfo').innerHTML =
		'Account (Not signed in) <span class="caret"></span>';
	document.getElementById('signInButtonList').className = '';
	$('#signInLink').prop('disabled', false);
	document.getElementById('signOutButtonList').className = 'disabled';
	$('#signOutLink').prop('disabled', true);
}

