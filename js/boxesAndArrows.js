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
canvas.addEventListener("mouseout", onMouseOut, false);

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
var menuX, menuY;
var menuWidth, menuHeight;
var numEntries, entryGap;
var menuHighlightColour = "#AAAAAA";
var menuHighlightedEntry = -1; // -1 for this value means not set.
var menuClickedNode; // The node the menu was opened for.
var nonEmptyOptionsAI = [ // Nonempty options - action/iteraton
	"Insert action after",
	"Insert branch after",
	"Insert iteration after",
	"Insert selection after",
	"Delete",
	"Insert action before",
	"Insert branch before",
	"Insert iteration before",
	"Insert selection before"
];
var nonEmptyOptionsBS = [ // Nonempty options - branch/selection
	"Insert action after",
	"Insert branch after",
	"Insert iteration after",
	"Insert selection after",
	"Delete",
	"Insert action before",
	"Insert branch before",
	"Insert iteration before",
	"Insert selection before",
	"Insert action",
	"Insert branch",
	"Insert iteration",
	"Insert selection"
];
var emptyOptions = [ // Options if the model is empty.
	"Insert action",
	"Insert branch",
	"Insert iteration",
	"Insert selection"
];
var menuType = emptyOptions;

function getListHead(node) {
	while (node.prev) {
		node = node.prev;
	}
	return node;
}

function growResult(height, maxParent) {
	this.height = height;
	this.maxParent = maxParent;
}

function Bounds(x, y) {
	this.x = x;
	this.y = y ;
}

//
//
//
function insertAfter(node, nodeAfterType) {
	var newNode = new Node(nodeAfterType,
		menuClickedNode.x + menuClickedNode.width + gapBetweenNodes,
		menuClickedNode.y, nodeWidth, nodeWidth, menuClickedNode.next,
		null, menuClickedNode.parentNode, menuClickedNode);
	menuClickedNode.next = newNode;
	// Push nodes after it over.
	pushX(newNode.next, nodeWidth + gapBetweenNodes);
	growParents(newNode);
}

//
//
//
function getListBounds(listHeadNode) {
	var maxX, maxY;

	if (listHeadNode) {
		maxX = listHeadNode.x + listHeadNode.width;
		maxY = listHeadNode.y + listHeadNode.height;
	} else {
		return null;
	}

	while (listHeadNode) {
		if (listHeadNode.x + listHeadNode.width > maxX) {
			maxX = listHeadNode.x + listHeadNode.width;
		}
		if (listHeadNode.y + listHeadNode.height > maxY) {
			maxY = listHeadNode.y + listHeadNode.height;
		}
		listHeadNode = listHeadNode.next;
	}

	return new Bounds(maxX, maxY);
}

function growParents(newNode) {
	// Adjust parent size to fit.
	var parentNode = newNode.parentNode;
	var bounds = getListBounds(newNode);
	var result = new growResult(0, null);
	while (parentNode) {
		if (parentNode.x + parentNode.width < bounds.x) {
			var oldWidth = parentNode.width;
			parentNode.width = bounds.x - parentNode.x +
				gapBetweenNodes;
			pushX(parentNode.next, parentNode.width - oldWidth);
		}
		if (parentNode.y + parentNode.height < bounds.y) {
			var oldHeight = parentNode.height;
			parentNode.height = bounds.y - parentNode.y +
				gapBetweenNodes;

			result.height = parentNode.height - oldHeight;
			result.maxParent = parentNode;
		}

		newNode = parentNode;
		parentNode = parentNode.parentNode;
		bounds = getListBounds(newNode);
	}
	return result;
}


//
// Find the node at global (x, y) within the node.
//
function findNodeAt(x, y, node) {
	// for each in the list of siblings
	var outerNode = node.contents;
	while (outerNode) {
		var innerNode = outerNode.head;
		while (innerNode) {
			if (inBounds(x, y, innerNode.x, innerNode.y,
				innerNode.width, innerNode.height)) {
				return findNodeAt(x, y, innerNode);
			}

			innerNode = innerNode.next;
		}

		outerNode = outerNode.sibling;
	}
	return node;
}

//
// Get the last element in the list. List head must not be null.
//
function getLastListElement(head) {
	var currentNode = head;
	while (currentNode.next) {
		currentNode = currentNode.next;
	}
	return currentNode;
}

//
// Pushes all nodes including and after node along the X axis by amount units.
//
function pushX(node, amount) {
	while (node) {
		node.x += amount;

		// Push the node internals over too.
		var child = node.contents;
		while (child) {
			if (child.head) {
				pushX(child.head, amount);
			}
			child = child.sibling;
		}

		node = node.next;
	}
}

//
//
//
function pushY(node, amount) {
	while (node) {
		node.y += amount;

		// Push the node internals over too.
		var child = node.contents;
		while (child) {
			if (child.head) {
				pushY(child.head, amount);
			}
			child = child.sibling;
		}

		node = node.next;
	}
}

