<?php
/**
 * Uninstall WP 3D Flipbook Plugin
 * 
 * This file is executed when the plugin is deleted from WordPress.
 * It cleans up all plugin data from the database.
 */

// If uninstall not called from WordPress, exit
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete plugin options
delete_option('wp3d_flipbook_settings');

// Delete all flipbook posts
$flipbooks = get_posts(array(
    'post_type' => 'wp3d_flipbook',
    'numberposts' => -1,
    'post_status' => 'any'
));

foreach ($flipbooks as $flipbook) {
    // Delete associated meta data
    delete_post_meta($flipbook->ID, '_wp3d_flipbook_pdf_url');
    delete_post_meta($flipbook->ID, '_wp3d_flipbook_width');
    delete_post_meta($flipbook->ID, '_wp3d_flipbook_height');
    delete_post_meta($flipbook->ID, '_wp3d_flipbook_page_mode');
    delete_post_meta($flipbook->ID, '_wp3d_flipbook_zoom_level');
    delete_post_meta($flipbook->ID, '_wp3d_flipbook_background_color');
    delete_post_meta($flipbook->ID, '_wp3d_flipbook_auto_play');
    delete_post_meta($flipbook->ID, '_wp3d_flipbook_show_controls');
    delete_post_meta($flipbook->ID, '_wp3d_flipbook_show_thumbnails');
    delete_post_meta($flipbook->ID, '_wp3d_flipbook_analytics');
    
    // Delete the post
    wp_delete_post($flipbook->ID, true);
}

// Clean up upload directory (optional - be careful with this)
$upload_dir = wp_upload_dir();
$flipbook_dir = $upload_dir['basedir'] . '/wp3d-flipbooks';

if (is_dir($flipbook_dir)) {
    // Remove .htaccess file
    $htaccess_file = $flipbook_dir . '/.htaccess';
    if (file_exists($htaccess_file)) {
        unlink($htaccess_file);
    }
    
    // Remove directory (only if empty)
    if (count(scandir($flipbook_dir)) <= 2) { // . and .. directories
        rmdir($flipbook_dir);
    }
}

// Flush rewrite rules
flush_rewrite_rules();