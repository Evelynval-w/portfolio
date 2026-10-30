import { useEffect, useRef, useState } from 'react'
import { useLang } from '../lang.jsx'
import { prefersReduced, useMedia } from '../hooks.js'
import Rise from './Rise.jsx'
import FractonFlow from './FractonFlow.jsx'

const PROJECTS = [
  {
    id: 'credit',
    name: 'Credit_risk',
    stack: 'Python · pandas · scikit-learn · XGBoost',
    media: 'credit-risk',
    label: {
      fr: 'Animation : 250 000 prêts, 7 modèles comparés, gain de 1,76 M$',
      en: 'Animation: 250K loans, 7 models compared, $1.76M gain',
    },
    fig: { fr: '+1,76 M$', en: '+$1.76M' },
    cap: {
      fr: "Seuil optimisé sur le profit, face à l'approbation systématique. 250 000 prêts, 7 modèles.",
      en: 'Profit-based threshold versus approving every loan. 250K loans, 7 models.',
    },
    what: {
      fr: "Pipeline de bout en bout sur 250 000 prêts Lending Club, avec séparation temporelle et correction des fuites de données. Sept modèles comparés ; XGBoost en tête (ROC-AUC 0,709, PR-AUC 0,452). Seuil optimisé sur le profit : +1,76 M$ face à l'approbation systématique.",
      en: 'End-to-end pipeline on 250K Lending Club loans, with a temporal split and data-leakage fixes. Seven models compared; XGBoost leads (ROC-AUC 0.709, PR-AUC 0.452). Profit-based threshold: +$1.76M versus approving every loan.',
    },
    href: 'https://github.com/Evelynval-w/credit_risk_ML_model',
  },
  {
    id: 'fracton',
    name: 'Fracton Scanner',
    stack: 'Python · Twitch API · SQLite · Docker · GitHub Actions',
    media: 'fracton-scanner',
    label: {
      fr: "Animation : balayage horaire de l'API Twitch, qualification, notation et publication des rapports",
      en: 'Animation: hourly Twitch API sweep, qualification, scoring and report publishing',
    },
    fig: { fr: 'Chaque heure', en: 'Every hour' },
    cap: {
      fr: "Balayage de l'API Twitch, qualification, notation, publication des rapports.",
      en: 'Twitch API sweep, qualification, scoring, report publishing.',
    },
    what: {
      fr: "Service Python auto-hébergé qui repère et note de petits streamers Twitch anglophones sur un marché cible. Chaque heure, il interroge l'API Twitch, déduit la localisation à partir du profil et des horaires de stream, écarte les rediffusions en continu et les chaînes de farm de badges, classe les chaînes, puis publie un classeur Excel, un tableau interactif et un journal des changements. Il tourne sur GitHub Actions et Docker, sans scraping.",
      en: 'A self-hosted Python service that finds and scores small English-language Twitch streamers in a target market. Every hour it queries the Twitch API, infers location from profile text and streaming hours, filters out 24/7 reruns and badge farms, ranks the channels, then publishes an Excel workbook, an interactive board and a change log. It runs on GitHub Actions and Docker, with no scraping.',
    },
    href: 'https://github.com/Evelynval-w/fracton-scanner',
    demo: true,
  },
  {
    id: 'stores',
    name: 'SynergyHack',
    stack: 'MongoDB · Neo4j · Redis',
    media: 'synergyhack',
    label: {
      fr: 'Animation : trois bases de données et mise en correspondance par graphe',
      en: 'Animation: three databases and graph-based team matching',
    },
    fig: { fr: 'Trois bases', en: 'Three stores' },
    cap: {
      fr: "MongoDB, Neo4j, Redis : chacune choisie pour ce qu'elle sait faire.",
      en: 'MongoDB, Neo4j, Redis: each chosen for what it does best.',
    },
    what: {
      fr: "Un même jeu de données réparti sur trois bases, chacune choisie pour ce qu'elle sait faire : MongoDB pour les documents, Neo4j pour le graphe, Redis pour les accès chauds.",
      en: "One dataset across three stores, each chosen for what it's actually good at: MongoDB for documents, Neo4j for the relationship graph, Redis for the hot path.",
    },
    href: 'https://github.com/Evelynval-w/synergyhack',
  },
]

