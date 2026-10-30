import { useEffect, useRef, useState } from 'react'
import { useLang } from '../lang.jsx'
import { prefersReduced } from '../hooks.js'

const STEPS = [
  {
    title: { fr: 'Balayage', en: 'Sweep' },
    text: {
      fr: "Chaque heure, le service interroge l'API Twitch pour lister les chaînes. Pas de scraping.",
      en: 'Every hour the service queries the Twitch API for channels. No scraping.',
    },
  },
  {
    title: { fr: 'Qualification', en: 'Qualify' },
    text: {
      fr: 'Il déduit la localisation à partir du profil et des horaires de stream, puis écarte les rediffusions en continu et les chaînes de farm de badges.',
      en: 'It infers location from profile text and streaming hours, then filters out 24/7 reruns and badge farms.',
    },
  },
  {
    title: { fr: 'Notation', en: 'Score' },
    text: {
      fr: 'Les chaînes restantes sont notées puis classées : les mieux placées montent en tête.',
      en: 'The channels that remain are scored and ranked, and the best fits rise to the top.',
    },
  },
  {
    title: { fr: 'Publication', en: 'Publish' },
    text: {
      fr: 'Un classeur Excel, un tableau interactif et un journal des changements sont publiés. Le tout tourne sur GitHub Actions et Docker.',
      en: 'An Excel workbook, an interactive board and a change log are published. It all runs on GitHub Actions and Docker.',
    },
  },
]

// an illustrative batch, not live data
const CHANNELS = [
  { kind: 'ok', score: 0.9 },
  { kind: 'ok', score: 0.4 },
  { kind: 'rerun', score: 0 },
  { kind: 'ok', score: 0.7 },
  { kind: 'farm', score: 0 },
  { kind: 'ok', score: 0.55 },
  { kind: 'ok', score: 0.8 },
  { kind: 'rerun', score: 0 },
  { kind: 'ok', score: 0.3 },
  { kind: 'ok', score: 0.6 },
]
const TOP = [0, 6, 3] // indices of the three best-scored channels

const KIND_LABEL = {
  rerun: { fr: 'rediffusion', en: 'rerun' },
  farm: { fr: 'farm de badges', en: 'badge farm' },
}

const OUTPUTS = [
  { fr: 'Classeur Excel', en: 'Excel workbook' },
  { fr: 'Tableau interactif', en: 'Interactive board' },
  { fr: 'Journal des changements', en: 'Change log' },
]

export default function FractonFlow() {
  const { t } = useLang()
  const [step, setStep] = useState(0)
  const [running, setRunning] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const run = () => {
    clearTimeout(timer.current)
    if (prefersReduced()) {
      setStep(3)
      return
    }
    setRunning(true)
    setStep(0)
    let i = 0
    const tick = () => {
      i += 1
      setStep(i)
      if (i < STEPS.length - 1) timer.current = setTimeout(tick, 1300)
      else setRunning(false)
    }
    timer.current = setTimeout(tick, 1300)
  }

  const pick = (i) => {
    clearTimeout(timer.current)
    setRunning(false)
    setStep(i)
  }

  return (
    <div className="flow" data-step={step}>
      <div className="flow__head">
        <p className="flow__title">{t({ fr: 'Une heure dans le scanner', en: 'One hour inside the scanner' })}</p>
        <button type="button" className="flow__run" onClick={run} disabled={running}>
          {running ? t({ fr: 'En cours…', en: 'Running…' }) : t({ fr: 'Lancer', en: 'Run it' })}
        </button>
      </div>

      <ol className="flow__steps">
        {STEPS.map((s, i) => (
          <li key={i}>
            <button type="button" className={`flow__step ${i === step ? 'is-active' : ''} ${i < step ? 'is-past' : ''}`} onClick={() => pick(i)} aria-pressed={i === step}>
              {t(s.title)}
            </button>
          </li>
        ))}
      </ol>

      <div className="flow__field" aria-hidden="true">
        <div className="flow__dots">
          {CHANNELS.map((c, i) => {
            const bad = c.kind !== 'ok'
            const cls = [
              'dot',
              step >= 1 && bad ? 'is-out' : '',
              step >= 2 && !bad ? 'is-scored' : '',
              step >= 3 && TOP.includes(i) ? 'is-top' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <span key={i} className={cls} style={{ '--s': 0.7 + c.score * 0.9, '--n': i }}>
                <span className="dot__core" />
                {step >= 1 && bad && <span className="dot__tag">{t(KIND_LABEL[c.kind])}</span>}
              </span>
            )
          })}
        </div>
        <div className={`flow__out ${step >= 3 ? 'is-on' : ''}`}>
          {OUTPUTS.map((o, i) => (
            <span key={i} className="chip" style={{ '--n': i }}>
              {t(o)}
            </span>
          ))}
        </div>
      </div>

      <p className="flow__text" aria-live="polite">
        {t(STEPS[step].text)}
      </p>
      <p className="flow__note">{t({ fr: 'Illustration : un lot fictif de chaînes, pas de données en direct.', en: 'Illustration: a made-up batch of channels, not live data.' })}</p>
    </div>
  )
}
