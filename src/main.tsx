import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react'
import './index.css'
import App from './App.tsx'
import { appBridgeConfig, isEmbedded } from './configs/appbridge.config'

// NOTE: Polaris styles are loaded via <link href="/polaris.css"> in index.html
// (vendored into public/). The @tailwindcss/vite plugin transforms every CSS file it
// sees in the bundle and chokes on Polaris's prebuilt CSS, so we keep it out of the
// build pipeline by serving it as a static asset.

const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// When loaded inside Shopify Admin (host param present), wrap in App Bridge so
// embedded auth (session tokens) and navigation work. Outside the iframe (e.g. the
// public marketing site / admin dashboard), render normally without App Bridge.
createRoot(document.getElementById('root')!).render(
  isEmbedded ? (
    <AppBridgeProvider config={appBridgeConfig}>{app}</AppBridgeProvider>
  ) : (
    app
  ),
)
