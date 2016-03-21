//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-
// Boxes & Arrows PML Builder
// Author: Sam Caulfield <sam@samcaulfield.com>
// Date: 20.03.2016
// Current Status: Not ready for release (Minimal functionality)
//
// Details:
// 	- The program is entirely event driven. Nothing changes without direct
//	  user interaction such as mouse clicks.
// 	- Whenever the UI needs to be updated, *everything* is redrawn.
// 	- The menu (right click) is the main point of entry for user input.
// 	- Coordinate systems: Drawable objects have an (x, y) position. The
// 	  camera has an offset (cx, cy) and zoom z. Objects are drawn at
// 	  (x * zoom - cx, y * zoom - cy). To detect clicks (mx, my) on an
// 	  object, check
// 	  inBounds(mx, my, x * zoom - cx, y * zoom - cy, objectWidth * zoom,
//	  	objectHeight * zoom).
// 	- This seems to run well on Chrome. On Firefox, the framerate is lower
// 	  and zooming doesn't work TODO.
//
//*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//
// PML model variables
//
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// The PML model is a linked list of nodes and is empty in the beginning.
var listHead = null;

//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//
// UI variables
//
//-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");
canvas.style.width='100%';
canvas.style.height='100%';
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

//+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// Mouse information
//
var lmbPressed;
var dragPrevX = -1, dragPrevY = -1; // -1 means this value isn't set.

//+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// Camera information
//

// The position of the top-left of the camera. This is an offset from zero.
var cx = 0, cy = 0;
// The scaling factor.
var zoom = 1.0;
var zoomDelta = 0.1;
var minZoom = 0.5;
var maxZoom = 10.0;

//+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// Appearance of nodes, colour and positioning
// Each node is coloured along a gradient and so has two colours.
//

// Actions
var actionColourA = "#555555";
var actionColourB = "#999999";
var actionBorderColour = "#000000";

// Branches
var branchColourA = "#3333CC";
var branchColourB = "#5555EE";
var branchBorderColour = "#000000";

// Iterations
var iterationColourA = "#222222";
var iterationColourB = "#444444";
var iterationBorderColour = "#000000";

// Selections
var selectionColourA = "#9933CC";
var selectionColourB = "#BB55EE";
var selectionBorderColour = "#000000";

var nodeWidth = 50;
var gapBetweenNodes = 20;

//+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// Input control, event handlers etc.
//

const LeftMouseButton = 0;
const RightMouseButton = 3;
canvas.addEventListener("contextmenu", handleContextMenu, false);
canvas.addEventListener("mousemove", onMouseMove, false);
canvas.addEventListener("mousedown", onMouseDown, false);
canvas.addEventListener("mouseup", onMouseUp, false);
canvas.addEventListener("mousewheel", onMouseWheel, false);

//+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// Text information, size and colour
//
var textColour = "#000000";
var textFont = "monospace";
var textSize = 15;

//+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// The colour to clear the canvas contents to.
//
var clearColour = "#FFFFFF";

//+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-
// Menu information.
//
var menuOpen = false;
var menuType = "emptyModel"
var menuX, menuY;
var menuWidth, menuHeight;
var numEntries, entryGap;
var menuHighlightColour = "#AAAAAA";
var menuHighlightedEntry = -1; // -1 for this value means not set.
var menuClickedNode; // The node the menu was opened for.
var nonEmptyOptions = [
	"Insert action after",
	"Insert branch after",
	"Insert iteration after",
	"Insert selection after",
	"delete",
	"Insert action before",
	"Insert branch before",
	"Insert iteration before",
	"Insert selection before"
];
var emptyOptions = [
	"Insert action",
	"Insert branch",
	"Insert iteration",
	"Insert selection"
];

//
// Clears the canvas to clearColour.
//
function clearCanvas() {
	c.fillStyle = clearColour;
	c.beginPath();
	c.fillRect(0, 0, canvas.width, canvas.height);
}

