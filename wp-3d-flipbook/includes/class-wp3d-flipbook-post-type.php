<?php
/**
 * Custom Post Type for 3D Flipbooks
 */

if (!defined('ABSPATH')) {
    exit;
}

class WP3D_Flipbook_Post_Type {
    
    public function __construct() {
        add_action('init', array($this, 'register_post_type'));
        add_action('add_meta_boxes', array($this, 'add_meta_boxes'));
        add_action('save_post', array($this, 'save_meta_boxes'));
        add_filter('manage_wp3d_flipbook_posts_columns', array($this, 'set_custom_columns'));
        add_action('manage_wp3d_flipbook_posts_custom_column', array($this, 'custom_column_content'), 10, 2);
    }
    
    public function register_post_type() {
        $labels = array(
            'name'               => _x('3D Flipbooks', 'post type general name', 'wp-3d-flipbook'),
            'singular_name'      => _x('3D Flipbook', 'post type singular name', 'wp-3d-flipbook'),
            'menu_name'          => _x('3D Flipbooks', 'admin menu', 'wp-3d-flipbook'),
            'name_admin_bar'     => _x('3D Flipbook', 'add new on admin bar', 'wp-3d-flipbook'),
            'add_new'            => _x('Add New', 'flipbook', 'wp-3d-flipbook'),
            'add_new_item'       => __('Add New Flipbook', 'wp-3d-flipbook'),
            'new_item'           => __('New Flipbook', 'wp-3d-flipbook'),
            'edit_item'          => __('Edit Flipbook', 'wp-3d-flipbook'),
            'view_item'          => __('View Flipbook', 'wp-3d-flipbook'),
            'all_items'          => __('All Flipbooks', 'wp-3d-flipbook'),
            'search_items'       => __('Search Flipbooks', 'wp-3d-flipbook'),
            'parent_item_colon'  => __('Parent Flipbooks:', 'wp-3d-flipbook'),
            'not_found'          => __('No flipbooks found.', 'wp-3d-flipbook'),
            'not_found_in_trash' => __('No flipbooks found in Trash.', 'wp-3d-flipbook')
        );

        $args = array(
            'labels'             => $labels,
            'description'        => __('3D Flipbook custom post type.', 'wp-3d-flipbook'),
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'query_var'          => true,
            'rewrite'            => array('slug' => 'flipbook'),
            'capability_type'    => 'post',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => 20,
            'menu_icon'          => 'dashicons-book-alt',
            'supports'           => array('title', 'editor', 'thumbnail', 'excerpt'),
            'show_in_rest'       => true,
        );

        register_post_type('wp3d_flipbook', $args);
    }
    
    public function add_meta_boxes() {
        add_meta_box(
            'wp3d_flipbook_settings',
            __('Flipbook Settings', 'wp-3d-flipbook'),
            array($this, 'render_settings_meta_box'),
            'wp3d_flipbook',
            'normal',
            'high'
        );
        
        add_meta_box(
            'wp3d_flipbook_preview',
            __('Flipbook Preview', 'wp-3d-flipbook'),
            array($this, 'render_preview_meta_box'),
            'wp3d_flipbook',
            'side',
            'high'
        );
    }
    
