var editor = ace.edit("textEditor");
editor.getSession().setUseWorker(false);
editor.setTheme("ace/theme/chrome");
editor.getSession().setMode("ace/mode/pml");
editor.getSession().setTabSize(8);
editor.getSession().setUseSoftTabs(false);
editor.focus();
editor.setFontSize('14px');
autoComplete(editor);

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
			url: 'php/uploadFile.php',
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

function attemptOpenFromServer() {
	if (isLoggedIn()) {
		// Generate the inner HTML of the form.
		$.ajax({
			type: 'POST',
			url: 'php/retrieve.php',
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
						document.getElementById('fileOpenForm').innerHTML.concat("<p>There are no files saved on your account.</p>");
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
	if (registerAttempt == "success") {
		$('#registerModal').modal('hide');
		signInCommon();
	} else if (registerAttempt == "failure-registered") {
		alert('That email is already registered!');
	} else if (registerAttempt == "failure") {
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

function autoComplete(editor)
{
	//For code completion
	//Takes advantage of the open source library; ajaxorg.github.io
	//Tell the editor to use it's autocompletion function
	editor.setOptions({
		enableBasicAutocompletion: true,
		enableSnippets: true,
		enableLiveAutocompletion: false
	});
	//PML keywords. Score (equal) given to likihood of being used.
	editor.completers.push({
	getCompletions: function (editor, session, pos, prefix, callback){
		callback(null, [
			{value: "process", score: 1000, meta: "keyword"},
			{value: "action", score: 1000, meta: "keyword"},
			{value: "branch", score: 1000, meta: "keyword"},
			{value: "requires", score: 1000, meta: "keyword"},
			{value: "provides", score: 1000, meta: "keyword"},
			{value: "selection", score: 1000, meta: "keyword"},
			{value: "agent", score: 1000, meta: "keyword"},
			{value: "script", score: 1000, meta: "keyword"},
			{value: "iteration", score: 1000, meta: "keyword"},
			{value: "sequence", score: 1000, meta: "keyword"}
		]);
	}});
	//Make sure the Autocompletion is called when user is typing
	editor.commands.on("afterExec", function(e) {
		if(e.command.name == "insertstring"&&/^[\w.]$/.test(e.args)) {
			editor.execCommand("startAutocomplete");
		}
	});
}

//
// Populate the editor's gutter with warnings and errors returned by pmlcheck.
//
function error_annot() {
	var arrayOfAnnos = [];
	$.post(
		"php/check.php",
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
// http://stackoverflow.com/questions/10730362/get-cookie-by-name
//
function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
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
		url: 'php/login.php',
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

function onSignIn(googleUser) {
	var profile = googleUser.getBasicProfile();
	var email = profile.getEmail();
	register(email, Math.random().toString());
	document.cookie = 'username=' + email + ';path=/;';
	signInCommon();
	// XXX Don't know why but this needs to go here..
	document.getElementById('signInInfo').innerHTML =
		'Account (' + email + ') <span class="caret"></span>';
	$('#signInModal').modal('hide');
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
	var result;
	$.ajax({
		type: 'POST',
		url: 'php/register.php',
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
				result = "success";
			} else if (trimmedResponse == "failure-registered") {
				result = "failure-registered";
			} else {
				result = "failure";
			}

		},
		dataType: 'text',
		async: false
	});
	return result;
}

//
//
//
function retrieveFile(fileName) {
	$.ajax({
		type: 'POST',
		url: 'php/retrieveFile.php',
		data: {email: getCookie('username'), fileName: fileName},
		success: function(response) {
			editor.setValue(response);
		},
		dataType: 'text',
		async: false
	});
	$('#fileOpenFromServerModal').modal('hide');
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

	// Clear the contents of the sign in and registration forms.
	document.getElementById("signInForm").reset();
	document.getElementById("registerForm").reset();
}

//
// Signs out the user by deleting the username cookie and resetting the UI.
//
function signOut() {
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {
	});

	document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
	document.getElementById('signInInfo').innerHTML =
		'Account (Not signed in) <span class="caret"></span>';
	document.getElementById('signInButtonList').className = '';
	$('#signInLink').prop('disabled', false);
	document.getElementById('signOutButtonList').className = 'disabled';
	$('#signOutLink').prop('disabled', true);
}

