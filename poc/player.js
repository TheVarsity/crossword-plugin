'use strict';
(function () {
    const dialogs = {
        puzzleSolved: {
            title: 'Puzzle solved!',
            content: '<p>Congratulations! You have solved the puzzle!</p>',
            type: 'info',
        },
        invalidMessage: {
            title: 'Invalid puzzle',
            content: '<p>The puzzle data you entered was corrupted or invalid.</p>',
            type: 'info',
        }
    }

    const defaultGridData = {
        size: 0,
        cells: [],
        checksum: 0,
        formatVersion: 1,
    };

    window.onload = function () {
        let gridData = Object.assign({}, defaultGridData);
        let solutionData = Object.assign({}, defaultGridData);


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

        const checkWin = function () {
            // Check if all letters are correct
            for (let i = 0; i < gridData.size; i++) {
                for (let j = 0; j < gridData.size; j++) {
                    if (gridData.cells[i][j].letter.toUpperCase() !== solutionData.cells[i][j].letter.toUpperCase()) {
                        console.log(gridData.cells[i][j].letter, solutionData.cells[i][j].letter)
                        return false;
                    }
                }
            }

            return true;
        }

        const completeGame = function () {
            // Lock all cells
            for (let i = 0; i < gridData.size; i++) {
                for (let j = 0; j < gridData.size; j++) {
                    gridData.cells[i][j].editable = false;
                }
            }
        };

        /**
         * Listener for window resize event
         */
        const resizeListener = function () {
            // Force #player to take up all remaining space
            const player = document.getElementById('player');
            // Set height to 100% of window height minus the height
            // taken by the elements #header and #settings
            const header = document.getElementById('header');
            const settings = document.getElementById('settings');
            const playerHeight = window.innerHeight - header.offsetHeight - settings.offsetHeight;
            player.style.height = playerHeight + 'px';

            // Update cell height so that the grid of size n fits in the player
            const gridSize = gridData.size;
            const cellHeight = (playerHeight - window.innerHeight * 0.1) / gridSize;
            const cellWidth = cellHeight;
            const gridCells = document.querySelectorAll('#grid td');
            gridCells.forEach((cell) => {
                cell.style.height = cellHeight + 'px';
                cell.style.width = cellWidth + 'px';
                cell.style.fontSize = cellHeight * 0.7 + 'px';
            });
        };

        const updateCell = function (cellRow, cellCol, letter='', blocked=false, hintNumber='') {
            const cell = document.getElementById('cell-' + cellRow + '-' + cellCol);
            const cellData = gridData.cells[cellRow][cellCol];
            cellData.letter = letter;
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

        const updateGrid = function (data) {
            // Initialize grid area
            const gridArea = document.getElementById('gridArea');
            gridArea.innerHTML = '';

            // Create grid using table and setting ID of each cell
            const grid = document.createElement('table');
            grid.id = 'grid';
            grid.classList.add('crossword-grid');
            gridArea.appendChild(grid);
            for (let i = 0; i < data.size; i++) {
                const row = document.createElement('tr');
                grid.appendChild(row);
                for (let j = 0; j < data.size; j++) {
                    const cell = document.createElement('td');
                    cell.id = 'cell-' + i + '-' + j;
                    cell.classList.add('cell');
                    // Check if cell is blocked
                    data.cells[i][j]["editable"] = true;
                    if (data.cells[i][j].blocked) {
                        cell.classList.add('blocked');
                        data.cells[i][j]["editable"] = false;
                    }

                    cell.innerHTML = '';
                    // Check if hint is present
                    if (data.cells[i][j].hintNumber !== '') {
                        cell.innerHTML += '<span class="hint">' + data.cells[i][j].hintNumber + '</span>';
                    }

                    row.appendChild(cell);
                }
            }

            gridData = data;
            solutionData = JSON.parse(JSON.stringify(data));

            // Clear letters from gridData
            for (let i = 0; i < gridData.size; i++) {
                for (let j = 0; j < gridData.size; j++) {
                    gridData.cells[i][j].letter = '';
                }
            }
            // Print grid data to console
            for (let i = 0; i < gridData.size; i++) {
                let row = '';
                for (let j = 0; j < gridData.size; j++) {
                    row += gridData.cells[i][j].letter + ' ';
                }

                console.log(row);
            }

            // Print solution data to console
            for (let i = 0; i < solutionData.size; i++) {
                let row = '';
                for (let j = 0; j < solutionData.size; j++) {
                    row += solutionData.cells[i][j].letter + ' ';
                }

                console.log(row);
            }

            // Add event listeners to cells
            const gridCells = document.querySelectorAll('#grid td');
            gridCells.forEach((cell) => {
                cell.addEventListener('click', function () {
                    const cellId = cell.id.split('-');
                    const i = parseInt(cellId[1]);
                    const j = parseInt(cellId[2]);
                    // Check if cell is editable
                    if (!gridData.cells[i][j].editable) {
                        // showMessage('This cell cannot be edited');
                        return;
                    }

                    // Get letter
                    const letter = prompt('Enter letter', gridData.cells[i][j].letter);
                    if (letter === null) {
                        return;
                    }

                    // Update letter
                    gridData.cells[i][j].letter = letter;
                    updateCell(i, j, letter, false, gridData.cells[i][j].hintNumber);

                    // Check if win
                    if (checkWin()) {
                        completeGame();
                        showMessage(dialogs.puzzleSolved.content, dialogs.puzzleSolved.title, dialogs.puzzleSolved.type);
                        return;
                    }
                });
            });

            // Insert into document
            document.getElementById('gridArea').appendChild(grid);
        };

        const updateGridBtnClick = function () {
            // Check if the input data is valid
            const data = document.getElementById('gridData').value;

            // Check if data is a valid base64 string
            try {
                atob(data);
            } catch (e) {
                showMessage(dialogs.invalidMessage.content, dialogs.invalidMessage.title, dialogs.invalidMessage.type);
                return;
            }

            // Check if data is a valid JSON string
            try {
                JSON.parse(atob(data));
            } catch (e) {
                showMessage(dialogs.invalidMessage.content, dialogs.invalidMessage.title, dialogs.invalidMessage.type);
                return;
            }

            // Compute checksum
            const gridDataBase64 = data;
            const gridDataJSON = atob(gridDataBase64);
            const gridData = JSON.parse(gridDataJSON);
            console.log(gridData);
            let checksum = 0;
            for (let i = 0; i < gridData.size; i++) {
                for (let j = 0; j < gridData.size; j++) {
                    let charCode = gridData.cells[i][j].letter.charCodeAt(0);
                    checksum += (charCode) ? charCode : 0;
                }
            }

            // Check if checksum is valid
            if (checksum !== gridData.checksum) {
                showMessage(dialogs.invalidMessage.content, dialogs.invalidMessage.title, dialogs.invalidMessage.type);
                return;
            }

            // Update grid
            updateGrid(gridData);

            resizeListener();
        };

        // Register listeners
        const updateGridBtn = document.getElementById('updateGridBtn');
        updateGridBtn.addEventListener('click', updateGridBtnClick);
        window.addEventListener('resize', resizeListener);
        document.getElementById('closeDialogBtn').addEventListener('click', dialogCloseBtnClick);
        document.getElementById('helpBtn').addEventListener('click', () => {
            showMessage('<p>To play, just click on any cell and enter a letter -- use the hints to your advantage and solve the puzzle!</p>', 'Help', 'info');
        });

        // Check if grid data is present in URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlGridData = urlParams.get('gd');
        if (urlGridData) {
            document.getElementById('gridData').value = urlGridData;
            // Lock grid data input
            document.getElementById('gridData').disabled = true;
            document.getElementById('updateGridBtn').disabled = true;
            updateGridBtnClick();
        }
    };
})();
