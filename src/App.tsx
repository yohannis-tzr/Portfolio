import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { contacts, profile, projects, skills, type Project } from './data'
import { Icon } from './Icon'

const sections = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
]

const pad = (n: number) => String(n).padStart(2, '0')

/* ---------- Hooks ---------- */

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}

const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
// Hover-only enhancements are skipped on touch devices.
const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)')

type Theme = 'dark' | 'light'

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )
  const reduced = useReducedMotion()

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // storage unavailable (private mode) — theme still applies for this visit
    }
  }, [theme])

  // Circular reveal from the toggle button where the View Transitions API exists.
  const toggle = (origin: HTMLElement) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    const apply = () => {
      document.documentElement.dataset.theme = next
      setTheme(next)
    }
    if (reduced || !document.startViewTransition) return apply()

    const { left, top, width, height } = origin.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    document.startViewTransition(apply).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 500, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
  }

  return [theme, toggle] as const
}

// Adds .is-visible as elements scroll into view; CSS skips this under reduced motion.
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    )
    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

function useActiveSection() {
  const [active, setActive] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return active
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return progress
}

// Buttons drift a few pixels toward the cursor (fine pointers only).
function useMagnetic<T extends HTMLElement>(strength = 0.25) {
  const ref = useRef<T>(null)
  const finePointer = useFinePointer()
  const reduced = useReducedMotion()
  const enabled = finePointer && !reduced

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) * strength
      const dy = (e.clientY - (r.top + r.height / 2)) * strength
      el.style.transform = `translate(${dx}px, ${dy}px)`
    }
    const leave = () => {
      el.style.transform = ''
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [enabled, strength])

  return ref
}

/* ---------- Header ---------- */

function Header() {
  const [theme, toggleTheme] = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const active = useActiveSection()
  const progress = useScrollProgress()

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <header className="header">
      <div className="container header__inner">
        <a href="#top" className="logo" aria-label={`${profile.name} — back to top`}>
          Yohannis<span className="logo__dot">.</span>
        </a>

        <nav id="site-nav" className={`nav ${menuOpen ? 'nav--open' : ''}`} aria-label="Primary">
          {sections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`nav__link ${active === id ? 'is-active' : ''}`}
              aria-current={active === id ? 'location' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <button
            type="button"
            className="icon-btn"
            onClick={(e) => toggleTheme(e.currentTarget)}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
          <button
            type="button"
            className="icon-btn menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="site-nav"
          >
            <Icon name={menuOpen ? 'x' : 'menu'} size={18} />
          </button>
        </div>
      </div>
      <div className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
    </header>
  )
}

/* ---------- Hero ---------- */

const buildWords = ['web apps', 'REST APIs', 'mobile apps', 'dashboards']

function RotatingWord() {
  const [index, setIndex] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setIndex((i) => (i + 1) % buildWords.length), 2200)
    return () => clearInterval(id)
  }, [reduced])

  return (
    <span className="rotator" aria-hidden="true">
      <span key={index} className="rotator__word">
        {buildWords[index]}
      </span>
    </span>
  )
}

function LocalTime() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <time>
      {now.toLocaleTimeString('en-GB', { timeZone: 'Africa/Addis_Ababa', hour: '2-digit', minute: '2-digit' })}{' '}
      local time
    </time>
  )
}

