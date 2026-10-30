import { useEffect, useState } from 'react'
import { useLang } from './lang.jsx'
import Hero from './components/Hero.jsx'
import Chat from './components/Chat.jsx'
import Work from './components/Work.jsx'
import Skills from './components/Skills.jsx'
import { Others, Background, Contact } from './components/Sections.jsx'

function Bar() {
  const { lang, setLang, t } = useLang()
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    const on = () => setSolid(window.scrollY > window.innerHeight * 0.75)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header className={`bar ${solid ? 'is-solid' : ''}`}>
      <a className="mark" href="#top">
        Makuo Okoene
      </a>
      <nav aria-label="Main">
        <a className="hide-sm" href="#projets">
          {t({ fr: 'Projets', en: 'Work' })}
        </a>
        <a className="hide-sm" href="#parcours">
          {t({ fr: 'Parcours', en: 'Background' })}
        </a>
        <a className="hide-md" href="#competences">
          {t({ fr: 'Compétences', en: 'Skills' })}
        </a>
        <a href="#contact">Contact</a>
      </nav>
      <button
        type="button"
        className="lang"
        onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
        aria-label="Changer de langue / Switch language"
      >
        <b>{lang === 'fr' ? 'FR' : 'EN'}</b> / {lang === 'fr' ? 'EN' : 'FR'}
      </button>
    </header>
  )
}

export default function App() {
  return (
    <>
      <Bar />
      <main id="top">
        <Hero />
        <Chat />
        <Work />
        <Others />
        <Background />
        <Skills />
      </main>
      <Contact />
    </>
  )
}
