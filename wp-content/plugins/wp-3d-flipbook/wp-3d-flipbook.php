<?php
/**
 * Plugin Name: WP 3D Flipbook (Lite)
 * Description: A lightweight 3D flipbook plugin with a custom post type and shortcode.
 * Version: 0.1.0
 * Author: Cursor AI
 * License: GPLv2 or later
 * Text Domain: wp-3d-flipbook
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Plugin constants
define( 'WP3DFB_VERSION', '0.1.0' );
define( 'WP3DFB_FILE', __FILE__ );
define( 'WP3DFB_DIR', plugin_dir_path( __FILE__ ) );
define( 'WP3DFB_URL', plugin_dir_url( __FILE__ ) );

// Includes
require_once WP3DFB_DIR . 'includes/cpt.php';
require_once WP3DFB_DIR . 'includes/assets.php';
require_once WP3DFB_DIR . 'includes/admin-metabox.php';
require_once WP3DFB_DIR . 'includes/shortcode.php';

// Activation/Deactivation
function wp3dfb_activate() {
	// Register CPT first to ensure rewrite rules exist if needed
	wp3dfb_register_cpt();
	flush_rewrite_rules();
}
register_activation_hook( WP3DFB_FILE, 'wp3dfb_activate' );

function wp3dfb_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( WP3DFB_FILE, 'wp3dfb_deactivate' );

// Bootstrap hooks
add_action( 'init', 'wp3dfb_register_cpt' );
add_action( 'add_meta_boxes', 'wp3dfb_register_metabox' );
add_action( 'save_post', 'wp3dfb_save_metabox' );
add_action( 'admin_enqueue_scripts', 'wp3dfb_admin_assets' );
add_action( 'wp_enqueue_scripts', 'wp3dfb_frontend_assets' );

// Shortcode
add_shortcode( 'wp3dfb', 'wp3dfb_shortcode' );