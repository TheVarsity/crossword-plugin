'use strict';
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Every 100ms, copy the iframe with id crosswordEditorFrame's input field gridData to the parent window's input field crossword_meta_box_data

        // Get the iframe
        setInterval(function() {
            const iframe = document.getElementById('crosswordEditorFrame');
            const iframeDoc = iframe.contentWindow.document;

            // Check for the loaded input field
            if (!iframeDoc.getElementById('loaded')) {
                return;
            }

            // Get the iframe's input field gridData
            const gridData = iframeDoc.getElementById('gridData').value;

            // Set the parent window's input field crossword_meta_box_data to gridData
            document.getElementById('crossword_meta_box_data').value = gridData;

            // Update field crossword_meta_box_sync_status_last_sync with the current time
            const lastSyncElement = document.getElementById('crossword_meta_box_sync_status_last_sync');
            if (lastSyncElement) {
                lastSyncElement.innerHTML = new Date().toLocaleString();
            }
        }, 100);
    });
})();