<?php
/**
 * Uninstall script for 3D FlipBook Pro
 */

// If uninstall not called from WordPress, then exit
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Include the database class
require_once plugin_dir_path(__FILE__) . 'includes/class-flipbook-database.php';

// Remove database tables
FlipBook_Database::drop_tables();

// Remove options
delete_option('flipbook_pro_version');
delete_option('flipbook_pro_settings');

// Remove any uploaded files (optional - you might want to keep user content)
// $upload_dir = wp_upload_dir();
// $flipbook_dir = $upload_dir['basedir'] . '/flipbooks/';
// if (is_dir($flipbook_dir)) {
//     // Recursively delete directory and contents
//     function rrmdir($dir) {
//         if (is_dir($dir)) {
//             $objects = scandir($dir);
//             foreach ($objects as $object) {
//                 if ($object != "." && $object != "..") {
//                     if (is_dir($dir . "/" . $object)) {
//                         rrmdir($dir . "/" . $object);
//                     } else {
//                         unlink($dir . "/" . $object);
//                     }
//                 }
//             }
//             rmdir($dir);
//         }
//     }
//     rrmdir($flipbook_dir);
// }

// Clear any cached data
wp_cache_flush();