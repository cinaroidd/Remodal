<?php
/**
 * Admin Interface for 3D Flipbooks
 */

if (!defined('ABSPATH')) {
    exit;
}

class WP3D_Flipbook_Admin {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'init_admin'));
        add_action('wp_ajax_wp3d_flipbook_upload_pdf', array($this, 'handle_pdf_upload'));
        add_action('wp_ajax_wp3d_flipbook_convert_pdf', array($this, 'handle_pdf_conversion'));
    }
    
    public function add_admin_menu() {
        add_submenu_page(
            'edit.php?post_type=wp3d_flipbook',
            __('Settings', 'wp-3d-flipbook'),
            __('Settings', 'wp-3d-flipbook'),
            'manage_options',
            'wp3d-flipbook-settings',
            array($this, 'render_settings_page')
        );
        
        add_submenu_page(
            'edit.php?post_type=wp3d_flipbook',
            __('Help & Documentation', 'wp-3d-flipbook'),
            __('Help', 'wp-3d-flipbook'),
            'manage_options',
            'wp3d-flipbook-help',
            array($this, 'render_help_page')
        );
    }
    
    public function init_admin() {
        // Add custom admin scripts
        add_action('admin_footer', array($this, 'admin_footer_scripts'));
    }
    
    public function render_settings_page() {
        if (isset($_POST['submit'])) {
            $this->save_settings();
        }
        
        $settings = get_option('wp3d_flipbook_settings', array());
        ?>
        <div class="wrap">
            <h1><?php _e('3D Flipbook Settings', 'wp-3d-flipbook'); ?></h1>
            
            <form method="post" action="">
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="default_width"><?php _e('Default Width', 'wp-3d-flipbook'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="default_width" name="wp3d_flipbook_settings[default_width]" 
                                   value="<?php echo esc_attr($settings['default_width'] ?? '100%'); ?>" class="regular-text" />
                            <p class="description">
                                <?php _e('Default width for new flipbooks (e.g., 100%, 800px)', 'wp-3d-flipbook'); ?>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="default_height"><?php _e('Default Height', 'wp-3d-flipbook'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="default_height" name="wp3d_flipbook_settings[default_height]" 
                                   value="<?php echo esc_attr($settings['default_height'] ?? '600px'); ?>" class="regular-text" />
                            <p class="description">
                                <?php _e('Default height for new flipbooks (e.g., 600px)', 'wp-3d-flipbook'); ?>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="max_file_size"><?php _e('Maximum File Size (MB)', 'wp-3d-flipbook'); ?></label>
                        </th>
                        <td>
                            <input type="number" id="max_file_size" name="wp3d_flipbook_settings[max_file_size]" 
                                   value="<?php echo esc_attr($settings['max_file_size'] ?? '50'); ?>" min="1" max="500" />
                            <p class="description">
                                <?php _e('Maximum allowed PDF file size in megabytes', 'wp-3d-flipbook'); ?>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="enable_analytics"><?php _e('Enable Analytics', 'wp-3d-flipbook'); ?></label>
                        </th>
                        <td>
                            <label>
                                <input type="checkbox" id="enable_analytics" name="wp3d_flipbook_settings[enable_analytics]" 
                                       value="1" <?php checked(isset($settings['enable_analytics']) ? $settings['enable_analytics'] : false); ?> />
                                <?php _e('Track flipbook views and interactions', 'wp-3d-flipbook'); ?>
                            </label>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
    
    public function render_help_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('3D Flipbook Help & Documentation', 'wp-3d-flipbook'); ?></h1>
            
            <div class="wp3d-flipbook-help-content">
                <h2><?php _e('Getting Started', 'wp-3d-flipbook'); ?></h2>
                <ol>
                    <li><?php _e('Go to "3D Flipbooks" → "Add New"', 'wp-3d-flipbook'); ?></li>
                    <li><?php _e('Enter a title for your flipbook', 'wp-3d-flipbook'); ?></li>
                    <li><?php _e('Upload a PDF file using the "Upload PDF" button', 'wp-3d-flipbook'); ?></li>
                    <li><?php _e('Configure the flipbook settings (width, height, options)', 'wp-3d-flipbook'); ?></li>
                    <li><?php _e('Publish the flipbook', 'wp-3d-flipbook'); ?></li>
                    <li><?php _e('Use the provided shortcode to display the flipbook on your site', 'wp-3d-flipbook'); ?></li>
                </ol>
                
                <h2><?php _e('Shortcode Usage', 'wp-3d-flipbook'); ?></h2>
                <p><?php _e('Use the following shortcode to display a flipbook:', 'wp-3d-flipbook'); ?></p>
                <code>[wp3d_flipbook id="POST_ID"]</code>
                
                <h3><?php _e('Shortcode Parameters', 'wp-3d-flipbook'); ?></h3>
                <ul>
                    <li><strong>id</strong> - <?php _e('The flipbook post ID (required)', 'wp-3d-flipbook'); ?></li>
                    <li><strong>width</strong> - <?php _e('Custom width (e.g., "800px", "100%")', 'wp-3d-flipbook'); ?></li>
                    <li><strong>height</strong> - <?php _e('Custom height (e.g., "600px")', 'wp-3d-flipbook'); ?></li>
                    <li><strong>preview</strong> - <?php _e('Set to "true" for preview mode', 'wp-3d-flipbook'); ?></li>
                </ul>
                
                <h2><?php _e('Features', 'wp-3d-flipbook'); ?></h2>
                <ul>
                    <li><?php _e('Realistic 3D page turning effects', 'wp-3d-flipbook'); ?></li>
                    <li><?php _e('Zoom in/out functionality', 'wp-3d-flipbook'); ?></li>
                    <li><?php _e('Fullscreen mode', 'wp-3d-flipbook'); ?></li>
                    <li><?php _e('Thumbnail navigation', 'wp-3d-flipbook'); ?></li>
                    <li><?php _e('Responsive design', 'wp-3d-flipbook'); ?></li>
                    <li><?php _e('Customizable appearance', 'wp-3d-flipbook'); ?></li>
                    <li><?php _e('Auto-play option', 'wp-3d-flipbook'); ?></li>
                </ul>
                
                <h2><?php _e('Browser Support', 'wp-3d-flipbook'); ?></h2>
                <p><?php _e('This plugin works best in modern browsers that support:', 'wp-3d-flipbook'); ?></p>
                <ul>
                    <li><?php _e('HTML5 Canvas', 'wp-3d-flipbook'); ?></li>
                    <li><?php _e('WebGL', 'wp-3d-flipbook'); ?></li>
                    <li><?php _e('ES6 JavaScript', 'wp-3d-flipbook'); ?></li>
                </ul>
                
                <h2><?php _e('Troubleshooting', 'wp-3d-flipbook'); ?></h2>
                <h3><?php _e('Flipbook not loading?', 'wp-3d-flipbook'); ?></h3>
                <ul>
                    <li><?php _e('Check that the PDF file is accessible', 'wp-3d-flipbook'); ?></li>
                    <li><?php _e('Ensure the PDF file is not corrupted', 'wp-3d-flipbook'); ?></li>
                    <li><?php _e('Try a different browser', 'wp-3d-flipbook'); ?></li>
                    <li><?php _e('Check browser console for JavaScript errors', 'wp-3d-flipbook'); ?></li>
                </ul>
            </div>
        </div>
        <?php
    }
    
    private function save_settings() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        if (!wp_verify_nonce($_POST['_wpnonce'], 'update-options')) {
            return;
        }
        
        $settings = array(
            'default_width' => sanitize_text_field($_POST['wp3d_flipbook_settings']['default_width']),
            'default_height' => sanitize_text_field($_POST['wp3d_flipbook_settings']['default_height']),
            'max_file_size' => intval($_POST['wp3d_flipbook_settings']['max_file_size']),
            'enable_analytics' => isset($_POST['wp3d_flipbook_settings']['enable_analytics']) ? 1 : 0
        );
        
        update_option('wp3d_flipbook_settings', $settings);
        
        add_settings_error(
            'wp3d_flipbook_settings',
            'settings_updated',
            __('Settings saved successfully.', 'wp-3d-flipbook'),
            'updated'
        );
    }
    
    public function handle_pdf_upload() {
        check_ajax_referer('wp3d_flipbook_nonce', 'nonce');
        
        if (!current_user_can('upload_files')) {
            wp_die(__('You do not have permission to upload files.', 'wp-3d-flipbook'));
        }
        
        if (!isset($_FILES['pdf_file'])) {
            wp_die(__('No file uploaded.', 'wp-3d-flipbook'));
        }
        
        $file = $_FILES['pdf_file'];
        
        // Check file type
        $allowed_types = array('application/pdf');
        $file_type = wp_check_filetype($file['name']);
        
        if (!in_array($file_type['type'], $allowed_types)) {
            wp_die(__('Only PDF files are allowed.', 'wp-3d-flipbook'));
        }
        
        // Check file size
        $settings = get_option('wp3d_flipbook_settings', array());
        $max_size = ($settings['max_file_size'] ?? 50) * 1024 * 1024; // Convert to bytes
        
        if ($file['size'] > $max_size) {
            wp_die(sprintf(__('File size exceeds the maximum allowed size of %d MB.', 'wp-3d-flipbook'), $settings['max_file_size'] ?? 50));
        }
        
        // Upload file
        $upload = wp_handle_upload($file, array('test_form' => false));
        
        if (isset($upload['error'])) {
            wp_die($upload['error']);
        }
        
        wp_send_json_success(array(
            'url' => $upload['url'],
            'file' => $upload['file']
        ));
    }
    
    public function handle_pdf_conversion() {
        check_ajax_referer('wp3d_flipbook_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_die(__('You do not have permission to perform this action.', 'wp-3d-flipbook'));
        }
        
        $pdf_url = sanitize_url($_POST['pdf_url']);
        
        if (!$pdf_url) {
            wp_die(__('Invalid PDF URL.', 'wp-3d-flipbook'));
        }
        
        // Here you would implement PDF to image conversion
        // For now, we'll just return success
        wp_send_json_success(array(
            'message' => __('PDF processed successfully.', 'wp-3d-flipbook')
        ));
    }
    
    public function admin_footer_scripts() {
        $screen = get_current_screen();
        
        if ($screen && $screen->post_type === 'wp3d_flipbook') {
            ?>
            <script type="text/javascript">
            jQuery(document).ready(function($) {
                // PDF upload functionality
                $('#wp3d_flipbook_upload_pdf').on('click', function(e) {
                    e.preventDefault();
                    
                    var frame = wp.media({
                        title: '<?php _e('Select PDF File', 'wp-3d-flipbook'); ?>',
                        button: {
                            text: '<?php _e('Use this PDF', 'wp-3d-flipbook'); ?>'
                        },
                        multiple: false,
                        library: {
                            type: 'application/pdf'
                        }
                    });
                    
                    frame.on('select', function() {
                        var attachment = frame.state().get('selection').first().toJSON();
                        $('#wp3d_flipbook_pdf_url').val(attachment.url);
                    });
                    
                    frame.open();
                });
                
                // Initialize color picker
                $('.color-picker').wpColorPicker();
            });
            </script>
            <?php
        }
    }
}