function Hero() {
  const ref = useRef<HTMLElement>(null)
  const primary = useMagnetic<HTMLAnchorElement>()
  const finePointer = useFinePointer()

  // Dot grid is revealed in a soft circle around the cursor.
  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    if (!finePointer || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`)
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <section id="top" ref={ref} className="hero" onPointerMove={onPointerMove}>
      <div className="hero__grid" aria-hidden="true" />
      <div className="container hero__inner">
        <div className="hero__meta">
          {profile.available && (
            <span className="status">
              <span className="status__dot" aria-hidden="true" />
              Available for work
            </span>
          )}
          <span>Based in {profile.location}</span>
          <LocalTime />
        </div>

        <h1 className="hero__title">
          {profile.name.split(' ').map((word) => (
            <span key={word} className="hero__line">
              {word}
            </span>
          ))}
        </h1>

        <p className="hero__lead">
          {profile.role}.
          <br />I build <RotatingWord />
          <span className="sr-only">web apps, REST APIs and mobile apps</span> that are fast, reliable and secure.
        </p>

        <div className="hero__cta">
          <a ref={primary} href="#work" className="btn btn--primary">
            See my work <Icon name="arrowDown" size={16} />
          </a>
          <a href="#contact" className="btn btn--ghost">
            Get in touch
          </a>
        </div>
      </div>
    </section>
  )
}

/* ---------- Work ---------- */

function ProjectVisual({ project }: { project: Project }) {
  const img = <img src={project.image} alt={project.imageAlt} loading="lazy" decoding="async" />

  if (project.device === 'phone') return <div className="shot shot--phone">{img}</div>

  return (
    <div className="shot shot--browser">
      <div className="shot__bar" aria-hidden="true">
        <span />
        <span />
        <span />
        {project.domain && <span className="shot__url">{project.domain}</span>}
      </div>
      {img}
    </div>
  )
}

function Work() {
  const [open, setOpen] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const finePointer = useFinePointer()
  const reduced = useReducedMotion()
  const showPreview = finePointer && !reduced

  const onPointerMove = (e: ReactPointerEvent) => {
    previewRef.current?.style.setProperty('--x', `${e.clientX}px`)
    previewRef.current?.style.setProperty('--y', `${e.clientY}px`)
  }

  return (
    <section id="work" className="section container">
      <SectionHeading index="01" title="Selected work" note="Tap a project to open it." />

      <ul className="projects" onPointerMove={showPreview ? onPointerMove : undefined} data-reveal>
        {projects.map((p, i) => {
          const isOpen = open === i
          return (
            <li key={p.name} className={`project ${isOpen ? 'is-open' : ''}`}>
              <h3 className="project__heading">
                <button
                  type="button"
                  id={`project-${i}`}
                  className="project__row"
                  aria-expanded={isOpen}
                  aria-controls={`project-panel-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  onPointerEnter={() => setHovered(i)}
                  onPointerLeave={() => setHovered(null)}
                >
                  <span className="project__num">{pad(i + 1)}</span>
                  <span className="project__name">{p.name}</span>
                  <span className="project__kind">{p.kind}</span>
                  <span className="project__toggle" aria-hidden="true">
                    <Icon name="plus" size={18} />
                  </span>
                </button>
              </h3>

              <div
                id={`project-panel-${i}`}
                role="region"
                aria-labelledby={`project-${i}`}
                className="project__panel"
                inert={!isOpen}
              >
                <div className="project__panel-inner">
                  <div className="project__content">
                    <div className="project__text">
                      <p className="project__desc">{p.description}</p>
                      <ul className="project__highlights">
                        {p.highlights.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                      <ul className="tags" aria-label="Technologies">
                        {p.tags.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                      {(p.url || p.repo) && (
                        <div className="project__links">
                          {p.url && (
                            <a href={p.url} target="_blank" rel="noreferrer" className="link-arrow">
                              Visit live site <Icon name="arrowUpRight" size={16} />
                            </a>
                          )}
                          {p.repo && (
                            <a href={p.repo} target="_blank" rel="noreferrer" className="link-arrow">
                              Source code <Icon name="arrowUpRight" size={16} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <ProjectVisual project={p} />
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {showPreview && (
        <div
          ref={previewRef}
          className={`preview ${hovered !== null && hovered !== open ? 'is-visible' : ''}`}
          aria-hidden="true"
        >
          {projects.map((p, i) => (
            <img
              key={p.name}
              src={p.image}
              alt=""
              className={`preview__img preview__img--${p.device} ${hovered === i ? 'is-active' : ''}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

/* ---------- About ---------- */

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = useReducedMotion()
  const [value, setValue] = useState(reduced ? to : 0)

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const start = performance.now()
      const tick = (t: number) => {
        const k = Math.min((t - start) / 900, 1)
        setValue(Math.round(to * (1 - Math.pow(1 - k, 3))))
        if (k < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [to, reduced])

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  )
}

function About() {
  return (
    <section id="about" className="section container">
      <SectionHeading index="02" title="About" />
      <div className="about">
        <p className="about__statement" data-reveal>
          I own products end to end — <em>from the first schema to the final pixel</em>, on the web and on mobile.
        </p>
        <div className="about__body" data-reveal>
          <p>
            On the web I work with React, Next.js and TanStack Start, styled with Tailwind CSS. On the server I build
            typed REST APIs with Node.js, Hono and Express, documented with Swagger/OpenAPI and backed by PostgreSQL.
          </p>
          <p>
            For mobile I ship cross-platform apps with Flutter and Material 3. I care about secure authentication
            flows — including OTP verification — clean architecture, and using modern AI-assisted tooling to move
            fast without cutting corners.
          </p>
          <dl className="stats">
            <div>
              <dt>Languages</dt>
              <dd>
                <CountUp to={6} />
              </dd>
            </div>
            <div>
              <dt>Shipped projects</dt>
              <dd>
                <CountUp to={projects.length} suffix="+" />
              </dd>
            </div>
            <div>
              <dt>Platforms: web &amp; mobile</dt>
              <dd>
                <CountUp to={2} />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}

/* ---------- Skills ---------- */

function Skills() {
  const tabs = ['All', ...skills.map((g) => g.title)]
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const visible = active === 0 ? skills : [skills[active - 1]]

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  const onKeyDown = (e: ReactKeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 }
    if (!(e.key in keys) && e.key !== 'Home' && e.key !== 'End') return
    e.preventDefault()
    const next =
      e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (active + keys[e.key] + tabs.length) % tabs.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="skills" className="section container">
      <SectionHeading index="03" title="Skills" />
      <div className="tabs" role="tablist" aria-label="Skill categories" onKeyDown={onKeyDown} data-reveal>
        {tabs.map((t, i) => (
          <button
            key={t}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            type="button"
            role="tab"
            id={`tab-${i}`}
            aria-selected={active === i}
            aria-controls="skills-panel"
            tabIndex={active === i ? 0 : -1}
            className="tab"
            onClick={() => setActive(i)}
          >
            {t}
          </button>
        ))}
      </div>

      <div id="skills-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="skills" key={active}>
        {visible.map((group) => (
          <div key={group.title} className="skills__row">
            <h3 className="skills__title">
              {group.title}
              <span className="skills__count">{pad(group.items.length)}</span>
            </h3>
            <ul className="skills__list">
              {group.items.map((item, i) => (
                <li key={item} style={{ '--i': i } as CSSProperties}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------- Contact ---------- */

function Contact() {
  const email = contacts.find((c) => c.icon === 'mail')!
  const others = contacts.filter((c) => c !== email)
  const [copied, setCopied] = useState(false)
  const magnet = useMagnetic<HTMLButtonElement>(0.12)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email.value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = email.href
    }
  }

  return (
    <section id="contact" className="section container">
      <SectionHeading index="04" title="Contact" />
      <div className="contact" data-reveal>
        <p className="contact__lead">Have a project or a role in mind? Let's talk.</p>

        <button ref={magnet} type="button" className={`email ${copied ? 'is-copied' : ''}`} onClick={copy}>
          <span className="email__text">
            <span className="email__value">{email.value}</span>
            <span className="email__done">Copied to clipboard</span>
          </span>
          <span className="email__icon" aria-hidden="true">
            <Icon name={copied ? 'check' : 'copy'} size={20} />
          </span>
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? 'Email address copied to clipboard' : ''}
        </span>
        <p className="contact__hint">
          Click to copy — or <a href={email.href}>open your mail app</a>.
        </p>

        <ul className="socials">
          {others.map((c) => {
            const external = c.href.startsWith('http')
            return (
              <li key={c.label}>
                <a href={c.href} className="social" {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                  <span className="social__label">{c.label}</span>
                  <span className="social__value">{c.value}</span>
                  <Icon name="arrowUpRight" size={18} />
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* ---------- Shared ---------- */

function SectionHeading({ index, title, note }: { index: string; title: string; note?: string }) {
  return (
    <div className="section-heading" data-reveal>
      <span className="section-heading__index">{index}</span>
      <h2>{title}</h2>
      {note && <p className="section-heading__note">{note}</p>}
    </div>
  )
}

export default function App() {
  useReveal()

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Work />
        <About />
        <Skills />
        <Contact />
      </main>
      <footer className="container">
        <div className="footer">
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
          <a href="#top" className="link-arrow">
            Back to top <Icon name="arrowUp" size={16} />
          </a>
        </div>
      </footer>
    </>
  )
}