//
// Clears the canvas and draws everything.
//
// The drawing model is as follows:
// 	- Call draw() whenever a UI change occurs.
// 	- If X should be drawn over Y, then draw Y then X.
// 	- Clear the canvas under the component before drawing the component.
//
var debug = false;
var frame = 0;
function draw() {
	clearCanvas();

	if (debug) {
		c.font = "10px monospace";
		c.fillStyle = textColour;
		c.fillText("frame: " + frame,          10, 10);
		c.fillText("cx: " + cx + " cy: " + cy, 10, 25);
		c.fillText("menuOpen = " + menuOpen,   10, 40);
		c.fillText("zoom = " + zoom,           10, 55);
		frame++;
		c.beginPath();
		c.moveTo(0, 0);
		c.lineTo(canvas.width, canvas.height);
		c.stroke();
		c.beginPath();
		c.moveTo(canvas.width, 0);
		c.lineTo(0, canvas.height);
		c.stroke();
	}

	// Draw the PML model
	drawModel();

	if (menuOpen) {
		drawMenu();
	}
}

//
// Draws the menu.
//
function drawMenu() {

	if (menuType == "emptyModel") {
		// Options are to insert a first element.

		entryGap = 5;
		menuHeight = emptyOptions.length * (textSize + entryGap);
		menuWidth = 150; // Should fit longest string.

		c.fillStyle = clearColour;
		c.beginPath();
		c.fillRect(menuX, menuY, menuWidth, menuHeight);

		if (menuHighlightedEntry != -1) {
			c.fillStyle = menuHighlightColour;
			c.fillRect(menuX, menuY + menuHighlightedEntry *
				(textSize + entryGap), menuWidth,
				textSize + entryGap);
		} 
		c.fillStyle = textColour;
		c.rect(menuX, menuY, menuWidth, menuHeight);
		c.stroke();

		c.font = textSize + "px " + textFont;
		var i;
		for (i = 0; i < emptyOptions.length; i++) {
			c.fillText(emptyOptions[i], menuX,
				menuY + (i + 1) * textSize + i * entryGap);
		}
	} else if (menuType == "nonEmptyModel") {
		c.fillStyle = clearColour;
		c.beginPath();
		c.fillRect(menuX, menuY, menuWidth, menuHeight);

		entryGap = 5;
		menuHeight = nonEmptyOptions.length * (textSize + entryGap);
		menuWidth = 350; // TODO Should fit longest string.

		if (menuHighlightedEntry != -1) {
			c.fillStyle = menuHighlightColour;
			c.fillRect(menuX, menuY + menuHighlightedEntry *
				(textSize + entryGap), menuWidth,
				textSize + entryGap);
		}

		c.fillStyle = textColour;
		c.rect(menuX, menuY, menuWidth, menuHeight);
		c.stroke();

		c.font = textSize + "px " + textFont;
		var i;
		for (i = 0; i < nonEmptyOptions.length; i++) {
			c.fillText(nonEmptyOptions[i], menuX,
				menuY + (i + 1) * textSize + i * entryGap);
		}
	}
}

//
// Draws the PML model.
//
function drawModel() {
	var currentNode = listHead;
	while (currentNode) {
		drawNode(currentNode);
		currentNode = currentNode.next;
	}
}

//
// Returns true if (ax, ay) in bounds of rectangle b.
//
function inBounds(ax, ay, bx, by, width, height) {
	return ax >= bx && ax < bx + width && ay >= by && ay < by + height;
}

