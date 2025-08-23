<?php
/**
 * Shortcode Handler for 3D Flipbooks
 */

if (!defined('ABSPATH')) {
    exit;
}

class WP3D_Flipbook_Shortcode {
    
    public function __construct() {
        add_shortcode('wp3d_flipbook', array($this, 'render_shortcode'));
        add_action('wp_footer', array($this, 'enqueue_flipbook_assets'));
    }
    
    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'id' => 0,
            'width' => '',
            'height' => '',
            'preview' => 'false'
        ), $atts, 'wp3d_flipbook');
        
        $post_id = intval($atts['id']);
        
        if (!$post_id || get_post_type($post_id) !== 'wp3d_flipbook') {
            return '<p>' . __('Flipbook not found.', 'wp-3d-flipbook') . '</p>';
        }
        
        $pdf_url = get_post_meta($post_id, '_wp3d_flipbook_pdf_url', true);
        
        if (!$pdf_url) {
            return '<p>' . __('No PDF file uploaded for this flipbook.', 'wp-3d-flipbook') . '</p>';
        }
        
        // Get flipbook settings
        $width = $atts['width'] ?: get_post_meta($post_id, '_wp3d_flipbook_width', true) ?: '100%';
        $height = $atts['height'] ?: get_post_meta($post_id, '_wp3d_flipbook_height', true) ?: '600px';
        $page_mode = get_post_meta($post_id, '_wp3d_flipbook_page_mode', true) ?: 'double';
        $zoom_level = get_post_meta($post_id, '_wp3d_flipbook_zoom_level', true) ?: '1';
        $background_color = get_post_meta($post_id, '_wp3d_flipbook_background_color', true) ?: '#ffffff';
        $auto_play = get_post_meta($post_id, '_wp3d_flipbook_auto_play', true);
        $show_controls = get_post_meta($post_id, '_wp3d_flipbook_show_controls', true) !== '0';
        $show_thumbnails = get_post_meta($post_id, '_wp3d_flipbook_show_thumbnails', true) !== '0';
        
        // Generate unique ID for this flipbook instance
        $flipbook_id = 'wp3d-flipbook-' . $post_id . '-' . uniqid();
        
        // Prepare configuration
        $config = array(
            'id' => $flipbook_id,
            'pdf_url' => $pdf_url,
            'width' => $width,
            'height' => $height,
            'page_mode' => $page_mode,
            'zoom_level' => floatval($zoom_level),
            'background_color' => $background_color,
            'auto_play' => $auto_play === '1',
            'show_controls' => $show_controls,
            'show_thumbnails' => $show_thumbnails,
            'preview_mode' => $atts['preview'] === 'true'
        );
        
        // Enqueue necessary scripts
        $this->enqueue_flipbook_scripts($config);
        
        // Build the HTML
        $html = '<div class="wp3d-flipbook-container" id="' . esc_attr($flipbook_id) . '">';
        
        if ($show_controls) {
            $html .= '<div class="wp3d-flipbook-controls">';
            $html .= '<button class="wp3d-flipbook-btn wp3d-flipbook-prev" title="' . __('Previous Page', 'wp-3d-flipbook') . '">‹</button>';
            $html .= '<button class="wp3d-flipbook-btn wp3d-flipbook-next" title="' . __('Next Page', 'wp-3d-flipbook') . '">›</button>';
            $html .= '<button class="wp3d-flipbook-btn wp3d-flipbook-zoom-in" title="' . __('Zoom In', 'wp-3d-flipbook') . '">+</button>';
            $html .= '<button class="wp3d-flipbook-btn wp3d-flipbook-zoom-out" title="' . __('Zoom Out', 'wp-3d-flipbook') . '">−</button>';
            $html .= '<button class="wp3d-flipbook-btn wp3d-flipbook-fullscreen" title="' . __('Fullscreen', 'wp-3d-flipbook') . '">⛶</button>';
            $html .= '<span class="wp3d-flipbook-page-info">';
            $html .= '<span class="wp3d-flipbook-current-page">1</span> / <span class="wp3d-flipbook-total-pages">0</span>';
            $html .= '</span>';
            $html .= '</div>';
        }
        
        if ($show_thumbnails) {
            $html .= '<div class="wp3d-flipbook-thumbnails" style="display: none;">';
            $html .= '<div class="wp3d-flipbook-thumbnails-content"></div>';
            $html .= '</div>';
        }
        
        $html .= '<div class="wp3d-flipbook-viewer" style="width: ' . esc_attr($width) . '; height: ' . esc_attr($height) . '; background-color: ' . esc_attr($background_color) . ';">';
        $html .= '<div class="wp3d-flipbook-pages"></div>';
        $html .= '<div class="wp3d-flipbook-loading">';
        $html .= '<div class="wp3d-flipbook-spinner"></div>';
        $html .= '<p>' . __('Loading flipbook...', 'wp-3d-flipbook') . '</p>';
        $html .= '</div>';
        $html .= '</div>';
        
        $html .= '</div>';
        
        // Add configuration as data attribute
        $html = str_replace(
            'id="' . esc_attr($flipbook_id) . '"',
            'id="' . esc_attr($flipbook_id) . '" data-config="' . esc_attr(json_encode($config)) . '"',
            $html
        );
        
        return $html;
    }
    
    private function enqueue_flipbook_scripts($config) {
        // Enqueue PDF.js for PDF rendering
        wp_enqueue_script(
            'pdfjs',
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
            array(),
            '3.11.174',
            true
        );
        
        wp_enqueue_script(
            'pdfjs-worker',
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
            array(),
            '3.11.174',
            true
        );
        
        // Enqueue Three.js for 3D effects
        wp_enqueue_script(
            'threejs',
            'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
            array(),
            'r128',
            true
        );
        
        // Enqueue our custom flipbook script
        wp_enqueue_script(
            'wp3d-flipbook-engine',
            WP3DFLIPBOOK_PLUGIN_URL . 'assets/js/flipbook-engine.js',
            array('jquery', 'pdfjs', 'threejs'),
            WP3DFLIPBOOK_VERSION,
            true
        );
        
        // Localize script with configuration
        wp_localize_script('wp3d-flipbook-engine', 'wp3d_flipbook_config_' . $config['id'], $config);
    }
    
    public function enqueue_flipbook_assets() {
        // This method is called on wp_footer to ensure all flipbook assets are loaded
        // The actual enqueuing is handled in render_shortcode for better performance
    }
}