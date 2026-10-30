import { createContext, useContext, useEffect, useState } from 'react'

const Ctx = createContext({ lang: 'fr', setLang: () => {}, t: (o) => o.fr })

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('lang') === 'en' ? 'en' : 'fr'
    } catch {
      return 'fr'
    }
  })

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem('lang', lang)
    } catch {
      /* storage can be blocked, the toggle still works for the session */
    }
  }, [lang])

  const t = (o) => (o && typeof o === 'object' ? o[lang] ?? o.fr : o)
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
