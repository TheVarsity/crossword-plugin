<?php
require_once (dirname(__FILE__) . '/../crossword-helpers.php');
$crossword_data = get_crossword($_GET['id']);
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crossword Editor</title>
    <script type="text/javascript" src="designer.js"></script>
    <link rel="stylesheet" href="designer.css">
</head>

<body>
    <input type="hidden" id="gridData" name="gridData" value="<?php echo $crossword_data; ?>" />
    
    <div id="status-container" class="status-container">
        <img src="../resources/checkmark.svg" class="status-icon status-icon-success" id="status-icon">
    </div>
    <div class="designer" id="designer">
        <div id="gridArea"></div>
    </div>
</body>

</html>