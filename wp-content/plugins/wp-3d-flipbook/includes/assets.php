<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

function wp3dfb_admin_assets( $hook ) {
	global $post_type;
	if ( in_array( $hook, array( 'post-new.php', 'post.php' ), true ) && 'wp3dfb_flipbook' === $post_type ) {
		wp_enqueue_media();
		wp_enqueue_script( 'jquery-ui-sortable' );
		wp_enqueue_style( 'wp3dfb-admin', WP3DFB_URL . 'assets/css/admin.css', array(), WP3DFB_VERSION );
		wp_enqueue_script( 'wp3dfb-admin', WP3DFB_URL . 'assets/js/admin.js', array( 'jquery' ), WP3DFB_VERSION, true );
	}
}

function wp3dfb_frontend_assets() {
	// External PageFlip library (StPageFlip)
	$cdn_js  = apply_filters( 'wp3dfb_cdn_js', 'https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.min.js' );
	$cdn_css = apply_filters( 'wp3dfb_cdn_css', 'https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/css/page-flip.css' );

	wp_register_style( 'page-flip', $cdn_css, array(), '2.0.7' );
	wp_register_script( 'page-flip', $cdn_js, array(), '2.0.7', true );

	wp_register_style( 'wp3dfb-frontend', WP3DFB_URL . 'assets/css/frontend.css', array( 'page-flip' ), WP3DFB_VERSION );
	wp_register_script( 'wp3dfb-frontend', WP3DFB_URL . 'assets/js/frontend.js', array( 'page-flip' ), WP3DFB_VERSION, true );
}