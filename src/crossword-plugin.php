<?php
/*
Plugin Name: Crossword Plugin
Plugin URI: https://github.com/TheVarsity/crossword-plugin
Description: A plugin to create and display crosswords on a WordPress website.
Version: 1.0.1
Author: Andrew Hong
Author URI: https://ahong.ca
License: GNU GPLv3
*/

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

// Include plugin config file.
require_once(plugin_dir_path(__FILE__) . 'crossword-plugin-config.php');

/**
 * Registers the crossword post type.
 */
function crossword_post_type()
{
    $labels = array(
        'name' => CROSSWORD_PLUGIN_STRINGS['POST_TYPE_NAME'],
        'singular_name' => CROSSWORD_PLUGIN_STRINGS['POST_TYPE_SINGULAR_NAME'],
        'add_new' => CROSSWORD_PLUGIN_STRINGS['POST_TYPE_ADD_NEW'],
        'add_new_item' => CROSSWORD_PLUGIN_STRINGS['POST_TYPE_ADD_NEW_ITEM'],
        'edit_item' => CROSSWORD_PLUGIN_STRINGS['POST_TYPE_EDIT_ITEM'],
        'new_item' => CROSSWORD_PLUGIN_STRINGS['POST_TYPE_NEW_ITEM'],
        'view_item' => CROSSWORD_PLUGIN_STRINGS['POST_TYPE_VIEW_ITEM'],
        'search_items' => CROSSWORD_PLUGIN_STRINGS['POST_TYPE_SEARCH_ITEMS'],
        'not_found' => CROSSWORD_PLUGIN_STRINGS['POST_TYPE_NOT_FOUND'],
        'not_found_in_trash' => CROSSWORD_PLUGIN_STRINGS['POST_TYPE_NOT_FOUND_IN_TRASH'],
        'parent_item_colon' => CROSSWORD_PLUGIN_STRINGS['POST_TYPE_PARENT_ITEM_COLON'],
        'menu_name' => CROSSWORD_PLUGIN_STRINGS['POST_TYPE_MENU_NAME'],
    );

    $args = array(
        'labels' => $labels,
        'hierarchical' => false,
        'description' => CROSSWORD_PLUGIN_STRINGS['POST_TYPE_DESCRIPTION'],
        'supports' => array('title', 'author'),
        'public' => true,
        'exclude_from_search' => true,
        'publicly_queryable' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'menu_position' => 5,
        'menu_icon' => 'dashicons-editor-table',
        'show_in_nav_menus' => false,
    );

    register_post_type('crossword', $args);
}

/**
 * Displays the crossword puzzle on the front-end.
 *
 * @param array $atts The shortcode attributes.
 * @return string The HTML for the crossword puzzle.
 */
function crossword_shortcode($atts)
{
    $atts = shortcode_atts(array(
        'id' => null,
        'size' => CROSSWORD_PLUGIN_DEFAULT_WIDTH_HEIGHT,
        'gridSize' => CROSSWORD_PLUGIN_DEFAULT_SIZE,
    ), $atts);

    $crossword = get_post($atts['id']);

    if (!$crossword) {
        return '';
    }

    $crossword_meta = get_post_meta($crossword->ID, 'crossword_meta', true);

    if (!$crossword_meta) {
        return '';
    }

    // The crossword meta should contain the following keys:
    // - id: The ID of the crossword (i.e., post ID)
    // - data: The crossword data (i.e., the Base64-encoded JSON string)
    
    // Obtain URL to plugin_dir/player/player.html
    $player_url = CROSSWORD_PLUGIN_URL . 'player/player.html';

    // Set up iframe with GET parameter gd=data
    $iframe = '<iframe src="' . $player_url . '?gd=' . $crossword_meta['data'] . '" width="' . $atts['size'] . '" height="' . $atts['size'] . '" frameborder="0" scrolling="yes"></iframe>';
    $full_html = '<div style="overflow-x: auto; max-width: 100%;">' . $iframe . '</div>';

    return $full_html;
}

/**
 * Displays the crossword editor.
 *
 * @param WP_Post $post The post object.
 */
