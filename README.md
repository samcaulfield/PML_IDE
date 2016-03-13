## A web-based IDE for PML


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

**File upload & download**

Open a file from your system in the editor.
* Click `File > Open from disk`
* In the system-specific file explorer choose the file you wish to open in the editor.
The file will be copied into PML Studio and can be edited. This does not modify the 
file on your system.
* To download a file, Click `File > Save to disk`. If your browser prompts you with a choice
to open or save the file, select "save". The default file name is "file.pml". The
browser will save the file in the directory normally used for downloads.


**Syntax analysis**

Highlight errors in PML code.
* Enter some PML into the editor. 
* Click `Tools > Check syntax` to receive warning and error messages if there is a 
problem with your model. 
These messages are displayed to the left of the line numbers in the editor.

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



