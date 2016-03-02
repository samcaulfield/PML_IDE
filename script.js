var editor = ace.edit("textEditor");
editor.getSession().setMode("ace/mode/c_cpp");
editor.getSession().setTabSize(8);
editor.getSession().setUseSoftTabs(false);
editor.setKeyboardHandler("ace/keyboard/vim");
editor.setBehavioursEnabled(false);
editor.focus();

window.onload = function() {
	document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
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
// Callback for the Google sign-in API.
//
function onSignIn(googleUser) {
	// If the user was able to sign in with a Google account, it means they
	// own the email address used to sign in (Google verifies emails).
	// This means the email of the account can be registered in the database
	// with a random password so it can't be taken by anyone else, since
	// the login itself is managed by Google.
	var userProfile = googleUser.getBasicProfile();
	var emailAddress = userProfile.getEmail();
	register(emailAddress, 'random');
	// Set the login cookie.
	// XXX Append instead of replace.
	document.cookie = 'username=' + emailAddress + ';path=/;';
	// Update the UI.
	$('#signInModal').modal('hide');
	document.getElementById('logInInfo').innerHTML =
		emailAddress + ' <span class="caret"></span>';
	$('#signInButtonList').addClass('disabled');
	$('#signOutButtonList').removeClass('disabled');
}

//
// Register the email address without any form of verification.
//
function register(emailAddress, password) {
	$.post('register.php', {email: emailAddress, password: password},
		function(response) {
		}
	);
}

