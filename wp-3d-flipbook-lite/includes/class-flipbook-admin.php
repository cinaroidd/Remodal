<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class WP3D_Flipbook_Admin {
	private static $instance = null;
	private $meta_key_pages = '_flipbook_pages';
	private $meta_key_settings = '_flipbook_settings';

	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_action( 'add_meta_boxes', [ $this, 'add_metaboxes' ] );
		add_action( 'save_post_flipbook', [ $this, 'save_metabox' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_assets' ] );
	}

	public function add_metaboxes() {
		add_meta_box(
			'wp3d_flipbook_pages',
			__( 'Flipbook Pages', 'wp-3d-flipbook-lite' ),
			[ $this, 'render_pages_metabox' ],
			'flipbook',
			'normal',
			'high'
		);

		add_meta_box(
			'wp3d_flipbook_settings',
			__( 'Flipbook Settings', 'wp-3d-flipbook-lite' ),
			[ $this, 'render_settings_metabox' ],
			'flipbook',
			'side',
			'default'
		);
	}

	public function render_pages_metabox( $post ) {
		wp_nonce_field( 'wp3d_flipbook_save', 'wp3d_flipbook_nonce' );
		$pages = get_post_meta( $post->ID, $this->meta_key_pages, true );
		if ( ! is_array( $pages ) ) { $pages = []; }
		?>
		<div id="wp3d-pages-wrapper">
			<p>
				<button type="button" class="button button-primary" id="wp3d-select-pages"><?php esc_html_e( 'Select Images', 'wp-3d-flipbook-lite' ); ?></button>
				<button type="button" class="button" id="wp3d-clear-pages"><?php esc_html_e( 'Clear', 'wp-3d-flipbook-lite' ); ?></button>
			</p>
			<ul id="wp3d-pages-list">
				<?php foreach ( $pages as $attachment_id ) :
					$thumb = wp_get_attachment_image_src( $attachment_id, 'thumbnail' );
					if ( ! $thumb ) { continue; }
				?>
				<li class="wp3d-page-item" data-id="<?php echo esc_attr( $attachment_id ); ?>">
					<img src="<?php echo esc_url( $thumb[0] ); ?>" alt="" />
					<span class="dashicons dashicons-no-alt wp3d-remove" title="<?php esc_attr_e( 'Remove', 'wp-3d-flipbook-lite' ); ?>"></span>
				</li>
				<?php endforeach; ?>
			</ul>
			<input type="hidden" id="wp3d-pages-input" name="wp3d_pages" value="<?php echo esc_attr( implode( ',', array_map( 'intval', $pages ) ) ); ?>" />
			<p class="description"><?php esc_html_e( 'Drag to reorder pages. First item is the front cover.', 'wp-3d-flipbook-lite' ); ?></p>
		</div>
		<?php
	}

	public function render_settings_metabox( $post ) {
		$settings = get_post_meta( $post->ID, $this->meta_key_settings, true );
		$width = isset( $settings['width'] ) ? (int) $settings['width'] : 800;
		$height = isset( $settings['height'] ) ? (int) $settings['height'] : 600;
		$bg = isset( $settings['bg'] ) ? $settings['bg'] : '#ffffff';
		?>
		<p>
			<label for="wp3d-width" style="display:block;margin-bottom:4px;"><strong><?php esc_html_e( 'Viewer Width (px)', 'wp-3d-flipbook-lite' ); ?></strong></label>
			<input type="number" id="wp3d-width" name="wp3d_width" min="200" step="10" value="<?php echo esc_attr( $width ); ?>" />
		</p>
		<p>
			<label for="wp3d-height" style="display:block;margin-bottom:4px;"><strong><?php esc_html_e( 'Viewer Height (px)', 'wp-3d-flipbook-lite' ); ?></strong></label>
			<input type="number" id="wp3d-height" name="wp3d_height" min="200" step="10" value="<?php echo esc_attr( $height ); ?>" />
		</p>
		<p>
			<label for="wp3d-bg" style="display:block;margin-bottom:4px;"><strong><?php esc_html_e( 'Background Color', 'wp-3d-flipbook-lite' ); ?></strong></label>
			<input type="text" id="wp3d-bg" name="wp3d_bg" class="regular-text" value="<?php echo esc_attr( $bg ); ?>" placeholder="#ffffff" />
		</p>
		<?php
	}

	public function save_metabox( $post_id ) {
		if ( ! isset( $_POST['wp3d_flipbook_nonce'] ) || ! wp_verify_nonce( $_POST['wp3d_flipbook_nonce'], 'wp3d_flipbook_save' ) ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) { return; }
		if ( ! current_user_can( 'edit_post', $post_id ) ) { return; }

		// Pages
		if ( isset( $_POST['wp3d_pages'] ) ) {
			$ids = array_filter( array_map( 'intval', explode( ',', (string) $_POST['wp3d_pages'] ) ) );
			update_post_meta( $post_id, $this->meta_key_pages, $ids );
		}

		// Settings
		$settings = [
			'width' => isset( $_POST['wp3d_width'] ) ? max( 200, (int) $_POST['wp3d_width'] ) : 800,
			'height' => isset( $_POST['wp3d_height'] ) ? max( 200, (int) $_POST['wp3d_height'] ) : 600,
			'bg' => isset( $_POST['wp3d_bg'] ) ? sanitize_text_field( $_POST['wp3d_bg'] ) : '#ffffff',
		];
		update_post_meta( $post_id, $this->meta_key_settings, $settings );
	}

	public function enqueue_admin_assets( $hook ) {
		$screen = get_current_screen();
		if ( ! $screen || 'flipbook' !== $screen->post_type ) {
			return;
		}

		wp_enqueue_media();
		wp_enqueue_style( 'wp3d-admin', WP3D_FLIPBOOK_URL . 'assets/admin/admin.css', [], WP3D_FLIPBOOK_VERSION );
		wp_enqueue_script( 'jquery-ui-sortable' );
		wp_enqueue_script( 'wp3d-admin', WP3D_FLIPBOOK_URL . 'assets/admin/admin.js', [ 'jquery', 'jquery-ui-sortable' ], WP3D_FLIPBOOK_VERSION, true );
	}
}