//
// Handles mouse presses EXCEPT right click.
//
function onMouseDown(e) {
	switch (e.button) {
	case LeftMouseButton:
		lmbPressed = true;
		break
	case RightMouseButton:
		// Throw away RMB clicks here, they are used to open the menu.
		return;
	}

	var canvasOffset = $("#canvas").offset();
	var offsetX = canvasOffset.left;
	var offsetY = canvasOffset.top;
	// The cursor coordinates on the canvas.
	var mx = parseInt(e.clientX - offsetX);
	var my = parseInt(e.clientY - offsetY);

	// If the menu is open it grabs all mouse move events over anything
	// under it.
	if (menuOpen && inBounds(mx, my, menuX, menuY, menuWidth, menuHeight)) {
		// Each entry is textSize + entryGap px high.
		var clickedEntryIndex = Math.floor((my - menuY) /
			(textSize + entryGap));

		if (menuType == "emptyModel") {
			switch (clickedEntryIndex) {
			case 0:
				listHead = new node("action", canvas.width / 2,
					canvas.height / 2, nodeWidth,
					nodeWidth, null, null, null);
				menuType = "nonEmptyModel";
				menuOpen = false;
				draw();
				break;
			case 1:
				nope();
				break;
			case 2:
				nope();
				break;
			case 3:
				nope();
				break;
			}
		} else if (menuType == "nonEmptyModel") {
			switch (clickedEntryIndex) {
			case 0: // Insert action after
				var newNode = new node("action",
					menuClickedNode.x +
					menuClickedNode.width + gapBetweenNodes,
					menuClickedNode.y, nodeWidth, nodeWidth,
					menuClickedNode.next, null, null);
				menuClickedNode.next = newNode;
				var i = newNode.next;
				while (i) {
					// Push everything over
					i.x += nodeWidth + gapBetweenNodes;
					i = i.next;
				}
				menuOpen = false;
				draw();
				break;
			case 1: // Insert branch after
				var newNode = new node("branch",
					menuClickedNode.x +
					menuClickedNode.width + gapBetweenNodes,
					menuClickedNode.y, nodeWidth, nodeWidth,
					menuClickedNode.next, null, null);
				menuClickedNode.next = newNode;
				var i = newNode.next;
				while (i) {
					// Push everything over
					i.x += nodeWidth + gapBetweenNodes;
					i = i.next;
				}
				menuOpen = false;
				draw();
				break;
			case 2: // Insert iteration after
				var newNode = new node("iteration",
					menuClickedNode.x +
					menuClickedNode.width + gapBetweenNodes,
					menuClickedNode.y, nodeWidth, nodeWidth,
					menuClickedNode.next, null, null);
				menuClickedNode.next = newNode;
				var i = newNode.next;
				while (i) {
					// Push everything over
					i.x += nodeWidth + gapBetweenNodes;
					i = i.next;
				}
				menuOpen = false;
				draw();
				break;
			case 3: // Insert selection after
				var newNode = new node("selection",
					menuClickedNode.x +
					menuClickedNode.width + gapBetweenNodes,
					menuClickedNode.y, nodeWidth, nodeWidth,
					menuClickedNode.next, null, null);
				menuClickedNode.next = newNode;
				var i = newNode.next;
				while (i) {
					// Push everything over
					i.x += nodeWidth + gapBetweenNodes;
					i = i.next;
				}
				menuOpen = false;
				draw();
				break;
			}
		}
	} else if (menuOpen) {
		menuOpen = false;
		draw();
	}
}

//
//
//
function onMouseUp(e) {
	switch (e.button) {
	case LeftMouseButton:
		lmbPressed = false;
		// Set these back to the unset value so the scene doesn't jump
		// around when a new drag starts.
		dragPrevX = dragPrevY = -1;
		break;
	}
}

//
//
//
function onMouseWheel(e) {
	e.preventDefault();
	menuOpen = false;
	draw();

	if (e.wheelDelta > 0) {
		if (zoom < maxZoom) {
			zoom += zoomDelta;
			draw();
		}
	} else if (e.wheelDelta < 0) {
		if (zoom > minZoom) {
			zoom -= zoomDelta;
			draw();
		}
	}
}

