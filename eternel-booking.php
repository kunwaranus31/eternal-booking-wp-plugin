<?php
/**
 * Plugin Name:       Eternel Booking
 * Plugin URI:        https://eternel-experiences.com
 * Description:        Guest booking flow (services & packages) for Eternel Experiences. Renders an embeddable React widget via the [eternel_booking] shortcode that talks to the Eternel API.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Eternel Experiences
 * License:           GPL-2.0-or-later
 * Text Domain:       eternel-booking
 *
 * The plugin itself is a thin PHP "shell". All the booking UI/logic lives in a
 * prebuilt React bundle under /build that is enqueued on pages containing the
 * [eternel_booking] shortcode. Runtime config (API base URL + Stripe key) is set
 * from the WP admin settings page and injected into the page via wp_localize_script.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // No direct access.
}

define( 'ETERNEL_BOOKING_VERSION', '1.0.0' );
define( 'ETERNEL_BOOKING_FILE', __FILE__ );
define( 'ETERNEL_BOOKING_DIR', plugin_dir_path( __FILE__ ) );
define( 'ETERNEL_BOOKING_URL', plugin_dir_url( __FILE__ ) );

// Option keys used to store admin settings.
define( 'ETERNEL_BOOKING_OPT_API', 'eternel_booking_api_base_url' );
define( 'ETERNEL_BOOKING_OPT_STRIPE', 'eternel_booking_stripe_pk' );

require_once ETERNEL_BOOKING_DIR . 'includes/class-settings.php';
require_once ETERNEL_BOOKING_DIR . 'includes/class-shortcode.php';

/**
 * Bootstrap the plugin once WordPress is ready.
 */
function eternel_booking_init() {
	new Eternel_Booking_Settings();
	new Eternel_Booking_Shortcode();
}
add_action( 'plugins_loaded', 'eternel_booking_init' );
