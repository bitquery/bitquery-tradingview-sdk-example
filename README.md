# Bitquery TradingView SDK — plain HTML demo

Simple demo that hosts TradingView Charting Library and uses `@bitquery/tradingview-sdk` to render charts via a lightweight WebSocket server.

Links
- SDK on npm: https://www.npmjs.com/package/@bitquery/tradingview-sdk
- Get Bitquery Authorization Token key: https://account.bitquery.io/user/api_v2/access_tokens
- TradingView Charting Library: https://www.tradingview.com/charting-library-docs/

Requirements
- Bitquery OAuth Token (required) — without it data will not load
- Access to the TradingView Charting Library
- Node.js 18+

Project structure (key parts)
- `public/static/charting_library/` — TradingView assets (place your copy here)
- `server.mjs` — serves static pages and runs Bitquery WS server
- `public/{index,currency,token,pair}.html` — demo pages

Setup
1) Install deps
```bash
npm ci
```
2) Place your TradingView Charting Library into:
```
public/static/charting_library/
```
3) Create `.env.local`
```bash
BITQUERY_OAUTH_TOKEN=YOUR_OAUTH_TOKEN
WS_PORT=8081
NEXT_PUBLIC_WS_URL=ws://localhost:8081
```

Run
```bash
npm run dev
# Web: http://localhost:3000
# WS:  ws://localhost:8081
```

Demo pages
- `/` — overview and navigation
- `/currency.html` — currency mode (base: currencyID, quote: 'usd', market: '')
- `/token.html` — token mode (base: tokenID, quote: 'usd', market: network or 'all')
- `/pair.html` — pair mode (base: tokenID, quote: quoteTokenID, market: marketID)

Minimal usage
```html
<script type="module">
  import { BitqueryWidget } from '@bitquery/tradingview-sdk/dist/client.js';
  const widget = new BitqueryWidget({
    base: 'bid:bitcoin',
    quote: 'usd',
    market: '',
    container: document.getElementById('chart'),
    serverUrl: 'ws://localhost:8081',
    tradingViewPath: '/static/charting_library/',
    theme: 'dark',
  });
  widget.init();
</script>
```

Server-side (WebSocket)

This demo runs a lightweight WebSocket server provided by the SDK. Minimal example:

```js
import { BitqueryServer } from '@bitquery/tradingview-sdk/server';

const server = new BitqueryServer({
  port: process.env.WS_PORT || 8081,
  apiKey: process.env.BITQUERY_OAUTH_TOKEN, // https://account.bitquery.io/user/api_v2/access_tokens
  bitqueryEndpoint:'https://streaming.bitquery.io/eap';

});

server.init();
```

In this project, the server is started in `server.mjs` alongside a static file server (Express) and is available at `ws://localhost:8081` by default. Ensure your client `serverUrl` matches it (use `wss://` when serving over HTTPS).

Data modes (parameters contract)

- Currency mode
  - base: currencyID (e.g. `bid:bitcoin`)
  - quote: `'usd'`
  - market: empty string `''` (currencies do not have a market)

- Token mode
  - base: tokenID (e.g. `bid:solana:So1111...`)
  - quote: `'usd'` 
  - market: a network/market selector. For now, `'all'`; later this will accept a specific network/market value

- Pair mode
  - base: tokenID (base token)
  - quote: quoteTokenID (quote token)
  - market: marketID (DEX pool/market where the pair trades)

- No parameters
  - If no `base/quote/market` are passed, the widget automatically selects and shows the top currency for the last 24h

Local development of the SDK (optional)
If you maintain the SDK locally, you can link it:
```bash
# in the SDK repo
npm i && npm run build && npm link

# in this demo
npm link @bitquery/tradingview-sdk
```
Keep the SDK dist up-to-date while developing (watch/build).

Troubleshooting
- Blank chart: make sure the Charting Library is available at `/static/charting_library/`
- 404 on SDK client: this server exposes `node_modules` under `/vendor`. Ensure `node_modules` exist and imports point to `/vendor/@bitquery/tradingview-sdk/dist/client.js`
- WebSocket errors: verify the WS server is running (port 8081 by default) and `BITQUERY_OAUTH_TOKEN` is valid
- Pair mode shows wrong entity: ensure `market` is a real DEX pool/market ID, not a program address

### Server-side configuration

Pass `widgetOptions` to the WebSocket server. These options will be sent to clients and applied to the TradingView widget.

```js
import { BitqueryServer } from '@bitquery/tradingview-sdk/server';

const server = new BitqueryServer({
  port: 8080,
  apiKey: process.env.BITQUERY_OAUTH_TOKEN,
  widgetOptions: {
    locale: 'ru',
    time_scale: { min_bar_spacing: 2 },
    overrides: {
      "paneProperties.background": "#fff1e6"
    },
    studies_overrides: {
      "volume.volume.color.0": "#ef5350",
      "volume.volume.color.1": "#26a69a",
      "volume.volume.transparency": 70
    }
  }
});

server.init();
```

### Client-side overrides

Optionally, pass `widgetOptions` to the browser widget. Client options override server options.

```js
import { BitqueryWidget } from '@bitquery/tradingview-sdk';

const widget = new BitqueryWidget({
  container: document.getElementById('chart-container'),
  serverUrl: 'ws://localhost:8080',
  tradingViewPath: '/static/charting_library/',
  theme: 'dark',
  widgetOptions: {
    // Any TradingView widget options are allowed here
    locale: 'ru',
    overrides: { "paneProperties.background": "#e8f5ff" },
    time_scale: { min_bar_spacing: 2 },
    studies_overrides: {
      "volume.volume.color.0": "#ef5350",
      "volume.volume.color.1": "#26a69a",
      "volume.volume.transparency": 60
    }
  }
});

await widget.init();
```

Commonly used keys:

- `locale`: UI language (requires localization files in your Charting Library assets).
- `overrides`: style overrides (e.g., `paneProperties.background`, legend, grid).
- `studies_overrides`: study colors and transparency (e.g., volume colors).
- `time_scale`: chart time scale settings (e.g., `min_bar_spacing`).
- `enabled_features` / `disabled_features`: toggle Charting Library features (arrays replace previous values).

Precedence: defaults < server `widgetOptions` < client `widgetOptions`.

To verify final options in the browser console, set `__debug: true`. The client will print:

`TradingViewWidget: merged widget options → { ... }`.

Notes
- `.gitignore` already excludes `public/static/charting_library/` and `public/static/datafeeds/` from version control
