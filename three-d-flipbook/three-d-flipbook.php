<?php
/*
Plugin Name: 3D FlipBook Lite
Description: Display interactive 3D flipbooks from PDFs or images using WebGL PageFlip library.
Version: 1.0.0
Author: AI Assistant
License: GPL2+
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

class ThreeDFlipbookPlugin {
    const VERSION = '1.0.0';
    const CPT_SLUG = 'flipbook';
    private static $instance = null;

    public static function instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Register hooks
        register_activation_hook( __FILE__, [ $this, 'activate' ] );
        register_deactivation_hook( __FILE__, [ $this, 'deactivate' ] );

        add_action( 'init', [ $this, 'register_post_type' ] );
        add_action( 'add_meta_boxes', [ $this, 'add_meta_boxes' ] );
        add_action( 'save_post', [ $this, 'save_post' ] );
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_public_assets' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_assets' ] );
        add_shortcode( 'flipbook', [ $this, 'flipbook_shortcode' ] );
    }

    public function activate() {
        $this->register_post_type();
        flush_rewrite_rules();
    }

    public function deactivate() {
        flush_rewrite_rules();
    }

    public function register_post_type() {
        $labels = [
            'name'          => __( 'Flipbooks', 'three-d-flipbook' ),
            'singular_name' => __( 'Flipbook', 'three-d-flipbook' ),
            'add_new_item'  => __( 'Add New Flipbook', 'three-d-flipbook' ),
            'edit_item'     => __( 'Edit Flipbook', 'three-d-flipbook' ),
        ];

        $args = [
            'labels'             => $labels,
            'public'             => true,
            'show_in_rest'       => true,
            'menu_icon'          => 'dashicons-book',
            'supports'           => [ 'title', 'thumbnail' ],
        ];

        register_post_type( self::CPT_SLUG, $args );
    }

    public function add_meta_boxes() {
        add_meta_box( 'flipbook_source', __( 'Flipbook Source', 'three-d-flipbook' ), [ $this, 'render_source_meta_box' ], self::CPT_SLUG, 'normal', 'default' );
    }

    public function render_source_meta_box( $post ) {
        wp_nonce_field( 'flipbook_source_nonce', 'flipbook_source_nonce_field' );
        $source = get_post_meta( $post->ID, '_flipbook_source', true );
        echo '<label for="flipbook_source_url">' . __( 'PDF URL or comma-separated image URLs', 'three-d-flipbook' ) . '</label>';
        echo '<input type="text" style="width:100%" id="flipbook_source_url" name="flipbook_source_url" value="' . esc_attr( $source ) . '" placeholder="https://example.com/file.pdf" />';
    }

    public function save_post( $post_id ) {
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
            return;
        }
        if ( ! isset( $_POST['flipbook_source_nonce_field'] ) || ! wp_verify_nonce( $_POST['flipbook_source_nonce_field'], 'flipbook_source_nonce' ) ) {
            return;
        }
        if ( isset( $_POST['flipbook_source_url'] ) ) {
            update_post_meta( $post_id, '_flipbook_source', sanitize_text_field( $_POST['flipbook_source_url'] ) );
        }
    }

    public function enqueue_public_assets() {
        // Using CDN for demo; in production, bundle in plugin assets dir.
        wp_enqueue_style( 'stpageflip-css', 'https://unpkg.com/page-flip/dist/page-flip.min.css', [], self::VERSION );
        wp_enqueue_script( 'stpageflip-js', 'https://unpkg.com/page-flip/dist/page-flip.browser.min.js', [], self::VERSION, true );
        wp_enqueue_script( 'three-d-flipbook-front', plugins_url( 'assets/js/flipbook-front.js', __FILE__ ), [ 'stpageflip-js' ], self::VERSION, true );
    }

    public function enqueue_admin_assets( $hook ) {
        if ( 'post.php' === $hook || 'post-new.php' === $hook ) {
            wp_enqueue_script( 'three-d-flipbook-admin', plugins_url( 'assets/js/flipbook-admin.js', __FILE__ ), [ 'jquery' ], self::VERSION, true );
        }
    }

    public function flipbook_shortcode( $atts ) {
        $atts = shortcode_atts( [ 'id' => 0, 'width' => '600px', 'height' => '400px' ], $atts, 'flipbook' );
        $post_id = intval( $atts['id'] );
        if ( ! $post_id ) {
            return '';
        }

        $source = get_post_meta( $post_id, '_flipbook_source', true );
        if ( ! $source ) {
            return '';
        }

        $container_id = 'flipbook-' . $post_id . '-' . uniqid();
        $html  = '<div id="' . esc_attr( $container_id ) . '" class="three-d-flipbook" style="width:' . esc_attr( $atts['width'] ) . ';height:' . esc_attr( $atts['height'] ) . ';"></div>';
        $html .= '<script type="text/javascript">document.addEventListener("DOMContentLoaded",function(){ if(window.PageFlip){ const source="' . esc_js( $source ) . '"; const isPdf=source.trim().toLowerCase().endsWith(".pdf"); const pages=isPdf?{pdf:source}:{images:source.split(",")}; const flipbook=new window.PageFlip(document.getElementById("' . esc_js( $container_id ) . '"),{ width:600,height:400, size:"stretch", minWidth:315,maxWidth:1000,minHeight:400,maxHeight:1536, autoResize:true, showCover:true, mobileScrollSupport:false }); flipbook.loadFromImages? flipbook.loadFromImages(pages.images): flipbook.loadFromPDF(pages.pdf); } });</script>';

        return $html;
    }
}

ThreeDFlipbookPlugin::instance();