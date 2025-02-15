// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

interface HistoryPosition {
  position: vscode.Position;
  editorPath: string;
}

// The cursor position history array containing object with the position in the file and the file path
const history: HistoryPosition[] = [];
// The current position in the history array
let posIndex = 0;
// Flag for moveCursor function so onCursorPositionChange will know to ignore this event
let fromScript = false;

const moveCursor = async (currentEditor: vscode.TextEditor, newPosition: HistoryPosition) => {
  try {
    // A flag so onCursorPositionChange will ignore the event for this position change
    fromScript = true;
    // The path of the current file that is open
    const { path: currentEditorPath } = currentEditor.document.uri;

    // if the current editor path is not equal to the new position path we need to change the active editor to the newPosition one
    const editor =
      currentEditorPath === newPosition.editorPath
        ? currentEditor
        : await vscode.window.showTextDocument(vscode.Uri.file(newPosition.editorPath), { preview: false });

    // Set the cursor position to 0,0 before execute cursorMove command
    // We want this so we will not need to calculate the exact movement from the current position
    const pos0 = new vscode.Position(0, 0);
    const sel = new vscode.Selection(pos0, pos0);
    editor.selection = sel;

    // Move the cursor to the new position
    const { line, character } = newPosition.position;

    await vscode.commands.executeCommand("cursorMove", {
      to: "down",
      by: "line",
      value: line,
    });
    await vscode.commands.executeCommand("cursorMove", {
      to: "right",
      by: "character",
      value: character,
    });
  } catch (err) {
    vscode.window.showErrorMessage(`Error changing cursor position. ${err}`);
  } finally {
    fromScript = false;
  }
};

const checkIfIsSelection = (selection: vscode.Selection): boolean => {
  const start = selection.start;
  const end = selection.end;
  return start.character !== end.character || start.line !== end.line;
};

const onCursorPositionChange = () => {
  try {
    const { activeTextEditor: editor } = vscode.window;

    // If this event cause by moveCursor function we need to ignore it
    if (fromScript) {
      return;
    }

    if (!editor) {
      vscode.window.showErrorMessage("Could not find active editor, please open a file before using the extension.");
      return;
    }

    const isSelection = checkIfIsSelection(editor.selection);

    const newPos = isSelection ? editor.selection.start : editor.selection.active;

    if (!newPos) {
      return;
    }

    const previousPos = history[posIndex]?.position;

    // If there is no new position (glitch) or the new position is the same as the previous one (selection), then stopping.
    if (newPos.character === previousPos?.character && newPos.line === previousPos?.line) {
      return;
    }

    // check the length of difference between last pos to new one
    const newPosColDiff = Math.abs(previousPos?.character - newPos.character);
    const newPosRowDiff = Math.abs(previousPos?.line - newPos.line);

    if (previousPos && newPosColDiff < 80 && newPosRowDiff < 4) {
      return;
    }

    const { path: currentEditorPath } = editor.document.uri;

    // Add the new position to start of history array and reset posIndex
    history.unshift({ position: newPos, editorPath: currentEditorPath });
    posIndex = 0;
  } catch (err) {
    vscode.window.showErrorMessage(`Error registering cursor position change. ${err}`);
  }
};

const onForward = async () => {
  try {
    const { activeTextEditor: editor } = vscode.window;

    if (!editor) {
      vscode.window.showErrorMessage("Could not find active editor, please open a file before using the extension.");
      return;
    }

    // If history is empty 
    // or posIndex === 0 meaning we reach the start of history 
    // or history[posIndex - 1] is not exist (should not happen just in case)
    // returning without moving
    if (!history.length || posIndex === 0 || !history[posIndex - 1]) {
      vscode.window.showInformationMessage("There is no more forwards, reached to end of history.");
      return;
    }

    // Reduce the position index in 1 position
    posIndex--;
    const newPosition = history[posIndex];

    await moveCursor(editor, newPosition);
  } catch (err) {
    vscode.window.showErrorMessage(`Error going forwards. ${err}`);
  }
};

const onBackward = async () => {
  try {
    const { activeTextEditor: editor } = vscode.window;

    if (!editor) {
      vscode.window.showErrorMessage("Could not find active editor, please open a file before using the extension.");
      return;
    }

    // If history is empty 
    // or posIndex larger or equal to history length meaning we reach the end of history 
    // or history[posIndex + 1] is not exist (should not happen just in case)
    // returning without moving
    if (!history.length || posIndex >= history.length || !history[posIndex + 1]) {
      vscode.window.showInformationMessage("There is no more backwards, reached to start of history.");
      return;
    }

    // Increase the position index in 1 position
    posIndex++;

    const newPosition = history[posIndex];

    await moveCursor(editor, newPosition);
  } catch (err) {
    vscode.window.showErrorMessage(`Error going backwards. ${err}`);
  }
};

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
  try {
    // Set listener for cursor position changed
    const onDidChangeTextEditorSelectionSubscription = vscode.window.onDidChangeTextEditorSelection(onCursorPositionChange);

    // Register the commands with in vscode
    // The command has been defined in the package.json file
    // The commandId parameter must match the command field in package.json
    const forwardSubscription = vscode.commands.registerCommand("cursorhistory.forward", onForward);
    const backwardSubscription = vscode.commands.registerCommand("cursorhistory.backward", onBackward);

    // Create action buttons in the bottom status bar
    const forwardBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    const backwardsBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 101);

    // Set the button params
    forwardBtn.text = "»";
    forwardBtn.command = "cursorhistory.forward";
    forwardBtn.tooltip = "Cursor History: forward";

    backwardsBtn.text = "«";
    backwardsBtn.command = "cursorhistory.backward";
    backwardsBtn.tooltip = "Cursor History: backward";

    // Add all subscriptions to vscode global subscriptions
    context.subscriptions.push(...[forwardSubscription, backwardSubscription, onDidChangeTextEditorSelectionSubscription, forwardBtn, backwardsBtn]);

    // Show the buttons in the status bar
    forwardBtn.show();
    backwardsBtn.show();
  } catch (err) {
    vscode.window.showErrorMessage(`Could not activate the Cursor History extension. ${err}`);
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
