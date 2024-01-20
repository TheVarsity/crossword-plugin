<?php
/**
 * This file provides helper functions related to the crossword player
 * and designer. 
 */

function get_crossword($post_id)
{
    /* Fetch post data */
    $post_id = $_GET['id'];

    /* Load WordPress plugin loader */
    require_once(dirname(__FILE__) . "/../../../wp-load.php");

    /* Load the post */
    $post = get_post($post_id);

    /* Check if the post is published */
    if ($post->post_status != 'publish') {
        return "";
    }

    /* Otherwise, return the data from meta */

    $crossword_meta = get_post_meta($post_id, 'crossword_meta' , true);
    if ($crossword_meta) {
        return $crossword_meta['data'];
    }
    
    return "";
}

$crossword_data = get_crossword($_GET['id']);