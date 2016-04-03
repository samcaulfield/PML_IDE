## A web-based IDE for PML

**Release 2 progress:**

* Feature points implemented: 94/174
* Feature points tested: 0/174
* Total completed feature points for Release 2: 0/174 (0%)


Contents:

1. Installation.
2. Features And Execution.

### 1. Installation:

These instructions are for installing this software on Ubuntu 14.04 64-bit.

* Ensure the required dependencies are installed:

`make install-deps`

* Choose a project name and deploy the IDE:

`make install ProjectName=<project name>`

* Check that the installation went OK:

`make smoke-test ProjectName=<project name>`

* Access the IDE by visiting `localhost/<project name>` in a web browser.

* Remove the IDE at any time by running:

`make clean ProjectName=<project name>`


### 2. Features And Execution:

---

**Basic Interface**

---

**File upload & download**

Open a file from your system in the editor.
* Click `File > Open from disk`
* In the system-specific file explorer choose the file you wish to open in the editor.
The file will be copied into PML Studio and can be edited. This does not modify the 
file on your system.
* To download a file, Click `File > Save to disk`. You will be prompted with a
dialog for entering the file name. Upon submitting the file name your browser
may present you with more dialogs, follow them as is the case for your browser.
If your browser prompts you with a choice to open or save the file, select
"save". The browser will save the file in the directory normally used for
downloads. Alternatively, press Ctrl-S in Ace mode or C-x C-s in Emacs mode.


**Syntax analysis**

Highlight errors in PML code.
* Enter some PML into the editor. 
* Click `Tools > Check syntax` to receive warning and error messages if there is a 
problem with your model. 
These messages are displayed to the left of the line numbers in the editor.
The editor view will be taken to the first incidence of an error.
* A popup will appear showing the total number of errors as well as the
currently highlighted error. The popup has buttons for viewing the next and
previous error.

**Authentication**

Sign in to use advanced features.
* Click `Account (Not signed in) > Sign in` 
* Click `Don't have an account?`
* Enter an email address and password and click `Register`. If registration was 
successful you will be automatically signed in. 
* To just sign in, click `Account (Not signed in) > Sign in`
* Enter your email address and password and click `Sign in`
* Alternatively, use the editor normally and you will be prompted to sign in on 
attempting to use any account-specific features. 
* To sign out, click `Account (email address) > Sign out`

**Third-party authentication**

PML Studio supports sign in using a Google account.
* Click `Account (Not signed in) > Sign in`
* Click the button with the Google logo that says `Sign in`
* Choose a Google account to sign in with. You should be automatically logged in 
to PML Studio with this account. 
* To sign out, click `Account (email address) > Sign out`

**File save & retrieve**

Save the editor contents online for later retrieval.
* Sign in and click `File > Save to server`
* Enter a file name (file extension optional) and click `Save` The file is now 
saved on the server under your username. 
* To retrieve a file, sign in and click `File > Open from server`. The files saved to
your account will be listed.
* Click on the name of the file to open it in the editor.  If there are no files
saved to your account, the message `There are no files saved on your account` will be displayed.

**Code editor**

The editor in PML Studio features syntax highlighting, keyword and resource completion, 
syntax highlighting and simple emulation of vim and emacs. The code editor is focused by 
default when PML Studio is loaded.

**Syntax highlighting**

Enter PML into the editor and keywords and brackets will be coloured 
in order to improve readability.

**Code completion (keywords and resources)**

This refers to PML specific code completion for PML keywords and resources.
Whilst typing in the code editor you may be prompted with a list of
strings under the cursor. Use the up/down arrow keys to select an entry
in the list and tab to select the highlighted entry.

**Editor keybinding emulation**
* Click `Edit > Preferences` to open the editor's settings menu. The "Keyboard Handler"
drop down list contains entries for several popular keyboard entry modes. 
* Select one and hit Escape or click on the editor area to close the preferences menu.

**Error highlighting**

This ensures all the syntax errors are highlighted.
* Enter some PML into the editor. 
* Click `Tools > Check syntax` to receive warnings and error messages if there is a 
problem with your model. 
These messages are displayed to the left of the line numbers in the editor.

---

**Enhancements to Basic Interface**

---

**Save to user-specified local file**