function Film({ p, className = '' }) {
  const { lang, t } = useLang()
  const ref = useRef(null)
  const poster = `/media/${p.media}-poster-${lang}.jpg`
  const src = `/media/${p.media}-${lang}.mp4`
  return (
    <video
      ref={ref}
      className={className}
      data-film={p.id}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      data-src={src}
      aria-label={t(p.label)}
    />
  )
}

/** Plays/pauses a video, loading its source the first time. */
function drive(v, on, lang) {
  if (!v) return
  if (!on) {
    v.pause()
    return
  }
  const src = v.getAttribute('data-src')
  if (src && v.getAttribute('src') !== src) {
    v.setAttribute('src', src)
    v.load()
  }
  const pr = v.play()
  if (pr && pr.catch) pr.catch(() => {})
}

export default function Work() {
  const { lang, t } = useLang()
  const wide = useMedia('(min-width: 1080px)')
  const reduced = prefersReduced()
  const [active, setActive] = useState('portrait')
  const root = useRef(null)

  // choose the stage layer from scroll position: last article whose top passed the middle
  useEffect(() => {
    if (!wide) return
    let ticking = false
    const pick = () => {
      ticking = false
      const mid = window.innerHeight * 0.5
      let id = 'portrait'
      root.current?.querySelectorAll('[data-stage]').forEach((el) => {
        if (el.getBoundingClientRect().top <= mid) id = el.getAttribute('data-stage')
      })
      setActive(id)
    }
    const queue = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(pick)
      }
    }
    pick()
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
    }
  }, [wide])

  // stage videos: only the active one plays
  useEffect(() => {
    if (!wide || reduced) return
    root.current?.querySelectorAll('.stage video').forEach((v) => drive(v, v.getAttribute('data-film') === active, lang))
  }, [active, wide, reduced, lang])

  // inline videos on narrow screens: play while in view
  useEffect(() => {
    if (wide || reduced || !('IntersectionObserver' in window)) return
    const vids = [...(root.current?.querySelectorAll('.inline-film video') || [])]
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => drive(e.target, e.isIntersecting, lang)),
      { threshold: 0.4 }
    )
    vids.forEach((v) => io.observe(v))
    return () => {
      io.disconnect()
      vids.forEach((v) => v.pause())
    }
  }, [wide, reduced, lang])

  return (
    <div className="work" id="projets" ref={root}>
      <div className="work__col">
        <header className="work__head" data-stage="portrait">
          <Rise as="h2">{t({ fr: 'Projets', en: 'Selected work' })}</Rise>
          <Rise as="p" i={1} className="sub">
            {t({
              fr: 'Du machine learning aux architectures distribuées, en passant par les applications LLM.',
              en: 'From machine learning to distributed architectures and LLM applications.',
            })}
          </Rise>
        </header>

        {PROJECTS.map((p) => (
          <article className="proj" key={p.id} data-stage={p.id}>
            <figure className="inline-film">
              <Film p={p} />
            </figure>
            <Rise as="h3">{p.name}</Rise>
            <Rise as="p" i={1} className="stack">
              {p.stack}
            </Rise>
            <Rise as="p" i={2} className="what">
              {t(p.what)}
            </Rise>
            {p.demo && (
              <Rise i={3}>
                <FractonFlow />
              </Rise>
            )}
            <Rise i={3} className="links">
              <a className="link" href={p.href}>
                {t({ fr: 'Code', en: 'Source' })}
              </a>
            </Rise>
          </article>
        ))}
      </div>

      <aside className="stage" aria-label={t({ fr: 'Aperçu du projet', en: 'Project preview' })}>
        <div className={`layer portrait ${active === 'portrait' ? 'on' : ''}`}>
          <img src="/portrait.jpg" alt="" />
          <p>Paris, France</p>
        </div>
        {PROJECTS.map((p) => (
          <div key={p.id} className={`layer film ${active === p.id ? 'on' : ''}`}>
            <Film p={p} />
            <p className="fig">{t(p.fig)}</p>
            <p className="cap">{t(p.cap)}</p>
          </div>
        ))}
      </aside>
    </div>
  )
}
