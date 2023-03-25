// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

interface HistoryPosition {
  position: vscode.Position;
  editorPath: string;
}

const history: HistoryPosition[] = [];
let posIndex = 0;
let fromScript = false;

const moveCursor = async (currentEditor: vscode.TextEditor, newPosition: HistoryPosition) => {
  fromScript = true;
  const currentEditorPath = currentEditor.document.uri.path;

  const editor =
    currentEditorPath === newPosition.editorPath
      ? currentEditor
      : await vscode.window.showTextDocument(vscode.Uri.file(newPosition.editorPath), { preview: false });

  const pos0 = new vscode.Position(0, 0);
  const sel = new vscode.Selection(pos0, pos0);
  editor.selection = sel;
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
  fromScript = false;
};

const onCursorPositionChange = () => {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage("could not find active editor");
    return;
  }

  if (fromScript) {
    return;
  }

  const newPos = editor.selection.active || new vscode.Position(0, 0);
  const currentEditorPath = editor.document.uri.path;

  history.unshift({ position: newPos, editorPath: currentEditorPath });
  posIndex = 0;
};

const onForward = async () => {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage("could not find active editor");
    return;
  }

  if (!history.length || posIndex === 0 || !history[posIndex - 1]) {
    vscode.window.showInformationMessage("no more forward");
    return;
  }

  posIndex--;
  const newPosition = history[posIndex];

  await moveCursor(editor, newPosition);
};

const onBackward = async () => {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showErrorMessage("could not find active editor");
    return;
  }

  if (!history.length || posIndex >= history.length || !history[posIndex + 1]) {
    vscode.window.showInformationMessage("no more backward");
    return;
  }

  posIndex++;

  const newPosition = history[posIndex];

  await moveCursor(editor, newPosition);
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const onDidChangeTextEditorSelectionSubscription = vscode.window.onDidChangeTextEditorSelection(onCursorPositionChange);
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const forwardSubscription = vscode.commands.registerCommand("cursorhistory.forward", onForward);
  const backwardSubscription = vscode.commands.registerCommand("cursorhistory.backward", onBackward);

  const forwardBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  const backwardsBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 101);

  forwardBtn.text = "»";
  forwardBtn.command = "cursorhistory.forward";
  forwardBtn.tooltip = "Cursor History: forward";

  backwardsBtn.text = "«";
  backwardsBtn.command = "cursorhistory.backward";
  backwardsBtn.tooltip = "Cursor History: backward";

  context.subscriptions.push(...[
    forwardSubscription, 
    backwardSubscription, 
    onDidChangeTextEditorSelectionSubscription,
    forwardBtn,
    backwardsBtn,
  ]);

  forwardBtn.show();
  backwardsBtn.show();
}

// This method is called when your extension is deactivated
export function deactivate() {}
