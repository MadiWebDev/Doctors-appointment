import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { ThemeToggleCompact } from '../Components/shared/ThemeToggle'

/* ────────────────────────────────────────────────────────────
   Icons — inline SVG, colored via currentColor so they inherit
   whatever Tailwind text-* class wraps them
   ──────────────────────────────────────────────────────────── */
const HeartIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z" />
  </svg>
)
const StarIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
)
const ShieldIcon = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const ClockIcon = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
const UserIcon = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const BellIcon = ({ className = 'w-7 h-7' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)
const ChevronIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

/* ────────────────────────────────────────────────────────────
   Signature motif — an EKG / vitals pulse line. Used as an
   ambient hero backdrop and as the connective thread through
   the "how it works" steps, since a heartbeat is the one shape
   nobody mistakes for anything but healthcare.
   ──────────────────────────────────────────────────────────── */
const PulseLine = ({ className = '' }) => (
  <svg
    viewBox="0 0 600 80"
    preserveAspectRatio="none"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M0 40 H210 L228 12 L248 68 L266 40 H600"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength="100"
      className="[stroke-dasharray:22_78] animate-[pulseTravel_3.4s_linear_infinite]"
    />
  </svg>
)

/* ── floating gradient orb ── */
function Orb({ className = '', style }) {
  return <div className={`absolute rounded-full blur-[80px] pointer-events-none ${className}`} style={style} />
}

/* ── animated counter ── */
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      observer.disconnect()
      let start = 0
      const step = Math.ceil(target / 60)
      const timer = setInterval(() => {
        start += step
        if (start >= target) { setCount(target); clearInterval(timer) }
        else setCount(start)
      }, 16)
    }, { threshold: 0.4 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ── data ── */
const DOCTORS = [
  { name: 'Dr. Sara Ahmed', spec: 'Cardiologist', rating: 4.9, reviews: 312, img: 'SA' },
  { name: 'Dr. Omar Malik', spec: 'Neurologist', rating: 4.8, reviews: 198, img: 'OM' },
  { name: 'Dr. Hina Qureshi', spec: 'Pediatrician', rating: 4.9, reviews: 425, img: 'HQ' },
]

const FEATURES = [
  { icon: ShieldIcon, title: 'License-verified doctors', desc: 'Every doctor is manually reviewed. We verify their license, credentials, and hospital affiliation before they go live.' },
  { icon: ClockIcon, title: 'Real-time slot booking', desc: 'See live availability and book a slot in under 60 seconds. No phone calls, no wait music.' },
  { icon: UserIcon, title: 'Full appointment history', desc: 'View past visits, medical notes, and prescriptions anytime. Your health record, always in reach.' },
  { icon: BellIcon, title: 'Smart reminders', desc: 'Automatic notifications before your appointment so you never miss a visit or follow-up.' },
]

const STEPS = [
  { n: '1', title: 'Create your account', desc: 'Sign up as a patient in under a minute. No paperwork, no wait.' },
  { n: '2', title: 'Find your doctor', desc: 'Browse by specialization, read reviews, and check real-time availability.' },
  { n: '3', title: 'Book & show up', desc: 'Pick a slot, confirm your reason, get a reminder — then just show up.' },
]

/* ── shared button styles (kept as strings so every CTA is pixel-consistent) ── */
const btn = {
  base: 'inline-flex items-center justify-center gap-2 rounded-md font-semibold text-sm transition-all duration-200 whitespace-nowrap',
  primary: 'bg-primary text-primary-foreground px-5 py-2.5 hover:brightness-110 hover:-translate-y-0.5 shadow-sm hover:shadow-lg',
  outline: 'border-[1.5px] border-primary text-primary px-5 py-2.5 hover:bg-secondary hover:-translate-y-0.5',
  ghost: 'text-muted-foreground px-4 py-2.5 hover:text-foreground hover:bg-secondary',
  white: 'bg-white text-primary px-8 py-4 text-base rounded-xl hover:bg-secondary hover:-translate-y-0.5 shadow-sm hover:shadow-lg',
  whiteOutline: 'bg-transparent text-white border-[1.5px] border-white/50 px-8 py-4 text-base rounded-xl hover:bg-white/10 hover:-translate-y-0.5',
  xl: 'px-8 py-4 text-base rounded-xl',
}

export default function Home() {
  const [activeSpec, setActiveSpec] = useState(0)
  const specs = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology']

  useEffect(() => {
    const t = setInterval(() => setActiveSpec((p) => (p + 1) % specs.length), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <style>{`
        @keyframes pulseTravel {
          0%   { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: -100; }
        }
        @keyframes softFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-18px); }
        }
        @keyframes dotPing {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: .45; transform: scale(1.5); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-6 md:px-10 lg:px-20 bg-background/85 backdrop-blur-md border-b border-border">
        <a href="/" className="flex items-center gap-2.5 font-bold text-lg text-foreground">
          <span className="w-8 h-8 rounded-[10px] bg-primary text-primary-foreground grid place-items-center">
            <HeartIcon className="w-4.5 h-4.5" />
          </span>
          MediBook
        </a>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggleCompact />
          <Link to="/login" className={`${btn.base} ${btn.ghost} hidden sm:inline-flex`}>Sign in</Link>
          <Link to="/register" className={`${btn.base} ${btn.outline}`}>Register</Link>
          <Link to="/doctor-register" className={`${btn.base} ${btn.primary}`}>
            <span className="hidden sm:inline">Join as Doctor</span>
            <span className="sm:hidden">Doctor</span>
            <ChevronIcon />
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-10 lg:px-20 pt-28 pb-16 overflow-hidden">
        {/* ambient gradient wash — tinted with the theme's own primary, so it adapts in dark mode */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, var(--primary) 10%, transparent) 0%, transparent 70%), ' +
              'radial-gradient(ellipse 60% 40% at 90% 80%, color-mix(in srgb, var(--primary) 7%, transparent) 0%, transparent 60%)',
          }}
        />
        {/* faint grid */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.35] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_30%,transparent_100%)]"
          style={{
            backgroundImage:
              'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <Orb
          className="-z-10 text-primary w-[500px] h-[500px] -top-36 -left-36"
          style={{ background: 'color-mix(in srgb, var(--primary) 9%, transparent)', animation: 'softFloat 9s ease-in-out infinite' }}
        />
        <Orb
          className="-z-10 w-[400px] h-[400px] -bottom-24 -right-24"
          style={{ background: 'color-mix(in srgb, var(--primary) 7%, transparent)', animation: 'softFloat 11s ease-in-out infinite reverse' }}
        />
        {/* signature pulse line, faint, drifting behind the copy */}
        <PulseLine className="-z-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] max-w-none h-24 text-primary opacity-[0.08]" />

        <div className="relative z-10 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-secondary text-primary border border-border rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animation: 'dotPing 2s infinite' }} />
            Trusted by 8,000+ patients across Pakistan
          </div>

          <h1 className="text-[clamp(2.6rem,6vw,4.2rem)] font-extrabold leading-[1.1] tracking-tight text-foreground mb-6">
            Book a{' '}
            <span
              key={activeSpec}
              className="inline-block min-w-[220px] bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 60%, var(--background)) 100%)',
                animation: 'fadeSlideIn 0.5s ease',
              }}
            >
              {specs[activeSpec]}
            </span>
            <br />
            specialist in minutes
          </h1>

          <p className="text-[clamp(1rem,2vw,1.15rem)] text-muted-foreground leading-relaxed max-w-xl mx-auto mb-10">
            Connect with 500+ verified doctors. Pick a time that suits you, skip the waiting room,
            and get the care you deserve — all in one place.
          </p>

          <div className="flex gap-3 justify-center flex-wrap mb-14">
            <Link to="/register" className={`${btn.base} ${btn.primary} ${btn.xl}`}>
              Get started free <ChevronIcon />
            </Link>
            <Link to="/login" className={`${btn.base} ${btn.outline} ${btn.xl}`}>
              Sign in to your account
            </Link>
          </div>

          <div className="flex gap-6 sm:gap-10 lg:gap-16 flex-wrap justify-center bg-card border border-border rounded-2xl px-8 sm:px-12 py-6 shadow-[0_4px_32px_rgba(0,0,0,0.06)]">
            {[
              { target: 500, suffix: '+', label: 'Verified doctors' },
              { target: 8000, suffix: '+', label: 'Happy patients' },
              { target: 20, suffix: '+', label: 'Specializations' },
              { target: 98, suffix: '%', label: 'Satisfaction rate' },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-6 sm:gap-10 lg:gap-16">
                <div className="text-center">
                  <div className="text-3xl font-extrabold text-foreground leading-none">
                    <Counter target={s.target} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">{s.label}</div>
                </div>
                {i < 3 && <div className="hidden sm:block w-px self-stretch bg-border" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-secondary py-20 md:py-28 px-6 md:px-10 lg:px-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs font-bold tracking-[0.1em] uppercase text-primary mb-3">Why MediBook</div>
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-foreground mb-4">
            Healthcare that works around you
          </h2>
          <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
            Everything you need to manage your health, from finding the right doctor to getting reminders for follow-ups.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group relative overflow-hidden bg-card border border-border rounded-2xl p-8 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-[0_12px_40px_rgba(2,132,199,0.12)]"
              >
                <div className="w-14 h-14 rounded-2xl bg-secondary text-primary grid place-items-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                  <Icon />
                </div>
                <div className="text-base font-bold text-foreground mb-2">{title}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Doctors ── */}
      <section className="bg-background py-20 md:py-28 px-6 md:px-10 lg:px-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs font-bold tracking-[0.1em] uppercase text-primary mb-3">Our specialists</div>
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-foreground mb-4">
            Meet top-rated doctors
          </h2>
          <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
            Handpicked specialists with verified credentials and consistently excellent patient ratings.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {DOCTORS.map((d) => (
              <div
                key={d.name}
                className="flex flex-col gap-4 bg-card border border-border rounded-2xl p-7 cursor-pointer transition-all duration-200 hover:-translate-y-1.5 hover:border-ring hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-full bg-secondary text-primary grid place-items-center text-xl font-extrabold">
                    {d.img}
                  </div>
                  <div>
                    <div className="text-base font-bold text-foreground">{d.name}</div>
                    <span className="inline-block text-[0.82rem] font-semibold text-primary bg-secondary px-2.5 py-0.5 rounded-full mt-1">
                      {d.spec}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.round(d.rating) ? 'opacity-100' : 'opacity-25'}>
                      <StarIcon />
                    </span>
                  ))}
                  <span className="text-foreground ml-1">{d.rating}</span>
                  <span className="text-muted-foreground font-normal text-xs">({d.reviews} reviews)</span>
                </div>
                <Link to="/register" className={`${btn.base} ${btn.outline} mt-auto w-full`}>
                  Book appointment
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-secondary py-20 md:py-28 px-6 md:px-10 lg:px-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-xs font-bold tracking-[0.1em] uppercase text-primary mb-3">How it works</div>
          <h2 className="text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight text-foreground mb-4">
            From signup to booked in 3 steps
          </h2>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-0 mt-14">
            {/* the heartbeat that threads the steps together */}
            <PulseLine className="hidden sm:block absolute top-8 left-[12%] right-[12%] w-[76%] h-8 text-primary/70 -translate-y-1/2" />

            {STEPS.map((s) => (
              <div key={s.n} className="relative z-10 text-center px-6">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-xl font-extrabold grid place-items-center mx-auto mb-5 ring-8 ring-secondary">
                  {s.n}
                </div>
                <div className="text-base font-bold text-foreground mb-2">{s.title}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <div
        className="relative overflow-hidden mx-6 md:mx-10 lg:mx-20 mb-20 md:mb-28 rounded-3xl px-8 md:px-16 py-14 md:py-20 flex flex-col items-center text-center gap-6"
        style={{
          background:
            'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 75%, black) 55%, color-mix(in srgb, var(--primary) 55%, black) 100%)',
        }}
      >
        <div className="absolute -top-1/2 -left-1/5 w-[500px] h-[500px] rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-2/5 -right-1/10 w-[400px] h-[400px] rounded-full bg-white/[0.04] pointer-events-none" />
        <PulseLine className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-16 text-white opacity-[0.08]" />

        <h2 className="relative z-10 text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold text-white tracking-tight leading-tight">
          Ready to take control<br />of your health?
        </h2>
        <p className="relative z-10 text-base text-white/80 max-w-md leading-relaxed">
          Join thousands of patients who book smarter, wait less, and get better care.
        </p>
        <div className="relative z-10 flex gap-3 flex-wrap justify-center">
          <Link to="/register" className={`${btn.base} ${btn.white}`}>Register as patient</Link>
          <Link to="/doctor-register" className={`${btn.base} ${btn.whiteOutline}`}>Join as a doctor</Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-card/30 text-primary text-center py-8 px-6 text-sm flex flex-col items-center gap-2">
        <p>
          © 2025 <strong className="text-foreground   ">MediBook</strong>. Built to make healthcare accessible for everyone.
        </p>
        <p className="text-xs text-background/50">
          Made by{' '}
          <a
            href="https://www.codexengr.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:text-primary underline underline-offset-2 transition-colors"
          >
            CodexEngr
          </a>
        </p>
      </footer>
    </div>
  )
}