//
// Handles mouse movement.
//
function onMouseMove(e) {
	var canvasOffset = $("#canvas").offset();
	var offsetX = canvasOffset.left;
	var offsetY = canvasOffset.top;
	var mx = parseInt(e.clientX - offsetX);
	var my = parseInt(e.clientY - offsetY);

	// If mouse is moving and LMB is pressed, then the user is dragging.
	if (lmbPressed) {
		if (dragPrevX != -1 && dragPrevY != -1) {
			cx += (1 / zoom) * (mx - dragPrevX);
			cy += (1 / zoom) * (my - dragPrevY);
			draw();
		}
		dragPrevX = mx;
		dragPrevY = my;
	}

	// If the menu is open it grabs all mouse move events over anything
	// under it.
	if (menuOpen && inBounds(mx, my, menuX, menuY, menuWidth, menuHeight)) {
		// Each entry is textSize + entryGap px high.
		var checkMenuHighlightedEntry = Math.floor((my - menuY) /
			(textSize + entryGap));
		if (checkMenuHighlightedEntry != menuHighlightedEntry) {
			menuHighlightedEntry = checkMenuHighlightedEntry;
			draw();
		}

	} else if (menuOpen) {
		menuHighlightedEntry = -1;
		draw();
	}
}

//
// Right click opens the context menu. The context menu contents depend on the
// state of the PML model. If the model is empty, then the meny prompts for a
// first node. Otherwise, if the click was over a node the menu prompts for a
// before/after node, else nothing happens.
//
function handleContextMenu(e) {
	e.preventDefault();

	// If the menu is open close it.
	if (menuOpen) {
		menuOpen = false;
		draw();
		return;
	}

	var canvasOffset = $("#canvas").offset();
	var offsetX = canvasOffset.left;
	var offsetY = canvasOffset.top;
	var mx = parseInt(e.clientX - offsetX);
	var my = parseInt(e.clientY - offsetY);

	// If the model is empty, the menu can be opened anywhere.
	if (menuType == "emptyModel") {
		menuX = mx;
		menuY = my;
		menuOpen = true;
		draw();
	}
	// If the model isn't empty, then the menu can only be opened by right
	// clicking on a node.
	else {
		var node = listHead;
		var finished = false;
		while (!finished && node) {
			if (inBounds(mx, my, (node.x - cx) * zoom,
				(node.y - cy) * zoom, node.width * zoom,
				node.height * zoom)) {
				menuX = mx;
				menuY = my;
				menuClickedNode = node;
				menuOpen = true;
				draw();
				finished = true;
			}
			node = node.next;
		}
	}
}

//
//
//
function node(type, x, y, width, height, next, prev, contents) {
	this.type = type;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.next = next;
	this.prev = prev;
	this.contents = contents;
}

//
//
//
function drawNode(node) {
	var x = node.x - cx, y = node.y - cy;
	var gradient = c.createLinearGradient(x * zoom, y * zoom,
		x * zoom + node.width * zoom, y * zoom + node.height * zoom);
	c.fillStyle = gradient;

	switch (node.type) {
	case "action":
		gradient.addColorStop(0, actionColourA);
		gradient.addColorStop(1, actionColourB);
		c.fillRect(x * zoom, y * zoom, node.width * zoom,
			node.height * zoom);
		c.strokeStyle = actionBorderColour;
		c.strokeRect(x * zoom, y * zoom, node.width * zoom,
			node.height * zoom);
		break;
	case "branch":
		gradient.addColorStop(0, branchColourA);
		gradient.addColorStop(1, branchColourB);
		c.fillRect(x * zoom, y * zoom, node.width * zoom,
			node.height * zoom);
		c.strokeStyle = branchBorderColour;
		c.strokeRect(x * zoom, y * zoom, node.width * zoom,
			node.height * zoom);
		break;
	case "iteration":
		gradient.addColorStop(0, iterationColourA);
		gradient.addColorStop(1, iterationColourB);
		c.fillRect(x * zoom, y * zoom, node.width * zoom,
			node.height * zoom);
		c.strokeStyle = iterationBorderColour;
		c.strokeRect(x * zoom, y * zoom, node.width * zoom,
			node.height * zoom);
		break;
	case "selection":
		gradient.addColorStop(0, selectionColourA);
		gradient.addColorStop(1, selectionColourB);
		c.fillRect(x * zoom, y * zoom, node.width * zoom,
			node.height * zoom);
		c.strokeStyle = selectionBorderColour;
		c.strokeRect(x * zoom, y * zoom, node.width * zoom,
			node.height * zoom);
		break;
	}
}

function nope() {
	alert("not implemented");
}

