var editor = ace.edit("textEditor");
editor.getSession().setUseWorker(false);
editor.setTheme("ace/theme/chrome");
editor.getSession().setMode("ace/mode/pml");
editor.getSession().setTabSize(8);
editor.getSession().setUseSoftTabs(false);
editor.focus();
editor.setFontSize('14px');
autoComplete(editor);
var arrayOfAnnos = [];
var currentWarningShowing = 0;
var allWarningRows = [];
var errorNotification = false;
var notyInstance;

window.onload = function() {
	if (isLoggedIn()) {
		signInCommon();
	}

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

	$('#fileSaveToDiskForm').on('submit', function(e) {
		e.preventDefault();
		saveFile(document.getElementById('fileSaveToDiskNameInput').value);
		$("#fileSaveToDiskModal").modal("hide");
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
	closeNotyInstance();
	//if(notyInstance){notyInstance.close();}
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
// vis.js 
// Takes DOT output from traverse and imports it to visjs Network graph and displays it in the 'graphicalEditor'
//
function DOT_to_visjs() {
	$.post(
		"php/getDOT.php",
		{value: editor.getSession().getValue()},
		function(data, filename) {
			var stringOfDOT = data
			//editor.getSession().setValue(stringOfDOT, 10)  //useful for debugging - prints the DOT code to the editor for viewing

			var parsedData = vis.network.convertDot(stringOfDOT);

			var data = {
  				nodes: parsedData.nodes,
  				edges: parsedData.edges
					}

			var options = parsedData.options;
// docs here:
//http://visjs.org/docs/network/#options
//
options = {
  
  //configure: {...},    // defined in the configure module.
  //edges: {...},        // defined in the edges module.
  nodes : {color: {
		background: '#ff0000'
		}
	},
  //groups: {...},       // defined in the groups module.
  layout : {hierarchical: {
		sortMethod: "directed"
			}
		},
  interaction : {navigationButtons: true, hover: true
		},
  //manipulation: {...}, // defined in the manipulation module.
  physics :  {
	enabled : false  // default here is true but makes every node/edge bounce when moved with physics and is a bit weird
	},   
}


var container = document.getElementById('graphicalEditor');

// create a network
var network = new vis.Network(container, data, options);

		}
	);
}

//Functions to translate the PML code into the DOT language.
//This focuses on the provides and requires needed by actions.
function DOT_to_RF() 
{//This method uses the dot string to make a graph, supported by vis.js
	$.post(
		"php/echo.php",
		{value: editor.getSession().getValue()},
		function(data, filename) {
			var stringOfDOT =  data
			stringOfDOT = PML_To_List(stringOfDOT)
			//editor.getSession().setValue(stringOfDOT, 10)  //useful for debugging - prints the DOT code to the editor for viewing

			var parsedData = vis.network.convertDot(stringOfDOT);

			var data = {
  				nodes: parsedData.nodes,
  				edges: parsedData.edges
					}

			var options = parsedData.options;
			options = 
			{
  			//nodes : {color: {background: '#fff000'}},
  			layout : {hierarchical: {sortMethod: "directed"}},
 			interaction : {navigationButtons: true, hover: true},
  			physics :  {
			enabled : false  // default here is true but makes every node/edge bounce when moved with physics and is a bit weird
			},   
			}


			var container = document.getElementById('graphicalEditor');

			// create a network
			var network = new vis.Network(container, data, options);

			}
		);
}

//The rest of these methods support the above metod by translating the given PML into DOT
function CreateNode()
{//Create nodes
	return {name: "",	//Name of action
		requires: new Array(0),//Requires of action
		provides: new Array(0),//Provides of action
		next: null};
}

//Translate the generated linked list into DOT
function ListToDOT(a)
{
	var start = a;
	var b = a;
	var DOT = "PML{";
	var i = 0;
	var j = 0;


	while(a.next !=null){
		
		/*for(i = 0; i < a.provides.length; i++)	//default case where an action requires and provides the same thing
			{
				for(j = 0; j < b.requires.length; j++)
				{
					if((a.provides[i] == b.requires[j]) && (a.provides.length > 0 && a.requires.length > 0))
					{
						DOT += a.name;
						DOT+= "[color = ";
						DOT += '"';
						DOT += "purple";
						DOT += '"';
						DOT += "]";
						DOT += ";\n";
					}
				}
			}*/
		if(a.requires.length > 0 && a.provides.length > 0)//transformer
			{
				DOT+= a.name;
				DOT+= "[color = ";
				DOT += '"';
				DOT += "green";
				DOT += '"';
				DOT += "]";
				DOT += ";\n";
		
		
		
		}else if(a.requires.length > 0 && a.provides.length == 0)//blackhole
		{
			DOT+= a.name;
			DOT+= "[color = ";
			DOT += '"';
			DOT += "yellow";
			DOT += '"';
			DOT += "]";
			DOT += ";\n";
			

		}
	
		else if (a.requires.length == 0 && a.provides.length > 0)//miracle
		{
			DOT+= a.name;
			DOT+= "[color = ";
			DOT += '"';
			DOT += "pink";
			DOT += '"';
			DOT += "]";
			DOT += ";\n";
		}
		a = a.next;
	}
		a = start;

	while(a.next != null)
	{
		b = a;
		while(b.next != null)
		{
			for(i = 0; i < a.provides.length; i++)
			{
				for(j = 0; j < b.requires.length; j++)
				{
					if(a.provides[i] == b.requires[j])
					{
						DOT += a.name;
						DOT += " -> ";
						DOT += b.name;
						DOT += ";\n";
					}
				}
			}
			b = b.next;
		}
		i++;
		a = a.next;
	}

	DOT += "}";

	return DOT;
}

function PML_To_List(input)
{

	//What the code is searching for
	var action = "action";
	var provides = "provides";
	var requires = "requires";
	//Nodes
	var start = CreateNode();
	var list = start;
	//Iterator
	var i = 0;
	//Current substring we are testing
	var current = input.substring(i, i+provides.length);
	var temp = "";//Temporary storage

	while(i < input.length)
	{
		if(current.substring(0, action.length) == action)
		{//If you find an sction
			//Create a new node
			list.next = CreateNode();
			list = list.next;
			
			//Move over to get to name
			i+=action.length;
			
			//Read in action name
			current = input.substring(i, i+1);
			while(current != '{')
			{
				list.name += current;
				i++;
				current = input.substring(i, i+1);
			}
				
		}else if(current == provides)
		{//If found provides
			
			temp = "";
			//Move over {
			i+= provides.length;
			current = input.substring(i, i+1);
			while(current != '{')
			{
				i++;
				current = input.substring(i, i+1);
			}
			i++;

			//Read in provides
			current = input.substring(i, i+1);
			while(current != '}')
			{
				if(current == '&')
				{//If multiple requirements
					list.provides.push(temp);
					i++;
					temp = "";
				}else if(current == ' ')
				{
				}else{
					temp += current;
				}
				i++;
				current = input.substring(i, i+1);
			}
			list.provides.push(temp);
			
		}else if(current == requires)
		{//If found requires
			
			temp = "";
			//Move over {
			i+= requires.length;
			current = input.substring(i, i+1);
			while(current != '{')
			{
				i++;
				current = input.substring(i, i+1);
			}
			i++;

			//Read in requires
			current = input.substring(i, i+1);
			while(current != '}')
			{
				if(current == '&')
				{//If multiple requirements
					list.requires.push(temp);
					i++;
					temp = "";
				}else if(current == ' ')
				{
				}else
				{
					temp += current;
				}
				i++;
				current = input.substring(i, i+1);
			}
			list.requires.push(temp);
		}

		i++;
		current = input.substring(i, i+provides.length);
	}

	//Get the DOT string
	var output = ListToDOT(start);
	return output;
}


//
// Populate the editor's gutter with warnings and errors returned by pmlcheck.
//
function error_annot() {
	arrayOfAnnos = [];
	allWarningRows = [];
	errorNotification = false;
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
					errorNotification = true;
				}
				var gutterAnno = {
					row: text_to_get-1,	
					column: 10,
					text: error_text,
					type: type
				}
				allWarningRows.push(parseInt(text_to_get));
				arrayOfAnnos.push(gutterAnno);
			}
			editor.getSession().setAnnotations(arrayOfAnnos);
			allWarningRows.sort(sortNumber);
			moveToFirstWarning();	//?
		}
	);
	moveToFirstWarning();
}

        function generate(type, text) {

                notyInstance = noty({
                text        : text,
                type        : type,
                dismissQueue: true,
                layout      : 'topCenter',
                closeWith   : ['button'],
                theme       : 'relax',
                maxVisible  : 200,
		killer	    : true,
                animation   : {
                    open  : {height: 'toggle'},//'animated bounceInLeft',
                    close : {height: 'toggle'},//'animated bounceOutLeft',
                    easing: 'swing',
                    speed : 500
                }
            });
            console.log('html: ' + notyInstance.options.id);
        }


