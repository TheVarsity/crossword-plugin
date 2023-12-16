'use strict';
(function () {
    const defaultGridData = {
        size: 0,
        cells: [], // Each element is an array of cells of the form { "letter": "", "blocked": false, "hintNumber": ""}
        checksum: 0,
        formatVersion: 1,
        minSquareSize: 20,
    };

    window.onload = function () {
        let solutionData = Object.assign({}, defaultGridData);

        const showStatus = function (type='success') {
            // Show dialog
            const statusContainer = document.getElementById('status-container');
            statusContainer.style.opacity = 0;
            statusContainer.style.display = 'flex';

            // Icon source
            const iconElement = document.getElementById('status-icon');
            if (type === 'success') {
                iconElement.src = 'checkmark.svg';
            } else {
                iconElement.src = 'errormark.svg';
            }

            // Fade in dialog
            setTimeout(() => {
                statusContainer.style.opacity = 1;
            }, 100);
        };

        /**
         * Listener for window resize event
         */
        const resizeListener = function () {
            // Force #player to take up all remaining space
            const player = document.getElementById('player');
            const playerHeight = window.innerHeight;
            player.style.height = playerHeight + 'px';

            // Update cell height so that the grid of size n fits in the player
            const gridSize = solutionData.size;
            const cellHeight = (playerHeight - window.innerHeight * 0.1) / gridSize;
            const gridCells = document.querySelectorAll('#grid td');
            gridCells.forEach((cell) => {
                cell.style.fontSize = cellHeight * 0.7 + 'px';
            });
        };

        const checkWin = function () {
            // Go through each input of the grid data
            let successful = true;
            solutionData.cells.forEach((row, i) => {
                row.forEach((cell, j) => {
                    // Check if the cell has a letter
                    if (!cell.letter) {
                        return;
                    }

                    const input = document.getElementById('cell-' + i + '-' + j).querySelector('input');
                    if (!input) {
                        return;
                    }

                    if (input.value.toLowerCase() !== cell.letter.toLowerCase()) {
                        successful = false;
                    }
                });
            });

            if (successful) {
                showStatus('success');
            }
        }

        const renderGrid = function (gridData) {
            // Initialize grid area
            const gridArea = document.getElementById('gridArea');
            const size = gridData.size;
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

                    let shouldAddInput = true;

                    if (gridData.cells[i][j].blocked) {
                        cell.classList.add('blocked');
                        shouldAddInput = false;
                    }

                    // Check if cell has a hint number
                    if (gridData.cells[i][j].hintNumber) {
                        const hintNumber = document.createElement('span');
                        hintNumber.classList.add('hint');
                        hintNumber.innerHTML = gridData.cells[i][j].hintNumber;
                        cell.appendChild(hintNumber);
                    }

                    // Add input element if required
                    if (shouldAddInput) {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.maxLength = 1;
                        input.classList.add('cell-input');
                        cell.appendChild(input);

                        // Add click listener to input
                        input.addEventListener('click', (e) => {
                            e.stopPropagation();
                            // Highlight the input contents
                            input.select();
                        });

                        // Add keydown listener to input
                        input.addEventListener('keyup', (e) => {
                            e.stopPropagation();

                            // Run win check
                            checkWin();
                        });
                    }
                }
            }

            // Set cell height so that the grid of size n fits in the designer
            resizeListener();
        };

        // Check for URL data
        const urlParams = new URLSearchParams(window.location.search);
        const puzzleData = urlParams.get('gd');

        // If we have puzzle data, try to load it
        if (puzzleData) {
            try {
                solutionData = JSON.parse(atob(puzzleData));
            } catch (e) {
                showStatus('error');
            }
        }

        // Check if we have a valid puzzle
        if (solutionData.size < 1 || solutionData.size > 20) {
            showStatus('error');
            return;
        }

        // Validate checksum
        let checksum = 0;
        for (let i = 0; i < solutionData.size; i++) {
            for (let j = 0; j < solutionData.size; j++) {
                let charCode = solutionData.cells[i][j].letter.charCodeAt(0);
                // make sure charCode is not NaN
                checksum += charCode ? charCode : 0;
            }
        }

        if (checksum !== solutionData.checksum) {
            showStatus('error');
            return;
        }

        // Create grid
        renderGrid(solutionData);

        // Add resize listener
        window.addEventListener('resize', resizeListener);
    };
})();