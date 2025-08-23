<?php
/**
 * Admin interface for FlipBook Pro
 */

if (!defined('ABSPATH')) {
    exit;
}

class FlipBook_Admin {
    
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'admin_init'));
        add_action('admin_post_save_flipbook', array($this, 'handle_save_flipbook'));
        add_action('admin_post_delete_flipbook', array($this, 'handle_delete_flipbook'));
    }
    
    public function add_admin_menu() {
        add_menu_page(
            __('3D FlipBook Pro', '3d-flipbook-pro'),
            __('FlipBook Pro', '3d-flipbook-pro'),
            'manage_options',
            'flipbook-pro',
            array($this, 'admin_page'),
            'dashicons-book-alt',
            30
        );
        
        add_submenu_page(
            'flipbook-pro',
            __('All FlipBooks', '3d-flipbook-pro'),
            __('All FlipBooks', '3d-flipbook-pro'),
            'manage_options',
            'flipbook-pro',
            array($this, 'admin_page')
        );
        
        add_submenu_page(
            'flipbook-pro',
            __('Add New FlipBook', '3d-flipbook-pro'),
            __('Add New', '3d-flipbook-pro'),
            'manage_options',
            'flipbook-pro-add',
            array($this, 'add_flipbook_page')
        );
        
        add_submenu_page(
            'flipbook-pro',
            __('Settings', '3d-flipbook-pro'),
            __('Settings', '3d-flipbook-pro'),
            'manage_options',
            'flipbook-pro-settings',
            array($this, 'settings_page')
        );
    }
    
    public function admin_init() {
        register_setting('flipbook_pro_settings', 'flipbook_pro_settings');
    }
    
    public function admin_page() {
        if (isset($_GET['action']) && $_GET['action'] === 'edit' && isset($_GET['id'])) {
            $this->edit_flipbook_page();
        } else {
            $this->list_flipbooks_page();
        }
    }
    
    private function list_flipbooks_page() {
        $flipbooks = FlipBook_Database::get_flipbooks();
        
        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline"><?php _e('FlipBooks', '3d-flipbook-pro'); ?></h1>
            <a href="<?php echo admin_url('admin.php?page=flipbook-pro-add'); ?>" class="page-title-action"><?php _e('Add New', '3d-flipbook-pro'); ?></a>
            <hr class="wp-header-end">
            
            <?php if (isset($_GET['message'])): ?>
                <div class="notice notice-success is-dismissible">
                    <p><?php echo esc_html($this->get_message($_GET['message'])); ?></p>
                </div>
            <?php endif; ?>
            
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th scope="col" class="manage-column column-title"><?php _e('Title', '3d-flipbook-pro'); ?></th>
                        <th scope="col" class="manage-column column-type"><?php _e('Type', '3d-flipbook-pro'); ?></th>
                        <th scope="col" class="manage-column column-shortcode"><?php _e('Shortcode', '3d-flipbook-pro'); ?></th>
                        <th scope="col" class="manage-column column-date"><?php _e('Date', '3d-flipbook-pro'); ?></th>
                        <th scope="col" class="manage-column column-actions"><?php _e('Actions', '3d-flipbook-pro'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($flipbooks)): ?>
                        <tr>
                            <td colspan="5"><?php _e('No flipbooks found.', '3d-flipbook-pro'); ?></td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($flipbooks as $flipbook): ?>
                            <tr>
                                <td class="column-title">
                                    <strong>
                                        <a href="<?php echo admin_url('admin.php?page=flipbook-pro&action=edit&id=' . $flipbook->id); ?>">
                                            <?php echo esc_html($flipbook->title); ?>
                                        </a>
                                    </strong>
                                </td>
                                <td class="column-type"><?php echo esc_html(ucfirst($flipbook->type)); ?></td>
                                <td class="column-shortcode">
                                    <code>[flipbook id="<?php echo $flipbook->id; ?>"]</code>
                                    <button class="button-link copy-shortcode" data-shortcode='[flipbook id="<?php echo $flipbook->id; ?>"]'><?php _e('Copy', '3d-flipbook-pro'); ?></button>
                                </td>
                                <td class="column-date"><?php echo date_i18n(get_option('date_format'), strtotime($flipbook->created_at)); ?></td>
                                <td class="column-actions">
                                    <a href="<?php echo admin_url('admin.php?page=flipbook-pro&action=edit&id=' . $flipbook->id); ?>" class="button button-small"><?php _e('Edit', '3d-flipbook-pro'); ?></a>
                                    <a href="<?php echo wp_nonce_url(admin_url('admin-post.php?action=delete_flipbook&id=' . $flipbook->id), 'delete_flipbook_' . $flipbook->id); ?>" 
                                       class="button button-small button-link-delete" 
                                       onclick="return confirm('<?php _e('Are you sure you want to delete this flipbook?', '3d-flipbook-pro'); ?>')"><?php _e('Delete', '3d-flipbook-pro'); ?></a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        <?php
    }
    
    public function add_flipbook_page() {
        $this->edit_flipbook_page();
    }
    
    private function edit_flipbook_page() {
        $flipbook = null;
        $is_edit = false;
        
        if (isset($_GET['id'])) {
            $flipbook = FlipBook_Database::get_flipbook(intval($_GET['id']));
            $is_edit = true;
        }
        
        if ($is_edit && !$flipbook) {
            wp_die(__('FlipBook not found.', '3d-flipbook-pro'));
        }
        
        ?>
        <div class="wrap">
            <h1><?php echo $is_edit ? __('Edit FlipBook', '3d-flipbook-pro') : __('Add New FlipBook', '3d-flipbook-pro'); ?></h1>
            
            <form method="post" action="<?php echo admin_url('admin-post.php'); ?>" enctype="multipart/form-data">
                <?php wp_nonce_field('save_flipbook', 'flipbook_nonce'); ?>
                <input type="hidden" name="action" value="save_flipbook">
                <?php if ($is_edit): ?>
                    <input type="hidden" name="flipbook_id" value="<?php echo $flipbook->id; ?>">
                <?php endif; ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="flipbook_title"><?php _e('Title', '3d-flipbook-pro'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="flipbook_title" name="flipbook_title" class="regular-text" 
                                   value="<?php echo $flipbook ? esc_attr($flipbook->title) : ''; ?>" required>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="flipbook_description"><?php _e('Description', '3d-flipbook-pro'); ?></label>
                        </th>
                        <td>
                            <textarea id="flipbook_description" name="flipbook_description" rows="3" class="large-text"><?php echo $flipbook ? esc_textarea($flipbook->description) : ''; ?></textarea>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="flipbook_type"><?php _e('Type', '3d-flipbook-pro'); ?></label>
                        </th>
                        <td>
                            <select id="flipbook_type" name="flipbook_type" class="regular-text">
                                <option value="pdf" <?php selected($flipbook ? $flipbook->type : 'pdf', 'pdf'); ?>><?php _e('PDF', '3d-flipbook-pro'); ?></option>
                                <option value="images" <?php selected($flipbook ? $flipbook->type : '', 'images'); ?>><?php _e('Images', '3d-flipbook-pro'); ?></option>
                                <option value="html" <?php selected($flipbook ? $flipbook->type : '', 'html'); ?>><?php _e('HTML', '3d-flipbook-pro'); ?></option>
                            </select>
                            <p class="description"><?php _e('Choose the type of content for your flipbook.', '3d-flipbook-pro'); ?></p>
                        </td>
                    </tr>
                    
                    <tr id="pdf_upload_row">
                        <th scope="row">
                            <label for="flipbook_pdf"><?php _e('PDF File', '3d-flipbook-pro'); ?></label>
                        </th>
                        <td>
                            <input type="url" id="flipbook_source_url" name="flipbook_source_url" class="regular-text" 
                                   value="<?php echo $flipbook ? esc_attr($flipbook->source_url) : ''; ?>" placeholder="<?php _e('PDF URL', '3d-flipbook-pro'); ?>">
                            <button type="button" class="button" id="upload_pdf_button"><?php _e('Upload PDF', '3d-flipbook-pro'); ?></button>
                            <p class="description"><?php _e('Upload a PDF file or enter a PDF URL.', '3d-flipbook-pro'); ?></p>
                        </td>
                    </tr>
                </table>
                
                <h3><?php _e('Display Settings', '3d-flipbook-pro'); ?></h3>
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="flipbook_width"><?php _e('Width', '3d-flipbook-pro'); ?></label>
                        </th>
                        <td>
                            <input type="number" id="flipbook_width" name="settings[width]" class="small-text" 
                                   value="<?php echo $flipbook && isset($flipbook->settings['width']) ? esc_attr($flipbook->settings['width']) : '800'; ?>" min="300">
                            <span>px</span>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="flipbook_height"><?php _e('Height', '3d-flipbook-pro'); ?></label>
                        </th>
                        <td>
                            <input type="number" id="flipbook_height" name="settings[height]" class="small-text" 
                                   value="<?php echo $flipbook && isset($flipbook->settings['height']) ? esc_attr($flipbook->settings['height']) : '600'; ?>" min="300">
                            <span>px</span>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="flipbook_autoplay"><?php _e('Auto Play', '3d-flipbook-pro'); ?></label>
                        </th>
                        <td>
                            <input type="checkbox" id="flipbook_autoplay" name="settings[autoplay]" value="1" 
                                   <?php checked($flipbook && isset($flipbook->settings['autoplay']) ? $flipbook->settings['autoplay'] : false, 1); ?>>
                            <label for="flipbook_autoplay"><?php _e('Enable auto page turning', '3d-flipbook-pro'); ?></label>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="flipbook_controls"><?php _e('Show Controls', '3d-flipbook-pro'); ?></label>
                        </th>
                        <td>
                            <input type="checkbox" id="flipbook_controls" name="settings[controls]" value="1" 
                                   <?php checked($flipbook && isset($flipbook->settings['controls']) ? $flipbook->settings['controls'] : true, 1); ?>>
                            <label for="flipbook_controls"><?php _e('Show navigation controls', '3d-flipbook-pro'); ?></label>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button($is_edit ? __('Update FlipBook', '3d-flipbook-pro') : __('Create FlipBook', '3d-flipbook-pro')); ?>
            </form>
        </div>
        <?php
    }
    
    public function settings_page() {
        if (isset($_POST['submit'])) {
            update_option('flipbook_pro_settings', $_POST['flipbook_pro_settings']);
            echo '<div class="notice notice-success"><p>' . __('Settings saved.', '3d-flipbook-pro') . '</p></div>';
        }
        
        $settings = get_option('flipbook_pro_settings', array());
        
        ?>
        <div class="wrap">
            <h1><?php _e('FlipBook Pro Settings', '3d-flipbook-pro'); ?></h1>
            
            <form method="post" action="">
                <?php wp_nonce_field('flipbook_settings', 'flipbook_settings_nonce'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="default_width"><?php _e('Default Width', '3d-flipbook-pro'); ?></label>
                        </th>
                        <td>
                            <input type="number" id="default_width" name="flipbook_pro_settings[default_width]" class="small-text" 
                                   value="<?php echo isset($settings['default_width']) ? esc_attr($settings['default_width']) : '800'; ?>" min="300">
                            <span>px</span>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="default_height"><?php _e('Default Height', '3d-flipbook-pro'); ?></label>
                        </th>
                        <td>
                            <input type="number" id="default_height" name="flipbook_pro_settings[default_height]" class="small-text" 
                                   value="<?php echo isset($settings['default_height']) ? esc_attr($settings['default_height']) : '600'; ?>" min="300">
                            <span>px</span>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="enable_lightbox"><?php _e('Enable Lightbox', '3d-flipbook-pro'); ?></label>
                        </th>
                        <td>
                            <input type="checkbox" id="enable_lightbox" name="flipbook_pro_settings[enable_lightbox]" value="1" 
                                   <?php checked(isset($settings['enable_lightbox']) ? $settings['enable_lightbox'] : true, 1); ?>>
                            <label for="enable_lightbox"><?php _e('Enable lightbox mode for flipbooks', '3d-flipbook-pro'); ?></label>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
    
    public function handle_save_flipbook() {
        if (!wp_verify_nonce($_POST['flipbook_nonce'], 'save_flipbook')) {
            wp_die(__('Security check failed.', '3d-flipbook-pro'));
        }
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', '3d-flipbook-pro'));
        }
        
        $flipbook_data = array(
            'title' => sanitize_text_field($_POST['flipbook_title']),
            'description' => sanitize_textarea_field($_POST['flipbook_description']),
            'type' => sanitize_text_field($_POST['flipbook_type']),
            'source_url' => esc_url_raw($_POST['flipbook_source_url']),
            'settings' => isset($_POST['settings']) ? $_POST['settings'] : array()
        );
        
        if (isset($_POST['flipbook_id'])) {
            // Update existing flipbook
            $flipbook_id = intval($_POST['flipbook_id']);
            FlipBook_Database::update_flipbook($flipbook_id, $flipbook_data);
            $message = 'updated';
        } else {
            // Create new flipbook
            $flipbook_id = FlipBook_Database::insert_flipbook($flipbook_data);
            $message = 'created';
        }
        
        wp_redirect(admin_url('admin.php?page=flipbook-pro&message=' . $message));
        exit;
    }
    
    public function handle_delete_flipbook() {
        $flipbook_id = intval($_GET['id']);
        
        if (!wp_verify_nonce($_GET['_wpnonce'], 'delete_flipbook_' . $flipbook_id)) {
            wp_die(__('Security check failed.', '3d-flipbook-pro'));
        }
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions.', '3d-flipbook-pro'));
        }
        
        FlipBook_Database::delete_flipbook($flipbook_id);
        
        wp_redirect(admin_url('admin.php?page=flipbook-pro&message=deleted'));
        exit;
    }
    
    private function get_message($message) {
        $messages = array(
            'created' => __('FlipBook created successfully.', '3d-flipbook-pro'),
            'updated' => __('FlipBook updated successfully.', '3d-flipbook-pro'),
            'deleted' => __('FlipBook deleted successfully.', '3d-flipbook-pro')
        );
        
        return isset($messages[$message]) ? $messages[$message] : '';
    }
}