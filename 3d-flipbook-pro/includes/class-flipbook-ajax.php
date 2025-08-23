<?php
/**
 * AJAX handlers for FlipBook Pro
 */

if (!defined('ABSPATH')) {
    exit;
}

class FlipBook_Ajax {
    
    public function __construct() {
        add_action('wp_ajax_get_flipbook_data', array($this, 'get_flipbook_data'));
        add_action('wp_ajax_nopriv_get_flipbook_data', array($this, 'get_flipbook_data'));
        add_action('wp_ajax_get_flipbooks_list', array($this, 'get_flipbooks_list'));
    }
    
    public function get_flipbook_data() {
        check_ajax_referer('flipbook_nonce', 'nonce');
        
        $flipbook_id = intval($_POST['flipbook_id']);
        $flipbook = FlipBook_Database::get_flipbook($flipbook_id);
        
        if (!$flipbook) {
            wp_send_json_error(__('FlipBook not found.', '3d-flipbook-pro'));
        }
        
        $response = array(
            'id' => $flipbook->id,
            'title' => $flipbook->title,
            'type' => $flipbook->type,
            'source_url' => $flipbook->source_url,
            'settings' => $flipbook->settings
        );
        
        // If it's an image-based flipbook, get the pages
        if ($flipbook->type === 'images') {
            $pages = FlipBook_Database::get_pages($flipbook_id);
            $response['pages'] = $pages;
        }
        
        wp_send_json_success($response);
    }
    
    public function get_flipbooks_list() {
        check_ajax_referer('flipbook_admin_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_send_json_error(__('Insufficient permissions.', '3d-flipbook-pro'));
        }
        
        $flipbooks = FlipBook_Database::get_flipbooks(array(
            'limit' => 100
        ));
        
        $response = array();
        foreach ($flipbooks as $flipbook) {
            $response[] = array(
                'id' => $flipbook->id,
                'title' => $flipbook->title,
                'type' => $flipbook->type
            );
        }
        
        wp_send_json_success($response);
    }
}