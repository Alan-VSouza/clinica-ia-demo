import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import App from './App'
import Painel from './Painel'
import { aplicarIdiomaNoDocumento } from './idioma'

aplicarIdiomaNoDocumento(
  ['Clínica Sorriso Claro: clínica odontológica no Centro de São Carlos', 'Sorriso Claro: AI receptionist demo for a dental clinic in Brazil'],
  [
    'Demonstração de uma assistente de IA que tira dúvidas, consulta convênios e marca consultas para uma clínica odontológica fictícia em São Carlos.',
    'Demo of an AI assistant that answers questions, checks dental plans and books appointments for a fictional dental clinic in São Carlos, Brazil.',
  ],
)

const ehPainel = window.location.pathname.replace(/\/$/, '') === '/painel'

if (ehPainel) {
  document.documentElement.classList.add('m-enter-done')
  createRoot(document.getElementById('root')!).render(<StrictMode><Painel /></StrictMode>)
} else {
  // O kit de design espera header, main, footer e a barra do celular direto no <body>.
  document.getElementById('root')?.remove()
  createRoot(document.body).render(<StrictMode><App /></StrictMode>)
}