This feature allows the user to specify the name of the file being saved to disk.
* Click `File > Save to disk`.
* In the dialog that opens, enter the desired file name in the `Save as` textbox.
* Click `Save`.
* The file will now be downloaded in the browser's download directory.

**Jump to first error/warning**

This feature scrolls the text editor to the first occurence of an error or warning.
* Click `Tools > Check syntax`.
* The text editor will jump to the first error or warning.

**Jump to next/prev error/warning**

This feature allows the user to cycle through the errors or warnings.
* Click `Tools > Check syntax`.
* In the dialog box that opens in the top centre of the screen, click
previous/next to cycle the errors and jump to them.

**Keyboard shortcut to save file**

This feature allows the user to save files using vim and emacs bindings.
* Click `Edit > Preferences` and change the `Keyboard Handler` entry to switch
the editor mode.
* In the vim editor mode, enter the command `:w` to save the file.
* In the emacs editor mode, enter the key combination `C-x C-s` to save the file.

---

**Graphical Designer**

---

**Boxes and Arrows**

This feature allows the user to build a PML model graphically.
* Open PML Studio.
* If PML Studio is already open, but the graphical editor is not displayed,
click `Tools > Graphical Editor`.
* The portion of the screen to the right of the text editor contains the
graphical editor. This area is coloured in grey.
* Right click anywhere in the grey area to open the menu.
* Click a menu option to insert the first node in the model.
* From now on, right-click a node to show the list of possible options for the
node.
* Hold left click and drag the mouse to change the camera position in the model.
* Scroll the scrool wheel to zoom the model in and out.
* The legend at the bottom-left of the graphical editor shows what colours
the various PML structures have.

**Scripts**

This feature allows the user to enter scripts into actions in the graphical
editor.
* Open the graphical editor as described in `Boxes and Arrows`.
* Build a PML model containing actions as described in `Boxes and Arrows`.
* Left-click on an action to open the script entry dialog.
* The dialog will display the script of the action if it exists, in the
"Action script" field.
* Enter a new script in the text box for the action and click `Change script`.
* Click `Done` when finished.

**Resources**

This feature allows the user to enter required and provided resources into
actions in the graphical editor.
* Open the graphical editor as described in `Boxes and Arrows`.
* Build a PML model containing actions as described in `Boxes and Arrows`.
* Left-click on an action to open the resources entry dialog.
* The dialog will display the required and provided resources of the action if
they exist, in the "Action required resources" and "Action provided resources"
fields.
* Enter new resources in each field. *Multiple resources must be separated with
'&&'.*
* Click `Change required resources` or `Changed provided resources` 
depending on which fields were changed.
* Click `Done` when finished.

**Agents**

This feature allows the user to specify which agents perform actions in the
graphical editor.
* Open the graphical editor as described in `Boxes and Arrows`.
* Build a PML model containing actions as described in `Boxes and Arrows`.
* Left-click on an action to open the agent entry dialog.
* The dialog will display the agents associated with the action if they exist,
in the "Action agents" field.
* Enter new agents into the "Action agents" field.
*Multiple agents must be separated with commas.*
* Click `Change agents`.
* Click `Done` when finished.

**PML Generation**

This feature allows the user to generate PML from the graphical model.
* Open the graphical editor as described in `Boxes and Arrows`.
* Build a PML model as described in `Boxes and Arrows`.
* Click `Generate PML` on the graphical editor toolbar.
* The text editor will now contain the generated PML.

---

**Diagrams**

---

**Resource Flow**

This feature allows the user to display a process diagram annotated with resource
names showing how resources flow through the process.
* Open PML Studio.
* Enter PML code into the text editor either manually or by uploading a file.
* Click `Tools > Resource Flow`.
* The diagram will be displayed in the portion of the screen to the right of the
text editor.

**Analysis Colored Actions**

This feature allows the user to display a process diagram where the actions
are coloured differently if they are "miracles," "black holes," or "transformers".
* Open PML studio
* Enter PML code into the text editor either manually or by uploading a file.
* Click `Tools > Resource Flow`.
* The diagram will be displayed in the portion of the screen to the right of the
text editor.
* If the action is a transformer, the name of the action is highlighted in green.
* If the action is a black hole, the name of the action is highlighted in yellow.
* If the action is a miracle, the name of the action is highlighted in pink.