function crossword_meta_box_callback($post)
{
    wp_nonce_field('crossword_meta_box', 'crossword_meta_box_nonce');

    $crossword_meta = get_post_meta($post->ID, 'crossword_meta', true);

    if (!$crossword_meta) {
        $crossword_meta = array(
            'id' => $post->ID,
            'data' => '',
            'gridSize' => CROSSWORD_PLUGIN_DEFAULT_SIZE,
        );
    }
    
    // Generate link to crossword editor
    $editor_url = CROSSWORD_PLUGIN_URL . 'designer/designer.html';
    $url_parameters = '?gd=' . $crossword_meta['data'] . '&size=' . $crossword_meta['gridSize'];
    $editor_url .= $url_parameters;

    // Add hidden input field for crossword data
    echo '<input type="hidden" name="crossword_meta_box_data" id="crossword_meta_box_data" value="' . $crossword_meta['data'] . '">';
    
    // Enqueue script at resources/crossword-plugin.js
    wp_enqueue_script('crossword-plugin', CROSSWORD_PLUGIN_URL . 'resources/crossword-plugin.js');

    // Return iframe
    echo '<div style="overflow-x: auto; max-width: 100%;">';
    echo '<iframe id="crosswordEditorFrame" src="' . $editor_url . '" width="700px" height="700px" frameborder="0" scrolling="yes"></iframe>';
    echo '</div>';

    // Return help text
    echo CROSSWORD_PLUGIN_EDITOR_HELP_STRING;
}

/**
 * Defines the meta box for the crossword data.
 */
function crossword_meta_box()
{
    add_meta_box(
        'crossword_meta_box',
        CROSSWORD_PLUGIN_EDITOR_STRING,
        'crossword_meta_box_callback',
        'crossword',
        'normal',
        'high'
    );
}

/**
 * Saves the crossword meta box data for a given post.
 *
 * @param int $post_id The ID of the post being saved.
 * @return void
 */
