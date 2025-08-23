<?php
/**
 * Database operations for FlipBook Pro
 */

if (!defined('ABSPATH')) {
    exit;
}

class FlipBook_Database {
    
    const TABLE_FLIPBOOKS = 'flipbook_pro_flipbooks';
    const TABLE_PAGES = 'flipbook_pro_pages';
    
    public function __construct() {
        // Constructor can be empty for now
    }
    
    public static function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Flipbooks table
        $table_flipbooks = $wpdb->prefix . self::TABLE_FLIPBOOKS;
        $sql_flipbooks = "CREATE TABLE $table_flipbooks (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            title varchar(255) NOT NULL,
            description text,
            type varchar(50) NOT NULL DEFAULT 'pdf',
            source_url varchar(500),
            settings longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            status varchar(20) DEFAULT 'active',
            author_id bigint(20) UNSIGNED,
            PRIMARY KEY (id),
            KEY author_id (author_id),
            KEY status (status),
            KEY type (type)
        ) $charset_collate;";
        
        // Pages table for image-based flipbooks
        $table_pages = $wpdb->prefix . self::TABLE_PAGES;
        $sql_pages = "CREATE TABLE $table_pages (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            flipbook_id mediumint(9) NOT NULL,
            page_number int NOT NULL,
            image_url varchar(500),
            content longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY flipbook_id (flipbook_id),
            KEY page_number (page_number),
            FOREIGN KEY (flipbook_id) REFERENCES $table_flipbooks(id) ON DELETE CASCADE
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql_flipbooks);
        dbDelta($sql_pages);
    }
    
    public static function drop_tables() {
        global $wpdb;
        
        $table_flipbooks = $wpdb->prefix . self::TABLE_FLIPBOOKS;
        $table_pages = $wpdb->prefix . self::TABLE_PAGES;
        
        $wpdb->query("DROP TABLE IF EXISTS $table_pages");
        $wpdb->query("DROP TABLE IF EXISTS $table_flipbooks");
    }
    
    public static function insert_flipbook($data) {
        global $wpdb;
        
        $table = $wpdb->prefix . self::TABLE_FLIPBOOKS;
        
        $defaults = array(
            'title' => '',
            'description' => '',
            'type' => 'pdf',
            'source_url' => '',
            'settings' => '{}',
            'status' => 'active',
            'author_id' => get_current_user_id()
        );
        
        $data = wp_parse_args($data, $defaults);
        
        if (is_array($data['settings'])) {
            $data['settings'] = json_encode($data['settings']);
        }
        
        $result = $wpdb->insert($table, $data);
        
        if ($result !== false) {
            return $wpdb->insert_id;
        }
        
        return false;
    }
    
    public static function update_flipbook($id, $data) {
        global $wpdb;
        
        $table = $wpdb->prefix . self::TABLE_FLIPBOOKS;
        
        if (isset($data['settings']) && is_array($data['settings'])) {
            $data['settings'] = json_encode($data['settings']);
        }
        
        return $wpdb->update($table, $data, array('id' => $id));
    }
    
    public static function get_flipbook($id) {
        global $wpdb;
        
        $table = $wpdb->prefix . self::TABLE_FLIPBOOKS;
        $flipbook = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $id));
        
        if ($flipbook && $flipbook->settings) {
            $flipbook->settings = json_decode($flipbook->settings, true);
        }
        
        return $flipbook;
    }
    
    public static function get_flipbooks($args = array()) {
        global $wpdb;
        
        $defaults = array(
            'status' => 'active',
            'limit' => 20,
            'offset' => 0,
            'orderby' => 'created_at',
            'order' => 'DESC'
        );
        
        $args = wp_parse_args($args, $defaults);
        $table = $wpdb->prefix . self::TABLE_FLIPBOOKS;
        
        $where = "WHERE status = %s";
        $query_args = array($args['status']);
        
        if (isset($args['author_id'])) {
            $where .= " AND author_id = %d";
            $query_args[] = $args['author_id'];
        }
        
        $sql = $wpdb->prepare(
            "SELECT * FROM $table $where ORDER BY {$args['orderby']} {$args['order']} LIMIT %d OFFSET %d",
            array_merge($query_args, array($args['limit'], $args['offset']))
        );
        
        $flipbooks = $wpdb->get_results($sql);
        
        foreach ($flipbooks as $flipbook) {
            if ($flipbook->settings) {
                $flipbook->settings = json_decode($flipbook->settings, true);
            }
        }
        
        return $flipbooks;
    }
    
    public static function delete_flipbook($id) {
        global $wpdb;
        
        $table_flipbooks = $wpdb->prefix . self::TABLE_FLIPBOOKS;
        $table_pages = $wpdb->prefix . self::TABLE_PAGES;
        
        // Delete pages first due to foreign key constraint
        $wpdb->delete($table_pages, array('flipbook_id' => $id));
        
        // Delete flipbook
        return $wpdb->delete($table_flipbooks, array('id' => $id));
    }
    
    public static function insert_page($flipbook_id, $page_number, $data) {
        global $wpdb;
        
        $table = $wpdb->prefix . self::TABLE_PAGES;
        
        $page_data = array(
            'flipbook_id' => $flipbook_id,
            'page_number' => $page_number,
            'image_url' => isset($data['image_url']) ? $data['image_url'] : '',
            'content' => isset($data['content']) ? $data['content'] : ''
        );
        
        $result = $wpdb->insert($table, $page_data);
        
        if ($result !== false) {
            return $wpdb->insert_id;
        }
        
        return false;
    }
    
    public static function get_pages($flipbook_id) {
        global $wpdb;
        
        $table = $wpdb->prefix . self::TABLE_PAGES;
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM $table WHERE flipbook_id = %d ORDER BY page_number ASC",
            $flipbook_id
        ));
    }
    
    public static function delete_pages($flipbook_id) {
        global $wpdb;
        
        $table = $wpdb->prefix . self::TABLE_PAGES;
        
        return $wpdb->delete($table, array('flipbook_id' => $flipbook_id));
    }
}