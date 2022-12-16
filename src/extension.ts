// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-pluto-operations" is now active!');

	function showCellId() {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const id = currentCellId(editor);
			if (id) {
				vscode.window.showInformationMessage(id);
			}
		}
	}

	function currentCellId(editor: vscode.TextEditor) {
		// Get the active text editor
		if (editor) {
			const document = editor.document;
			const currentPosition = editor.selection.active;

			for (let n = currentPosition.line; n > 0; n--) {
				const line = document.lineAt(n);
				if (line.text.startsWith('# ╔═╡')) {
					const id = line.text.slice(-36);
					return id;
				}
			}
		}
	}
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-pluto-operations.current_cell_id', showCellId);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