function crossword_meta_box_save($post_id)
{
    if (!isset($_POST['crossword_meta_box_nonce'])) {
        return;
    }

    if (!wp_verify_nonce($_POST['crossword_meta_box_nonce'], 'crossword_meta_box')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    if (!isset($_POST['crossword_meta_box_data'])) {
        return;
    }

    $crossword_meta = get_post_meta($post_id, 'crossword_meta', true);
    if (!$crossword_meta) {
        $crossword_meta = array(
            'id' => $post_id,
            'data' => '',
            'gridSize' => CROSSWORD_PLUGIN_DEFAULT_SIZE,
        );
    }

    $crossword_meta['data'] = $_POST['crossword_meta_box_data'];

    // log to debug_log
    error_log('Saving crossword data: ' . $crossword_meta['data'] . ' for crossword ' . $crossword_meta['id'] . ' with grid size ' . $crossword_meta['gridSize'] . '.');

    update_post_meta($post_id, 'crossword_meta', $crossword_meta);
}

/**
 * Function to define the meta box for resetting the crossword puzzle.
 */
function crossword_meta_box_reset()
{
    add_meta_box(
        'crossword_meta_box_reset',
        'Reset crossword',
        'crossword_meta_box_reset_callback',
        'crossword',
        'side',
        'high'
    );
}

/**
 * Displays fields for resetting the crossword puzzle.
 *
 * @param WP_Post $post The post object.
 */
function crossword_meta_box_reset_callback($post)
{
    wp_nonce_field('crossword_meta_box', 'crossword_meta_box_nonce');

    echo '<p>Click the button below to reset the crossword. Please note that this will delete all existing data for this puzzle.</p>';

    echo '<label for="crossword_meta_box_reset_confirm">Confirm reset:&nbsp;&nbsp;</label>';
    echo '<input type="checkbox" id="crossword_meta_box_reset_confirm" name="crossword_meta_box_reset_confirm">';
    echo '<br><br>';
    echo '<input type="submit" class="button button-primary button-large" name="crossword_meta_box_reset" value="Reset crossword">';
}

/**
 * Resets and saves the crossword meta box data for a given post.
 *
 * @param int $post_id The ID of the crossword post to reset.
 * @return void
 */
function crossword_meta_box_reset_save($post_id)
{
    if (!isset($_POST['crossword_meta_box_reset'])) {
        return;
    }

    if (!wp_verify_nonce($_POST['crossword_meta_box_nonce'], 'crossword_meta_box')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    // Check for crossword_meta_box_reset_confirm
    if (!isset($_POST['crossword_meta_box_reset_confirm']) || $_POST['crossword_meta_box_reset_confirm'] != 'on') {
        return;
    }

    $crossword_meta = array(
        'id' => $post_id,
        'data' => '',
        'gridSize' => CROSSWORD_PLUGIN_DEFAULT_SIZE,
    );

    // log to error_log
    error_log('Resetting crossword data for crossword ' . $crossword_meta['id'] . '.');

    update_post_meta($post_id, 'crossword_meta', $crossword_meta);
}

/**
 * Function to define the meta box for the crossword data.
 */
function crossword_meta_box_size()
{
    add_meta_box(
        'crossword_meta_box_size',
        'Crossword size',
        'crossword_meta_box_size_callback',
        'crossword',
        'side',
        'high'
    );
}

/**
 * Displays fields for the size of the crossword puzzle.
 *
 * @param WP_Post $post The post object.
 */
function crossword_meta_box_size_callback($post)
{
    wp_nonce_field('crossword_meta_box', 'crossword_meta_box_nonce');

    $crossword_meta = get_post_meta($post->ID, 'crossword_meta', true);

    if (!$crossword_meta) {
        $crossword_meta = array(
            'id' => $post->ID,
            'data' => '',
            'gridSize' => CROSSWORD_PLUGIN_DEFAULT_SIZE,
        );
    }

    echo '<p>Enter the size of the crossword grid below. Please note that this will reset the crossword puzzle.</p>';

    echo '<label for="crossword_meta_box_size">Size:&nbsp;&nbsp;</label>';
    echo '<input type="number" name="crossword_meta_box_size" id="crossword_meta_box_size" value="' . $crossword_meta['gridSize'] . '" min="3" max="20">';
}

/**
 * Saves the size of the crossword puzzle.
 *
 * @param int $post_id The ID of the post being saved.
 */
function crossword_meta_box_size_save($post_id)
{
    if (!isset($_POST['crossword_meta_box_nonce'])) {
        return;
    }

    if (!wp_verify_nonce($_POST['crossword_meta_box_nonce'], 'crossword_meta_box')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    if (!isset($_POST['crossword_meta_box_size'])) {
        return;
    }

    // Check if the size was updated (and changed from previous value)
    $crossword_meta = get_post_meta($post_id, 'crossword_meta', true);
    $size = intval($_POST['crossword_meta_box_size']);
    if ($crossword_meta && $size == intval($crossword_meta['gridSize'])) {
        return;
    }

    $crossword_meta['gridSize'] = $_POST['crossword_meta_box_size'];
    $crossword_meta['data'] = '';

    // log to error_log
    error_log('Updating crossword size to ' . $crossword_meta['gridSize'] . ' for crossword ' . $crossword_meta['id'] . '.');

    update_post_meta($post_id, 'crossword_meta', $crossword_meta);
}

/**
 * Function to define the meta box for the shortcode assistant.
 */
function crossword_meta_box_shortcode_assistant()
{
    add_meta_box(
        'crossword_meta_box_shortcode_assistant',
        'Crossword shortcode assistant',
        'crossword_meta_box_shortcode_assistant_callback',
        'crossword',
        'normal',
        'core'
    );
}

/**
 * Displays fields for the shortcode assistant.
 *
 * @param WP_Post $post The post object.
 */
function crossword_meta_box_shortcode_assistant_callback($post)
{
    wp_nonce_field('crossword_meta_box', 'crossword_meta_box_nonce');

    $crossword_meta = get_post_meta($post->ID, 'crossword_meta', true);

    if (!$crossword_meta) {
        $crossword_meta = array(
            'id' => $post->ID,
            'data' => '',
            'gridSize' => CROSSWORD_PLUGIN_DEFAULT_SIZE,
        );
    }

    echo CROSSWORD_PLUGIN_EDITOR_SHORTCODE_STRING;

    $shortcode = sprintf(CROSSWORD_PLUGIN_EDITOR_SHORTCODE_FORMAT, $crossword_meta['id'], CROSSWORD_PLUGIN_DEFAULT_WIDTH_HEIGHT);
    echo '<input type="text" value="' . htmlspecialchars($shortcode) . '" readonly="readonly" style="width: 100%;">';
}

/**
 * Initializes the crossword plugin.
 */
function crossword_plugin_init()
{
    crossword_post_type();

    // Add editor code.
    add_action('add_meta_boxes', 'crossword_meta_box');
    add_action('save_post', 'crossword_meta_box_save');

    // Add reset code.
    add_action('add_meta_boxes', 'crossword_meta_box_reset');
    add_action('save_post', 'crossword_meta_box_reset_save');

    // Add size update code.
    add_action('add_meta_boxes', 'crossword_meta_box_size');
    add_action('save_post', 'crossword_meta_box_size_save');

    // Add shortcode assistant code.
    add_action('add_meta_boxes', 'crossword_meta_box_shortcode_assistant');

    // Add the shortcode.
    add_shortcode('crossword', 'crossword_shortcode');
}

add_action('init', 'crossword_plugin_init');