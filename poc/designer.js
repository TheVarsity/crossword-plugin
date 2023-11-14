'use strict';
(function () {
    const appStrings = {
        gridConfirmMessage: 'Are you sure you want to change the grid size?',
        gridSizeInvalidIntegerError: 'Please enter a positive integer',
        copiedToClipboardMessage: 'Copied to clipboard',
    }

    const dialogs = {
        help: {
            type: 'info',
            content: '<p>To use the crossword designer, there are a few actions you need to know:</p><ul><li>Left-click a square to change its letter</li><li>Right-click a square to block/unblock it</li><li>Hold shift and left-click a square to change its hint number</li></ul>',
            title: 'Help',
        },
        copiedToClipboard: {
            type: 'info',
            content: '<p>Copied to clipboard!</p>',
            title: 'Success',
        },
    }

    const defaultSquareData = {
        letter: '',
        blocked: false,
        hintNumber: '',
    };

    const defaultGridData = {
        size: 0,
        cells: [],
        checksum: 0,
        formatVersion: 1
    };

    window.onload = function () {
        let gridData = Object.assign({}, defaultGridData);

        const showMessage = function (message, title = '', type = 'info') {
            // Update dialog header
            const dialogHeader = document.getElementById('dialog-header');
            dialogHeader.innerHTML = '<h2>' + title + '</h2>';
            // Clear classlist
            dialogHeader.className = 'dialog-header';
            dialogHeader.classList.add(`dialog-${type}`);
            // Update dialog content
            const dialogContent = document.getElementById('dialog-content');
            dialogContent.innerHTML = message;
            // Show dialog
            const dialogContainer = document.getElementById('dialog-container');
            dialogContainer.style.opacity = 0;
            dialogContainer.style.display = 'flex';

            // Fade in dialog
            setTimeout(() => {
                dialogContainer.style.opacity = 1;
            }, 100);
        };

        const dialogCloseBtnClick = function () {
            const dialogContainer = document.getElementById('dialog-container');
            dialogContainer.style.opacity = 0;
            setTimeout(() => {
                dialogContainer.style.display = 'none';
            }, 200);
        }

        const confirmMessage = function (message) {
            return confirm(message); // todo: replace with something better
        }

        const updateCell = function (cellRow, cellCol, letter='', blocked=false, hintNumber='') {
            const cell = document.getElementById('cell-' + cellRow + '-' + cellCol);
            const cellData = gridData.cells[cellRow][cellCol];
            cellData.letter = letter.toUpperCase();
            cellData.blocked = blocked;
            cellData.hintNumber = hintNumber;
            cell.innerHTML = '';
            // If a hint is present, display it in a span
            if (hintNumber) {
                const hintSpan = document.createElement('span');
                hintSpan.classList.add('hint');
                hintSpan.innerHTML = hintNumber;
                cell.appendChild(hintSpan);
            }

            // Append letter to cell
            cell.innerHTML += letter;

            if (blocked) {
                cell.classList.add('blocked');
            } else {
                cell.classList.remove('blocked');
            }
        }

        /**
         * Listener for window resize event
         */
        const resizeListener = function () {
            // Force #designer to take up all remaining space
            const designer = document.getElementById('designer');
            // Set height to 100% of window height minus the height
            // taken by the elements #header and #settings
            const header = document.getElementById('header');
            const settings = document.getElementById('settings');
            const designerHeight = window.innerHeight - header.offsetHeight - settings.offsetHeight;
            designer.style.height = designerHeight + 'px';

            // Update cell height so that the grid of size n fits in the designer
            const gridSize = gridData.size;
            const cellHeight = (designerHeight - window.innerHeight * 0.1) / gridSize;
            const cellWidth = cellHeight;
            const gridCells = document.querySelectorAll('#grid td');
            gridCells.forEach((cell) => {
                cell.style.height = cellHeight + 'px';
                cell.style.width = cellWidth + 'px';
                cell.style.fontSize = cellHeight * 0.7 + 'px';
            });
        };

        const updateGrid = function (size) {
            // Initialize grid area
            const gridArea = document.getElementById('gridArea');
            gridArea.innerHTML = '';

            // Create grid using table and setting ID of each cell
            const grid = document.createElement('table');
            grid.id = 'grid';
            grid.classList.add('crossword-grid');
            gridArea.appendChild(grid);
            for (let i = 0; i < size; i++) {
                const row = document.createElement('tr');
                grid.appendChild(row);
                for (let j = 0; j < size; j++) {
                    const cell = document.createElement('td');
                    cell.id = 'cell-' + i + '-' + j;
                    cell.classList.add('cell');
                    row.appendChild(cell);
                }
            }

            // Update grid data
            gridData.size = size;
            gridData.cells = [];

            // Insert empty cells
            for (let i = 0; i < size; i++) {
                gridData.cells.push([]);
                for (let j = 0; j < size; j++) {
                    gridData.cells[i].push(Object.assign({}, defaultSquareData));
                }
            }

            // Register listeners
            const gridCells = document.querySelectorAll('#grid td');

            const gridCellClick = function () {
                // Check if cell is blocked
                if (this.classList.contains('blocked')) {
                    return;
                }

                // Check if shift key is pressed
                if (event.shiftKey) {
                    return;
                }

                const cellId = this.id;
                const cell = document.getElementById(cellId);
                const cellCoords = cellId.split('-');
                const cellData = gridData.cells[cellCoords[1]][cellCoords[2]];
                const letter = prompt('Enter letter', cellData.letter);
                if (letter !== null && letter.length === 1) {
                    // force uppercase
                    updateCell(cellCoords[1], cellCoords[2], letter, false, cellData.hintNumber);
                }
            };

            const gridCellRightClick = function (event) {
                event.preventDefault();
                const cellId = this.id;
                const cell = document.getElementById(cellId);
                const cellCoords = cellId.split('-');
                const cellData = gridData.cells[cellCoords[1]][cellCoords[2]];
                cellData.letter = '';
                cellData.blocked = !cellData.blocked;
                cellData.hintNumber = '';
                cell.classList.toggle('blocked');
                cell.innerHTML = '';
            };

            // click handler for shift-click
            const gridCellShiftClick = function (event) {
                // Check if shift key is pressed
                if (!event.shiftKey) {
                    return;
                }

                // Check if cell is blocked
                if (this.classList.contains('blocked')) {
                    return;
                }

                // Allow user to enter hint number
                const cellId = this.id;
                const cell = document.getElementById(cellId);
                const cellCoords = cellId.split('-');
                const cellData = gridData.cells[cellCoords[1]][cellCoords[2]];
                const hintNumber = prompt('Enter hint number', cellData.hintNumber);
                if (hintNumber !== null) {
                    cellData.hintNumber = hintNumber;
                    updateCell(cellCoords[1], cellCoords[2], cellData.letter, false, cellData.hintNumber);
                }
            }

            gridCells.forEach((cell) => {
                cell.addEventListener('click', gridCellClick);
                cell.addEventListener('click', gridCellShiftClick);
                cell.addEventListener('contextmenu', gridCellRightClick);
            });
        };

        const exportGridBtnClick = function () {
            // JSONify gridData
            let currentGridData = Object.assign({}, gridData);
            // Add format versiongridData
            currentGridData.formatVersion = 1;
            // Compute checksum
            currentGridData.checksum = 0;
            console.log(currentGridData.cells);
            for (let i = 0; i < currentGridData.size; i++) {
                for (let j = 0; j < currentGridData.size; j++) {
                    let charCode = currentGridData.cells[i][j].letter.charCodeAt(0);
                    // make sure charCode is not NaN
                    currentGridData.checksum += charCode ? charCode : 0;
                }
            }

            console.log(currentGridData);
            
            const gridDataJSON = JSON.stringify(currentGridData);
            // Encode gridDataJSON to base64
            const gridDataBase64 = btoa(gridDataJSON);

            // Copy to clipboard
            const tempInput = document.createElement('input');
            tempInput.value = gridDataBase64;
            document.body.appendChild(tempInput);
            tempInput.select();
            tempInput.setSelectionRange(0, 999999999);
            navigator.clipboard.writeText(tempInput.value);
            showMessage(dialogs.copiedToClipboard.content, dialogs.copiedToClipboard.title, dialogs.copiedToClipboard.type);
            document.body.removeChild(tempInput);
        }

        const updateGridBtnClick = function () {
            const size = document.getElementById('gridSize').value;
            // Check if size is a positive integer
            if (size > 0 && size % 1 === 0) {
                if (confirmMessage(appStrings.gridConfirmMessage)) {
                    updateGrid(size);
                    resizeListener();
                }
            } else {
                showMessage(appStrings.gridSizeInvalidIntegerError);
            }
        };

        updateGrid(15);
        resizeListener();

        // Register listeners
        const updateGridBtn = document.getElementById('updateGridBtn');
        updateGridBtn.addEventListener('click', updateGridBtnClick);
        window.addEventListener('resize', resizeListener);
        const exportGridBtn = document.getElementById('exportGridBtn');
        exportGridBtn.addEventListener('click', exportGridBtnClick);
        const helpBtn = document.getElementById('helpBtn');
        helpBtn.addEventListener('click', function () {
            showMessage(dialogs.help.content, dialogs.help.title, dialogs.help.type);
        });
        const closeBtn = document.getElementById('closeDialogBtn');
        closeBtn.addEventListener('click', dialogCloseBtnClick);
    };
})();