function getLastSibling(outerNode) {
	while (outerNode.sibling) {
		outerNode = outerNode.sibling;
	}
	return outerNode;
}

function getLargestHeight(listHeadNode) {
	var largest = listHeadNode.height;
	while (listHeadNode) {
		if (listHeadNode.height > largest) {
			largest = listHeadNode.height;
		}
		listHeadNode = listHeadNode.next;
	}
	return largest;
}

function iterationInsert(iteration, newNodeType) {
	return branchInsert(iteration, newNodeType);
}

function selectionInsert(selection, newNodeType) {
	// same logic
	return branchInsert(selection, newNodeType);
}

//
//
//
function branchInsert(branch, newNodeType) {
	// The branch decribes parallel subprocesses
	// It grows downwards on the screen as parallel subprocesses are added
	// New subprocesses are added beneath the existing ones
	// The branch has an outer linked list of the parallel subprocesses
	var lastOuter;
	var newNodeX, newNodeY;

	if (branch.contents) {
		var x = branch.contents;
		var y = null;
		while (x.sibling) {
			y = x;
			x = x.sibling;
		}
		lastOuter = x;

		var z = null;
		if (branch.parentNode) {
			z = branch.parentNode.contents;
			while (z.head !== getListHead(branch)) {
				z = z.sibling;
			}
		}

		lastOuter.sibling = new NodeWrapper(null, null, z);

		var last = lastOuter.head;
		var largest = getLargestHeight(last);
		newNodeX = last.x;
		newNodeY = last.y + largest + gapBetweenNodes;

		lastOuter = lastOuter.sibling;
	} else {
		lastOuter = branch.contents = new NodeWrapper(null, null, null);

		// Set the NodeWrapper parent
		var z = null;
		if (branch.parentNode) {
			z = branch.parentNode.contents;
			while (z.head !== getListHead(branch)) {
				z = z.sibling;
			}
		}
		lastOuter.parentNode = z;

		newNodeX = branch.x + gapBetweenNodes;
		newNodeY = branch.y + gapBetweenNodes;
	}

	var newNode = lastOuter.head = new Node(newNodeType, newNodeX, newNodeY,
		nodeWidth, nodeWidth, null, null, branch, null);

	// Traverse the parents and tell them to expand to fit the new node
//	growParents(newNode);
	var result = growParents(newNode);

	// We added a new node, but the structure needs to expand to accomodate
	// it without overlap
	//
	//        contents
	//        v
	// [b] -> o -> [b] -> [n] -> null
	//        |
	//        o -> [a] -> null
	//        |
	//       null
	//
	// In the above diagram when the new action (n) is added to the branch
	// (b) then the action (a) will need to be pushed down to make way for n
	//

	while (lastOuter) {
		var x = lastOuter.sibling;
		while (x) {
			pushY(x.head, result.height);
			growParents(x.head);
			x = x.sibling;
		}
		lastOuter = lastOuter.parentNode;
	}
}

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

	// draw grid
	var grid = false;//true;
	if (grid) {
		var x, y;
		for (x = 0; x < canvas.width; x += 10) {
			c.beginPath();
			c.moveTo(x, 0);
			c.lineTo(x, canvas.height - 1);
			c.stroke();
		}
		for (y = 0; y < canvas.height; y += 10) {
			c.beginPath();
			c.moveTo(0, y);
			c.lineTo(canvas.width - 1, y);
			c.stroke();
		}
	}
}

