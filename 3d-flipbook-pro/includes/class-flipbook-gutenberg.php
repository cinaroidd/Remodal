<?php
/**
 * Gutenberg block for FlipBook Pro
 */

if (!defined('ABSPATH')) {
    exit;
}

class FlipBook_Gutenberg {
    
    public function __construct() {
        add_action('init', array($this, 'register_block'));
        add_action('enqueue_block_editor_assets', array($this, 'enqueue_block_editor_assets'));
    }
    
    public function register_block() {
        if (!function_exists('register_block_type')) {
            return;
        }
        
        register_block_type('flipbook-pro/flipbook', array(
            'editor_script' => 'flipbook-pro-block-editor',
            'editor_style' => 'flipbook-pro-block-editor',
            'style' => 'flipbook-style',
            'render_callback' => array($this, 'render_block'),
            'attributes' => array(
                'flipbookId' => array(
                    'type' => 'number',
                    'default' => 0
                ),
                'width' => array(
                    'type' => 'number',
                    'default' => 800
                ),
                'height' => array(
                    'type' => 'number',
                    'default' => 600
                ),
                'autoplay' => array(
                    'type' => 'boolean',
                    'default' => false
                ),
                'controls' => array(
                    'type' => 'boolean',
                    'default' => true
                ),
                'lightbox' => array(
                    'type' => 'boolean',
                    'default' => false
                )
            )
        ));
    }
    
    public function enqueue_block_editor_assets() {
        wp_enqueue_script(
            'flipbook-pro-block-editor',
            FLIPBOOK_PRO_PLUGIN_URL . 'assets/js/block-editor.js',
            array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'),
            FLIPBOOK_PRO_VERSION,
            true
        );
        
        wp_enqueue_style(
            'flipbook-pro-block-editor',
            FLIPBOOK_PRO_PLUGIN_URL . 'assets/css/block-editor.css',
            array('wp-edit-blocks'),
            FLIPBOOK_PRO_VERSION
        );
        
        wp_localize_script('flipbook-pro-block-editor', 'flipbookProBlock', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('flipbook_admin_nonce')
        ));
    }
    
    public function render_block($attributes) {
        if (empty($attributes['flipbookId'])) {
            return '<p>' . __('Please select a flipbook.', '3d-flipbook-pro') . '</p>';
        }
        
        $frontend = new FlipBook_Frontend();
        return $frontend->render_flipbook($attributes['flipbookId'], $attributes);
    }
}