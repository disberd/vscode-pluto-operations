// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// Import the uuid module to generate random UUIDs for the cells
import * as uuid from 'uuid';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-pluto-operations" is now active!');

	type CellData = {
		codeStart: number;
		codeEnd: number;
		orderLine: number;
		hidden: boolean;
	};

	function newCellData(n: number): CellData {
		return {
			codeStart: n,
			codeEnd: -1,
			orderLine: -1,
			hidden: false
		};
	}

	function extractStructure(editor: vscode.TextEditor) {
		const document = editor.document;
		const cellStructure: { [id: string]: CellData } = {};
		let tracking = '';
		let n = 1;

		// Process the first part of the code
		do {
			const line = document.lineAt(n);
			if (line.text.startsWith('# ╔═╡')) {
				if (uuid.validate(tracking)) {
					// We have to update the last line of the previous cell
					cellStructure[tracking].codeEnd = n;
				}
				const id = line.text.slice(-36);
				// Update the tracking
				tracking = id;
				cellStructure[id] = newCellData(n)
			}
			n++;
		} while (tracking !== '# ╔═╡ Cell order:');
		// Now we just parse the part with the cell order
		while (n < document.lineCount) {
			const line = document.lineAt(n);
			const id = line.text.slice(-36);
			const data = cellStructure[id];
			data.hidden = line.text.startsWith('# ╟─') ? false : true;
			data.orderLine = n;
			n++;
		}
		return cellStructure;
	}

	function showCellId() {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const out = extractStructure(editor);
			vscode.window.showInformationMessage(JSON.stringify(out));
		}
	}

	function currentCellId(editor: vscode.TextEditor) {
		const document = editor.document;
		const currentPosition = editor.selection.active;

		for (let n = currentPosition.line; n > 0; n--) {
			const line = document.lineAt(n);
			if (line.text.startsWith('# ╔═╡')) {
				const id = line.text.slice(-36);
				return { id, line: n };
			}
		}
	}

	function getCellOrder(editor: vscode.TextEditor) {
		const document = editor.document;
		const order = [];
		for (let n = document.lineCount - 1; n > 0; n--) {
			const line = document.lineAt(n);
			if (line.text.startsWith('# ╔═╡ Cell order:')) {
				return order;
			} else {
				const hidden = line.text.startsWith('# ╟─') ? false : true;
				const id = line.text.slice(-36);
				order.unshift({ id, hidden });
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
