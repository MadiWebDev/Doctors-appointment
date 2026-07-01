import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

/* ── tiny icon helpers (inline SVG so no extra dep) ── */
const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"/>
  </svg>
)
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
)
const ShieldIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const UserIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

/* ── floating orb background ── */
function Orb({ style }) {
  return <div className="orb" style={style} />
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

/* ── doctor card ── */
const DOCTORS = [
  { name: 'Dr. Sara Ahmed',   spec: 'Cardiologist',  rating: 4.9, reviews: 312, img: 'SA', color: '#dbeafe' },
  { name: 'Dr. Omar Malik',   spec: 'Neurologist',   rating: 4.8, reviews: 198, img: 'OM', color: '#dcfce7' },
  { name: 'Dr. Hina Qureshi', spec: 'Pediatrician',  rating: 4.9, reviews: 425, img: 'HQ', color: '#fce7f3' },
]

export default function Home() {
  const [activeSpec, setActiveSpec] = useState(0)
  const specs = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology']

  useEffect(() => {
    const t = setInterval(() => setActiveSpec(p => (p + 1) % specs.length), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --background: #ffffff;
          --foreground: #0f172a;
          --card: #ffffff;
          --card-foreground: #0f172a;
          --popover: #ffffff;
          --popover-foreground: #0f172a;
          --primary: #0284c7;
          --primary-foreground: #ffffff;
          --secondary: #f1f5f9;
          --secondary-foreground: #0f172a;
          --muted: #f1f5f9;
          --muted-foreground: #64748b;
          --accent: #f1f5f9;
          --accent-foreground: #0f172a;
          --destructive: #ef4444;
          --destructive-foreground: #ffffff;
          --border: #e2e8f0;
          --input: #e2e8f0;
          --ring: #0284c7;
          --radius: 0.5rem;
        }

        body { font-family: 'Inter', system-ui, sans-serif; background: var(--background); color: var(--foreground); }

        /* ── layout ── */
        .page { min-height: 100vh; overflow-x: hidden; }

        /* ── navbar ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(1.5rem, 5vw, 5rem); height: 64px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
        }
        .nav-brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1.2rem; color: var(--foreground); text-decoration: none; }
        .nav-brand-dot { width: 34px; height: 34px; border-radius: 10px; background: var(--primary); display: flex; align-items: center; justify-content: center; color: var(--primary-foreground); }
        .nav-links { display: flex; gap: 8px; }

        /* ── buttons ── */
        .btn { display: inline-flex; align-items: center; gap: 7px; border-radius: var(--radius); font-size: 0.875rem; font-weight: 600; padding: 0.55rem 1.25rem; cursor: pointer; border: none; transition: all 0.18s ease; text-decoration: none; white-space: nowrap; }
        .btn-primary { background: var(--primary); color: var(--primary-foreground); }
        .btn-primary:hover { background: #0369a1; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(2,132,199,0.35); }
        .btn-outline { background: transparent; color: var(--primary); border: 1.5px solid var(--primary); }
        .btn-outline:hover { background: var(--secondary); transform: translateY(-1px); }
        .btn-ghost { background: transparent; color: var(--muted-foreground); }
        .btn-ghost:hover { color: var(--foreground); background: var(--secondary); }
        .btn-lg { padding: 0.8rem 2rem; font-size: 1rem; border-radius: 0.625rem; }
        .btn-xl { padding: 1rem 2.4rem; font-size: 1.05rem; border-radius: 0.75rem; }

        /* ── hero ── */
        .hero {
          position: relative; min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 80px clamp(1.5rem,5vw,5rem) 60px;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 80% 60% at 50% -10%, rgba(2,132,199,0.08) 0%, transparent 70%),
                      radial-gradient(ellipse 60% 40% at 90% 80%, rgba(2,132,199,0.05) 0%, transparent 60%);
        }
        .grid-lines {
          position: absolute; inset: 0; z-index: 0; opacity: 0.35;
          background-image:
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }
        .orb {
          position: absolute; border-radius: 50%; filter: blur(70px);
          pointer-events: none; z-index: 0;
        }
        .hero-content { position: relative; z-index: 1; text-align: center; max-width: 780px; }

        .eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--secondary); color: var(--primary);
          border: 1px solid rgba(2,132,199,0.2);
          border-radius: 999px; padding: 6px 16px;
          font-size: 0.78rem; font-weight: 600; letter-spacing: 0.04em;
          margin-bottom: 1.75rem;
        }
        .eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--primary); animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }

        .hero-title {
          font-size: clamp(2.6rem, 6vw, 4.2rem);
          font-weight: 800; line-height: 1.1;
          letter-spacing: -0.03em;
          color: var(--foreground);
          margin-bottom: 1.5rem;
        }
        .hero-title .gradient-word {
          background: linear-gradient(135deg, var(--primary) 0%, #0ea5e9 50%, #38bdf8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .spec-rotator {
          display: inline-block; position: relative; min-width: 220px;
          background: linear-gradient(135deg, var(--primary) 0%, #0ea5e9 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .hero-sub {
          font-size: clamp(1rem, 2vw, 1.15rem);
          color: var(--muted-foreground); line-height: 1.7;
          max-width: 560px; margin: 0 auto 2.5rem;
        }

        .hero-cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 3.5rem; }

        /* ── stats strip ── */
        .stats-strip {
          position: relative; z-index: 1;
          display: flex; gap: clamp(1.5rem, 4vw, 4rem); flex-wrap: wrap; justify-content: center;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 1.25rem;
          padding: 1.5rem 3rem;
          box-shadow: 0 4px 32px rgba(0,0,0,0.06);
        }
        .stat-item { text-align: center; }
        .stat-num { font-size: 1.9rem; font-weight: 800; color: var(--foreground); line-height: 1; }
        .stat-num span { color: var(--primary); }
        .stat-lbl { font-size: 0.78rem; color: var(--muted-foreground); font-weight: 500; margin-top: 4px; }
        .stat-div { width: 1px; background: var(--border); align-self: stretch; }

        /* ── section ── */
        .section { padding: clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 5rem); }
        .section-label { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--primary); margin-bottom: 0.75rem; }
        .section-title { font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 800; letter-spacing: -0.02em; color: var(--foreground); margin-bottom: 1rem; }
        .section-sub { font-size: 1.05rem; color: var(--muted-foreground); max-width: 520px; line-height: 1.7; }

        /* ── features ── */
        .features { background: var(--secondary); }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-top: 3rem; }
        .feature-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 1rem; padding: 2rem;
          transition: all 0.22s ease;
          position: relative; overflow: hidden;
        }
        .feature-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(2,132,199,0.04) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.22s;
        }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(2,132,199,0.12); border-color: rgba(2,132,199,0.3); }
        .feature-card:hover::before { opacity: 1; }
        .feature-icon { width: 54px; height: 54px; border-radius: 0.875rem; background: rgba(2,132,199,0.08); color: var(--primary); display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; }
        .feature-title { font-size: 1.05rem; font-weight: 700; color: var(--foreground); margin-bottom: 0.5rem; }
        .feature-desc { font-size: 0.9rem; color: var(--muted-foreground); line-height: 1.65; }

        /* ── doctors ── */
        .doctors-section { background: var(--background); }
        .doctors-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-top: 3rem; }
        .doctor-card {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 1.25rem; padding: 1.75rem;
          display: flex; flex-direction: column; gap: 1rem;
          transition: all 0.22s ease; cursor: pointer;
        }
        .doctor-card:hover { transform: translateY(-5px); box-shadow: 0 16px 48px rgba(0,0,0,0.1); border-color: var(--ring); }
        .doctor-avatar { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 800; color: var(--primary); }
        .doctor-name { font-size: 1rem; font-weight: 700; color: var(--foreground); }
        .doctor-spec { font-size: 0.82rem; color: var(--primary); font-weight: 600; background: rgba(2,132,199,0.08); padding: 2px 10px; border-radius: 999px; display: inline-block; margin-top: 2px; }
        .doctor-rating { display: flex; align-items: center; gap: 5px; color: #f59e0b; font-size: 0.85rem; font-weight: 600; }
        .doctor-reviews { color: var(--muted-foreground); font-size: 0.8rem; font-weight: 400; margin-left: 2px; }
        .doctor-book { margin-top: auto; width: 100%; justify-content: center; }

        /* ── how it works ── */
        .how-section { background: var(--secondary); }
        .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0; margin-top: 3.5rem; position: relative; }
        .steps::before { content: ''; position: absolute; top: 32px; left: 10%; right: 10%; height: 1px; background: linear-gradient(90deg, transparent, var(--border), var(--border), transparent); z-index: 0; }
        .step { text-align: center; padding: 0 1.5rem; position: relative; z-index: 1; }
        .step-num { width: 64px; height: 64px; border-radius: 50%; background: var(--primary); color: var(--primary-foreground); font-size: 1.4rem; font-weight: 800; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; box-shadow: 0 0 0 8px rgba(2,132,199,0.1); }
        .step-title { font-size: 1rem; font-weight: 700; color: var(--foreground); margin-bottom: 0.5rem; }
        .step-desc { font-size: 0.87rem; color: var(--muted-foreground); line-height: 1.6; }

        /* ── cta banner ── */
        .cta-banner {
          margin: 0 clamp(1.5rem, 5vw, 5rem) clamp(4rem, 8vw, 7rem);
          border-radius: 1.5rem;
          background: linear-gradient(135deg, var(--primary) 0%, #0369a1 50%, #075985 100%);
          padding: clamp(3rem, 6vw, 5rem) clamp(2rem, 5vw, 5rem);
          display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 1.5rem; position: relative; overflow: hidden;
        }
        .cta-banner::before {
          content: ''; position: absolute; top: -50%; left: -20%;
          width: 500px; height: 500px; border-radius: 50%;
          background: rgba(255,255,255,0.05);
        }
        .cta-banner::after {
          content: ''; position: absolute; bottom: -40%; right: -10%;
          width: 400px; height: 400px; border-radius: 50%;
          background: rgba(255,255,255,0.04);
        }
        .cta-title { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; color: #fff; letter-spacing: -0.02em; line-height: 1.2; position: relative; z-index: 1; }
        .cta-sub { font-size: 1.05rem; color: rgba(255,255,255,0.8); max-width: 500px; line-height: 1.65; position: relative; z-index: 1; }
        .cta-btns { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; position: relative; z-index: 1; }
        .btn-white { background: #fff; color: var(--primary); }
        .btn-white:hover { background: var(--secondary); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
        .btn-white-outline { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.5); }
        .btn-white-outline:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); }

        /* ── footer ── */
        .footer { background: var(--foreground); color: rgba(255,255,255,0.6); text-align: center; padding: 2rem; font-size: 0.85rem; }
        .footer strong { color: #fff; }

        /* ── responsive ── */
        @media (max-width: 640px) {
          .stat-div { display: none; }
          .stats-strip { gap: 1.5rem; padding: 1.5rem; }
          .steps::before { display: none; }
          .nav-links .btn-ghost { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .orb, .eyebrow-dot { animation: none; }
          .feature-card:hover, .doctor-card:hover, .btn:hover { transform: none; }
        }
      `}</style>

      <div className="page">

        {/* ── Nav ── */}
        <nav className="nav">
          <a href="/" className="nav-brand">
            <div className="nav-brand-dot"><HeartIcon /></div>
            MediBook
          </a>
          <div className="nav-links">
            <Link to="/login" className="btn btn-ghost">Sign in</Link>
            <Link to="/register" className="btn btn-outline">Register</Link>
            <Link to="/doctor-register" className="btn btn-primary">
            {/* <ThemeTo */}
              Join as Doctor <ChevronIcon />
            </Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="grid-lines" />
          <Orb style={{ width: 500, height: 500, top: -150, left: -150, background: 'rgba(2,132,199,0.07)' }} />
          <Orb style={{ width: 400, height: 400, bottom: -100, right: -100, background: 'rgba(14,165,233,0.06)' }} />

          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Trusted by 8,000+ patients across Pakistan
            </div>

            <h1 className="hero-title">
              Book a{' '}
              <span className="gradient-word">
                <span className="spec-rotator">{specs[activeSpec]}</span>
              </span>
              <br />
              specialist in minutes
            </h1>

            <p className="hero-sub">
              Connect with 500+ verified doctors. Pick a time that suits you,
              skip the waiting room, and get the care you deserve — all in one place.
            </p>

            <div className="hero-cta">
              <Link to="/register" className="btn btn-primary btn-xl">
                Get started free <ChevronIcon />
              </Link>
              <Link to="/login" className="btn btn-outline btn-xl">
                Sign in to your account
              </Link>
            </div>

            <div className="stats-strip">
              <div className="stat-item">
                <div className="stat-num"><Counter target={500} suffix="+" /></div>
                <div className="stat-lbl">Verified doctors</div>
              </div>
              <div className="stat-div" />
              <div className="stat-item">
                <div className="stat-num"><Counter target={8000} suffix="+" /></div>
                <div className="stat-lbl">Happy patients</div>
              </div>
              <div className="stat-div" />
              <div className="stat-item">
                <div className="stat-num"><Counter target={20} suffix="+" /></div>
                <div className="stat-lbl">Specializations</div>
              </div>
              <div className="stat-div" />
              <div className="stat-item">
                <div className="stat-num"><Counter target={98} suffix="%" /></div>
                <div className="stat-lbl">Satisfaction rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="section features">
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="section-label">Why MediBook</div>
            <h2 className="section-title">Healthcare that works around you</h2>
            <p className="section-sub">Everything you need to manage your health, from finding the right doctor to getting reminders for follow-ups.</p>

            <div className="features-grid">
              {[
                { icon: <ShieldIcon />, title: 'License-verified doctors', desc: 'Every doctor is manually reviewed. We verify their license, credentials, and hospital affiliation before they go live.' },
                { icon: <ClockIcon />, title: 'Real-time slot booking', desc: 'See live availability and book a slot in under 60 seconds. No phone calls, no wait music.' },
                { icon: <UserIcon />, title: 'Full appointment history', desc: 'View past visits, medical notes, and prescriptions anytime. Your health record, always in reach.' },
                { icon: <HeartIcon />, title: 'Smart reminders', desc: 'Automatic notifications before your appointment so you never miss a visit or follow-up.' },
              ].map((f) => (
                <div className="feature-card" key={f.title}>
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Doctors ── */}
        <section className="section doctors-section">
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="section-label">Our specialists</div>
            <h2 className="section-title">Meet top-rated doctors</h2>
            <p className="section-sub">Handpicked specialists with verified credentials and consistently excellent patient ratings.</p>

            <div className="doctors-grid">
              {DOCTORS.map((d) => (
                <div className="doctor-card" key={d.name}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div className="doctor-avatar" style={{ background: d.color }}>{d.img}</div>
                    <div>
                      <div className="doctor-name">{d.name}</div>
                      <div className="doctor-spec">{d.spec}</div>
                    </div>
                  </div>
                  <div className="doctor-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ opacity: i < Math.round(d.rating) ? 1 : 0.25 }}><StarIcon /></span>
                    ))}
                    <span>{d.rating}</span>
                    <span className="doctor-reviews">({d.reviews} reviews)</span>
                  </div>
                  <Link to="/register" className="btn btn-outline doctor-book">Book appointment</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="section how-section">
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="section-label">How it works</div>
            <h2 className="section-title">From signup to booked in 3 steps</h2>
            <div className="steps">
              {[
                { n: '1', title: 'Create your account', desc: 'Sign up as a patient in under a minute. No paperwork, no wait.' },
                { n: '2', title: 'Find your doctor', desc: 'Browse by specialization, read reviews, and check real-time availability.' },
                { n: '3', title: 'Book & show up', desc: "Pick a slot, confirm your reason, get a reminder — then just show up." },
              ].map((s) => (
                <div className="step" key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <div className="cta-banner">
          <h2 className="cta-title">Ready to take control<br />of your health?</h2>
          <p className="cta-sub">Join thousands of patients who book smarter, wait less, and get better care.</p>
          <div className="cta-btns">
            <Link to="/register" className="btn btn-white btn-xl">Register as patient</Link>
            <Link to="/doctor-register" className="btn btn-white-outline btn-xl">Join as a doctor</Link>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="footer">
          © 2025 <strong>MediBook</strong>. Built to make healthcare accessible for everyone.
        </footer>

      </div>
    </>
  )
}