<?php
/**
 * Plugin Name: WP 3D Flipbook Lite
 * Description: A lightweight 3D flipbook plugin powered by Three.js. Create flipbooks from images and embed via shortcode.
 * Version: 0.1.0
 * Author: Your Name
 * License: GPLv2 or later
 * Text Domain: wp-3d-flipbook-lite
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'WP3D_FLIPBOOK_VERSION', '0.1.0' );
define( 'WP3D_FLIPBOOK_FILE', __FILE__ );
define( 'WP3D_FLIPBOOK_DIR', plugin_dir_path( __FILE__ ) );
define( 'WP3D_FLIPBOOK_URL', plugin_dir_url( __FILE__ ) );

// Includes
require_once WP3D_FLIPBOOK_DIR . 'includes/class-flipbook-cpt.php';
require_once WP3D_FLIPBOOK_DIR . 'includes/class-flipbook-admin.php';
require_once WP3D_FLIPBOOK_DIR . 'includes/class-flipbook-shortcode.php';

// Bootstrap
add_action( 'init', [ 'WP3D_Flipbook_CPT', 'register' ] );

add_action( 'plugins_loaded', function() {
	// Admin features
	if ( is_admin() ) {
		WP3D_Flipbook_Admin::get_instance();
	}

	// Front-end shortcode
	WP3D_Flipbook_Shortcode::get_instance();
} );