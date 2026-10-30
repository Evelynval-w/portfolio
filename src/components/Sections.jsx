import { useLang } from '../lang.jsx'
import Rise, { Spark } from './Rise.jsx'

/* ------------------------------------------------------------ other projects */

const OTHERS = [
  {
    name: 'EVFLIX',
    tone: 'blush',
    text: {
      fr: "Interface de streaming avec un assistant IA qui répond aux questions sur le catalogue, en contexte. Déployée et en ligne.",
      en: 'Streaming interface with an AI assistant that answers questions about the catalogue in context. Deployed and live.',
    },
    stack: 'React · Hugging Face · Vercel',
    links: [
      { href: 'https://evfix-seven.vercel.app', label: { fr: 'Voir le site', en: 'Live site' } },
      { href: 'https://github.com/Evelynval-w/ai-engineering', label: { fr: 'Code', en: 'Source' } },
    ],
  },
  {
    name: 'SnapQuest',
    tone: 'lime',
    text: {
      fr: "Application Android de défis photo, projet d'équipe à 5. J'ai pris en charge la couche réseau : BroadcastReceiver de connectivité, état en ligne / hors ligne, dégradation propre en cas de perte de signal.",
      en: 'Android photo-challenge app built by a five-person team. I owned the network layer: connectivity BroadcastReceiver, online/offline state, clean degradation when the signal drops.',
    },
    stack: 'Java · Android SDK · BroadcastReceiver',
  },
  {
    name: 'GameHub',
    tone: 'sage',
    text: {
      fr: 'Plateforme de jeux découpée en microservices communiquant par broker de messages, entièrement conteneurisée. Complétée par un pattern de compensation sur un flux de réservation.',
      en: 'Games platform split into microservices talking over a message broker, fully containerised. Paired with a compensation pattern for a booking flow.',
    },
    stack: 'Python · FastAPI · RabbitMQ · Docker',
  },
  {
    name: { fr: 'Labs IAM', en: 'IAM labs' },
    tone: 'clay',
    text: {
      fr: "Provisionnement et gouvernance des identités : Keycloak et MidPoint, annuaire OpenLDAP, fédération vers Entra ID. Moins spectaculaire que l'IA, mais c'est le quotidien des équipes sécurité.",
      en: 'Identity provisioning and governance: Keycloak and MidPoint, OpenLDAP directory, federation into Entra ID. Less glamorous than the AI work, and closer to what security teams actually do.',
    },
    stack: 'Keycloak · MidPoint · OpenLDAP · Entra ID',
  },
]

