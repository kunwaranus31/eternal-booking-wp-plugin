<?php
/**
 * Registers the [eternel_booking] shortcode and loads the React widget bundle.
 *
 * - JS is enqueued normally (footer).
 * - CSS is INLINED directly into the page (printed as a <style> block by the
 *   shortcode). Inlining makes styling bulletproof against caching/CDN/enqueue
 *   timing issues that can stop an external stylesheet from loading.
 *
 * Runtime config is injected via an inline script (window.ETERNEL_BOOKING_CONFIG)
 * before the app bundle runs.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Eternel_Booking_Shortcode {

	const HANDLE  = 'eternel-booking-app';
	const ROOT_ID = 'eternel-booking-root';

	/** Ensures the CSS is printed only once even with multiple shortcodes. */
	private static $css_printed = false;

	public function __construct() {
		add_shortcode( 'eternel_booking', array( $this, 'render' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'register_and_maybe_enqueue' ) );
	}

	public function register_and_maybe_enqueue() {
		$this->register_script();

		// Enqueue the JS early when the singular post contains the shortcode.
		if ( is_singular() ) {
			$post = get_post();
			if ( $post && has_shortcode( $post->post_content, 'eternel_booking' ) ) {
				wp_enqueue_script( self::HANDLE );
			}
		}
	}

	private function register_script() {
		if ( wp_script_is( self::HANDLE, 'registered' ) ) {
			return;
		}

		$js_rel  = 'build/eternel-booking.js';
		$js_path = ETERNEL_BOOKING_DIR . $js_rel;
		$js_ver  = file_exists( $js_path ) ? filemtime( $js_path ) : ETERNEL_BOOKING_VERSION;

		wp_register_script(
			self::HANDLE,
			ETERNEL_BOOKING_URL . $js_rel,
			array(),
			$js_ver,
			true // footer
		);

		$config = array(
			'apiBaseUrl' => get_option( ETERNEL_BOOKING_OPT_API, '' ),
			'stripeKey'  => get_option( ETERNEL_BOOKING_OPT_STRIPE, '' ),
			'rootId'     => self::ROOT_ID,
		);
		wp_add_inline_script(
			self::HANDLE,
			'window.ETERNEL_BOOKING_CONFIG = ' . wp_json_encode( $config ) . ';',
			'before'
		);
	}

	/**
	 * Reads the compiled stylesheet and returns it as an inline <style> block.
	 * Printed once per page.
	 */
	private function inline_css() {
		if ( self::$css_printed ) {
			return '';
		}
		$css_path = ETERNEL_BOOKING_DIR . 'build/eternel-booking.css';
		if ( ! file_exists( $css_path ) ) {
			return '';
		}
		self::$css_printed = true;
		$css = file_get_contents( $css_path );
		// Strip line breaks so wpautop can't inject <br> into the CSS. Minified
		// CSS is whitespace-insensitive, so this is safe.
		$css = str_replace( array( "\r", "\n" ), ' ', $css );
		return '<style id="eternel-booking-inline-css">' . $css . '</style>';
	}

	/**
	 * Shortcode output: inline CSS + the mount node. Also enqueues the JS as a
	 * fallback (covers page builders that don't store the shortcode in post_content).
	 */
	public function render( $atts = array() ) {
		$this->register_script();
		wp_enqueue_script( self::HANDLE );

		$missing = ! get_option( ETERNEL_BOOKING_OPT_API ) || ! get_option( ETERNEL_BOOKING_OPT_STRIPE );
		$notice  = '';
		if ( $missing && current_user_can( 'manage_options' ) ) {
			$notice = '<p style="color:#b32d2e;font-family:sans-serif;">'
				. esc_html__( 'Eternel Booking: API Base URL or Stripe key is not configured. Set them under Settings → Eternel Booking. (This notice is only visible to admins.)', 'eternel-booking' )
				. '</p>';
		}

		return $this->inline_css()
			. $notice
			. '<div id="' . esc_attr( self::ROOT_ID ) . '"></div>';
	}
}
