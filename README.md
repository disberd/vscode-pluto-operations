# vscode-pluto-operations README

This is an extension to perform basic cell operations in [Pluto](https://github.com/fonsp/Pluto.jl/) notebook files. This can be useful when one wants to modify a notebook without a Pluto server running or even to perform basic operations directly on the file and exploit the auto-reload from file feature of Pluto.

## Features

All the commands operate either __on__ or __based__ on the cell where the cursor is currently active. The active cell is parsed both when the crusor is inside the cell code as well as when it is on the list of Cell orders at the bottom of the notebook. 
The following commands/functionalities are currently supported:

### Add a cell
The commands _Pluto: Add a Cell After_ and _Pluto: Add a Cell Before_ create a new empty cell and position it either after or before the currently active cell:

### Remove a cell
The command _Pluto: Remove Cell_ deletes the currently active cell from the notebook

### Move between Cell Code and Cell Order
The command _Pluto: Go To Cell Code/Order_ moves both the cursor and the editor view between the code and the cell order for the currently active cell. 
- When the command is invoked from the cell code, the cursor moves to the line of the active cells in the Cell Order section at the bottom of the notebook.
- When the command is invoked from the Cell Order section at the bottom of the notebook, the cursor and editor view is moved to the active cell code definition.

## Release Notes

### 0.0.1

Initial release 
