# Run in a virtual framebuffer.
Xvfb :10 2>/dev/null &
export DISPLAY=:10

python registerSignInSignOut.py
python syntaxWarning0.py
python syntaxWarn3.py
python syntaxError.py
python editorKeybindingEmulation.py
python keywordAndResourceCompletion.py
python kbdShortcutToSave.py
python moveToNextPrevWarnings.py
python saveRetrieveServer.py
python specifyFileName.py

