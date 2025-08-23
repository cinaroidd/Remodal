<?php
/**
 * Plugin Name: WP 3D Flipbook
 * Plugin URI: https://github.com/your-username/wp-3d-flipbook
 * Description: Create beautiful 3D flipbooks for your WordPress site. Upload PDFs and convert them into interactive flipbooks with realistic page turning effects.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://yourwebsite.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: wp-3d-flipbook
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('WP3DFLIPBOOK_VERSION', '1.0.0');
define('WP3DFLIPBOOK_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WP3DFLIPBOOK_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('WP3DFLIPBOOK_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Main plugin class
class WP3DFlipbook {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->init_hooks();
    }
    
    private function init_hooks() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    public function init() {
        // Load text domain
        load_plugin_textdomain('wp-3d-flipbook', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // Initialize components
        $this->init_components();
    }
    
    private function init_components() {
        // Include required files
        require_once WP3DFLIPBOOK_PLUGIN_PATH . 'includes/class-wp3d-flipbook-post-type.php';
        require_once WP3DFLIPBOOK_PLUGIN_PATH . 'includes/class-wp3d-flipbook-shortcode.php';
        require_once WP3DFLIPBOOK_PLUGIN_PATH . 'includes/class-wp3d-flipbook-admin.php';
        require_once WP3DFLIPBOOK_PLUGIN_PATH . 'includes/class-wp3d-flipbook-ajax.php';
        
        // Initialize components
        new WP3D_Flipbook_Post_Type();
        new WP3D_Flipbook_Shortcode();
        
        if (is_admin()) {
            new WP3D_Flipbook_Admin();
        }
        
        new WP3D_Flipbook_Ajax();
    }
    
    public function enqueue_scripts() {
        // Enqueue frontend scripts and styles
        wp_enqueue_style(
            'wp3d-flipbook-style',
            WP3DFLIPBOOK_PLUGIN_URL . 'assets/css/wp3d-flipbook.css',
            array(),
            WP3DFLIPBOOK_VERSION
        );
        
        wp_enqueue_script(
            'wp3d-flipbook-script',
            WP3DFLIPBOOK_PLUGIN_URL . 'assets/js/wp3d-flipbook.js',
            array('jquery'),
            WP3DFLIPBOOK_VERSION,
            true
        );
        
        // Localize script for AJAX
        wp_localize_script('wp3d-flipbook-script', 'wp3d_flipbook_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wp3d_flipbook_nonce')
        ));
    }
    
    public function admin_enqueue_scripts($hook) {
        // Only load on our plugin pages
        if (strpos($hook, 'wp3d-flipbook') !== false || $hook === 'post.php' || $hook === 'post-new.php') {
            wp_enqueue_style(
                'wp3d-flipbook-admin-style',
                WP3DFLIPBOOK_PLUGIN_URL . 'assets/css/admin.css',
                array(),
                WP3DFLIPBOOK_VERSION
            );
            
            wp_enqueue_script(
                'wp3d-flipbook-admin-script',
                WP3DFLIPBOOK_PLUGIN_URL . 'assets/js/admin.js',
                array('jquery', 'wp-color-picker'),
                WP3DFLIPBOOK_VERSION,
                true
            );
            
            wp_enqueue_media();
            wp_enqueue_style('wp-color-picker');
        }
    }
    
    public function activate() {
        // Create custom post type
        $post_type = new WP3D_Flipbook_Post_Type();
        $post_type->register_post_type();
        
        // Flush rewrite rules
        flush_rewrite_rules();
        
        // Create upload directory
        $upload_dir = wp_upload_dir();
        $flipbook_dir = $upload_dir['basedir'] . '/wp3d-flipbooks';
        
        if (!file_exists($flipbook_dir)) {
            wp_mkdir_p($flipbook_dir);
        }
        
        // Create .htaccess to protect the directory
        $htaccess_content = "Order Deny,Allow\nDeny from all";
        file_put_contents($flipbook_dir . '/.htaccess', $htaccess_content);
    }
    
    public function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
    }
}

// Initialize the plugin
function wp3d_flipbook_init() {
    return WP3DFlipbook::get_instance();
}

// Start the plugin
wp3d_flipbook_init();