<?php
/**
 * Admin settings page for the Eternel Booking plugin.
 *
 * Adds a "Eternel Booking" page under Settings where an admin can configure:
 *   - API Base URL   (e.g. https://api.eternel-experiences.com)  — NO trailing slash
 *   - Stripe Publishable Key (pk_live_... / pk_test_...)
 *
 * These are read by the shortcode class and injected into the page for the
 * React widget to consume.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Eternel_Booking_Settings {

	const PAGE_SLUG  = 'eternel-booking';
	const GROUP      = 'eternel_booking_settings';

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
	}

	public function add_menu() {
		add_options_page(
			__( 'Eternel Booking', 'eternel-booking' ),
			__( 'Eternel Booking', 'eternel-booking' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render_page' )
		);
	}

	public function register_settings() {
		register_setting(
			self::GROUP,
			ETERNEL_BOOKING_OPT_API,
			array(
				'type'              => 'string',
				'sanitize_callback' => array( $this, 'sanitize_url' ),
				'default'           => '',
			)
		);

		register_setting(
			self::GROUP,
			ETERNEL_BOOKING_OPT_STRIPE,
			array(
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			)
		);

		add_settings_section(
			'eternel_booking_main',
			__( 'API & Payment configuration', 'eternel-booking' ),
			function () {
				echo '<p>' . esc_html__( 'Configure how the booking widget connects to the Eternel backend. After saving, place the [eternel_booking] shortcode on any page.', 'eternel-booking' ) . '</p>';
			},
			self::PAGE_SLUG
		);

		add_settings_field(
			ETERNEL_BOOKING_OPT_API,
			__( 'API Base URL', 'eternel-booking' ),
			array( $this, 'field_api' ),
			self::PAGE_SLUG,
			'eternel_booking_main'
		);

		add_settings_field(
			ETERNEL_BOOKING_OPT_STRIPE,
			__( 'Stripe Publishable Key', 'eternel-booking' ),
			array( $this, 'field_stripe' ),
			self::PAGE_SLUG,
			'eternel_booking_main'
		);
	}

	/**
	 * Strip a trailing slash so the JS can safely append `/booking`, `/service`, etc.
	 */
	public function sanitize_url( $value ) {
		$value = esc_url_raw( trim( $value ) );
		return untrailingslashit( $value );
	}

	public function field_api() {
		$value = get_option( ETERNEL_BOOKING_OPT_API, '' );
		printf(
			'<input type="url" name="%1$s" value="%2$s" class="regular-text" placeholder="https://api.eternel-experiences.com" />',
			esc_attr( ETERNEL_BOOKING_OPT_API ),
			esc_attr( $value )
		);
		echo '<p class="description">' . esc_html__( 'Base URL of the Eternel API. No trailing slash. The widget appends /service, /package, /booking, etc.', 'eternel-booking' ) . '</p>';
	}

	public function field_stripe() {
		$value = get_option( ETERNEL_BOOKING_OPT_STRIPE, '' );
		printf(
			'<input type="text" name="%1$s" value="%2$s" class="regular-text" placeholder="pk_live_xxx or pk_test_xxx" />',
			esc_attr( ETERNEL_BOOKING_OPT_STRIPE ),
			esc_attr( $value )
		);
		echo '<p class="description">' . esc_html__( 'Stripe PUBLISHABLE key only (pk_...). Never paste a secret key here — this value is exposed to the browser.', 'eternel-booking' ) . '</p>';
	}

	public function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		?>
		<div class="wrap">
			<h1><?php echo esc_html__( 'Eternel Booking', 'eternel-booking' ); ?></h1>
			<form action="options.php" method="post">
				<?php
				settings_fields( self::GROUP );
				do_settings_sections( self::PAGE_SLUG );
				submit_button();
				?>
			</form>
			<hr />
			<h2><?php echo esc_html__( 'Usage', 'eternel-booking' ); ?></h2>
			<p><?php echo esc_html__( 'Add this shortcode to any page or post to render the booking widget:', 'eternel-booking' ); ?></p>
			<code>[eternel_booking]</code>
		</div>
		<?php
	}
}
