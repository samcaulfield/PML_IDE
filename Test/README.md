
####Tests performed:

**1. registerSignInSignOut.py:**
  * Registers a new Account with an email address (when registering, it will automatically sign in with that account)
  * Signs Out
  * Signs In with the new registered email
  * Generates a random email address every time the test is run 

**2. syntaxAnalysisWarn0.py:**
  * Inputs pml code on the editor with 0 warnings
  * Clicks `Tools--> Syntax Check` and verifies that the box shows `Total warnings: 0`
  
**3. syntaxAnalysisWarn3.py:**
  * Inputs pml code with 3 warnings
  * Clicks `Tools--> Syntax Check` and verified that the box for warnings/errors shows `Total warnings: 3`

**4. python syntaxAnalysisError.py:**
  * Inputs pml code with on Error
  * Clicks `Tools--> Syntax Check` and verifies that the box shows `Total Errors: 1`
  
**5. editorKeybindingEmulation.py:**
  * This is a test to check if edit--> Preferences works by changing the font size
  * Inputs a pml code to the editor, goes to `Edit-->Preferences`
  * Clears the font size, and changes it to 30px
  * Checks if the font size has been changed to 30px by getting the size of the text from the editor css 
  * If not, raises an exception

**6. keywordAndResourceCompletion.py:**
  * The keywords and the beginnings of keywords(1st, 2nd, 3rd letters) are stored in a dictionary
  * Inputs the beginnings of keywords 
  * Checks if the words have been completed when Enter is hit by getting the text from the editor
  * Inputs 'process resourceWord{action beginning of the resource word' 
  * Checks if the resource word has been completed when Enter is hit by getting the text from the editor
  * If not, raises an exception
 
**7. kbdShortcutToSave.py** 
  * This test ensures the keyboard shortcuts for `emacs` and `vim` modes work as they are supposed to.
  * Inputs a piece of pml code in the editor
  * Clicks `Edit-->Preferences`
  * Sets the keyboard handler mode to `emacs`
  * Goes back to the editor, enters keyboard combinations `C-x C-s`
  * The dialog pops up to save the file to disk, closes the dialog
  * Clicks `Edit-->Preferences`
  * Sets the keyboard handler mode to `vim`
  * Enters keyboard combinations `:w ENTER`
  * The dialog pops up to save the file to disk
  
**8. moveToNextPrevWarnings.py**  
  * This test ensures the feature to move to next and previous warnings work
  * Inputs pml code in the editor with 3 warnings
  * Clicks `Tools--> Syntax Check`
  * Checks if the popup for warnings/errors show total warnings: 3, Showing warning #1 of 3
  * Clicks on the next button, checks if the message has changed to Showing warning #2 of 3
  * Clicks on the next button, checks if the message has changed to Showing warning #3 of 3
  * Clicks on the previous button, checks if the message has changed to Showing warning #2 of 3
  * Clicks on the previous button, checks if the message has changed to Showing warning #1 of 3

**9. saveRetrieveServer.py**
  * This test ensures the feature `Save to and Open from Server` works
  * Registers with a randomly generated email address (Need to be signed in in order to save to server)
  * Inputs pml code in the editor
  * Clicks `File--> Save to Server`
  * Enters a name of the file as 'test' and `Save button`
  * Clicks `File--> Open from Server`
  * From the popup, chooses the file 'test' and clicks on it to open the file
  * Checks if the content of the file is the same as of the file that was saved earlier
  
**10. specifyFileName.py**
  * This test ensures that the user can specify the name of the file when saving it to disk
  * Inputs pml code in the editor
  * Clicks `File--> Save to Disk`
  * Specifies the name of the file in the text popup
  * Clicks `Save` button
  * The Firefox popup window will appear 
