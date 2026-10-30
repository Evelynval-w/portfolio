import { useEffect, useMemo, useRef, useState } from 'react'
import { useLang } from '../lang.jsx'
import { prefersReduced, useInView, useMedia } from '../hooks.js'
import Rise from './Rise.jsx'

const GROUPS = [
  {
    id: 'ml',
    label: { fr: 'Machine learning & données', en: 'Machine learning & data' },
    items: ['pandas', 'NumPy', 'scikit-learn', 'XGBoost'],
  },
  {
    id: 'ai',
    label: { fr: 'IA', en: 'AI' },
    items: [
      { fr: 'Applications LLM', en: 'LLM applications' },
      'RAG',
      { fr: "Évaluation d'agents", en: 'Agent evaluation' },
      'Hugging Face',
    ],
  },
  {
    id: 'lang',
    label: { fr: 'Langages', en: 'Languages' },
    items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'SQL', 'PHP'],
  },
  {
    id: 'back',
    label: { fr: 'Backend & infrastructure', en: 'Backend & infrastructure' },
    items: ['FastAPI', 'Flask', 'Node.js', 'Docker', 'RabbitMQ', 'Linux', 'CI/CD'],
  },
  {
    id: 'db',
    label: { fr: 'Bases de données', en: 'Databases' },
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Neo4j', 'Redis'],
  },
  {
    id: 'sec',
    label: { fr: 'Sécurité & IAM', en: 'Security & IAM' },
    items: ['Keycloak', 'MidPoint', 'OpenLDAP', 'Entra ID', 'RGPD'],
  },
  {
    id: 'net',
    label: { fr: 'Réseaux', en: 'Networking' },
    items: ['BGP', 'VRF', 'GNS3'],
  },
]

