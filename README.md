# Eternel Booking — WordPress Plugin

Embeddable **guest booking flow** (services & packages) for Eternel Experiences,
delivered as a React widget inside a thin WordPress plugin shell. Drop the
`[eternel_booking]` shortcode on any page and the full flow runs there —
**no theme conflicts, no page reloads** — talking to the existing Eternel API.

## What it does

Full guest journey, end to end:

1. **Listing** — Experiences & Packages tabs (`GET /service?public=true`, `GET /package`)
2. **Experience flow** — session → date/time (`/booking/available-slots`) → instructor (`/booking/available-instructors-for-slot`) → add-on (`/addons`)
3. **Package flow** — choose package → confirm plan
4. **Guest details + OTP** — `/booking/initiate-guest`, `/booking/verify-guest`
5. **Checkout** — coupon (`/coupon/apply`), TPS/TVQ tax breakdown, Stripe guest card (`/booking/add-payment-method`), create booking (`POST /booking`)
6. **Voucher** — success screen + **Download Voucher** (`/appointment/{id}/voucher`)

Guest-only. English-only. No login required.

## How it's built (design decisions)

| Concern | Approach |
|---|---|
| **Navigation** | A **step state machine** (no React Router) — the whole flow lives on one WP page, so there are no URL changes or routing conflicts. See `app/src/context/CheckoutContext.jsx`. |
| **CSS isolation** | **Tailwind v3** with `prefix: "tw-"`, `preflight: false`, and `important: "#eternel-booking-root"`. Utilities can't collide with the theme, the theme's reset can't fight ours, and a scoped reset lives in `app/src/index.css`. |
| **Config** | API base URL + Stripe publishable key are set in **Settings → Eternel Booking** and injected via `wp_localize_script` (`window.ETERNEL_BOOKING_CONFIG`). Nothing is hardcoded. |
| **Bundle** | Vite builds a single `build/eternel-booking.js` + `build/eternel-booking.css` with stable names, enqueued only on pages that contain the shortcode. |

## Folder layout

```
eternel-booking/
├─ eternel-booking.php        # Plugin entry (defines constants, boots classes)
├─ includes/
│  ├─ class-settings.php      # Settings → Eternel Booking (API URL + Stripe key)
│  └─ class-shortcode.php     # [eternel_booking] + asset enqueue + config inject
├─ build/                     # ← shipped to WordPress (generated, see below)
│  ├─ eternel-booking.js
│  └─ eternel-booking.css
└─ app/                       # React source (dev only — NOT needed on the server)
   ├─ src/...
   ├─ package.json
   └─ vite.config.js
```

## Building the widget

Requires Node 18+.

```bash
cd app
npm install
npm run build      # outputs ../build/eternel-booking.js + .css
```

For local UI preview (uses the dev config in `app/index.html`):

```bash
cd app
npm run dev
```

> `build/index.html` is produced by Vite but is **not used** by WordPress — the
> plugin only enqueues the `.js` and `.css` by name.

## Installing in WordPress

1. Run the build (above) so `build/` contains the compiled assets.
2. Copy the plugin folder (you only need `eternel-booking.php`, `includes/`, and
   `build/`) into `wp-content/plugins/eternel-booking/`. The `app/` source and
   `node_modules` do **not** need to be on the server.
3. Activate **Eternel Booking** in Plugins.
4. Go to **Settings → Eternel Booking** and set:
   - **API Base URL** — e.g. `https://api.eternel-experiences.com` (no trailing slash)
   - **Stripe Publishable Key** — `pk_live_...` or `pk_test_...`
5. Add `[eternel_booking]` to any page/post and view it.

## ⚠️ Backend requirement: CORS

The widget calls the Eternel API directly from the visitor's browser. The API
**must allow the WordPress site's origin** (CORS) for these requests to succeed.
Add the WordPress domain to the API's allowed origins.

## Notes & assumptions

- Prices are handled in **cents** throughout (matching the main app) and
  formatted with the same `convertToDollars` logic.
- Taxes: **TPS 5%** + **TVQ 9.975%**, mirroring the platform's `taxCalculator`.
- The booking is created in a single `POST /booking` call; the backend performs
  the Stripe charge natively (same as the main app's guest checkout).
- Service/package names that arrive as `{ en, fr }` objects are resolved to
  English automatically (`app/src/utils/format.js`).
- This plugin is a **separate project** from the main React app and makes **no
  changes** to it — it only reuses the same API contracts.
