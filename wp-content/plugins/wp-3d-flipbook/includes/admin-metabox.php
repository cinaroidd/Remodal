<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

function wp3dfb_register_metabox() {
	add_meta_box(
		'wp3dfb_pages_box',
		__( 'Flipbook Pages', 'wp-3d-flipbook' ),
		'wp3dfb_render_metabox',
		'wp3dfb_flipbook',
		'normal',
		'default'
	);
}

function wp3dfb_render_metabox( $post ) {
	wp_nonce_field( 'wp3dfb_save_pages', 'wp3dfb_nonce' );
	$pages = get_post_meta( $post->ID, '_wp3dfb_pages', true );
	$pages = is_array( $pages ) ? array_map( 'absint', $pages ) : array();
	?>
	<div class="wp3dfb-metabox">
		<p><?php esc_html_e( 'Add images as pages. Drag to reorder.', 'wp-3d-flipbook' ); ?></p>
		<ul id="wp3dfb-pages-list" class="wp3dfb-pages">
			<?php foreach ( $pages as $attachment_id ) :
				$url = wp_get_attachment_image_url( $attachment_id, 'thumbnail' );
				?>
				<li class="wp3dfb-page" data-id="<?php echo esc_attr( $attachment_id ); ?>">
					<input type="hidden" name="wp3dfb_pages[]" value="<?php echo esc_attr( $attachment_id ); ?>" />
					<img src="<?php echo esc_url( $url ); ?>" alt="" />
					<button type="button" class="button link-button wp3dfb-remove">&times;</button>
				</li>
			<?php endforeach; ?>
		</ul>
		<p>
			<button type="button" class="button button-primary" id="wp3dfb-add-pages"><?php esc_html_e( 'Add Pages', 'wp-3d-flipbook' ); ?></button>
		</p>
	</div>
	<?php
}

function wp3dfb_save_metabox( $post_id ) {
	if ( ! isset( $_POST['wp3dfb_nonce'] ) || ! wp_verify_nonce( $_POST['wp3dfb_nonce'], 'wp3dfb_save_pages' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( isset( $_POST['post_type'] ) && 'wp3dfb_flipbook' === $_POST['post_type'] ) {
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
	}

	$pages = isset( $_POST['wp3dfb_pages'] ) && is_array( $_POST['wp3dfb_pages'] ) ? array_map( 'absint', $_POST['wp3dfb_pages'] ) : array();

	if ( empty( $pages ) ) {
		delete_post_meta( $post_id, '_wp3dfb_pages' );
	} else {
		update_post_meta( $post_id, '_wp3dfb_pages', array_values( $pages ) );
	}
}