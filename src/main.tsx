import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react'
import '@shopify/polaris/build/esm/styles.css'
import './index.css'
import App from './App.tsx'
import { appBridgeConfig, isEmbedded } from './configs/appbridge.config'

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
