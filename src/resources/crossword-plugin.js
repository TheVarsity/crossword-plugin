'use strict';
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Every 100ms, copy the iframe with id crosswordEditorFrame's input field gridData to the parent window's input field crossword_meta_box_data

        // Get the iframe
        setInterval(function() {
            const iframe = document.getElementById('crosswordEditorFrame');

            // Get the iframe's input field gridData
            const gridData = iframe.contentWindow.document.getElementById('gridData').value;

            // Set the parent window's input field crossword_meta_box_data to gridData
            document.getElementById('crossword_meta_box_data').value = gridData;
        }, 100);
    });
})();