export default function Skills() {
  const { t, lang } = useLang()
  const reduced = prefersReduced()
  const small = useMedia('(max-width: 720px)')
  const [only, setOnly] = useState(null)
  const [view, inView] = useInView()
  const box = useRef(null)
  const visible = useRef(false)
  visible.current = inView

  const bubbles = useMemo(
    () =>
      GROUPS.flatMap((g) =>
        g.items.map((it) => {
          const text = typeof it === 'string' ? it : it[lang]
          const d = Math.min(small ? 112 : 148, Math.max(small ? 54 : 70, text.length * (small ? 7.6 : 8.6) + (small ? 22 : 34)))
          return { key: `${g.id}-${typeof it === 'string' ? it : it.en}`, text, group: g.id, d }
        })
      ),
    [lang, small]
  )

  useEffect(() => {
    const el = box.current
    if (!el || reduced) return
    const nodes = [...el.querySelectorAll('.bub')].map((n, i) => ({
      n,
      r: bubbles[i].d / 2,
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 30,
      vy: (Math.random() - 0.5) * 30,
      pop: 0,
    }))
    let W = el.clientWidth
    let H = el.clientHeight
    nodes.forEach((o, i) => {
      o.x = o.r + Math.random() * Math.max(W - o.r * 2, 1)
      o.y = o.r + Math.random() * Math.max(H - o.r * 2, 1)
    })
    // relax overlaps so the first frame is clean
    for (let k = 0; k < 60; k++) collide(nodes, W, H, 0.5)

    const ptr = { x: -9999, y: -9999 }
    const move = (e) => {
      const b = el.getBoundingClientRect()
      ptr.x = e.clientX - b.left
      ptr.y = e.clientY - b.top
    }
    const leave = () => {
      ptr.x = ptr.y = -9999
    }
    const click = (e) => {
      const i = [...el.querySelectorAll('.bub')].indexOf(e.target.closest('.bub'))
      if (i < 0) return
      const o = nodes[i]
      o.pop = 1
      const a = Math.random() * Math.PI * 2
      o.vx += Math.cos(a) * 260
      o.vy += Math.sin(a) * 260
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    el.addEventListener('click', click)

    const ro = new ResizeObserver(() => {
      W = el.clientWidth
      H = el.clientHeight
    })
    ro.observe(el)

    let raf = 0
    let last = performance.now()
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min((now - last) / 1000, 0.04)
      last = now
      if (!visible.current) return
      for (const o of nodes) {
        o.vx += (Math.random() - 0.5) * 60 * dt
        o.vy += (Math.random() - 0.5) * 60 * dt - 6 * dt // faint buoyancy
        const dx = o.x - ptr.x
        const dy = o.y - ptr.y
        const d = Math.hypot(dx, dy)
        const reach = o.r + 90
        if (d < reach) {
          const f = (1 - d / reach) * 900
          o.vx += (dx / (d + 0.01)) * f * dt
          o.vy += (dy / (d + 0.01)) * f * dt
        }
        const sp = Math.hypot(o.vx, o.vy)
        const max = 340
        if (sp > max) {
          o.vx *= max / sp
          o.vy *= max / sp
        }
        const damp = Math.exp(-0.9 * dt)
        o.vx *= damp
        o.vy *= damp
        o.x += o.vx * dt
        o.y += o.vy * dt
        o.pop *= Math.exp(-5 * dt)
      }
      collide(nodes, W, H, 1)
      for (const o of nodes) {
        o.n.style.transform = `translate3d(${o.x - o.r}px,${o.y - o.r}px,0) scale(${1 + o.pop * 0.22})`
      }
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      el.removeEventListener('click', click)
    }
  }, [bubbles, reduced])

  return (
    <section className="skills" id="competences" aria-labelledby="skills-title" ref={view}>
      <div className="skills__top">
        <Rise as="h2" id="skills-title">
          {t({ fr: 'Compétences', en: 'Skills' })}
        </Rise>
        <Rise as="p" i={1} className="skills__hint">
          {reduced
            ? t({ fr: 'Choisis un groupe pour le mettre en avant.', en: 'Pick a group to highlight it.' })
            : t({
                fr: 'Attrape les bulles avec le curseur, clique pour les faire sauter, ou filtre par groupe.',
                en: 'Push the bubbles with your cursor, click to pop them, or filter by group.',
              })}
        </Rise>
      </div>

      <div className="legend" role="group" aria-label={t({ fr: 'Groupes de compétences', en: 'Skill groups' })}>
        {GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`legend__btn g-${g.id} ${only === g.id ? 'is-on' : ''}`}
            aria-pressed={only === g.id}
            onClick={() => setOnly(only === g.id ? null : g.id)}
          >
            <i aria-hidden="true" />
            {t(g.label)}
          </button>
        ))}
      </div>

      <div className={`bubbles ${reduced ? 'bubbles--static' : ''}`} ref={box} aria-hidden={reduced ? undefined : 'true'}>
        {bubbles.map((b) => (
          <span
            key={b.key}
            className={`bub g-${b.group} ${only && only !== b.group ? 'is-dim' : ''}`}
            style={{ width: b.d, height: b.d }}
          >
            <span>{b.text}</span>
          </span>
        ))}
      </div>

      {!reduced && (
        <dl className="sr-only">
          {GROUPS.map((g) => (
            <div key={g.id}>
              <dt>{t(g.label)}</dt>
              <dd>{g.items.map((it) => (typeof it === 'string' ? it : it[lang])).join(', ')}</dd>
            </div>
          ))}
        </dl>
      )}

      <Rise as="p" className="spoken">
        <strong>{t({ fr: 'Langues', en: 'Spoken' })}</strong>{' '}
        {t({ fr: 'Anglais (natif), igbo (natif), français (B1)', en: 'English (native), Igbo (native), French (B1)' })}
      </Rise>
    </section>
  )
}

/** Keeps bubbles inside the box and pushes overlapping ones apart. */
function collide(nodes, W, H, strength) {
  for (const o of nodes) {
    if (o.x < o.r) {
      o.x = o.r
      o.vx = Math.abs(o.vx) * 0.7
    } else if (o.x > W - o.r) {
      o.x = W - o.r
      o.vx = -Math.abs(o.vx) * 0.7
    }
    if (o.y < o.r) {
      o.y = o.r
      o.vy = Math.abs(o.vy) * 0.7
    } else if (o.y > H - o.r) {
      o.y = H - o.r
      o.vy = -Math.abs(o.vy) * 0.7
    }
  }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]
      const b = nodes[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const min = a.r + b.r + 2
      const d2 = dx * dx + dy * dy
      if (d2 < min * min) {
        const d = Math.sqrt(d2) || 0.01
        const push = ((min - d) / 2) * strength
        const nx = dx / d
        const ny = dy / d
        a.x -= nx * push
        a.y -= ny * push
        b.x += nx * push
        b.y += ny * push
        const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
        if (rv < 0) {
          a.vx += nx * rv * 0.5
          a.vy += ny * rv * 0.5
          b.vx -= nx * rv * 0.5
          b.vy -= ny * rv * 0.5
        }
      }
    }
  }
}
