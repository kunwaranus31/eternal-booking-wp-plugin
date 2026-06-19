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
			<p><?php echo esc_html__( 'Add this shortcode to any page or post to render the full booking widget (services + packages):', 'eternel-booking' ); ?></p>
			<code>[eternel_booking]</code>

			<hr />
			<h2><?php echo esc_html__( 'Per-service shortcodes', 'eternel-booking' ); ?></h2>
			<p><?php echo esc_html__( 'Use one of these on its own page to show just that single service. "Book Now" runs the same flow (including Single / Multiple Session).', 'eternel-booking' ); ?></p>
			<?php $this->render_services_list(); ?>

			<hr />
			<h2><?php echo esc_html__( 'Per-package shortcodes', 'eternel-booking' ); ?></h2>
			<p><?php echo esc_html__( 'Use one of these on its own page to show just that single package. "Book Now" runs the package flow (Choose Your Package → ...).', 'eternel-booking' ); ?></p>
			<?php $this->render_packages_list(); ?>
			<?php $this->render_copy_script(); ?>
		</div>
		<?php
	}

	/**
	 * Fetches services from the configured API (server-side, public endpoint) and
	 * renders a copy-ready per-service shortcode for each.
	 */
	private function render_services_list() {
		$api = get_option( ETERNEL_BOOKING_OPT_API, '' );
		if ( ! $api ) {
			echo '<p><em>' . esc_html__( 'Set the API Base URL above and save to load your services here.', 'eternel-booking' ) . '</em></p>';
			return;
		}

		$response = wp_remote_get(
			trailingslashit( $api ) . 'service?public=true',
			array( 'timeout' => 15 )
		);

		if ( is_wp_error( $response ) ) {
			echo '<p style="color:#b32d2e;">' . esc_html( sprintf( /* translators: %s: error message */ __( 'Could not reach the API: %s', 'eternel-booking' ), $response->get_error_message() ) ) . '</p>';
			return;
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( $code < 200 || $code >= 300 || empty( $body['data'] ) ) {
			echo '<p style="color:#b32d2e;">' . esc_html__( 'No services found, or the API returned an error.', 'eternel-booking' ) . '</p>';
			return;
		}

		echo '<table class="widefat striped" style="max-width:780px;margin-top:10px;"><thead><tr>';
		echo '<th>' . esc_html__( 'Service', 'eternel-booking' ) . '</th>';
		echo '<th>' . esc_html__( 'Shortcode', 'eternel-booking' ) . '</th>';
		echo '</tr></thead><tbody>';

		foreach ( $body['data'] as $svc ) {
			$id = isset( $svc['_id'] ) ? $svc['_id'] : '';
			if ( ! $id ) {
				continue;
			}
			$name      = $this->service_name( $svc );
			$shortcode = '[eternel_booking service="' . $id . '"]';
			echo '<tr>';
			echo '<td>' . esc_html( $name ) . '</td>';
			echo '<td>';
			echo '<input type="text" readonly value="' . esc_attr( $shortcode ) . '" onclick="this.select()" style="width:330px;font-family:monospace;" /> ';
			echo '<button type="button" class="button eb-copy" data-shortcode="' . esc_attr( $shortcode ) . '">' . esc_html__( 'Copy', 'eternel-booking' ) . '</button>';
			echo '</td>';
			echo '</tr>';
		}

		echo '</tbody></table>';
	}

	/**
	 * Fetches package groups from the API and renders a copy-ready shortcode for
	 * each. The package id used is the group's service id (groups are 1:1 with a
	 * service), which the widget matches in PackagePage.
	 */
	private function render_packages_list() {
		$api = get_option( ETERNEL_BOOKING_OPT_API, '' );
		if ( ! $api ) {
			echo '<p><em>' . esc_html__( 'Set the API Base URL above and save to load your packages here.', 'eternel-booking' ) . '</em></p>';
			return;
		}

		$response = wp_remote_get(
			trailingslashit( $api ) . 'package?includePrivate=false',
			array( 'timeout' => 15 )
		);

		if ( is_wp_error( $response ) ) {
			echo '<p style="color:#b32d2e;">' . esc_html( sprintf( /* translators: %s: error message */ __( 'Could not reach the API: %s', 'eternel-booking' ), $response->get_error_message() ) ) . '</p>';
			return;
		}

		$code = wp_remote_retrieve_response_code( $response );
		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( $code < 200 || $code >= 300 || empty( $body['data'] ) ) {
			echo '<p style="color:#b32d2e;">' . esc_html__( 'No packages found, or the API returned an error.', 'eternel-booking' ) . '</p>';
			return;
		}

		echo '<table class="widefat striped" style="max-width:780px;margin-top:10px;"><thead><tr>';
		echo '<th>' . esc_html__( 'Package (service)', 'eternel-booking' ) . '</th>';
		echo '<th>' . esc_html__( 'Shortcode', 'eternel-booking' ) . '</th>';
		echo '</tr></thead><tbody>';

		foreach ( $body['data'] as $group ) {
			$service = isset( $group['service'] ) ? $group['service'] : array();
			$id      = isset( $service['_id'] ) ? $service['_id'] : ( isset( $group['_id'] ) ? $group['_id'] : '' );
			if ( ! $id ) {
				continue;
			}
			$name      = $this->service_name( $service );
			$shortcode = '[eternel_booking package="' . $id . '"]';
			echo '<tr>';
			echo '<td>' . esc_html( $name ) . '</td>';
			echo '<td>';
			echo '<input type="text" readonly value="' . esc_attr( $shortcode ) . '" onclick="this.select()" style="width:330px;font-family:monospace;" /> ';
			echo '<button type="button" class="button eb-copy" data-shortcode="' . esc_attr( $shortcode ) . '">' . esc_html__( 'Copy', 'eternel-booking' ) . '</button>';
			echo '</td>';
			echo '</tr>';
		}

		echo '</tbody></table>';
	}

	/**
	 * One-time clipboard handler bound to every .eb-copy button on the page
	 * (covers both the services and packages tables).
	 */
	private function render_copy_script() {
		?>
		<script>
		(function () {
			document.querySelectorAll('.eb-copy').forEach(function (btn) {
				btn.addEventListener('click', function () {
					var sc = btn.getAttribute('data-shortcode');
					navigator.clipboard.writeText(sc).then(function () {
						var old = btn.textContent;
						btn.textContent = '<?php echo esc_js( __( 'Copied!', 'eternel-booking' ) ); ?>';
						setTimeout(function () { btn.textContent = old; }, 1500);
					});
				});
			});
		})();
		</script>
		<?php
	}

	/**
	 * Service name may be a plain string or a localized object { en, fr }.
	 */
	private function service_name( $svc ) {
		$name = isset( $svc['name'] ) ? $svc['name'] : '';
		if ( is_array( $name ) ) {
			if ( ! empty( $name['en'] ) ) {
				return $name['en'];
			}
			$first = reset( $name );
			return $first ? $first : '(unnamed)';
		}
		return $name ? $name : '(unnamed)';
	}
}
