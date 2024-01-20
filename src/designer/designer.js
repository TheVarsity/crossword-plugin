'use strict';
(function () {
    const defaultGridData = {
        size: 0,
        cells: [], // Each element is an array of cells of the form { "letter": "", "blocked": false, "hintNumber": "", "specialFlags": []}
        checksum: 0,
        formatVersion: 1,
        minSquareSize: 20,
    };

    window.onload = function () {
        let solutionData = Object.assign({}, defaultGridData);

        const onDataChanged = function () {
            // Update checksum
            let checksum = 0;
            for (let i = 0; i < solutionData.size; i++) {
                for (let j = 0; j < solutionData.size; j++) {
                    let charCode = solutionData.cells[i][j].letter.charCodeAt(0);
                    // make sure charCode is not NaN
                    checksum += charCode ? charCode : 0;
                }
            }
            solutionData.checksum = checksum;
    
            // Update gridData field
            const gridDataField = document.getElementById('gridData');
            gridDataField.value = btoa(JSON.stringify(solutionData));
        };

        const showStatus = function (type = 'success') {
            // Show dialog
            const statusContainer = document.getElementById('status-container');
            statusContainer.style.opacity = 0;
            statusContainer.style.display = 'flex';

            // Icon source
            const iconElement = document.getElementById('status-icon');
            if (type === 'success') {
                iconElement.src = '../resources/checkmark.svg';
                iconElement.classList.value = 'status-icon status-icon-success';
            } else {
                iconElement.src = '../resources/errormark.svg';
                iconElement.classList.value = 'status-icon status-icon-failure';
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
            const designer = document.getElementById('designer');
            const designerHeight = window.innerHeight;
            designer.style.height = designerHeight + 'px';

            // Update cell height so that the grid of size n fits in the designer
            const gridSize = solutionData.size;
            const cellHeight = (designerHeight - window.innerHeight * 0.1) / gridSize;
            const gridCells = document.querySelectorAll('#grid td');
            gridCells.forEach((cell) => {
                cell.style.fontSize = cellHeight * 0.7 + 'px';
            });
        };

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

                    if (gridData.cells[i][j].blocked) {
                        cell.classList.add('blocked');
                    }

                    // Check if cell has a hint number
                    if (gridData.cells[i][j].hintNumber) {
                        const hintNumber = document.createElement('span');
                        hintNumber.classList.add('hint');
                        hintNumber.innerHTML = gridData.cells[i][j].hintNumber;
                        cell.appendChild(hintNumber);
                    }

                    // Check if the cell has a special flag
                    if (gridData.cells[i][j].specialFlags) {
                        // Check if the cell has a cell-circled flag
                        if (gridData.cells[i][j].specialFlags.indexOf('cell-circled') !== -1) {
                            cell.classList.add('cell-circled');
                        }
                    }

                    // Add input element if required
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.classList.add('cell-input');
                    cell.appendChild(input);

                    // Set input value
                    input.value = gridData.cells[i][j].letter;

                    // Add click listener to input
                    input.addEventListener('click', (e) => {
                        e.stopPropagation();
                        // Highlight the input contents
                        input.select();
                    });

                    // Add keydown listener to input
                    input.addEventListener('keyup', (e) => {
                        e.stopPropagation();

                        // Update solution data
                        solutionData.cells[i][j].letter = input.value;
                        onDataChanged();
                    });

                    // Add right click listener to input
                    input.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Toggle blocked status
                        solutionData.cells[i][j].blocked = !solutionData.cells[i][j].blocked;
                        if (solutionData.cells[i][j].blocked) {
                            cell.classList.add('blocked');

                            // Clear input
                            input.value = '';
                            solutionData.cells[i][j].letter = '';
                            solutionData.cells[i][j].hintNumber = '';

                            // Remove hint number element
                            const hintNumberElement = cell.querySelector('.hint');
                            if (hintNumberElement) {
                                hintNumberElement.remove();
                            }
                        } else {
                            cell.classList.remove('blocked');
                        }

                        onDataChanged();
                    });

                    // Add listener to detect shift+click
                    input.addEventListener('mousedown', (e) => {
                        // Shift click
                        if (e.shiftKey) {
                            e.preventDefault();
                            e.stopPropagation();

                            // Prompt for hint number
                            const hintNumber = prompt('Enter hint number:');
                            if (hintNumber) {
                                solutionData.cells[i][j].hintNumber = hintNumber;
                                // Check if the cell already has a hint number element
                                let hintNumberElement = cell.querySelector('.hint');
                                if (hintNumberElement) {
                                    hintNumberElement.innerHTML = hintNumber;
                                } else {
                                    hintNumberElement = document.createElement('span');
                                    hintNumberElement.classList.add('hint');
                                    hintNumberElement.innerHTML = hintNumber;
                                    cell.appendChild(hintNumberElement);
                                }

                                onDataChanged();
                            }
                        }

                        // Ctrl click
                        if (e.ctrlKey) {
                            e.preventDefault();
                            e.stopPropagation();

                            // Add circle special flag if it doesn't exist, otherwise remove it
                            let specialFlags = solutionData.cells[i][j].specialFlags;

                            // If the cell doesn't have any special flags, create the array
                            if (!specialFlags) {
                                solutionData.cells[i][j].specialFlags = [];
                                specialFlags = [];
                            }

                            const circleIndex = specialFlags.indexOf('cell-circled');
                            if (circleIndex === -1) {
                                specialFlags.push('cell-circled');
                                cell.classList.add('cell-circled');
                            } else {
                                specialFlags.splice(circleIndex, 1);
                                cell.classList.remove('cell-circled');
                            }

                            onDataChanged();
                        }
                    });
                }
            }

            // Set cell height so that the grid of size n fits in the designer
            resizeListener();
        };

        // Check for URL data. We look for exiting data in the gridData input field,
        // but also the size parameter for a new puzzle in the URL parameters.
        const urlParams = new URLSearchParams(window.location.search);
        const puzzleData = document.getElementById('gridData').value;
        // If we have puzzle data, try to load it
        if (puzzleData) {
            try {
                solutionData = JSON.parse(atob(puzzleData));
            } catch (e) {
                showStatus('error');
            }
        } else {
            // Check if there is a size parameter
            const sizeParam = urlParams.get('size');

            // Empty, so initialize with default data
            solutionData = Object.assign({}, defaultGridData);
            solutionData.size = sizeParam ? parseInt(sizeParam) : 9;

            // Initialize cells
            for (let i = 0; i < solutionData.size; i++) {
                solutionData.cells[i] = [];
                for (let j = 0; j < solutionData.size; j++) {
                    solutionData.cells[i][j] = {
                        letter: '',
                        blocked: false,
                        hintNumber: '',
                        specialFlags: [],
                    };
                }
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
        onDataChanged();

        // Add resize listener
        window.addEventListener('resize', resizeListener);

        // Append hidden input to body indicating load completion
        const loadedInput = document.createElement('input');
        loadedInput.type = 'hidden';
        loadedInput.value = 'true';
        loadedInput.name = 'loaded';
        loadedInput.id = 'loaded';
        document.body.appendChild(loadedInput);
    };
})();