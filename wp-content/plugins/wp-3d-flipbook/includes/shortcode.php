<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

function wp3dfb_shortcode( $atts ) {
	$atts = shortcode_atts( array(
		'id'     => 0,
		'width'  => '800',
		'height' => '600',
	), $atts, 'wp3dfb' );

	$post_id = absint( $atts['id'] );
	if ( 0 === $post_id ) {
		if ( is_singular( 'wp3dfb_flipbook' ) ) {
			global $post;
			$post_id = $post->ID;
		} else {
			return '';
		}
	}

	$pages = get_post_meta( $post_id, '_wp3dfb_pages', true );
	$pages = is_array( $pages ) ? array_map( 'absint', $pages ) : array();
	if ( empty( $pages ) ) {
		return '';
	}

	$image_urls = array();
	foreach ( $pages as $attachment_id ) {
		$url = wp_get_attachment_image_url( $attachment_id, 'full' );
		if ( $url ) {
			$image_urls[] = esc_url_raw( $url );
		}
	}
	if ( empty( $image_urls ) ) {
		return '';
	}

	$container_id = 'wp3dfb-' . $post_id . '-' . wp_generate_uuid4();

	wp_enqueue_style( 'wp3dfb-frontend' );
	wp_enqueue_script( 'wp3dfb-frontend' );

	$style = sprintf( 'width:%dpx;height:%dpx;', (int) $atts['width'], (int) $atts['height'] );

	$html  = '<div id="' . esc_attr( $container_id ) . '" class="wp3dfb-viewer" style="' . esc_attr( $style ) . '" data-width="' . esc_attr( (int) $atts['width'] ) . '" data-height="' . esc_attr( (int) $atts['height'] ) . '" data-pages="' . esc_attr( wp_json_encode( $image_urls ) ) . '"></div>';

	return $html;
}