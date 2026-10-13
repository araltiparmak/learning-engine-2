import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { brand } from './config/lang'
import { fromLang } from './i18n'
import { applyTheme, savedTheme } from './lib/theme'

document.title = brand
document.documentElement.lang = fromLang
applyTheme(savedTheme())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
