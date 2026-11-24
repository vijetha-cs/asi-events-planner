<?php
/**
 * Plugin Name: ASI Events Planner API
 * Description: Event management and student registration REST API for the ASI Events Planner portfolio project.
 * Version: 1.0.0
 * Requires at least: 6.4
 * Requires PHP: 8.0
 * Author: Vijetha Kamath
 * License: GPL-2.0-or-later
 */

if (!defined('ABSPATH')) {
    exit;
}

final class ASI_Events_Planner_API {
    const POST_TYPE = 'asi_event';
    const REST_NAMESPACE = 'asi-events/v1';
    const ROLE = 'asi_event_organizer';

    public static function boot() {
        add_action('init', [__CLASS__, 'register_event_type']);
        add_action('init', [__CLASS__, 'register_event_meta']);
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
        add_filter('allowed_http_origin', [__CLASS__, 'allow_configured_frontend_origin']);
        add_filter('rest_allowed_cors_headers', [__CLASS__, 'allow_nonce_header']);
        add_filter('rest_pre_serve_request', [__CLASS__, 'send_credentials_cors_header'], 10, 4);
    }

    public static function activate() {
        self::register_event_type();
        self::create_registration_table();
        self::add_organizer_role();
        flush_rewrite_rules();
    }

    public static function deactivate() {
        flush_rewrite_rules();
    }

    private static function caps() {
        return [
            'edit_post' => 'edit_asi_event',
            'read_post' => 'read_asi_event',
            'delete_post' => 'delete_asi_event',
            'edit_posts' => 'edit_asi_events',
            'edit_others_posts' => 'edit_others_asi_events',
            'publish_posts' => 'publish_asi_events',
            'read_private_posts' => 'read_private_asi_events',
            'delete_posts' => 'delete_asi_events',
            'delete_private_posts' => 'delete_private_asi_events',
            'delete_published_posts' => 'delete_published_asi_events',
            'delete_others_posts' => 'delete_others_asi_events',
            'edit_private_posts' => 'edit_private_asi_events',
            'edit_published_posts' => 'edit_published_asi_events',
            'create_posts' => 'edit_asi_events',
        ];
    }

    public static function register_event_type() {
        register_post_type(self::POST_TYPE, [
            'labels' => [
                'name' => 'ASI Events',
                'singular_name' => 'ASI Event',
                'add_new_item' => 'Add event',
                'edit_item' => 'Edit event',
            ],
            'public' => true,
            'show_in_rest' => true,
            'rest_base' => 'asi-events',
            'show_in_menu' => true,
            'menu_icon' => 'dashicons-calendar-alt',
            'supports' => ['title', 'editor', 'thumbnail', 'author'],
            'capability_type' => ['asi_event', 'asi_events'],
            'capabilities' => self::caps(),
            'map_meta_cap' => true,
            'has_archive' => false,
            'rewrite' => ['slug' => 'asi-event'],
        ]);
    }

    public static function register_event_meta() {
        $fields = [
            'asi_event_date' => ['type' => 'string', 'sanitize_callback' => 'sanitize_text_field'],
            'asi_event_time' => ['type' => 'string', 'sanitize_callback' => 'sanitize_text_field'],
            'asi_event_location' => ['type' => 'string', 'sanitize_callback' => 'sanitize_text_field'],
            'asi_event_category' => ['type' => 'string', 'sanitize_callback' => 'sanitize_text_field'],
            'asi_event_accessibility' => ['type' => 'string', 'sanitize_callback' => 'sanitize_textarea_field'],
            'asi_event_registration_limit' => ['type' => 'integer', 'sanitize_callback' => 'absint'],
            'asi_event_image_url' => ['type' => 'string', 'sanitize_callback' => 'esc_url_raw'],
            'asi_event_image_alt' => ['type' => 'string', 'sanitize_callback' => 'sanitize_text_field'],
        ];

        foreach ($fields as $key => $options) {
            register_post_meta(self::POST_TYPE, $key, [
                'type' => $options['type'],
                'single' => true,
                'show_in_rest' => true,
                'sanitize_callback' => $options['sanitize_callback'],
                'auth_callback' => function ($allowed, $meta_key, $post_id) {
                    return current_user_can('edit_post', $post_id);
                },
            ]);
        }
    }

