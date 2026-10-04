import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fonts are bundled into the extension (no network, no CDN).
import '@fontsource-variable/fraunces'
import '@fontsource-variable/hanken-grotesk'
import './index.css'
import App from './App.tsx'
import { applyTheme, readInitialTheme } from './lib/theme'

// Set the theme before the first paint so there is no light/dark flash.
applyTheme(readInitialTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
