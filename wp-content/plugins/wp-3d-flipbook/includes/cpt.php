<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

function wp3dfb_register_cpt() {
	$labels = array(
		'name'               => __( 'Flipbooks', 'wp-3d-flipbook' ),
		'singular_name'      => __( 'Flipbook', 'wp-3d-flipbook' ),
		'add_new'            => __( 'Add New', 'wp-3d-flipbook' ),
		'add_new_item'       => __( 'Add New Flipbook', 'wp-3d-flipbook' ),
		'edit_item'          => __( 'Edit Flipbook', 'wp-3d-flipbook' ),
		'new_item'           => __( 'New Flipbook', 'wp-3d-flipbook' ),
		'view_item'          => __( 'View Flipbook', 'wp-3d-flipbook' ),
		'search_items'       => __( 'Search Flipbooks', 'wp-3d-flipbook' ),
		'not_found'          => __( 'No flipbooks found', 'wp-3d-flipbook' ),
		'not_found_in_trash' => __( 'No flipbooks found in Trash', 'wp-3d-flipbook' ),
		'menu_name'          => __( '3D Flipbooks', 'wp-3d-flipbook' ),
	);

	$args = array(
		'labels'             => $labels,
		'public'             => false,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'show_in_rest'       => false,
		'supports'           => array( 'title' ),
		'menu_icon'          => 'dashicons-book',
		'capability_type'    => 'post',
		'has_archive'        => false,
		'rewrite'            => false,
	);

	register_post_type( 'wp3dfb_flipbook', $args );
}