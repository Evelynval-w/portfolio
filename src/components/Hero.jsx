import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useLang } from '../lang.jsx'
import { prefersReduced, useInView, useMedia } from '../hooks.js'
import { Spark } from './Rise.jsx'

/* ------------------------------------------------------------------ sampling */

/** Draws the name on an offscreen canvas and returns normalised points (width = 1). */
async function sampleName(lines, wanted) {
  try {
    await document.fonts.load('800 200px Besley')
  } catch {
    /* fall back to the serif stack */
  }
  const W = 1400
  const c = document.createElement('canvas')
  const probe = c.getContext('2d')
  let fs = 200
  probe.font = `800 ${fs}px Besley, Georgia, serif`
  const widest = Math.max(...lines.map((l) => probe.measureText(l).width))
  fs *= (W * 0.94) / widest
  const lineH = fs * 1.02
  const H = Math.ceil(lineH * lines.length + fs * 0.3)
  c.width = W
  c.height = H
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = '#fff'
  ctx.font = `800 ${fs}px Besley, Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  lines.forEach((l, i) => ctx.fillText(l, W / 2, fs * 0.15 + lineH * (i + 0.5)))
  const img = ctx.getImageData(0, 0, W, H).data
  const raw = []
  const step = 2
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      if (img[(y * W + x) * 4 + 3] > 140) raw.push([x / W - 0.5, -(y / W - H / W / 2)])
    }
  }
  // shuffle, then take `wanted` points (repeat with jitter if the text is small)
  for (let i = raw.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    ;[raw[i], raw[j]] = [raw[j], raw[i]]
  }
  const out = new Float32Array(wanted * 2)
  for (let i = 0; i < wanted; i++) {
    const p = raw[i % raw.length]
    const jitter = i >= raw.length ? 0.0012 : 0
    out[i * 2] = p[0] + (Math.random() - 0.5) * jitter
    out[i * 2 + 1] = p[1] + (Math.random() - 0.5) * jitter
  }
  return out
}

/* ------------------------------------------------------------------ particles */

const LIME = new THREE.Color('#d4ec7a')
const CREAM = new THREE.Color('#f3ecdc')
const SAGE = new THREE.Color('#86a06a')

function Swarm({ targets, nameN, dustN, reduced, mobile, ptr }) {
  const geo = useRef()
  const { viewport, invalidate } = useThree()
  const total = nameN + dustN
  const clock = useRef(0)

  const s = useMemo(() => {
    const pos = new Float32Array(total * 3)
    const vel = new Float32Array(total * 2)
    const delay = new Float32Array(total)
    const col = new Float32Array(total * 3)
    const seed = new Float32Array(total * 3)
    for (let i = 0; i < total; i++) {
      seed[i * 3] = Math.random() * Math.PI * 2
      seed[i * 3 + 1] = 0.05 + Math.random() * 0.12
      seed[i * 3 + 2] = Math.random()
      const isDust = i >= nameN
      delay[i] = isDust ? 0 : 0.2 + Math.random() * 1.6
      const c = isDust ? SAGE : Math.random() < 0.28 ? CREAM : LIME
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return { pos, vel, delay, col, seed }
  }, [total, nameN])

  // scatter once we know the viewport
  const placed = useRef(false)
  const place = () => {
    const w = viewport.width
    const h = viewport.height
    for (let i = 0; i < total; i++) {
      s.pos[i * 3] = (Math.random() - 0.5) * w * 1.1
      s.pos[i * 3 + 1] = (Math.random() - 0.5) * h * 1.1
      s.pos[i * 3 + 2] = 0
    }
    placed.current = true
  }

  const frame = (dt, pointer, still) => {
    const w = viewport.width
    const h = viewport.height
    const W = Math.min(w * (mobile ? 0.92 : 0.88), 1400)
    const cy = -h * 0.04
    const px = pointer.x
    const py = pointer.y
    const t = clock.current
    const R = mobile ? 90 : 140
    for (let i = 0; i < total; i++) {
      const isDust = i >= nameN
      let tx
      let ty
      if (isDust) {
        const a = s.seed[i * 3] + t * s.seed[i * 3 + 1]
        tx = Math.sin(a) * w * 0.52 + Math.sin(a * 0.37 + i) * 40
        ty = Math.cos(a * 0.8 + s.seed[i * 3 + 2] * 6) * h * 0.5
      } else {
        tx = targets[i * 2] * W
        ty = targets[i * 2 + 1] * W + cy
        if (!still) {
          tx += Math.sin(t * 1.3 + i) * 1.1
          ty += Math.cos(t * 1.1 + i * 1.7) * 1.1
        }
      }
      if (still) {
        if (!isDust) {
          s.pos[i * 3] = tx
          s.pos[i * 3 + 1] = ty
        }
        continue
      }
      const ramp = Math.min(Math.max((t - s.delay[i]) / 1.1, 0), 1)
      const k = isDust ? 0.35 : 4 + ramp * ramp * 26
      let vx = s.vel[i * 2]
      let vy = s.vel[i * 2 + 1]
      vx += (tx - s.pos[i * 3]) * k * dt
      vy += (ty - s.pos[i * 3 + 1]) * k * dt
      const dx = s.pos[i * 3] - px
      const dy = s.pos[i * 3 + 1] - py
      const d = Math.hypot(dx, dy) + 0.001
      if (d < R) {
        const f = (1 - d / R) ** 2 * 2600
        vx += (dx / d) * f * dt
        vy += (dy / d) * f * dt
      }
      const damp = Math.exp(-(isDust ? 1.2 : 5.5) * dt)
      vx *= damp
      vy *= damp
      s.vel[i * 2] = vx
      s.vel[i * 2 + 1] = vy
      s.pos[i * 3] += vx * dt
      s.pos[i * 3 + 1] += vy * dt
    }
    if (geo.current) geo.current.attributes.position.needsUpdate = true
  }

  useFrame((state, dtRaw) => {
    if (!placed.current) place()
    if (reduced) return
    const dt = Math.min(dtRaw, 0.05)
    clock.current += dt
    frame(dt, ptr.current, false)
  })

  useEffect(() => {
    if (!reduced) return
    if (!placed.current) place()
    frame(0, { x: 9, y: 9 }, true)
    invalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, viewport.width, viewport.height, targets])

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geo}>
        <bufferAttribute attach="attributes-position" args={[s.pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[s.col, 3]} />
      </bufferGeometry>
      <pointsMaterial size={mobile ? 2.1 : 2.5} sizeAttenuation={false} vertexColors transparent opacity={0.95} depthWrite={false} />
    </points>
  )
}

/* ------------------------------------------------------------------ hero */

const WORDS = {
  fr: ['Machine', 'learning', 'appliqué.'],
  en: ['Applied', 'machine', 'learning.'],
}

export default function Hero() {
  const { lang, t } = useLang()
  const mobile = useMedia('(max-width: 720px)')
  const reduced = useMemo(() => prefersReduced(), [])
  const [targets, setTargets] = useState(null)
  const [wrap, inView] = useInView()
  const ptr = useRef({ x: 9999, y: 9999 })
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    ptr.current.x = e.clientX - r.left - r.width / 2
    ptr.current.y = -(e.clientY - r.top - r.height / 2)
  }
  const off = () => {
    ptr.current.x = 9999
    ptr.current.y = 9999
  }
  const nameN = mobile ? 4600 : 9500
  const dustN = mobile ? 120 : 260

  useEffect(() => {
    let live = true
    setTargets(null)
    sampleName(mobile ? ['Makuo', 'Okoene'] : ['Makuo Okoene'], nameN).then((p) => live && setTargets(p))
    return () => {
      live = false
    }
  }, [mobile, nameN])

  return (
    <section className="hero" ref={wrap} aria-labelledby="hero-title">
      <div
        className="hero__stage"
        aria-hidden="true"
        onPointerMove={onMove}
        onPointerLeave={off}
        onPointerCancel={off}
        onPointerUp={(e) => e.pointerType !== 'mouse' && off()}
      >
        <div className="hero__canvas">
          {targets && (
            <Canvas
              key={mobile ? 'm' : 'd'}
              orthographic
              camera={{ position: [0, 0, 10], zoom: 1, near: 0.1, far: 100 }}
              dpr={[1, 1.75]}
              frameloop={reduced ? 'demand' : inView ? 'always' : 'never'}
              gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
            >
              <Swarm targets={targets} nameN={nameN} dustN={dustN} reduced={reduced} mobile={mobile} ptr={ptr} />
            </Canvas>
          )}
        </div>
        <Spark className="hero__spark hero__spark--a" size={34} />
        <Spark className="hero__spark hero__spark--b" size={20} />
        <Spark className="hero__spark hero__spark--c" size={26} />
      </div>

      <div className="hero__copy">
        <p className="sr-only">Makuo Okoene</p>
        <h1 id="hero-title" className="kinetic" key={lang} aria-label={WORDS[lang].join(' ')}>
          {WORDS[lang].map((w, i) => (
            <span key={w} className="kinetic__word" aria-hidden="true" style={{ '--d': `${0.5 + i * 0.42}s` }}>
              <span className={i % 2 ? 'kinetic__in kinetic__in--alt' : 'kinetic__in'}>{w}</span>
            </span>
          ))}
        </h1>
        <p className="hero__lead" style={{ '--d': '2s' }}>
          {t({
            fr: "Étudiante en 3ᵉ année à l'EPITA Paris. Stage de fin d'études de 6 mois, dès février 2027.",
            en: 'Third-year computer science student at EPITA Paris. Six-month end-of-studies internship from February 2027.',
          })}
        </p>
        <p className="hero__body" style={{ '--d': '2.15s' }}>
          {t({
            fr: "Machine learning, traitement de données et développement backend, au service d'équipes qui construisent des systèmes d'IA fiables.",
            en: 'Machine learning, data processing and backend development, for teams building reliable AI systems.',
          })}
        </p>
        <div className="actions" style={{ '--d': '2.3s' }}>
          <a className="btn btn--lime" href="mailto:okoeneeve@gmail.com">
            {t({ fr: 'Me contacter', en: 'Get in touch' })}
          </a>
          <a className="link link--cream" href="#projets">
            {t({ fr: 'Voir les projets', en: 'See the work' })}
          </a>
        </div>
      </div>
    </section>
  )
}