function generateAll() {
	    if(!errorNotification){
            generate('warning', 'Total warnings: ' + arrayOfAnnos.length + '.   Showing warning #'+ (currentWarningShowing + 1) + " of " + arrayOfAnnos.length +"      "+ '<a href="#" onclick="moveToPrevious();return false;">previous</a> '+  '<a href="#" onclick="moveToNext();return false;">next</a> ');
	}
	else{
	    generate('error', 'ERROR ' + '.   Showing error #'+ (currentWarningShowing + 1) + " : Syntax error at line:  " + (arrayOfAnnos[0].row+1));
        }
}



function sortNumber(a,b) {
    return a - b;
}

function startGraphicalEditor() {
	document.getElementById("graphicalEditor").innerHTML = "<canvas id='canvas'></canvas>"
}

function closeNotyInstance(){
	if(notyInstance){notyInstance.close();}
	else{return;}
}


function moveToNext(){
	if(currentWarningShowing < arrayOfAnnos.length-1){
	var nextWarn = currentWarningShowing+1;}
	else{
	var nextWarn = currentWarningShowing;
	notyInstance.close();
	return;		
	}
	var nextRow = allWarningRows[nextWarn];
	editor.resize(true);

	editor.scrollToLine(nextRow, true, true, function () {});

	editor.gotoLine(nextRow,10, true);
	currentWarningShowing = nextWarn;
	generateAll();
}

