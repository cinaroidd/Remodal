<?php
/**
 * Shortcode functionality for FlipBook Pro
 */

if (!defined('ABSPATH')) {
    exit;
}

class FlipBook_Shortcode {
    
    public function __construct() {
        add_shortcode('flipbook', array($this, 'render_shortcode'));
        add_action('init', array($this, 'add_shortcode_button'));
    }
    
    public function render_shortcode($atts, $content = null) {
        $atts = shortcode_atts(array(
            'id' => '',
            'width' => '',
            'height' => '',
            'autoplay' => '',
            'controls' => '',
            'lightbox' => ''
        ), $atts, 'flipbook');
        
        if (empty($atts['id'])) {
            return '<p>' . __('FlipBook ID is required.', '3d-flipbook-pro') . '</p>';
        }
        
        $flipbook_id = intval($atts['id']);
        
        // Remove empty attributes
        $attributes = array_filter($atts, function($value) {
            return $value !== '';
        });
        
        // Convert string values to appropriate types
        if (isset($attributes['width'])) {
            $attributes['width'] = intval($attributes['width']);
        }
        if (isset($attributes['height'])) {
            $attributes['height'] = intval($attributes['height']);
        }
        if (isset($attributes['autoplay'])) {
            $attributes['autoplay'] = filter_var($attributes['autoplay'], FILTER_VALIDATE_BOOLEAN);
        }
        if (isset($attributes['controls'])) {
            $attributes['controls'] = filter_var($attributes['controls'], FILTER_VALIDATE_BOOLEAN);
        }
        if (isset($attributes['lightbox'])) {
            $attributes['lightbox'] = filter_var($attributes['lightbox'], FILTER_VALIDATE_BOOLEAN);
        }
        
        $frontend = new FlipBook_Frontend();
        return $frontend->render_flipbook($flipbook_id, $attributes);
    }
    
    public function add_shortcode_button() {
        if (!current_user_can('edit_posts') && !current_user_can('edit_pages')) {
            return;
        }
        
        if (get_user_option('rich_editing') == 'true') {
            add_filter('mce_external_plugins', array($this, 'add_tinymce_plugin'));
            add_filter('mce_buttons', array($this, 'add_tinymce_button'));
        }
    }
    
    public function add_tinymce_plugin($plugin_array) {
        $plugin_array['flipbook_shortcode'] = FLIPBOOK_PRO_PLUGIN_URL . 'assets/js/tinymce-plugin.js';
        return $plugin_array;
    }
    
    public function add_tinymce_button($buttons) {
        array_push($buttons, 'flipbook_shortcode');
        return $buttons;
    }
}