Bitquery TradingView SDK — plain HTML demo

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
BITQUERY_API_KEY=YOUR_KEY
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
  apiKey: process.env.BITQUERY_API_KEY // required token, generate here https://account.bitquery.io/user/api_v2/access_tokens
});

server.init();
```

In this project, the server is started in `server.mjs` alongside a static file server (Express) and is available at `ws://localhost:8081` by default. Ensure your client `serverUrl` matches it (use `wss://` when serving over HTTPS).

Data modes (parameters contract)

- Currency mode
  - base: currencyID (e.g. `bid:bitcoin`)
  - quote: `'usd'` (fixed in this mode)
  - market: empty string `''` (currencies do not have a market)

- Token mode
  - base: tokenID (e.g. `bid:solana:So1111...`)
  - quote: `'usd'` (fixed in this mode)
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
- WebSocket errors: verify the WS server is running (port 8081 by default) and `BITQUERY_API_KEY` is valid
- Pair mode shows wrong entity: ensure `market` is a real DEX pool/market ID, not a program address

Notes
- `.gitignore` already excludes `public/static/charting_library/` and `public/static/datafeeds/` from version control
