<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class WP3D_Flipbook_Shortcode {
	private static $instance = null;
	private $meta_key_pages = '_flipbook_pages';
	private $meta_key_settings = '_flipbook_settings';
	private $did_enqueue = false;
	private $instance_counter = 0;

	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	private function __construct() {
		add_shortcode( 'flipbook', [ $this, 'render_shortcode' ] );
	}

	private function enqueue_public_assets() {
		if ( $this->did_enqueue ) { return; }

		wp_register_style( 'wp3d-public', WP3D_FLIPBOOK_URL . 'assets/public/style.css', [], WP3D_FLIPBOOK_VERSION );
		wp_enqueue_style( 'wp3d-public' );

		// Three.js via CDN
		wp_register_script( 'three-js', 'https://unpkg.com/three@0.156.1/build/three.min.js', [], '0.156.1', true );
		wp_register_script( 'wp3d-viewer', WP3D_FLIPBOOK_URL . 'assets/public/viewer.js', [ 'three-js' ], WP3D_FLIPBOOK_VERSION, true );
		wp_enqueue_script( 'wp3d-viewer' );

		$this->did_enqueue = true;
	}

	public function render_shortcode( $atts ) {
		$atts = shortcode_atts( [ 'id' => 0 ], $atts, 'flipbook' );
		$post_id = (int) $atts['id'];
		if ( ! $post_id ) { return ''; }
		$pages = get_post_meta( $post_id, $this->meta_key_pages, true );
		$settings = get_post_meta( $post_id, $this->meta_key_settings, true );
		if ( ! is_array( $pages ) || empty( $pages ) ) { return ''; }
		$width = isset( $settings['width'] ) ? (int) $settings['width'] : 800;
		$height = isset( $settings['height'] ) ? (int) $settings['height'] : 600;
		$bg = isset( $settings['bg'] ) ? $settings['bg'] : '#ffffff';

		$image_urls = [];
		foreach ( $pages as $attachment_id ) {
			$url = wp_get_attachment_image_src( $attachment_id, 'full' );
			if ( $url ) { $image_urls[] = esc_url_raw( $url[0] ); }
		}
		if ( empty( $image_urls ) ) { return ''; }

		$this->enqueue_public_assets();
		$this->instance_counter++;
		$container_id = 'wp3d-flipbook-' . $this->instance_counter . '-' . $post_id;

		$data = [
			'id' => $container_id,
			'pages' => $image_urls,
			'width' => $width,
			'height' => $height,
			'bg' => $bg,
		];

		ob_start();
		?>
		<div id="<?php echo esc_attr( $container_id ); ?>" class="wp3d-flipbook" style="max-width:100%;">
			<div class="wp3d-toolbar">
				<button class="wp3d-btn wp3d-prev" type="button" aria-label="<?php esc_attr_e( 'Previous', 'wp-3d-flipbook-lite' ); ?>">&#9664;</button>
				<button class="wp3d-btn wp3d-next" type="button" aria-label="<?php esc_attr_e( 'Next', 'wp-3d-flipbook-lite' ); ?>">&#9654;</button>
			</div>
			<div class="wp3d-canvas"></div>
			<script type="application/json" class="wp3d-data"><?php echo wp_json_encode( $data ); ?></script>
		</div>
		<?php
		return ob_get_clean();
	}
}