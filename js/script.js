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

// The name of the project as specified by ProjectName
var instanceName;

window.onload = function() {
	if (isLoggedIn()) {
		signInCommon();
	}

	instanceName = getInstanceName();

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

function getInstanceName() {
	var instance;
	$.ajax({
		type: 'POST',
		url: 'php/getInstanceName.php',
		data: {},
		success: function(response) {
			instance = response;
		},
		dataType: 'text',
		async: false
	});
	return instance;
}

function plantUMLwithSwimlanesSimple(){
    swimlaneBuilder(true, false, true);
}

function plantUMLwithSwimlanes() {
    swimlaneBuilder(true, false,false);
}

function plantUMLwithoutSwimlanes() {
    swimlaneBuilder(false, false,false);
}

function buildAgentColouredActionsString() {
    swimlaneBuilder(false, true,false);
}

function swimlaneBuilder(isSwimLanesGraph, isAgentActions, isSimpleActionsOnlySwimlanes) {
    $.post(
        "php/getSimpleTraverseOutput.php", {
            value: editor.getSession().getValue()
        },

        function(data, filename) {
            data = data.replace(/&amp;&amp/g, ',');
            //editor.getSession().setValue(data, 10);  //useful for debugging - prints the simpleTraverse code to the editor for viewing
            var isSwimlanes = isSwimLanesGraph;
            var isAgentColouredActions = isAgentActions;
	    var isSimpleSwim = isSimpleActionsOnlySwimlanes;
            var dictNodeAgents = {};
            var dictNodeType = {};
            var dictNodeIteration = {};
            var dictSelectNodes = {}; // i think he sometimes treats joins as selects :( like the first join in netbeans
            var dictJoinNodes = {};
            var dictBranchNodes = {};
            var allNodes = new Array();
            var stringOfDOT = data;
            var arrNewLines = data.split("\n");
            var lengthh = arrNewLines.length;
            var globalAgents = ['Default_Agent'];
            var uniqueGlobalAgents = []; // this is the  ordered array of swimlanes starting at 'Default Lane'
            var twoDArrayConnections = [];
            var twoDArrayAllConnections = [];
            var dictSequence = {};
            var dictAgentColour = {
                'Default_Agent': '#C8E3F8'
            };
            var agentColours = ['#D2B9D6', '#F7F5C2', '#FCC7CF', '#F8D040', '#F898C8', '#B0A0F8', '#98F8F8', '#90C0F8', '#EEE9B2', '#AEC572', '#7E7C4A'];
            console.log(lengthh);

            for (i = 0; i < arrNewLines.length; i++) {
                line = arrNewLines[i];
                if (line.substring(0, 7) == "AGENTS:") {
                    // console.log("inside substring agent");

                    var separators = ['\\,', '\\\(', '\\\)', '\\&\\&', '\\|\\|'];

                    var tokens = line.split(new RegExp(separators.join('|'), 'g'));

                    // remove whitespace
                    tokensRWS = formatOutWhiteSpaceSemiColan(tokens);

                    var nameOfNode = tokensRWS[1];
                    var agentsArr = ['Default_Agent'];
                    if (tokensRWS.length > 2) { // has agents// 0=AGENTS: 1=nodeName

                        for (k = 2; k < tokensRWS.length; k++) {
                            agentsArr.push(tokensRWS[k]);
                            globalAgents.push(tokensRWS[k]);

                        }
                        // console.log("agents arry now size  : " + agentsArr.length);
                    }

                    dictNodeAgents[nameOfNode] = agentsArr;
                } // END OF IF(AGENTS)
                if (line.substring(0, 15) == "NODE_NAME_TYPE:") {
                    var tokens = line.split(",");
                    tokensRWS = formatOutWhiteSpaceSemiColan(tokens);
                    if (tokensRWS.length > 2) { //must be 3  NODE_NAME_TYPE/nodeName/TYPE

                        nodeName = tokensRWS[1];
                        nodeType = tokensRWS[2];
                        dictNodeType[nodeName] = nodeType;
                        dictNodeIteration[nodeName] = [0, 0];
                    }
                } // END OF IF(NODE NAME TYPE)



                if (line.substring(0, 14) == "STANDARD_LINK:") {
                    var tokens = line.split(" ");

                    var tokensRWS = formatOutWhiteSpaceSemiColan(tokens);

                    var firstNode = tokensRWS[1];
                    var secondNode = tokensRWS[2];

                    dictSequence[firstNode] = secondNode;


                    if (dictNodeType[firstNode] == "SELECTION") {
                        if (!(firstNode in dictSelectNodes)) { //alert("never before " + firstNode)}// first time entry?
                            dictSelectNodes[firstNode] = [secondNode];
                        } else { // else add to existing value array
                            var selArr = dictSelectNodes[firstNode];
                            selArr.push(secondNode);
                            dictSelectNodes[firstNode] = selArr;
                            //alert("more than 1 in" + selArr[0] +" "+ selArr[1]);			
                        }
                    } else if (dictNodeType[firstNode] == "JOIN") {
                        if (!(firstNode in dictJoinNodes)) { //alert("never before " + firstNode)}// first time entry?
                            dictJoinNodes[firstNode] = [secondNode];
                        } else { // else add to existing value array
                            var joinArr = dictJoinNodes[firstNode];
                            joinArr.push(secondNode);
                            dictJoinNodes[firstNode] = joinArr;
                            //alert("more than 1 in" + selArr[0] +" "+ selArr[1]);			
                        }
                    } else if (dictNodeType[firstNode] == "BRANCH") {
                        if (!(firstNode in dictBranchNodes)) { // first time entry?
                            dictBranchNodes[firstNode] = [secondNode];
                        } else { // else add to existing value array
                            var branchArr = dictBranchNodes[firstNode];
                            branchArr.push(secondNode);
                            dictBranchNodes[firstNode] = branchArr;

                        }
                    } else { // if not a select add to standard connection pairs
                        var arrNodePair = [firstNode, secondNode];

                        twoDArrayConnections.push(arrNodePair);
                    }

                } //END OF IF(STANDARD_LINK)


                if (line.substring(0, 10) == "ITERATION:") {
                    var tokens = line.split(" ");

                    var tokensRWS = formatOutWhiteSpaceSemiColan(tokens);

                    var firstNode = tokensRWS[1];
                    var secondNode = tokensRWS[2];

                    if ((dictNodeType[firstNode] == "ACTION") && (dictNodeType[secondNode] == "ACTION")) {

                        var arrIts = dictNodeIteration[firstNode];
                        var firstIts = arrIts[0];
                        var secondIts = arrIts[1];
                        firstIts++;
                        var newArr = [firstIts, secondIts];
                        dictNodeIteration[firstNode] = newArr;

                        var arrIts1 = dictNodeIteration[secondNode];
                        var firstIts1 = arrIts1[0];
                        var secondIts1 = arrIts1[1];
                        secondIts1++;
                        var newArr1 = [firstIts1, secondIts1];
                        dictNodeIteration[secondNode] = newArr1;
                    }

                } //END OF IF(ITERATION)				

            } // END OF MAIN-LINE-FOR-LOOP

            /*for(x in dictNodeIteration){
            	
            	if(dictNodeType[x] == "JOIN"){
            	alert("found node " + x);
            	
            	var nextNode = findNextAction(x);

            	dictNodeIteration[nextNode] = dictNodeIteration[x];
            	
            	alert("made new iteration entry for " + nextNode + "and removed" + x);// says ACTION?
            	delete dictNodeIteration[x];
            		}
            	}*/

            function findNextAction(node) {
                xx = dictNodeType[node];
                y = node;
                while (xx != "ACTION") {
                    y = dictSequence[node];
                    xx = dictNodeType[y];
                }
                return y;

            }

            uniqueGlobalAgents = ArrNoDupe(globalAgents);

            var iter = 0;

            for (g = 0; g < uniqueGlobalAgents.length; g++) {

                dictAgentColour[uniqueGlobalAgents[g]] = agentColours[iter];
                if (iter == 10) {
                    iter = -1;
                }
                iter++;
                //alert("just assigned" +  uniqueGlobalAgents[g] + " to colour " + agentColours[iter-1]);
            }


            // MAKE THE PLANT-UML STRING

            var PUstring = "";
            if (isAgentColouredActions == false) {
                var startingLanes = allSwimLanesString();
                if (isSwimlanes) {
                    PUstring += startingLanes; //-------------------------------------
                }
                var firstPair = twoDArrayConnections[0];
                var notOver = true;

		if(isSimpleSwim == true){
		justActionsNoBranchesEtc();
		}
		else{
                recursiveLoop(firstPair[0]);
			}
            } else {

                agentColouredActions();
            }

            var globalJoin = ""; //= []; //once stopped by a join it needs to remeber where to start from when all selections/branches are complete// these are pushed/popped

            var joinNotFromSelect = true;


	   function justActionsNoBranchesEtc(){
		var listOfActions = getArrayOfActions(twoDArrayConnections);
		for(w = 0; w < listOfActions.length; w ++){
			var action = listOfActions[w];
			addNodeToPUString(action);
			
			}		
			}



            function agentColouredActions() {
                var listOfActions = getArrayOfActions(twoDArrayConnections);

                for (t = 0; t < listOfActions.length; t++) {
		    if(t < 25){ // more than 24 will not fit on screen acd nd can crash the request			
                    colourActionString = stringColouredNode(listOfActions[t]);
                    PUstring += colourActionString;

                	}
		}

            }

            function stringColouredNode(node) {
		var hasFourPlusNote = false;
		var strNote = "";
                var retString = "";
                var arrAgents = dictNodeAgents[node];
		if(arrAgents.length>1){
			arrAgents.splice(0,1);
		}
		if(arrAgents.length>4){
			 strNote = moreThanFourAgents(node);
			 strNote+="\n";
			 arrAgents.splice(4,arrAgents.length-4 );
				//}


}
                var semiColanCount = 0;
                //partition #CC00EE another {
                for (z = 0; z < arrAgents.length; z++) {
                    retString += "partition " + dictAgentColour[arrAgents[z]] + " " + arrAgents[z] + " {\n"
                    semiColanCount++;
                }
		retString +=strNote;
                retString += ":";
                retString += node;
                retString += ";\n";

                for (r = 0; r < semiColanCount; r++) {
                    retString += "}\n";
                }
                return retString;
            }

            function getArrayOfActions(twodarray) {
                arr = [];

                for (e = 0; e < twodarray.length; e++) {
                    pair = twodarray[e];
                    if (dictNodeType[pair[0]] == "ACTION") {
                        arr.push(pair[0]);
                    }
                    if (dictNodeType[pair[1]] == "ACTION") {
                        arr.push(pair[1]);
                    }
                }

                uniqueActions = ArrNoDupe(arr);

                return uniqueActions;
            }


            function recursiveLoop(node1) {
                var localGlobal = globalJoin;
                //alert(" inputting to recurrsive " + node1);
                if ((dictNodeType[node1] != "JOIN") && (dictNodeType[node1] != "RENDEZVOUS")) {
                    if (dictNodeType[node1] != "SELECTION") {
                        if (dictNodeType[node1] != "BRANCH") {
                            addNodeToPUString(node1);
                            node2 = findNextConnectInArray(node1);

                            if (node2 != "no_node") { //SHOULD only happen on last node
                                recursiveLoop(node2);
                            } else {
                                // this is the end of traverse  - a dot - no node is reached 
                            }
                            //}
                        } else { // if branch
                            handleBranch(node1);
                        }
                    } else { // if selection
                        handleSelection(node1);
                    }
                } else { // if join
                    /*if(joinNotFromSelect){	// !! PROBABLY SHOULD KEEP A COUNTER OF HOW DEEP INTO NESTED 'JOIN REQUIRES' WE ARE  if at 0 do this

					handJoin(node1);// in his netbeans he treats a join as a select so my code just stops					
					}
			else{*/
                    globalJoin = node1; //.push("join_3");
                    //}
                }
            }
            //printFormatAllNodeAgentTypes(dictNodeType);
            //justPrintArray(uniqueGlobalAgents);
            //printFormatAllNodeIteration(dictNodeIteration);
            //printFormatConnections(twoDArrayConnections );

            //editor.getSession().setValue(PUstring, 10)  //useful for debugging - can see the PlantUML code in editor

            $.post(
                "php/makeIMG.php", {
                    plantUMLstring: PUstring
                },
                function(data, filename) {
                    var imageRecieved = data;
                    document.getElementById('graphicalEditor').innerHTML = data;
                })

            function handleBranch(node) {
                var nodeChoices = dictBranchNodes[node];
                PUstring += "split\n"
                recursiveLoop(nodeChoices[0]);
	                    PUstring += "split again\n"
			var p = 1;

		while(p < nodeChoices.length -1){
			if(nodeChoices[p] != undefined){// hideous recreation of a 'for' loop as after much debugging the for loop didn't do its last iteration for some reason
                    recursiveLoop(nodeChoices[p]);
                    PUstring += "split again\n"
		}
		p++;
		}

		recursiveLoop(nodeChoices[nodeChoices.length-1]);                
                PUstring += "end split\n";
                var afterJoin = findNextConnectInArray(globalJoin); //.pop());
                recursiveLoop(afterJoin);

            }

            function handleSelection(node) {
                joinNotFromSelect = false;
                var nodeChoices1 = dictSelectNodes[node];
                PUstring += "split\n"
                recursiveLoop(nodeChoices1[0]);
	                    PUstring += "split again\n"
			var b = 1;

		while(b < nodeChoices1.length -1){
			if((nodeChoices1[b] != undefined) && (nodeChoices1[b] != node)){// hideous recreation of a 'for' loop as after much debugging the for loop didn't do its last iteration for some reason
                    recursiveLoop(nodeChoices1[b]);
                    PUstring += "split again\n"
			}
		b++;
		}

		recursiveLoop(nodeChoices1[nodeChoices1.length-1]);                
                PUstring += "end split\n";
                //var afterJoin = findNextConnectInArray(globalJoin.pop());
                var popNextJoinNode = globalJoin; //.pop();
                var afterJoinArr = dictJoinNodes[popNextJoinNode];
                var afterJoin = afterJoinArr[0]; // not sure this is ook with multis - try change to a for loop or at least test if its multi //length >1
                recursiveLoop(afterJoin);
            }

            function handleJoin(node) { //**
                var isMulti = false;
                //joinNotFromSelect = false;
                nodeChoices = dictJoinNodes[node];
                if (nodeChoices.length > 1) {
                    isMulti = true;
                }
                if (isMulti) {
                    PUstring += "split\n"
                }
                recursiveLoop(nodeChoices[0]);
                for (i = 1; i < nodeChoices.length; i++) {
                    PUstring += "split again\n"
                    recursiveLoop(nodeChoices[i]);

                }
                if (isMulti) {
                    PUstring += "end split\n";
                }
                var afterJoin = findNextConnectInArray(globalJoin); //.pop());

                //recursiveLoop(afterJoin);

            }


            function addNodeToPUString(node1) {
                var nString1 = ":" + node1 + ";\n";
                var slString1 = getCorrectSwimlaneString(node1);
                var notes1 = otherAgentNotes(node1);

                var repeats = getIterBefore(node1);
                if (isSwimlanes) {
                    PUstring += slString1;
                }
                PUstring += repeats;
                PUstring += nString1;
                if (isSwimlanes) {
                    PUstring += notes1;
                }
                var repeatsWhile = getIterAfter(node1);
                PUstring += repeatsWhile;
            }


            function findNextConnectInArray(node) {

                for (i = 0; i < twoDArrayConnections.length; i++) {
                    var pair = twoDArrayConnections[i];
                    if (pair[0] == node) {
                        twoDArrayConnections.splice(i, 1); //remove this from the connections array and return it
                        return pair[1];
                    }


                }
                return "no_node";

            }


            function otherAgentNotes(node) {
                var otherAgents = "";
                var agents = dictNodeAgents[node];
	        agents.splice(0,1);
                if (agents.length > 1) {
		    agents.splice(0,1);
                    otherAgents += "note right\n<b>OTHER AGENTS</b>\n====\n"
                    for (u = 0; u < agents.length; u++) {
                        var dotAgent = "* " + agents[u] + "\n";
                        otherAgents += dotAgent;
                    }
                    otherAgents += "end note\n";
                }
                return otherAgents;

            }

            function moreThanFourAgents(node) {
                var otherAgents = "";
                var agents = dictNodeAgents[node];
	        //agents.splice(0,4);
                if (agents.length > 1) {
                    otherAgents += "note right\nnesting too deep\n<b>OTHER AGENTS</b>\n====\n"
                    for (u = 4; u < agents.length; u++) {
                        var dotAgent = "* " + agents[u] + "\n";
                        otherAgents += dotAgent;
                    }
                    otherAgents += "end note\n";
                }
                return otherAgents;
	
            }

            function getIterBefore(node) {

                strRepeat = "";
                arrIter = dictNodeIteration[node];
                if (arrIter[1] > 0) {
                    for (y = 0; y < arrIter[1]; y++) {
                        strRepeat += "repeat\n";
                    }
                }
                dictNodeIteration[node] = [arrIter[0], 0];
                return strRepeat;
            }

            function getIterAfter(node) {
                strRepeatWhile = "";
                arrIter = dictNodeIteration[node];
                if (arrIter[0] > 0) {
                    for (v = 0; v < arrIter[0]; v++) {
                        strRepeatWhile += "repeat while()\n";
                    }
                }
                dictNodeIteration[node] = [0, arrIter[1]];
                return strRepeatWhile;
            }

            function allSwimLanesString() {
                var everySecondOne = 9;
                var agentLanes = "";
                for (h = 0; h < uniqueGlobalAgents.length; h++) {
                    everySecondOne++;
                    var agent = uniqueGlobalAgents[h];
                    if (everySecondOne % 2 == 0) {
                        agentLanes += "|#AntiqueWhite";
                    }
                    agentLanes += "|";
                    agentLanes += agent;
                    agentLanes += "|\n";
                }

                return agentLanes;
            }

            function justPrintArray(arr) {
                for (o = 0; o < arr.length; o++) {
                    console.log(arr[o]);
                }
            }

            function formatOutWhiteSpaceSemiColan(tokens) {
                var tokensRWS = []; // remove white space from tokens
                for (p = 0; p < tokens.length; p++) {
                    if (tokens[p] != " " && tokens[p] != "") {
                        var remSpace = tokens[p].replace(/ /g, '')
                        var remSC = remSpace.replace(/;/g, '')
                        tokensRWS.push(remSC);
                    }
                }
                return tokensRWS;
            }

            function printFormatConnections(arr) {
                for (i = 0; i < arr.length; i++) {
                    console.log(arr[i][0] + " --> " + arr[i][1]);
                }
            }

            function printFormatAllNodeAgentDicts(dict) {
                console.log("called this function");
                for (i in dict) {
                    console.log("\n Node-Agents:");
                    console.log(i);
                    for (key in dict[i]) {
                        console.log(dict[i][key]);
                    }
                }
            }

            function printFormatAllNodeAgentTypes(dict) {
                console.log("called this function");
                for (i in dict) {
                    console.log("\n Node-Type:");
                    console.log(i);
                    console.log(dict[i]);

                }
            }

            function printFormatAllNodeIteration(dict) {
                console.log("called this function");
                for (i in dict) {
                    console.log("\n Node-Iterate bools:");
                    console.log(i);
                    console.log(dict[i]);

                }
            }

            function ArrNoDupe(a) {
                var temp = {};
                for (var i = 0; i < a.length; i++)
                    temp[a[i]] = true;
                var r = [];
                for (var k in temp)
                    r.push(k);
                return r;
            }

            function getCorrectSwimlaneString(nodeName) {
                //check nodes agents - all have at least default
                var arrAgents = dictNodeAgents[nodeName];
                var lane = arrAgents[0]; // default  
                if (arrAgents.length > 1) {
                    lane = arrAgents[1];
                }
                laneString = "|" + lane + "|\n";
                return laneString;

            }

        }
    );
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
			parsedData.nodes[0].hidden = true;
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
		background: '#a3a3ff'
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
		"php/get_pro_req.php",
		{value: editor.getSession().getValue()},
		function(data, filename) {
			var stringOfDOT =  data
			stringOfDOT = Read_traverse_Pro_Req(stringOfDOT)
			editor.getSession().setValue(stringOfDOT, 10)  //useful for debugging - prints the DOT code to the editor for viewing

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
		type: "",	//type
		requires: new Array(0),//Requires of action
		provides: new Array(0),//Provides of action
		next: null};
}

function Read_traverse_Pro_Req(input)
{

	//Search strings
	var action = "NODE_NAME_TYPE";
	var provides = "PROVIDES";
	var requires = "REQUIRES";

	//Nodes
	var start = CreateNode();
	var list = start;

	var found = false;

	//iterator
	var j = 0;
	var temp;//temp storage
	var temp_01 = "";
	var current = "";

	//Read in text line by line
	var new_input = input.split('\n');
	for(i = 0; i < new_input.length; i++)
	{
		
		if(new_input[i].substring(0, action.length) == action)
		{//If you find the type, action/branch/iteration
			
			temp = new_input[i].split(',');
			//input += temp[1];
			if(temp[2] == " ACTION ")
			{
				list.next = CreateNode();
				list = list.next;

				list.name = temp[1];
				list.type = "ACTION";

			}else if(temp[2] == " BRANCH ")
			{
				list.next = CreateNode();
				list = list.next;

				list.name = temp[1];
				list.type = "BRANCH";
			}else if(temp[2] == " RENDEZVOUS ")
			{
				list.next = CreateNode();
				list = list.next;

				list.name = temp[1];
				list.type = "RENDEZVOUS";
			}//else if(temp[2] == "??")

			current += temp[1];
			
		}else if(new_input[i].substring(0, provides.length) == requires)
		{
			temp = new_input[i].split(',');
			//ignore the first [] - [0] is PROVIDES, and name is [1]

			//Add to the node - working with temp[2]
			j = 0;
			temp_01 = "";
			current = temp[2];		
			while(j < current.length)
			{
				if(current.substring(j, j+1) == ' ')
				{//Blank spaces are ignores
				}else if(current.substring(j, j+1) == ',')
				{//Ignore Commas
				}else if(current.substring(j, j+1) == '&')
				{
					list.requires.push(temp_01);
					temp_01 = "";
					j++;
				}else if(current.substring(j, j+1) == '.')
				{//Take only the main of variable, eg take blood of blood.type
					list.requires.push(temp_01);
					temp_01 = "";
					
					//Move over value stored
					while(current.substring(j, j+1) != '"' && j < current.length)
					{//Move over everything else
						j++;
					}
					j++;
					//Move over second "
					while(current.substring(j, j+1) != '"' && j < current.length)
					{//Move over everything else
						j++;
					}
					
				}else
				{
					temp_01 += current.substring(j, j+1);
				}
				j++;
			}
			if(temp_01 != "")
				list.requires.push(temp_01);

		}else if(new_input[i].substring(0, provides.length) == provides)
		{
			temp = new_input[i].split(',');
			//ignore the first [] - [0] is PROVIDES, ....


			//Add to the node - working with temp[2]
			j = 0;
			temp_01 = "";
			current = temp[2];
			while(j < current.length)
			{
				if(current.substring(j, j+1) == ' ')
				{//Blank spaces are ignores
				}else if(current.substring(j, j+1) == ',')
				{//Ignore Commas
				}else if(current.substring(j, j+1) == '&')
				{
					list.provides.push(temp_01);
					temp_01 = "";
					j++;
				}else if(current.substring(j, j+1) == '.')
				{//Take only the main of variable, eg take blood of blood.type
					list.provides.push(temp_01);
					temp_01 = "";
					
					//Move over value stored
					while(current.substring(j, j+1) != '"' && j < current.length)
					{//Move over everything else
						j++;
					}
					j++;
					//Move over second "
					while(current.substring(j, j+1) != '"'&& j < current.length)
					{//Move over everything else
						j++;
					}
					
				}else
				{
					temp_01 += current.substring(j, j+1);
				}
				j++;
			}
			if(temp_01 != "")
				list.provides.push(temp_01);
		}
	}
	
	var output = ListToDOT(start);

	return output;

}

//Translate the generated linked list into DOT
function ListToDOT(a)
{
	var start = a;
	var b = a;
	var DOT = "PML{";
	var i = 0;
	var j = 0;
	//var found = false;
	//var setalready = false;

	do{
		a = a.next;
		found = false;
		setalready = false;
		//For transforms
		if(a.type == "ACTION")
		{
			for(i = 0; i < a.provides.length && !found; i++)
			{
				for(j = 0; j < a.requires.length && !found; j++)
				{
					if(a.provides[i] == a.requires[j])
					{
						DOT += a.name;
						DOT += "[color = ";
						DOT += '"';
						DOT += "green";
						DOT += '"';
						DOT += " weigth=0.5";
						DOT += " nodesep=2.0]\n";
						found = true;
						setalready = true;
					}
				}
			}

			//Check if a miracle
			if(!setalready)
			{
				for(i = 0; i < a.requires.length; i++)
				{
					for(j = 0; j < a.provides.length; j++)
					{
						if(a.requires[i] == a.provides[j])
						{
							found = true;
						}
					}
				}
	
				if(!found)
				{
					DOT += a.name;
					DOT += "[color = ";
					DOT += '"';
					DOT += "yellow";
					DOT += '"';DOT += " weigth=0.5";
					DOT += " nodesep=2.0]\n";
					found = true;
				}
			}

			if(!found && !setalready)
			{//Last option, must be a blackhole
				DOT += a.name;
				DOT += "[color = ";
				DOT += '"';
				DOT += "blue";
				DOT += '"';
				DOT += " weigth=0.5";
				DOT += " nodesep=2.0]\n";
			}

			
		}/*else
		{
			DOT += "BRANCH";
			DOT += "[color = ";
			DOT += '"';
			DOT += "red";
			DOT += '"';
			DOT += "]";
			DOT += ";\n";
		}*/	


	}while(a.next !=null)

	a = start;

	while(a.next != null)
	{
		b = a;
		do
		{
			//Connect provides and requires
			b = b.next;
			for(i = 0; i < a.provides.length; i++)
			{
				for(j = 0; j < b.requires.length; j++)
				{
					if(a.provides[i] == b.requires[j])
					{
						DOT += a.name;
						DOT += " -> ";
						DOT += b.name;
						DOT += "[label=";
						DOT += '"';
						DOT += a.provides[i];
						DOT += '"';
						DOT += "];\n";
					}
				}
			}
			
		}while(b.next != null)
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
	document.getElementById("graphicalEditor").innerHTML = `
	<nav class="navbar navbar-default">
		<a class="navbar-brand" href="#">Graphical Editor</a>
		<ul class="nav navbar-nav">
			<li><a id="generatePML" href="#">Generate PML</a></li>
			<li><a id="clearModel" href="#">Clear Model</a></li>
		</ul>
	</nav>
	<canvas id="canvas"></canvas>`;
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
					'username=' + emailAddress + ';path=/' + instanceName + '/;';
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
	document.cookie = 'username=' + email + ';path=/' + instanceName + '/;';
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
					'username=' + emailAddress + ';path=/' + instanceName + '/;';
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

	document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/" + instanceName + "/";
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
