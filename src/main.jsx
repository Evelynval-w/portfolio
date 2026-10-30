import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { LangProvider } from './lang.jsx'
import './styles.css'

document.documentElement.classList.add('js')

createRoot(document.getElementById('root')).render(
  <LangProvider>
    <App />
  </LangProvider>
)
