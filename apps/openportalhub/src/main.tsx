import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import '@openportalhub/design/hero.css'
import './styles/hero.css'
import './styles/oph.css'
import App from './App'
import { readPageContext } from './lib/pages'

// The markup is already in the file (prerendered at build time); hydrating it
// keeps the text on screen and attaches the behaviour. The page and its language
// come from the data attributes on #root, never from a guess.
const root = document.getElementById('root')
const { lang } = readPageContext(root)

hydrateRoot(root!, (
  <StrictMode>
    <App lang={lang} />
  </StrictMode>
))
