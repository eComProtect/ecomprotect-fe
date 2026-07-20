import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// NOTE: Polaris styles are loaded via <link href="/polaris.css"> in index.html
// (vendored into public/). The @tailwindcss/vite plugin transforms every CSS file it
// sees in the bundle and chokes on Polaris's prebuilt CSS, so we keep it out of the
// build pipeline by serving it as a static asset.

// App Bridge v4 has no createApp()/<Provider> pair to wrap the tree in — it
// self-initializes from the <meta name="shopify-api-key"> tag and CDN
// <script> in index.html (see appbridge.config.ts), exposing a global
// `window.shopify` object. Nothing here needs to branch on embedded vs
// standalone anymore; the same render path works for both.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
