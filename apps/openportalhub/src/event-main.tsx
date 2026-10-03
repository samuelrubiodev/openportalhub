import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import '@openportalhub/design/hero.css'
import './styles/hero.css'
import './styles/oph.css'
import EventApp from './EventApp'
import { readPageContext } from './lib/pages'

const root = document.getElementById('root')
const { lang } = readPageContext(root)

hydrateRoot(root!, (
  <StrictMode>
    <EventApp lang={lang} />
  </StrictMode>
))