    public function render_settings_meta_box($post) {
        wp_nonce_field('wp3d_flipbook_meta_box', 'wp3d_flipbook_meta_box_nonce');
        
        $pdf_url = get_post_meta($post->ID, '_wp3d_flipbook_pdf_url', true);
        $width = get_post_meta($post->ID, '_wp3d_flipbook_width', true) ?: '100%';
        $height = get_post_meta($post->ID, '_wp3d_flipbook_height', true) ?: '600px';
        $auto_play = get_post_meta($post->ID, '_wp3d_flipbook_auto_play', true);
        $show_controls = get_post_meta($post->ID, '_wp3d_flipbook_show_controls', true) !== '0';
        $show_thumbnails = get_post_meta($post->ID, '_wp3d_flipbook_show_thumbnails', true) !== '0';
        $background_color = get_post_meta($post->ID, '_wp3d_flipbook_background_color', true) ?: '#ffffff';
        $page_mode = get_post_meta($post->ID, '_wp3d_flipbook_page_mode', true) ?: 'double';
        $zoom_level = get_post_meta($post->ID, '_wp3d_flipbook_zoom_level', true) ?: '1';
        ?>
        
        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="wp3d_flipbook_pdf_url"><?php _e('PDF File', 'wp-3d-flipbook'); ?></label>
                </th>
                <td>
                    <input type="text" id="wp3d_flipbook_pdf_url" name="wp3d_flipbook_pdf_url" 
                           value="<?php echo esc_attr($pdf_url); ?>" class="regular-text" />
                    <button type="button" class="button" id="wp3d_flipbook_upload_pdf">
                        <?php _e('Upload PDF', 'wp-3d-flipbook'); ?>
                    </button>
                    <p class="description">
                        <?php _e('Upload or select a PDF file to convert into a flipbook.', 'wp-3d-flipbook'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="wp3d_flipbook_width"><?php _e('Width', 'wp-3d-flipbook'); ?></label>
                </th>
                <td>
                    <input type="text" id="wp3d_flipbook_width" name="wp3d_flipbook_width" 
                           value="<?php echo esc_attr($width); ?>" class="regular-text" />
                    <p class="description">
                        <?php _e('Width of the flipbook (e.g., 100%, 800px)', 'wp-3d-flipbook'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="wp3d_flipbook_height"><?php _e('Height', 'wp-3d-flipbook'); ?></label>
                </th>
                <td>
                    <input type="text" id="wp3d_flipbook_height" name="wp3d_flipbook_height" 
                           value="<?php echo esc_attr($height); ?>" class="regular-text" />
                    <p class="description">
                        <?php _e('Height of the flipbook (e.g., 600px)', 'wp-3d-flipbook'); ?>
                    </p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="wp3d_flipbook_page_mode"><?php _e('Page Mode', 'wp-3d-flipbook'); ?></label>
                </th>
                <td>
                    <select id="wp3d_flipbook_page_mode" name="wp3d_flipbook_page_mode">
                        <option value="single" <?php selected($page_mode, 'single'); ?>>
                            <?php _e('Single Page', 'wp-3d-flipbook'); ?>
                        </option>
                        <option value="double" <?php selected($page_mode, 'double'); ?>>
                            <?php _e('Double Page', 'wp-3d-flipbook'); ?>
                        </option>
                    </select>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="wp3d_flipbook_zoom_level"><?php _e('Default Zoom Level', 'wp-3d-flipbook'); ?></label>
                </th>
                <td>
                    <select id="wp3d_flipbook_zoom_level" name="wp3d_flipbook_zoom_level">
                        <option value="0.5" <?php selected($zoom_level, '0.5'); ?>>50%</option>
                        <option value="0.75" <?php selected($zoom_level, '0.75'); ?>>75%</option>
                        <option value="1" <?php selected($zoom_level, '1'); ?>>100%</option>
                        <option value="1.25" <?php selected($zoom_level, '1.25'); ?>>125%</option>
                        <option value="1.5" <?php selected($zoom_level, '1.5'); ?>>150%</option>
                        <option value="2" <?php selected($zoom_level, '2'); ?>>200%</option>
                    </select>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="wp3d_flipbook_background_color"><?php _e('Background Color', 'wp-3d-flipbook'); ?></label>
                </th>
                <td>
                    <input type="text" id="wp3d_flipbook_background_color" name="wp3d_flipbook_background_color" 
                           value="<?php echo esc_attr($background_color); ?>" class="color-picker" />
                </td>
            </tr>
            
            <tr>
                <th scope="row"><?php _e('Options', 'wp-3d-flipbook'); ?></th>
                <td>
                    <label>
                        <input type="checkbox" name="wp3d_flipbook_auto_play" value="1" 
                               <?php checked($auto_play, '1'); ?> />
                        <?php _e('Auto-play on load', 'wp-3d-flipbook'); ?>
                    </label>
                    <br>
                    <label>
                        <input type="checkbox" name="wp3d_flipbook_show_controls" value="1" 
                               <?php checked($show_controls, true); ?> />
                        <?php _e('Show navigation controls', 'wp-3d-flipbook'); ?>
                    </label>
                    <br>
                    <label>
                        <input type="checkbox" name="wp3d_flipbook_show_thumbnails" value="1" 
                               <?php checked($show_thumbnails, true); ?> />
                        <?php _e('Show thumbnails panel', 'wp-3d-flipbook'); ?>
                    </label>
                </td>
            </tr>
        </table>
        
        <?php
    }
    
    public function render_preview_meta_box($post) {
        $pdf_url = get_post_meta($post->ID, '_wp3d_flipbook_pdf_url', true);
        
        if ($pdf_url) {
            echo '<div id="wp3d-flipbook-preview">';
            echo do_shortcode('[wp3d_flipbook id="' . $post->ID . '" preview="true"]');
            echo '</div>';
        } else {
            echo '<p>' . __('Upload a PDF file to see the preview.', 'wp-3d-flipbook') . '</p>';
        }
        
        echo '<p><strong>' . __('Shortcode:', 'wp-3d-flipbook') . '</strong></p>';
        echo '<code>[wp3d_flipbook id="' . $post->ID . '"]</code>';
    }
    
    public function save_meta_boxes($post_id) {
        // Check if nonce is valid
        if (!isset($_POST['wp3d_flipbook_meta_box_nonce']) || 
            !wp_verify_nonce($_POST['wp3d_flipbook_meta_box_nonce'], 'wp3d_flipbook_meta_box')) {
            return;
        }
        
        // Check if user has permissions
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
        
        // Check if not an autosave
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        
        // Save meta fields
        $fields = array(
            'wp3d_flipbook_pdf_url',
            'wp3d_flipbook_width',
            'wp3d_flipbook_height',
            'wp3d_flipbook_page_mode',
            'wp3d_flipbook_zoom_level',
            'wp3d_flipbook_background_color'
        );
        
        foreach ($fields as $field) {
            if (isset($_POST[$field])) {
                update_post_meta($post_id, '_' . $field, sanitize_text_field($_POST[$field]));
            }
        }
        
        // Save checkbox fields
        $checkbox_fields = array(
            'wp3d_flipbook_auto_play',
            'wp3d_flipbook_show_controls',
            'wp3d_flipbook_show_thumbnails'
        );
        
        foreach ($checkbox_fields as $field) {
            $value = isset($_POST[$field]) ? '1' : '0';
            update_post_meta($post_id, '_' . $field, $value);
        }
    }
    
    public function set_custom_columns($columns) {
        $new_columns = array();
        $new_columns['cb'] = $columns['cb'];
        $new_columns['title'] = $columns['title'];
        $new_columns['pdf_file'] = __('PDF File', 'wp-3d-flipbook');
        $new_columns['shortcode'] = __('Shortcode', 'wp-3d-flipbook');
        $new_columns['date'] = $columns['date'];
        
        return $new_columns;
    }
    
    public function custom_column_content($column, $post_id) {
        switch ($column) {
            case 'pdf_file':
                $pdf_url = get_post_meta($post_id, '_wp3d_flipbook_pdf_url', true);
                if ($pdf_url) {
                    echo '<a href="' . esc_url($pdf_url) . '" target="_blank">' . basename($pdf_url) . '</a>';
                } else {
                    echo '<span style="color: #999;">' . __('No PDF uploaded', 'wp-3d-flipbook') . '</span>';
                }
                break;
                
            case 'shortcode':
                echo '<code>[wp3d_flipbook id="' . $post_id . '"]</code>';
                break;
        }
    }
}