import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import './styles/fonts.css'
import '@openportalhub/design/hero.css'
import './styles/hero.css'
import App from './App'
import { defaultLang, type Lang } from './lib/pages'

// The prerender writes `data-lang` (and `data-page`) on #root; the URL already
// declares the language, so there is nothing to derive at runtime.
const root = document.getElementById('root')
const declared = root?.dataset.lang
const lang: Lang = declared === 'es' || declared === 'en' ? declared : defaultLang

hydrateRoot(root!, (
  <StrictMode>
    <App lang={lang} />
  </StrictMode>
))
