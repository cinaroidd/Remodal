<?php
/**
 * Frontend functionality for FlipBook Pro
 */

if (!defined('ABSPATH')) {
    exit;
}

class FlipBook_Frontend {
    
    public function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_footer', array($this, 'add_modal_html'));
    }
    
    public function enqueue_scripts() {
        // Only enqueue if there's a flipbook on the page
        if ($this->has_flipbook_on_page()) {
            wp_enqueue_script('flipbook-three-js', FLIPBOOK_PRO_PLUGIN_URL . 'assets/js/three.min.js', array(), FLIPBOOK_PRO_VERSION, true);
            wp_enqueue_script('flipbook-pdf-js', FLIPBOOK_PRO_PLUGIN_URL . 'assets/js/pdf.min.js', array(), FLIPBOOK_PRO_VERSION, true);
            wp_enqueue_script('flipbook-main', FLIPBOOK_PRO_PLUGIN_URL . 'assets/js/flipbook.js', array('jquery'), FLIPBOOK_PRO_VERSION, true);
            wp_enqueue_style('flipbook-style', FLIPBOOK_PRO_PLUGIN_URL . 'assets/css/flipbook.css', array(), FLIPBOOK_PRO_VERSION);
            
            wp_localize_script('flipbook-main', 'flipbook_ajax', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('flipbook_nonce'),
                'plugin_url' => FLIPBOOK_PRO_PLUGIN_URL
            ));
        }
    }
    
    private function has_flipbook_on_page() {
        global $post;
        
        if (!$post) {
            return false;
        }
        
        // Check if the post content contains flipbook shortcode
        return has_shortcode($post->post_content, 'flipbook') || has_block('flipbook-pro/flipbook', $post->post_content);
    }
    
    public function render_flipbook($flipbook_id, $attributes = array()) {
        $flipbook = FlipBook_Database::get_flipbook($flipbook_id);
        
        if (!$flipbook) {
            return '<p>' . __('FlipBook not found.', '3d-flipbook-pro') . '</p>';
        }
        
        // Merge flipbook settings with shortcode attributes
        $settings = wp_parse_args($attributes, $flipbook->settings);
        
        $width = isset($settings['width']) ? intval($settings['width']) : 800;
        $height = isset($settings['height']) ? intval($settings['height']) : 600;
        $autoplay = isset($settings['autoplay']) && $settings['autoplay'] ? 'true' : 'false';
        $controls = isset($settings['controls']) && $settings['controls'] ? 'true' : 'false';
        
        $container_id = 'flipbook-' . $flipbook_id . '-' . uniqid();
        
        ob_start();
        ?>
        <div class="flipbook-container" 
             id="<?php echo esc_attr($container_id); ?>"
             data-flipbook-id="<?php echo esc_attr($flipbook_id); ?>"
             data-flipbook-type="<?php echo esc_attr($flipbook->type); ?>"
             data-flipbook-source="<?php echo esc_attr($flipbook->source_url); ?>"
             data-flipbook-autoplay="<?php echo esc_attr($autoplay); ?>"
             data-flipbook-controls="<?php echo esc_attr($controls); ?>"
             style="width: <?php echo esc_attr($width); ?>px; height: <?php echo esc_attr($height); ?>px; max-width: 100%;">
            
            <div class="flipbook-loading">
                <div class="flipbook-spinner"></div>
                <p><?php _e('Loading flipbook...', '3d-flipbook-pro'); ?></p>
            </div>
            
            <div class="flipbook-error" style="display: none;">
                <p><?php _e('Error loading flipbook. Please try again.', '3d-flipbook-pro'); ?></p>
            </div>
            
            <div class="flipbook-canvas-container">
                <!-- 3D canvas will be inserted here -->
            </div>
            
            <?php if ($controls === 'true'): ?>
            <div class="flipbook-controls">
                <button class="flipbook-btn flipbook-prev" title="<?php _e('Previous Page', '3d-flipbook-pro'); ?>">
                    <span class="flipbook-icon">‹</span>
                </button>
                
                <div class="flipbook-page-info">
                    <span class="flipbook-current-page">1</span>
                    <span class="flipbook-separator">/</span>
                    <span class="flipbook-total-pages">1</span>
                </div>
                
                <button class="flipbook-btn flipbook-next" title="<?php _e('Next Page', '3d-flipbook-pro'); ?>">
                    <span class="flipbook-icon">›</span>
                </button>
                
                <button class="flipbook-btn flipbook-fullscreen" title="<?php _e('Fullscreen', '3d-flipbook-pro'); ?>">
                    <span class="flipbook-icon">⛶</span>
                </button>
                
                <button class="flipbook-btn flipbook-zoom-in" title="<?php _e('Zoom In', '3d-flipbook-pro'); ?>">
                    <span class="flipbook-icon">+</span>
                </button>
                
                <button class="flipbook-btn flipbook-zoom-out" title="<?php _e('Zoom Out', '3d-flipbook-pro'); ?>">
                    <span class="flipbook-icon">−</span>
                </button>
            </div>
            <?php endif; ?>
        </div>
        <?php
        
        return ob_get_clean();
    }
    
    public function add_modal_html() {
        ?>
        <div id="flipbook-modal" class="flipbook-modal" style="display: none;">
            <div class="flipbook-modal-backdrop"></div>
            <div class="flipbook-modal-content">
                <button class="flipbook-modal-close">&times;</button>
                <div class="flipbook-modal-body">
                    <!-- Modal flipbook content will be inserted here -->
                </div>
            </div>
        </div>
        <?php
    }
}