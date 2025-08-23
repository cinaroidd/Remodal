<?php
/**
 * Plugin Name: 3D FlipBook Pro
 * Plugin URI: https://yoursite.com/3d-flipbook-pro
 * Description: Create stunning interactive 3D flipbooks from PDFs, images, and HTML content with realistic page-turning animations.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://yoursite.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: 3d-flipbook-pro
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
define('FLIPBOOK_PRO_VERSION', '1.0.0');
define('FLIPBOOK_PRO_PLUGIN_URL', plugin_dir_url(__FILE__));
define('FLIPBOOK_PRO_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('FLIPBOOK_PRO_PLUGIN_FILE', __FILE__);

// Main plugin class
class FlipBookPro {
    
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('init', array($this, 'init'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        register_uninstall_hook(__FILE__, array('FlipBookPro', 'uninstall'));
    }
    
    public function init() {
        // Load text domain for translations
        load_plugin_textdomain('3d-flipbook-pro', false, dirname(plugin_basename(__FILE__)) . '/languages');
        
        // Include required files
        $this->includes();
        
        // Initialize components
        $this->init_hooks();
    }
    
    private function includes() {
        require_once FLIPBOOK_PRO_PLUGIN_PATH . 'includes/class-flipbook-database.php';
        require_once FLIPBOOK_PRO_PLUGIN_PATH . 'includes/class-flipbook-admin.php';
        require_once FLIPBOOK_PRO_PLUGIN_PATH . 'includes/class-flipbook-frontend.php';
        require_once FLIPBOOK_PRO_PLUGIN_PATH . 'includes/class-flipbook-shortcode.php';
        require_once FLIPBOOK_PRO_PLUGIN_PATH . 'includes/class-flipbook-gutenberg.php';
        require_once FLIPBOOK_PRO_PLUGIN_PATH . 'includes/class-flipbook-ajax.php';
    }
    
    private function init_hooks() {
        // Initialize database
        new FlipBook_Database();
        
        // Initialize admin interface
        if (is_admin()) {
            new FlipBook_Admin();
        }
        
        // Initialize frontend
        new FlipBook_Frontend();
        
        // Initialize shortcode
        new FlipBook_Shortcode();
        
        // Initialize Gutenberg block
        new FlipBook_Gutenberg();
        
        // Initialize AJAX handlers
        new FlipBook_Ajax();
        
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
    }
    
    public function enqueue_frontend_assets() {
        wp_enqueue_script('flipbook-three-js', FLIPBOOK_PRO_PLUGIN_URL . 'assets/js/three.min.js', array(), FLIPBOOK_PRO_VERSION, true);
        wp_enqueue_script('flipbook-pdf-js', FLIPBOOK_PRO_PLUGIN_URL . 'assets/js/pdf.min.js', array(), FLIPBOOK_PRO_VERSION, true);
        wp_enqueue_script('flipbook-main', FLIPBOOK_PRO_PLUGIN_URL . 'assets/js/flipbook.js', array('jquery', 'flipbook-three-js'), FLIPBOOK_PRO_VERSION, true);
        wp_enqueue_style('flipbook-style', FLIPBOOK_PRO_PLUGIN_URL . 'assets/css/flipbook.css', array(), FLIPBOOK_PRO_VERSION);
        
        // Localize script for AJAX
        wp_localize_script('flipbook-main', 'flipbook_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('flipbook_nonce'),
            'plugin_url' => FLIPBOOK_PRO_PLUGIN_URL
        ));
    }
    
    public function enqueue_admin_assets($hook) {
        if (strpos($hook, 'flipbook') !== false) {
            wp_enqueue_media();
            wp_enqueue_script('flipbook-admin', FLIPBOOK_PRO_PLUGIN_URL . 'assets/js/admin.js', array('jquery'), FLIPBOOK_PRO_VERSION, true);
            wp_enqueue_style('flipbook-admin', FLIPBOOK_PRO_PLUGIN_URL . 'assets/css/admin.css', array(), FLIPBOOK_PRO_VERSION);
            
            wp_localize_script('flipbook-admin', 'flipbook_admin', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('flipbook_admin_nonce')
            ));
        }
    }
    
    public function activate() {
        // Create database tables
        FlipBook_Database::create_tables();
        
        // Add default options
        add_option('flipbook_pro_version', FLIPBOOK_PRO_VERSION);
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    public function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    public static function uninstall() {
        // Remove database tables
        FlipBook_Database::drop_tables();
        
        // Remove options
        delete_option('flipbook_pro_version');
        delete_option('flipbook_pro_settings');
    }
}

// Initialize the plugin
FlipBookPro::get_instance();