    private static function create_registration_table() {
        global $wpdb;
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        $table = $wpdb->prefix . 'asi_event_registrations';
        $charset = $wpdb->get_charset_collate();
        $sql = "CREATE TABLE $table (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            event_id bigint(20) unsigned NOT NULL,
            user_id bigint(20) unsigned NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'registered',
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY event_user (event_id,user_id),
            KEY user_status (user_id,status),
            KEY event_status (event_id,status)
        ) $charset;";
        dbDelta($sql);
    }

    private static function add_organizer_role() {
        $role = get_role(self::ROLE);
        if (!$role) {
            $role = add_role(self::ROLE, 'ASI Event Organizer', ['read' => true]);
        }
        if (!$role) {
            return;
        }
        foreach (self::caps() as $capability) {
            $role->add_cap($capability);
        }
        $admin = get_role('administrator');
        if ($admin) {
            foreach (self::caps() as $capability) {
                $admin->add_cap($capability);
            }
        }
    }

    public static function register_routes() {
        register_rest_route(self::REST_NAMESPACE, '/session', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'session'],
            'permission_callback' => '__return_true',
        ]);
        register_rest_route(self::REST_NAMESPACE, '/events', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [__CLASS__, 'list_events'],
                'permission_callback' => '__return_true',
            ],
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [__CLASS__, 'save_event'],
                'permission_callback' => [__CLASS__, 'can_manage_events'],
            ],
        ]);
        register_rest_route(self::REST_NAMESPACE, '/events/(?P<id>\d+)', [
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => [__CLASS__, 'save_event'],
                'permission_callback' => [__CLASS__, 'can_edit_event'],
            ],
            [
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => [__CLASS__, 'delete_event'],
                'permission_callback' => [__CLASS__, 'can_edit_event'],
            ],
        ]);
        register_rest_route(self::REST_NAMESPACE, '/my-registrations', [
            'methods' => WP_REST_Server::READABLE,
            'callback' => [__CLASS__, 'my_registrations'],
            'permission_callback' => [__CLASS__, 'is_logged_in'],
        ]);
        register_rest_route(self::REST_NAMESPACE, '/events/(?P<id>\d+)/register', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'register_student'],
            'permission_callback' => [__CLASS__, 'is_logged_in'],
        ]);
        register_rest_route(self::REST_NAMESPACE, '/events/(?P<id>\d+)/cancel', [
            'methods' => WP_REST_Server::CREATABLE,
            'callback' => [__CLASS__, 'cancel_registration'],
            'permission_callback' => [__CLASS__, 'is_logged_in'],
        ]);
    }

    public static function allow_configured_frontend_origin($origin) {
        $configured = defined('ASI_EVENTS_ALLOWED_ORIGIN') ? untrailingslashit(ASI_EVENTS_ALLOWED_ORIGIN) : '';
        $request_origin = isset($_SERVER['HTTP_ORIGIN']) ? esc_url_raw(wp_unslash($_SERVER['HTTP_ORIGIN'])) : '';
        if ($configured && $request_origin && hash_equals($configured, untrailingslashit($request_origin))) {
            return $request_origin;
        }
        return $origin;
    }

    public static function allow_nonce_header($headers) {
        $headers[] = 'X-WP-Nonce';
        return $headers;
    }

    public static function send_credentials_cors_header($served, $result, $request, $server) {
        $configured = defined('ASI_EVENTS_ALLOWED_ORIGIN') ? untrailingslashit(ASI_EVENTS_ALLOWED_ORIGIN) : '';
        $request_origin = isset($_SERVER['HTTP_ORIGIN']) ? esc_url_raw(wp_unslash($_SERVER['HTTP_ORIGIN'])) : '';
        if ($configured && $request_origin && hash_equals($configured, untrailingslashit($request_origin))) {
            header('Access-Control-Allow-Credentials: true');
            header('Vary: Origin', false);
        }
        return $served;
    }

    public static function session() {
        $user = wp_get_current_user();
        return rest_ensure_response([
            'loggedIn' => is_user_logged_in(),
            'name' => is_user_logged_in() ? $user->display_name : null,
            'canManageEvents' => current_user_can('edit_asi_events'),
            'nonce' => is_user_logged_in() ? wp_create_nonce('wp_rest') : null,
            'loginUrl' => site_url('wp-login.php'),
        ]);
    }

    public static function can_manage_events() {
        return current_user_can('edit_asi_events');
    }

    public static function can_edit_event($request) {
        $post = get_post(absint($request['id']));
        return $post && $post->post_type === self::POST_TYPE && current_user_can('edit_post', $post->ID);
    }

    public static function is_logged_in() {
        return is_user_logged_in() && current_user_can('read');
    }

    public static function list_events() {
        $can_manage = current_user_can('edit_asi_events');
        $query = new WP_Query([
            'post_type' => self::POST_TYPE,
            'post_status' => $can_manage ? ['publish', 'draft', 'pending', 'private'] : ['publish'],
            'posts_per_page' => 100,
            'orderby' => 'meta_value',
            'meta_key' => 'asi_event_date',
            'order' => 'ASC',
            'no_found_rows' => true,
        ]);
        $events = array_map(function ($post) use ($can_manage) {
            return self::format_event($post, $can_manage);
        }, $query->posts);
        return rest_ensure_response($events);
    }

    private static function format_event($post, $include_counts = false) {
        $date = get_post_meta($post->ID, 'asi_event_date', true);
        $timestamp = $date ? strtotime($date . 'T12:00:00') : false;
        $status = get_post_status($post);
        $event = [
            'id' => (string) $post->ID,
            'title' => get_the_title($post),
            'description' => wp_strip_all_tags($post->post_content),
            'category' => get_post_meta($post->ID, 'asi_event_category', true) ?: 'Community',
            'date' => $date,
            'dateLabel' => $timestamp ? strtoupper(wp_date('M d', $timestamp)) : '',
            'dateText' => $timestamp ? wp_date('l, F j, Y', $timestamp) : '',
            'time' => get_post_meta($post->ID, 'asi_event_time', true),
            'location' => get_post_meta($post->ID, 'asi_event_location', true),
            'accessibilityNotes' => get_post_meta($post->ID, 'asi_event_accessibility', true),
            'registrationLimit' => (int) get_post_meta($post->ID, 'asi_event_registration_limit', true),
            'imageUrl' => get_post_meta($post->ID, 'asi_event_image_url', true),
            'imageAlt' => get_post_meta($post->ID, 'asi_event_image_alt', true),
            'source' => 'WordPress API',
            'status' => $status === 'publish' ? 'published' : 'draft',
            'color' => 'from-sky-700 to-cyan-500',
            'symbol' => '✦',
        ];
        if ($include_counts) {
            $event['registrationCount'] = self::registration_count($post->ID);
        }
        return $event;
    }

    public static function save_event($request) {
        $data = $request->get_json_params();
        $id = isset($request['id']) ? absint($request['id']) : (isset($data['id']) ? absint($data['id']) : 0);
        $date = isset($data['date']) ? sanitize_text_field($data['date']) : '';
        if (!self::valid_date($date)) {
            return new WP_Error('asi_invalid_date', 'Enter a valid event date in YYYY-MM-DD format.', ['status' => 400]);
        }
        $title = isset($data['title']) ? sanitize_text_field($data['title']) : '';
        $location = isset($data['location']) ? sanitize_text_field($data['location']) : '';
        $image_url = isset($data['imageUrl']) ? esc_url_raw($data['imageUrl']) : '';
        $image_alt = isset($data['imageAlt']) ? sanitize_text_field($data['imageAlt']) : '';
        if (!$title || !$location) {
            return new WP_Error('asi_missing_fields', 'Event title and location are required.', ['status' => 400]);
        }
        if ($image_url && !$image_alt) {
            return new WP_Error('asi_missing_image_alt', 'Add an image description when an event image is provided.', ['status' => 400]);
        }
        $image_scheme = $image_url ? strtolower((string) wp_parse_url($image_url, PHP_URL_SCHEME)) : '';
        if ($image_url && !in_array($image_scheme, ['http', 'https'], true)) {
            return new WP_Error('asi_invalid_image_url', 'Use a valid HTTP or HTTPS image URL.', ['status' => 400]);
        }
        $status_value = isset($data['status']) && $data['status'] === 'draft' ? 'draft' : 'publish';
        $post_data = [
            'post_type' => self::POST_TYPE,
            'post_title' => $title,
            'post_content' => isset($data['description']) ? sanitize_textarea_field($data['description']) : '',
            'post_status' => $status_value,
        ];
        if ($id) {
            $post_data['ID'] = $id;
            $post_id = wp_update_post($post_data, true);
        } else {
            $post_data['post_author'] = get_current_user_id();
            $post_id = wp_insert_post($post_data, true);
        }
        if (is_wp_error($post_id)) {
            return $post_id;
        }
        $fields = [
            'asi_event_date' => $date,
            'asi_event_time' => isset($data['time']) ? sanitize_text_field($data['time']) : '',
            'asi_event_location' => $location,
            'asi_event_category' => isset($data['category']) ? sanitize_text_field($data['category']) : 'Community',
            'asi_event_accessibility' => isset($data['accessibilityNotes']) ? sanitize_textarea_field($data['accessibilityNotes']) : '',
            'asi_event_registration_limit' => isset($data['registrationLimit']) ? absint($data['registrationLimit']) : 0,
            'asi_event_image_url' => $image_url,
            'asi_event_image_alt' => $image_alt,
        ];
        foreach ($fields as $key => $value) {
            update_post_meta($post_id, $key, $value);
        }
        return rest_ensure_response(self::format_event(get_post($post_id), true));
    }

    public static function delete_event($request) {
        $post_id = absint($request['id']);
        $deleted = wp_delete_post($post_id, true);
        if (!$deleted) {
            return new WP_Error('asi_delete_failed', 'The event could not be deleted.', ['status' => 500]);
        }
        return rest_ensure_response(['deleted' => true, 'id' => (string) $post_id]);
    }

    public static function my_registrations() {
        global $wpdb;
        $table = $wpdb->prefix . 'asi_event_registrations';
        $ids = $wpdb->get_col($wpdb->prepare(
            "SELECT event_id FROM $table WHERE user_id = %d AND status = 'registered'",
            get_current_user_id()
        ));
        return rest_ensure_response(array_map('strval', $ids));
    }

    public static function register_student($request) {
        global $wpdb;
        $event_id = absint($request['id']);
        $post = get_post($event_id);
        if (!$post || $post->post_type !== self::POST_TYPE || $post->post_status !== 'publish') {
            return new WP_Error('asi_event_unavailable', 'This event is unavailable for registration.', ['status' => 404]);
        }
        $table = $wpdb->prefix . 'asi_event_registrations';
        $limit = absint(get_post_meta($event_id, 'asi_event_registration_limit', true));
        $wpdb->query('START TRANSACTION');
        $wpdb->get_var($wpdb->prepare("SELECT ID FROM {$wpdb->posts} WHERE ID = %d FOR UPDATE", $event_id));
        $existing = $wpdb->get_row($wpdb->prepare(
            "SELECT id, status FROM $table WHERE event_id = %d AND user_id = %d",
            $event_id,
            get_current_user_id()
        ));
        if ($existing) {
            if ($existing->status !== 'registered' && $limit && self::registration_count($event_id) >= $limit) {
                $wpdb->query('ROLLBACK');
                return new WP_Error('asi_event_full', 'This event has reached its registration limit.', ['status' => 409]);
            }
            $wpdb->update($table, ['status' => 'registered', 'updated_at' => current_time('mysql', true)], ['id' => $existing->id]);
        } else {
            $count = self::registration_count($event_id);
            if ($limit && $count >= $limit) {
                $wpdb->query('ROLLBACK');
                return new WP_Error('asi_event_full', 'This event has reached its registration limit.', ['status' => 409]);
            }
            $wpdb->insert($table, [
                'event_id' => $event_id,
                'user_id' => get_current_user_id(),
                'status' => 'registered',
                'created_at' => current_time('mysql', true),
                'updated_at' => current_time('mysql', true),
            ], ['%d', '%d', '%s', '%s', '%s']);
        }
        $wpdb->query('COMMIT');
        return rest_ensure_response(['registered' => true, 'eventId' => (string) $event_id, 'registrationCount' => self::registration_count($event_id)]);
    }

    public static function cancel_registration($request) {
        global $wpdb;
        $event_id = absint($request['id']);
        $table = $wpdb->prefix . 'asi_event_registrations';
        $wpdb->update(
            $table,
            ['status' => 'cancelled', 'updated_at' => current_time('mysql', true)],
            ['event_id' => $event_id, 'user_id' => get_current_user_id(), 'status' => 'registered'],
            ['%s', '%s'],
            ['%d', '%d', '%s']
        );
        return rest_ensure_response(['registered' => false, 'eventId' => (string) $event_id, 'registrationCount' => self::registration_count($event_id)]);
    }

    private static function registration_count($event_id) {
        global $wpdb;
        $table = $wpdb->prefix . 'asi_event_registrations';
        return (int) $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM $table WHERE event_id = %d AND status = 'registered'",
            absint($event_id)
        ));
    }

    private static function valid_date($date) {
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return false;
        }
        [$year, $month, $day] = array_map('intval', explode('-', $date));
        return checkdate($month, $day, $year);
    }
}

ASI_Events_Planner_API::boot();
register_activation_hook(__FILE__, ['ASI_Events_Planner_API', 'activate']);
register_deactivation_hook(__FILE__, ['ASI_Events_Planner_API', 'deactivate']);
