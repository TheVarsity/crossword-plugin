<?php

/**
 * This file is part of the Crossword Plugin for WordPress.
 * We define any constants we need here.
 */

define('CROSSWORD_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('CROSSWORD_PLUGIN_URL', plugin_dir_url(__FILE__));
define('CROSSWORD_PLUGIN_VERSION', '1.0.1');

define('CROSSWORD_PLUGIN_STRINGS', array(
    'POST_TYPE_NAME' => 'Crosswords',
    'POST_TYPE_SINGULAR_NAME' => 'Crossword',
    'POST_TYPE_ADD_NEW' => 'Add new',
    'POST_TYPE_ADD_NEW_ITEM' => 'Add new crossword',
    'POST_TYPE_EDIT_ITEM' => 'Edit crossword',
    'POST_TYPE_NEW_ITEM' => 'New crossword',
    'POST_TYPE_VIEW_ITEM' => 'View crossword',
    'POST_TYPE_SEARCH_ITEMS' => 'Search crosswords',
    'POST_TYPE_NOT_FOUND' => 'No crosswords found',
    'POST_TYPE_NOT_FOUND_IN_TRASH' => 'No crosswords found in Trash',
    'POST_TYPE_PARENT_ITEM_COLON' => 'Parent crossword:',
    'POST_TYPE_MENU_NAME' => 'Crosswords',
    'POST_TYPE_DESCRIPTION' => 'Crossword',
));

define('CROSSWORD_PLUGIN_DEFAULT_SIZE', '9');
define('CROSSWORD_PLUGIN_EDITOR_STRING', 'Crossword editor');
define('CROSSWORD_PLUGIN_EDITOR_HELP_STRING', '<p><strong>Left-click on a cell to edit it, and right-click to block it (and again to unblock it). Shift-left-click to add a clue.</strong></p>');
define('CROSSWORD_PLUGIN_EDITOR_SHORTCODE_FORMAT', '[crossword id="%d" size="%s"]');
define('CROSSWORD_PLUGIN_EDITOR_SHORTCODE_STRING', 'Copy and paste the following shortcode into your post to display the crossword player:');
define('CROSSWORD_PLUGIN_DEFAULT_WIDTH_HEIGHT', '600px');