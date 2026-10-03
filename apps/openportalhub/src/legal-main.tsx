import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import '@openportalhub/design/hero.css'
import './styles/hero.css'
import './styles/oph.css'
import LegalApp from './LegalApp'
import { readPageContext } from './lib/pages'

const root = document.getElementById('root')
const { lang, page } = readPageContext(root)

hydrateRoot(root!, (
  <StrictMode>
    <LegalApp lang={lang} page={page === 'terms' ? 'terms' : 'privacy'} />
  </StrictMode>
))