export function Others() {
  const { t } = useLang()
  return (
    <section className="others" aria-labelledby="others-title">
      <Rise as="h2" id="others-title">
        {t({ fr: 'Autres projets', en: 'More projects' })}
      </Rise>
      <div className="others__grid">
        {OTHERS.map((o, i) => (
          <Rise as="article" i={i} key={i} className={`card card--${o.tone}`}>
            <h3>{t(o.name)}</h3>
            <p>{t(o.text)}</p>
            <p className="stack">{o.stack}</p>
            {o.links && (
              <div className="links">
                {o.links.map((l) => (
                  <a key={l.href} className="link" href={l.href}>
                    {t(l.label)}
                  </a>
                ))}
              </div>
            )}
          </Rise>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ background */

const EXPERIENCE = [
  {
    when: { fr: 'Août 2026', en: 'Aug 2026' },
    title: 'Split Papy',
    org: { fr: 'Stagiaire, plateforme Fracton, télétravail', en: 'Intern, Fracton platform, remote' },
    text: {
      fr: "Stage EPITA d'un mois sur une plateforme de rémunération des créateurs, 35h/semaine sous la supervision du DG. Acquisition de créateurs : identification des profils, arguments de conversion, reporting direct à la direction.",
      en: 'One-month EPITA internship on a creator-reward platform, 35h/week reporting to the managing director. Creator acquisition: finding the right profiles, working out what converts, reporting straight to leadership.',
    },
  },
  {
    when: { fr: '2025 à octobre 2026', en: '2025 to Oct 2026' },
    title: { fr: 'Annotation & évaluation IA', en: 'AI annotation & evaluation' },
    org: { fr: 'Freelance, Outlier, Alignerr, micro1', en: 'Freelance, Outlier, Alignerr, micro1' },
    text: {
      fr: "Évaluation de réponses de modèles, rédaction de réponses de référence, détection d'erreurs factuelles dans des sorties fluides mais fausses. Des centaines d'heures à lire du texte généré de très près.",
      en: "Rating model responses, writing reference answers, catching factual errors in output that reads fluently but isn't right. Hundreds of hours spent reading generated text very closely.",
    },
  },
  {
    when: { fr: '2025 à juillet 2026', en: '2025 to Jul 2026' },
    title: { fr: 'Inventoriste', en: 'Inventory auditor' },
    org: { fr: 'RGIS France, temps partiel', en: 'RGIS France, part-time' },
    text: {
      fr: 'Inventaires en magasin pour des clients du retail : précision sous contrainte de temps, en équipe, en environnement francophone.',
      en: 'In-store stock counts for retail clients: precision under time pressure, in a team, working in French.',
    },
  },
]

const EDUCATION = [
  {
    when: '2024–2027',
    title: 'EPITA Paris',
    org: { fr: 'Informatique, spécialisation apprentissage automatique', en: 'Computer science, machine learning specialisation' },
    text: {
      fr: "Intégration de systèmes d'IA, systèmes distribués, DevOps, réseaux d'entreprise et développement web.",
      en: 'AI systems integration, distributed systems, DevOps, enterprise networking and web development.',
    },
  },
  {
    when: { fr: '2026, en cours', en: '2026, in progress' },
    title: 'Machine Learning Specialization',
    org: 'DeepLearning.AI',
  },
  { when: '2026', title: 'Google AI Professional Certificate', org: 'Coursera' },
]

function Row({ r, i }) {
  const { t } = useLang()
  return (
    <Rise as="div" i={i} className="row">
      <p className="when">{t(r.when)}</p>
      <div className="row__body">
        <h4>{t(r.title)}</h4>
        <p className="org">{t(r.org)}</p>
        {r.text && <p className="t">{t(r.text)}</p>}
      </div>
    </Rise>
  )
}

export function Background() {
  const { t } = useLang()
  return (
    <section className="background" id="parcours" aria-labelledby="bg-title">
      <Spark className="background__spark" size={38} />
      <Rise as="h2" id="bg-title">
        {t({ fr: 'Parcours', en: 'Background' })}
      </Rise>
      <div className="background__cols">
        <div>
          <Rise as="h3" className="group-title">
            {t({ fr: 'Expérience', en: 'Experience' })}
          </Rise>
          {EXPERIENCE.map((r, i) => (
            <Row r={r} i={i} key={i} />
          ))}
        </div>
        <div>
          <Rise as="h3" className="group-title">
            {t({ fr: 'Formation', en: 'Education' })}
          </Rise>
          {EDUCATION.map((r, i) => (
            <Row r={r} i={i} key={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ contact */

export function Contact() {
  const { t } = useLang()
  const email = 'okoeneeve@gmail.com'
  return (
    <section className="contact" id="contact" aria-labelledby="contact-title">
      <div className="contact__top">
        <h2 id="contact-title">{t({ fr: 'Parlons-en.', en: "Let's talk." })}</h2>
        <p className="ask">
          {t({
            fr: 'Stage de 6 mois, dès février 2027, à Paris ou à distance.',
            en: 'Six-month internship from February 2027, in Paris or remote.',
          })}
        </p>
      </div>

      <a className="mail" href={`mailto:${email}`} aria-label={email}>
        <span className="mail__line" aria-hidden="true">
          {email.split('').map((c, i) => (
            <span key={i} className="mail__c" style={{ '--i': i }}>
              {c}
            </span>
          ))}
        </span>
      </a>

      <div className="corners">
        <p>Paris, France</p>
        <nav aria-label="Social">
          <a href="https://github.com/Evelynval-w">GitHub</a>
          <a href="https://www.linkedin.com/in/okoene-makuo-56932b259/">LinkedIn</a>
        </nav>
      </div>
      <p className="fine">{t({ fr: 'Conçu et déployé par moi. Octobre 2026.', en: 'Designed and deployed by me. October 2026.' })}</p>
    </section>
  )
}