//
// Draws the menu.
//
function drawMenu() {
	entryGap = 5;
	menuHeight = menuType.length * (textSize + entryGap);
	menuWidth = 400;

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
	for (i = 0; i < menuType.length; i++) {
		c.fillText(menuType[i], menuX,
			menuY + (i + 1) * textSize + i * entryGap);
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

		switch (menuType) {
		case emptyOptions:
			switch (clickedEntryIndex) {
			case 0: // Insert action
				listHead = new Node("action", mx + cx, my + cy,
					nodeWidth, nodeWidth, null, null, null,
					null);
				menuOpen = false;
				draw();
				break;
			case 1: // Insert branch
				listHead = new Node("branch", mx + cx, my + cy,
					nodeWidth, nodeWidth, null, null, null,
					null);
				menuOpen = false;
				draw();
				break;
			case 2: // Insert iteration
				listHead = new Node("iteration", mx + cx,
					my + cy, nodeWidth, nodeWidth, null,
					null, null, null);
				menuOpen = false;
				draw();
				break;
			case 3: // Insert selection
				listHead = new Node("selection", mx + cx,
					my + cy, nodeWidth, nodeWidth, null,
					null, null, null);
				menuOpen = false;
				draw();
				break;
			}
			break;
		case nonEmptyOptionsAI:
			switch (clickedEntryIndex) {
			case 0: // Insert action after
				insertAfter(menuClickedNode, "action");
				menuOpen = false;
				draw();
				break;
			case 1: // Insert branch after
				newNodeType = "branch";
				insertAfter(menuClickedNode, "branch");
				menuOpen = false;
				draw();
				break;
			case 2: // Insert iteration after
				newNodeType = "iteration";
				insertAfter(menuClickedNode, "iteration");
				menuOpen = false;
				draw();
				break;
			case 3: // Insert selection after
				newNodeType = "selection";
				insertAfter(menuClickedNode, "selection");
				menuOpen = false;
				draw();
				break;
			case 4: // Delete
			case 5: // Insert action before
			case 6: // Insert branch before
			case 7: // Insert iteration before
			case 8: // Insert selection before
				menuOpen = false;
				draw();
				nope();
				break;
			}
			break;
		case nonEmptyOptionsBS:
			switch (clickedEntryIndex) {
			case 0: // Insert action after
				insertAfter(menuClickedNode, "action");
				menuOpen = false;
				draw();
				break;
			case 1: // Insert branch after
				newNodeType = "branch";
				insertAfter(menuClickedNode, "branch");
				menuOpen = false;
				draw();
				break;
			case 2: // Insert iteration after
				newNodeType = "iteration";
				insertAfter(menuClickedNode, "iteration");
				menuOpen = false;
				draw();
				break;
			case 3: // Insert selection after
				newNodeType = "selection";
				insertAfter(menuClickedNode, "selection");
				menuOpen = false;
				draw();
				break;
			case 4: // Delete
			case 5: // Insert action before
			case 6: // Insert branch before
			case 7: // Insert iteration before
			case 8: // Insert selection before
				menuOpen = false;
				draw();
				nope();
				break;
			case 9: // Insert action
				switch (menuClickedNode.type) {
				case "branch":
					branchInsert(menuClickedNode, "action");
					break;
				case "iteration":
					iterationInsert(menuClickedNode, "action");
					break;
				case "selection":
					selectionInsert(menuClickedNode, "action");
					break;
				}
				menuOpen = false;
				draw();
				break;
			case 10: // Insert branch
				switch (menuClickedNode.type) {
				case "branch":
					branchInsert(menuClickedNode, "branch");
					break;
				case "iteration":
					iterationInsert(menuClickedNode, "branch");
					break;
				case "selection":
					selectionInsert(menuClickedNode, "branch");
					break;
				}
				menuOpen = false;
				draw();
				break;
			case 11: // Insert iteration
				switch (menuClickedNode.type) {
				case "branch":
					branchInsert(menuClickedNode, "iteration");
					break;
				case "iteration":
					iterationInsert(menuClickedNode, "iteration");
					break;
				case "selection":
					selectionInsert(menuClickedNode, "iteration");
					break;
				}
				menuOpen = false;
				draw();
				break;
			case 12: // Insert selection
				switch (menuClickedNode.type) {
				case "branch":
					branchInsert(menuClickedNode, "selection");
					break;
				case "iteration":
					iterationInsert(menuClickedNode, "selection");
					break;
				case "selection":
					selectionInsert(menuClickedNode, "selection");
					break;
				}
				menuOpen = false;
				draw();
				break;
			}
			break;
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
// Called when the mouse leaves the canvas area.
//
function onMouseOut(e) {
	// Reset mouse interaction so annoying things don't happen.
	lmbPressed = false;
	dragPrevX = -1;
	dragPrevY = -1;
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

	if (mx < 0 || mx >= canvas.width || my < 0 || my >= canvas.height) {
		return;
	}

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
	if (listHead == null) {
		menuX = mx + 1;
		menuY = my + 1;
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
				menuX = mx + 1;
				menuY = my + 1;
				menuClickedNode = findNodeAt(mx, my, node);
				switch (menuClickedNode.type) {
				case "action":
					menuType = nonEmptyOptionsAI
					break;
				case "branch":
					menuType = nonEmptyOptionsBS;
					break;
				case "iteration":
					if (menuClickedNode.contents) {
						menuType = nonEmptyOptionsAI;
					} else {
						menuType = nonEmptyOptionsBS;
					}
					break;
				case "selection":
					menuType = nonEmptyOptionsBS;
					break;
				}
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
var nodeDebugID = 0;
function Node(type, x, y, width, height, next, contents, parentNode, prev) {
	this.type = type;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.next = next;
	this.contents = contents;
	this.parentNode = parentNode;
	this.ID = nodeDebugID;
	this.prev = prev;
	nodeDebugID++;
}

//
//
//
function NodeWrapper(head, sibling, parentNode) {
	this.head = head;
	this.sibling = sibling;
	this.parentNode = parentNode;
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

	var child = node.contents;
	while (child) {
		var subNode = child.head;
		while (subNode) {
			drawNode(subNode);
			subNode = subNode.next;
		}
		child = child.sibling;
	}
}

function nope() {
	alert("not implemented");
}

