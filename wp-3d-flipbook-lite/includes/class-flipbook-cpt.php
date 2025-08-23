<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class WP3D_Flipbook_CPT {
	public static function register() {
		$labels = [
			'name' => __( 'Flipbooks', 'wp-3d-flipbook-lite' ),
			'singular_name' => __( 'Flipbook', 'wp-3d-flipbook-lite' ),
			'add_new' => __( 'Add New', 'wp-3d-flipbook-lite' ),
			'add_new_item' => __( 'Add New Flipbook', 'wp-3d-flipbook-lite' ),
			'edit_item' => __( 'Edit Flipbook', 'wp-3d-flipbook-lite' ),
			'new_item' => __( 'New Flipbook', 'wp-3d-flipbook-lite' ),
			'view_item' => __( 'View Flipbook', 'wp-3d-flipbook-lite' ),
			'view_items' => __( 'View Flipbooks', 'wp-3d-flipbook-lite' ),
			'not_found' => __( 'No flipbooks found', 'wp-3d-flipbook-lite' ),
			'all_items' => __( 'Flipbooks', 'wp-3d-flipbook-lite' ),
		];

		$args = [
			'labels' => $labels,
			'public' => false,
			'show_ui' => true,
			'show_in_menu' => true,
			'menu_icon' => 'dashicons-book-alt',
			'supports' => [ 'title' ],
		];

		register_post_type( 'flipbook', $args );
	}
}