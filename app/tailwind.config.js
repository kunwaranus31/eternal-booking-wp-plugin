/**
 * Tailwind v3, configured for SAFE embedding inside a WordPress theme:
 *   - prefix "tw-"  → every utility becomes tw-flex, tw-bg-sand ... so it can't
 *                     collide with theme/other-plugin classes.
 *   - preflight OFF → Tailwind's global reset won't fight the active theme.
 *                     We ship our own scoped reset (see src/index.css) limited
 *                     to #eternel-booking-root.
 *   - important scoped to #eternel-booking-root → our utilities reliably win over
 *                     leaked theme styles, without affecting the rest of the page.
 */
export default {
  prefix: "tw-",
  // `important: true` puts !important on every utility. Combined with the "tw-"
  // prefix + preflight off, this is the most robust setup for embedding: classes
  // apply regardless of DOM nesting and reliably beat theme styles, while the
  // prefix still prevents any class-name collisions with the theme.
  important: true,
  corePlugins: {
    preflight: false,
  },
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    // Custom breakpoints copied from the main app (its Tailwind v4 @theme), so
    // the responsive prefixes used across the components (s_phone:, tablet:,
    // laptop:, etc.) actually generate CSS. Min-width based.
    screens: {
      s_phone: "319px",
      m_phone: "374px",
      phone: "429px",
      tablet: "767px",
      "laptop-sm": "900px",
      laptop: "1023px",
      "laptop-lg": "1200px",
      desktop: "1439px",
      "4k": "1920px",
    },
    extend: {
      colors: {
        // Exact tokens copied from the main app's index.css @theme
        primary: "#3c190e",
        secondary: "#c78c4e",
        brown: "#3e1b0b",
        "dark-brown": "#3c190e",
        "normal-brown": "#c97f4b",
        sand: "#ffd588",
        almond: "#eedaca",
        cream: "#fef0e5",
        beige: "#f8f3ed",
        "soft-cream": "#fffbf8",
        gray: "#eee7e7",
        "gray-medium": "#bcbcbc",
        grey: "#333333",
        red: "#ef0000",
        green: "#16a636",
      },
      fontFamily: {
        unna: ['"Gilda Display"', "Georgia", "serif"],
        urbanist: ['"Nunito"', "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
