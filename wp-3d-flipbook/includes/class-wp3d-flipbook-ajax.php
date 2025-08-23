<?php
/**
 * AJAX Handler for 3D Flipbooks
 */

if (!defined('ABSPATH')) {
    exit;
}

class WP3D_Flipbook_Ajax {
    
    public function __construct() {
        add_action('wp_ajax_wp3d_flipbook_get_pages', array($this, 'get_pages'));
        add_action('wp_ajax_nopriv_wp3d_flipbook_get_pages', array($this, 'get_pages'));
        add_action('wp_ajax_wp3d_flipbook_track_view', array($this, 'track_view'));
        add_action('wp_ajax_nopriv_wp3d_flipbook_track_view', array($this, 'track_view'));
        add_action('wp_ajax_wp3d_flipbook_track_interaction', array($this, 'track_interaction'));
        add_action('wp_ajax_nopriv_wp3d_flipbook_track_interaction', array($this, 'track_interaction'));
    }
    
    public function get_pages() {
        check_ajax_referer('wp3d_flipbook_nonce', 'nonce');
        
        $pdf_url = sanitize_url($_POST['pdf_url']);
        
        if (!$pdf_url) {
            wp_send_json_error(__('Invalid PDF URL.', 'wp-3d-flipbook'));
        }
        
        // Get PDF file path
        $upload_dir = wp_upload_dir();
        $pdf_path = str_replace($upload_dir['baseurl'], $upload_dir['basedir'], $pdf_url);
        
        if (!file_exists($pdf_path)) {
            wp_send_json_error(__('PDF file not found.', 'wp-3d-flipbook'));
        }
        
        try {
            // Use PDF.js to get page count and generate thumbnails
            $pages_data = $this->process_pdf_pages($pdf_path, $pdf_url);
            wp_send_json_success($pages_data);
        } catch (Exception $e) {
            wp_send_json_error($e->getMessage());
        }
    }
    
    private function process_pdf_pages($pdf_path, $pdf_url) {
        // This is a simplified version - in a real implementation,
        // you would use a server-side PDF processing library like Imagick or Ghostscript
        
        $pages_data = array(
            'total_pages' => 0,
            'pages' => array(),
            'thumbnails' => array()
        );
        
        // For demo purposes, we'll simulate processing
        // In a real implementation, you would:
        // 1. Use a PDF library to extract page count
        // 2. Convert each page to an image
        // 3. Generate thumbnails
        // 4. Store the images in the uploads directory
        
        // Simulate 10 pages for demo
        $total_pages = 10;
        $pages_data['total_pages'] = $total_pages;
        
        for ($i = 1; $i <= $total_pages; $i++) {
            $pages_data['pages'][] = array(
                'page_number' => $i,
                'image_url' => $this->generate_demo_page_image($i, $pdf_url),
                'thumbnail_url' => $this->generate_demo_thumbnail($i, $pdf_url)
            );
        }
        
        return $pages_data;
    }
    
    private function generate_demo_page_image($page_number, $pdf_url) {
        // In a real implementation, this would generate actual page images
        // For demo purposes, we'll return a placeholder
        return WP3DFLIPBOOK_PLUGIN_URL . 'assets/images/page-placeholder.png';
    }
    
    private function generate_demo_thumbnail($page_number, $pdf_url) {
        // In a real implementation, this would generate actual thumbnails
        // For demo purposes, we'll return a placeholder
        return WP3DFLIPBOOK_PLUGIN_URL . 'assets/images/thumbnail-placeholder.png';
    }
    
    public function track_view() {
        check_ajax_referer('wp3d_flipbook_nonce', 'nonce');
        
        $flipbook_id = intval($_POST['flipbook_id']);
        
        if (!$flipbook_id || get_post_type($flipbook_id) !== 'wp3d_flipbook') {
            wp_send_json_error(__('Invalid flipbook ID.', 'wp-3d-flipbook'));
        }
        
        // Get current analytics data
        $analytics = get_post_meta($flipbook_id, '_wp3d_flipbook_analytics', true);
        if (!is_array($analytics)) {
            $analytics = array(
                'views' => 0,
                'unique_views' => 0,
                'interactions' => array()
            );
        }
        
        // Increment view count
        $analytics['views']++;
        
        // Track unique views (simplified - in production you'd use cookies/sessions)
        $user_ip = $this->get_user_ip();
        $viewed_ips = isset($analytics['viewed_ips']) ? $analytics['viewed_ips'] : array();
        
        if (!in_array($user_ip, $viewed_ips)) {
            $analytics['unique_views']++;
            $viewed_ips[] = $user_ip;
            $analytics['viewed_ips'] = $viewed_ips;
        }
        
        // Save analytics
        update_post_meta($flipbook_id, '_wp3d_flipbook_analytics', $analytics);
        
        wp_send_json_success(array(
            'message' => __('View tracked successfully.', 'wp-3d-flipbook')
        ));
    }
    
    public function track_interaction() {
        check_ajax_referer('wp3d_flipbook_nonce', 'nonce');
        
        $flipbook_id = intval($_POST['flipbook_id']);
        $interaction_type = sanitize_text_field($_POST['interaction_type']);
        $interaction_data = isset($_POST['interaction_data']) ? $_POST['interaction_data'] : array();
        
        if (!$flipbook_id || get_post_type($flipbook_id) !== 'wp3d_flipbook') {
            wp_send_json_error(__('Invalid flipbook ID.', 'wp-3d-flipbook'));
        }
        
        // Get current analytics data
        $analytics = get_post_meta($flipbook_id, '_wp3d_flipbook_analytics', true);
        if (!is_array($analytics)) {
            $analytics = array(
                'views' => 0,
                'unique_views' => 0,
                'interactions' => array()
            );
        }
        
        // Add interaction
        $interaction = array(
            'type' => $interaction_type,
            'data' => $interaction_data,
            'timestamp' => current_time('timestamp'),
            'user_ip' => $this->get_user_ip()
        );
        
        $analytics['interactions'][] = $interaction;
        
        // Keep only last 1000 interactions to prevent database bloat
        if (count($analytics['interactions']) > 1000) {
            $analytics['interactions'] = array_slice($analytics['interactions'], -1000);
        }
        
        // Save analytics
        update_post_meta($flipbook_id, '_wp3d_flipbook_analytics', $analytics);
        
        wp_send_json_success(array(
            'message' => __('Interaction tracked successfully.', 'wp-3d-flipbook')
        ));
    }
    
    private function get_user_ip() {
        $ip_keys = array('HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR');
        
        foreach ($ip_keys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                foreach (explode(',', $_SERVER[$key]) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                        return $ip;
                    }
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
}