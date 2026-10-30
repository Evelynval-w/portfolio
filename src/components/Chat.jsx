import { useEffect, useState } from 'react'
import { useLang } from '../lang.jsx'
import { prefersReduced, useInView } from '../hooks.js'
import Rise, { Spark } from './Rise.jsx'

const THREAD = [
  {
    from: 'you',
    text: { fr: 'Tu fais quoi, exactement ?', en: 'What do you actually do?' },
  },
  {
    from: 'me',
    text: {
      fr: "Du machine learning appliqué : je prépare les données, j'entraîne et je compare des modèles, et je construis le backend autour pour que le tout tienne en production.",
      en: 'Applied machine learning: I prepare the data, train and compare models, and build the backend around them so the whole thing holds up in production.',
    },
  },
  {
    from: 'you',
    text: { fr: "Un exemple concret ?", en: 'A concrete example?' },
  },
  {
    from: 'me',
    text: {
      fr: "Un pipeline de bout en bout sur 250 000 prêts Lending Club : sept modèles comparés, et un seuil optimisé sur le profit qui rapporte +1,76 M$ face à l'approbation systématique.",
      en: 'An end-to-end pipeline on 250K Lending Club loans: seven models compared, and a profit-based threshold worth +$1.76M versus approving every loan.',
    },
  },
  {
    from: 'you',
    text: { fr: 'Et côté systèmes ?', en: 'And on the systems side?' },
  },
  {
    from: 'me',
    text: {
      fr: "Un scanner Twitch qui tourne chaque heure sur GitHub Actions et Docker, une plateforme de jeux en microservices avec RabbitMQ, et trois bases de données qui travaillent ensemble.",
      en: 'A Twitch scanner that runs every hour on GitHub Actions and Docker, a microservices games platform on RabbitMQ, and three databases working together.',
    },
  },
  {
    from: 'you',
    text: { fr: 'Tu cherches quoi ?', en: 'What are you looking for?' },
  },
  {
    from: 'me',
    text: {
      fr: "Un stage de fin d'études de 6 mois, dès février 2027, à Paris ou à distance. Je parle anglais et igbo en natif, et français niveau B1.",
      en: 'A six-month end-of-studies internship from February 2027, in Paris or remote. I speak English and Igbo natively, and French at B1.',
    },
  },
]

export default function Chat() {
  const { t, lang } = useLang()
  const reduced = prefersReduced()
  const [wrap, inView] = useInView('0px 0px -25% 0px')
  const [status, setStatus] = useState(() => THREAD.map(() => (reduced ? 'on' : 'off')))
  const [go, setGo] = useState(reduced)
  const [run, setRun] = useState(0)

  useEffect(() => {
    if (inView) setGo(true)
  }, [inView])

  useEffect(() => {
    if (reduced || !go) return
    let cancelled = false
    const pause = (ms) => new Promise((r) => setTimeout(r, ms))
    ;(async () => {
      setStatus(THREAD.map(() => 'off'))
      await pause(350)
      for (let i = 0; i < THREAD.length; i++) {
        if (cancelled) return
        const m = THREAD[i]
        if (m.from === 'me') {
          setStatus((s) => s.map((v, k) => (k === i ? 'typing' : v)))
          await pause(900 + Math.min(m.text.en.length * 6, 900))
        } else {
          await pause(450)
        }
        if (cancelled) return
        setStatus((s) => s.map((v, k) => (k === i ? 'on' : v)))
        await pause(420)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [go, run, reduced])

  const done = status.every((s) => s === 'on')

  return (
    <section className="about" id="apropos" aria-labelledby="about-title" ref={wrap}>
      <div className="about__head">
        <Rise as="h2" id="about-title">
          {t({ fr: 'Parlons un peu.', en: 'A quick chat.' })}
        </Rise>
        <Rise as="p" i={1} className="about__sub">
          {t({
            fr: 'Les questions que l’on me pose le plus souvent, et mes réponses.',
            en: 'The questions I get asked most, and my answers.',
          })}
        </Rise>
        <Spark className="about__spark" size={44} />
      </div>

      <ol className="thread" aria-label={t({ fr: 'Conversation', en: 'Conversation' })}>
        {THREAD.map((m, i) => (
          <li key={i} className={`msg msg--${m.from} is-${status[i]}`}>
            {m.from === 'me' && <img className="msg__ava" src="/portrait.jpg" alt="" width="44" height="44" />}
            <div className="msg__stack">
              <p className="bubble">{t(m.text)}</p>
              {m.from === 'me' && (
                <span className="bubble bubble--typing" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>

      {!reduced && done && (
        <button type="button" className="replay" onClick={() => setRun((r) => r + 1)} key={lang}>
          {t({ fr: 'Rejouer la conversation', en: 'Replay the chat' })}
        </button>
      )}
    </section>
  )
}
