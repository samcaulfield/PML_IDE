
Tests performed:

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
