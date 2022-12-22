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

	const _mainfestId = '00000000-0000-0000-0000-000000000002';
	const _cellOrderString = '# ╔═╡ Cell order:';
	const _cellDelimiter = '# ╔═╡ ';
	const _hiddenCellDelimiter = '# ╟─';
	const _shownCellDelimiter = '# ╠═';

	function isCellLine(linetext: string) {
		const isCell = [_cellDelimiter, _hiddenCellDelimiter, _shownCellDelimiter].some(s => linetext.startsWith(s));
		return isCell;
	}

	type CellData = {
		codeRange: vscode.Range;
		orderRange: vscode.Range;
		hidden: boolean;
	};

	function newCellData(r: vscode.Range): CellData {
		return {
			codeRange: r,
			orderRange: new vscode.Range(0,0,0,0),
			hidden: false
		};
	}

	function extractStructure(editor: vscode.TextEditor) {
		const document = editor.document;
		const cellStructure: { [id: string]: CellData } = {};
		let tracking = '';
		let n = 0;
		// Process the first part of the code
		for (n; n < document.lineCount; n++) {
			const line = document.lineAt(n);
			if (line.text.startsWith(_cellDelimiter)) {
				if (cellStructure[tracking]) {
					// We have to update the last line of the previous cell
					const cellData = cellStructure[tracking];
					const endPosition = new vscode.Position(n,0);
					cellData.codeRange = new vscode.Range(cellData.codeRange.start, endPosition);
				}
				const id = line.text.slice(-36);
				// Update the tracking
				tracking = id;
				cellStructure[id] = newCellData(line.range);
			}
			if (tracking === _mainfestId) {
				// We stop when we find the manifest cell as it's the last one
				break;
			}
		}  
		// Now we just parse the last part of the notebook with the cell order
		for (n = document.lineCount - 1; n > 0; n--) {
			const line = document.lineAt(n);
			if (line.text === _cellOrderString) {
				// We reached the start of the cell order. We update the mainfest cell data to also save the last code line
				const cellData = cellStructure[_mainfestId];
				const endPosition = new vscode.Position(n,0);
				cellData.codeRange = new vscode.Range(cellData.codeRange.start, endPosition);
				break;
			} else {
				const text = line.text;
				if (!isCellLine(text)) {continue;}; // We skip cells which are not valid cell identifiers
				// We just parse the cell id and update order and hidden status
				const id = text.slice(-36);
				const data = cellStructure[id];
				data.hidden = text.startsWith(_hiddenCellDelimiter) ? true : false;
				data.orderRange = line.rangeIncludingLineBreak;
			}
		}
		return cellStructure;
	}

	function removeCell(editor: vscode.TextEditor) {
		const cellStructure = extractStructure(editor);
		const id = currentCellId(editor);
		if (id === '') {
			vscode.window.showErrorMessage('You are not currently over a valid cell');
		}
		editor.edit(editBuilder => {
			const currentCell = cellStructure[id];
			// Delete the order
			editBuilder.delete(currentCell.orderRange);
			// Delete the code
			editBuilder.delete(currentCell.codeRange);
		});
	}
	function addCell(editor: vscode.TextEditor, after: boolean = true) {
		const cellStructure = extractStructure(editor);
		const id = currentCellId(editor);
		if (id === '') {
			vscode.window.showErrorMessage('You are not currently over a valid cell');
		}
		const newId = uuid.v4();
		editor.edit(editBuilder => {
			const currentCell = cellStructure[id];
			const newCodePosition = after ? currentCell.codeRange.end : currentCell.codeRange.start;
			const newOrderPosition = after ? currentCell.orderRange.end : currentCell.orderRange.start;
			// Insert the cell in the order
			editBuilder.insert(newOrderPosition, _shownCellDelimiter + newId + '\n');
			// Insert the cell in the code
			editBuilder.insert(newCodePosition, _cellDelimiter + newId + '\n\n');
		});
	}

	function addCellAfter() {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			addCell(editor, true);
		}
	}

	function addCellBefore() {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			addCell(editor, false);
		}
	}

	function showCellId() {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const out = currentCellId(editor);
			vscode.window.showInformationMessage(out);
		}
	}

	function currentCellId(editor: vscode.TextEditor) {
		const document = editor.document;
		const currentPosition = editor.selection.active;

		for (let n = currentPosition.line; n > 0; n--) {
			const line = document.lineAt(n);
			const text = line.text;
			if (isCellLine(text)) {
				const id = text.slice(-36);
				return id;
			}
		}
		return '';
	}

	function gotoCodeOrder() {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const cellStructure = extractStructure(editor);
			const id = currentCellId(editor);
			const cellData = cellStructure[id];
			const currentPosition = editor.selection.active;
			const r = cellData.codeRange.contains(currentPosition) ? cellData.orderRange : cellData.codeRange;
			editor.selection = new vscode.Selection(r.start, r.start);
			editor.revealRange(r);
		}
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(vscode.commands.registerCommand('vscode-pluto-operations.current_cell_id', showCellId));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-pluto-operations.add_cell_after', addCellAfter));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-pluto-operations.add_cell_before', addCellBefore));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-pluto-operations.remove_cell', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			removeCell(editor);
		}
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vscode-pluto-operations.goto_code_order', gotoCodeOrder));
}

// This method is called when your extension is deactivated
export function deactivate() { }