function moveToPrevious(){
	if(currentWarningShowing>0){
	var prevWarn = currentWarningShowing-1;
}
	else{
	var prevWarn = currentWarningShowing;
	return;	
	}
	var prevRow = allWarningRows[prevWarn];
	
	editor.resize(true);

	editor.scrollToLine(prevRow, true, true, function () {});

	editor.gotoLine(prevRow,10, true);
	currentWarningShowing = prevWarn;
	generateAll();
}

function moveToFirstWarning(){

	var firstWarningRowNumber = allWarningRows[0];
	editor.resize(true);

	editor.scrollToLine(firstWarningRowNumber, true, true, function () {});

	editor.gotoLine(firstWarningRowNumber,10, true);
	currentWarningShowing = 0;
	generateAll();
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
	$('#fileSaveToDiskModal').modal('show');
}

//
//
//
function saveFile(name) {
	download(editor.getValue(), name, 'text/plain');
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

//
// Display a visualisation of the PML in the graphical window.
//
function visualise() {
	//
	// 0: Ensure the syntax is correct.
	//
	// TODO

	//
	// 1: Generate a PNG image of the PML.
	//
	var imageName;
	$.ajax({
		type: 'POST',
		url: 'php/generatePNG.php',
		data: {
			value: editor.getValue()
		},
		success: function(response) {
			imageName = response;
		},
		dataType: 'text',
		async: false
	});


	//
	// 2: Display it in the div.
	//
	document.getElementById('graphicalEditor').innerHTML = '<img src="' + imageName + '">';
}

//List of Keyboard Shortcuts
//=========================

//Save to disk
editor.commands.addCommand({
name: "SaveToDisk",
bindKey: {win: "Ctrl-s", mac:"Command-s"},
exec: function(editor)
{
	if(editor.getKeyboardHandler() != "ace/keyboard/emac")
	promptToSave();	
}
});

//Save To Disk Emac
editor.commands.addCommand({
name: "SaveToDiskEmacs",
bindKey: {win: "Ctrl-s-x", mac:"Command-s-x"},
exec: function(editor)
{
	if(editor.getKeyboardHandler() == "ace/keyboard/emac")
	{
        	promptToSave();
	}
}
});

/*Open From Disk
editor.commands.addCommand({
name: "OpenFromDisk",
bindKey: {win: "Ctrl-o", mac:"Command-o"},
exec: function(editor)
{
	if(editor.getKeyboardHandler() != "ace/keyboard/emac")
	{
		$("#openFileInput")
        	e.preventDefault();
	}
}
});*/

//Open From Disk Emac
/*editor.commands.addCommand({
name: "OpenFromDiskEmacs",
bindKey: {win: "Ctrl-f-x", mac:"Command-f-x"},
exec: function(editor)
{
	if(editor.getKeyboardHandler() == "ace/keyboard/emac")
	{
        	$("#openFileInput")
        	e.preventDefault();
	}
}
});*/

//Save To Server
editor.commands.addCommand({
name: "SaveToServer",
bindKey: {win:"Ctrl-Shift-s", mac:"Command-Shift-s"},
exec: function(editor)
{
	attemptSaveToServer();
}
});

//Open From Server
editor.commands.addCommand({
name: "OpenFromServer",
bindKey: {win:"Ctrl-Shift-o", mac:"Command-Shift-o"},
exec:function(editor)
{
	attemptOpenFromServer();
}
});

//Check PML Syntax
editor.commands.addCommand({
name: "CheckSyntax",
bindKey:{win:"Ctrl-r", mac: "Command-r"},
exec: function(editor)
{
	error_annot();
}
});
