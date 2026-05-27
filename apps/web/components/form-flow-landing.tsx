"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "~/hooks/api/auth";

const NAV_LINKS = ["Features", "Templates", "Pricing", "Docs"];

const FEATURES = [
  {
    number: "01",
    title: "Drag & Drop Builder",
    description:
      "Compose forms visually with a fluid drag-and-drop canvas. Add fields, reorder, group — no code required.",
    tag: "Builder",
  },
  {
    number: "02",
    title: "Type-Safe APIs",
    description:
      "Every endpoint is validated end-to-end with tRPC and Zod. Ship without runtime surprises.",
    tag: "Developer",
  },
  {
    number: "03",
    title: "Real-Time Analytics",
    description:
      "Track completion rates, drop-offs and field-level engagement as responses come in.",
    tag: "Analytics",
  },
  {
    number: "04",
    title: "Public & Unlisted",
    description:
      "Publish to your explore page or keep it unlisted — share only with the people you choose.",
    tag: "Visibility",
  },
  {
    number: "05",
    title: "Email Notifications",
    description:
      "Automated emails to creators and respondents the moment a form is submitted.",
    tag: "Automation",
  },
  {
    number: "06",
    title: "Theme Gallery",
    description:
      "Movies, anime, games, tech companies — pick a personality or design your own.",
    tag: "Design",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "0",
    desc: "For individuals getting started",
    features: ["3 active forms", "100 responses/mo", "Basic analytics", "Unlisted sharing"],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "19",
    desc: "For teams shipping serious products",
    features: [
      "Unlimited forms",
      "10,000 responses/mo",
      "Advanced analytics",
      "CSV export",
      "Custom slugs",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "79",
    desc: "For orgs that need control at scale",
    features: [
      "Everything in Pro",
      "Unlimited responses",
      "Admin dashboard",
      "SSO & SAML",
      "SLA support",
      "API access",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

const FIELD_TYPES = [
  { label: "Short Text", icon: "T" },
  { label: "Long Text", icon: "¶" },
  { label: "Email", icon: "@" },
  { label: "Number", icon: "#" },
  { label: "Select", icon: "◎" },
  { label: "Rating", icon: "★" },
  { label: "Date", icon: "▦" },
  { label: "Checkbox", icon: "☑" },
];

const TESTIMONIALS = [
  {
    quote:
      "Form Flow replaced three tools we were juggling. The tRPC integration alone saved us a week of boilerplate.",
    author: "Priya Sharma",
    role: "CTO, Stacklane",
    initials: "PS",
    bg: "#16a34a",
  },
  {
    quote:
      "The theme gallery is genuinely fun. Our respondents actually comment on how good our forms look.",
    author: "Arjun Mehta",
    role: "Product Lead, Velox",
    initials: "AM",
    bg: "#d97706",
  },
  {
    quote:
      "Unlisted forms with direct links changed how we do user research. Clean, fast, zero friction.",
    author: "Sana Qureshi",
    role: "UX Researcher, Figbird",
    initials: "SQ",
    bg: "#dc2626",
  },
];

const A = {
  base:   "rgb(16,185,129)",
  dark:   "rgb(5,150,105)",
  subtle: "rgba(16,185,129,0.15)",
  border: "rgba(16,185,129,0.35)",
  text:   "rgb(52,211,153)",
  glow:   "rgba(16,185,129,0.25)",
};

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible] as const;
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView();
  useEffect(() => {
    if (!visible) return;
    let v = 0;
    const step = Math.ceil(target / 55);
    const t = setInterval(() => {
      v += step;
      if (v >= target) { setCount(target); clearInterval(t); }
      else setCount(v);
    }, 16);
    return () => clearInterval(t);
  }, [visible, target]);
  return <span ref={ref as React.RefObject<HTMLSpanElement>}>{count.toLocaleString()}{suffix}</span>;
}

export default function FormFlowLanding() {
  const router = useRouter();
  const { user } = useUser();

  const handlePlanClick = (planName: string) => {
    if (user?.id) {
      router.push("/dashboard/billing");
    } else {
      router.push(`/login?plan=${planName.toLowerCase()}`);
    }
  };

  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [activeField, setActiveField] = useState(0);
  const [heroRef, heroVisible] = useInView(0.05);
  const [featRef, featVisible] = useInView(0.05);
  const [pricRef, pricVisible] = useInView(0.05);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveField(p => (p + 1) % FIELD_TYPES.length), 1400);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: "#0a0a0a", color: "#e5e5e5", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;1,9..144,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ff-display { font-family: 'Fraunces', serif; }

        .ff-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        .ff-up { opacity: 0; transform: translateY(24px); transition: opacity .55s ease, transform .55s ease; }
        .ff-up.on { opacity: 1; transform: translateY(0); }
        .d1 { transition-delay: .05s; }
        .d2 { transition-delay: .12s; }
        .d3 { transition-delay: .19s; }
        .d4 { transition-delay: .26s; }
        .d5 { transition-delay: .33s; }
        .d6 { transition-delay: .40s; }

        @keyframes ff-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .ff-float { animation: ff-float 5s ease-in-out infinite; }

        @keyframes ff-pulse { 0%{box-shadow:0 0 0 0 rgba(16,185,129,.5)} 70%{box-shadow:0 0 0 10px rgba(16,185,129,0)} 100%{box-shadow:0 0 0 0 rgba(16,185,129,0)} }
        .ff-pulse { animation: ff-pulse 2.4s ease infinite; }

        .ff-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent); }

        .ff-navlink { color: rgba(255,255,255,.5); font-size: 13.5px; font-weight: 500; text-decoration: none; position: relative; transition: color .2s; }
        .ff-navlink:hover { color: #fff; }
        .ff-navlink::after { content:''; position:absolute; bottom:-3px; left:0; width:0; height:1.5px; background:${A.base}; transition:width .25s; }
        .ff-navlink:hover::after { width:100%; }

        .ff-btn-primary {
          background: ${A.base};
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 14px;
          padding: 11px 24px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background .2s, transform .15s;
        }
        .ff-btn-primary:hover { background: ${A.dark}; transform: translateY(-1px); }

        .ff-btn-ghost {
          background: transparent;
          color: rgba(255,255,255,.6);
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: 14px;
          padding: 11px 24px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,.14);
          cursor: pointer;
          transition: border-color .2s, color .2s;
        }
        .ff-btn-ghost:hover { border-color: rgba(255,255,255,.35); color: #fff; }

        .ff-tag {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          font-family: 'DM Sans', sans-serif;
          color: ${A.text};
          background: ${A.subtle};
          border: 1px solid ${A.border};
          padding: 3px 10px;
          border-radius: 99px;
        }

        .ff-card {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 16px;
          transition: border-color .25s;
        }
        .ff-card:hover { border-color: ${A.border}; }

        .ff-input {
          width: 100%;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 8px;
          padding: 10px 14px;
          color: rgba(255,255,255,.75);
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          margin-top: 7px;
          transition: border-color .2s;
        }
        .ff-input:focus { border-color: ${A.border}; }

        .ff-progress { height: 3px; background: rgba(255,255,255,.09); border-radius: 99px; overflow: hidden; }
        .ff-progress-fill { height: 100%; width: 60%; background: linear-gradient(90deg, ${A.base}, #34d399); border-radius: 99px; }

        .ff-stat { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 14px; padding: 28px; text-align: center; }

        .ff-label { font-size: 11px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; color: ${A.base}; font-family: 'DM Sans', sans-serif; }

        .ff-noise::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: .5;
          z-index: 0;
        }

        @media (max-width: 768px) {
          .ff-hero-h { font-size: clamp(36px, 9vw, 56px) !important; }
          .ff-section-h { font-size: clamp(26px, 7vw, 40px) !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        transition: "all .3s",
        ...(scrolled ? { background: "rgba(10,10,10,.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,.06)" } : {}),
      }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="ff-pulse" style={{ width: 30, height: 30, borderRadius: 8, background: A.base, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 11, fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>FF</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-.02em" }}>Form Flow</span>
          </div>

          <div style={{ display: "flex", gap: 32, alignItems: "center" }} className="hidden md:flex">
            {NAV_LINKS.map(l => <a key={l} href={`#${l.toLowerCase()}`} className="ff-navlink">{l}</a>)}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }} className="hidden md:flex">
            <button className="ff-btn-ghost" onClick={() => router.push("/login")}>Sign in</button>
            <button className="ff-btn-primary" onClick={() => router.push("/signup")}>Get started</button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,.6)", cursor: "pointer", padding: 4 }}
            className="md:hidden"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
              {mobileOpen
                ? <path d="M6 6l12 12M18 6L6 18"/>
                : <path d="M3 7h18M3 12h18M3 17h18"/>}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div style={{ background: "rgba(14,14,14,.98)", borderTop: "1px solid rgba(255,255,255,.06)", padding: "16px 24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            {NAV_LINKS.map(l => <a key={l} href={`#${l.toLowerCase()}`} style={{ color: "rgba(255,255,255,.55)", fontSize: 14, textDecoration: "none" }}>{l}</a>)}
            <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
              <button className="ff-btn-ghost" style={{ flex: 1 }} onClick={() => router.push("/login")}>Sign in</button>
              <button className="ff-btn-primary" style={{ flex: 1 }} onClick={() => router.push("/signup")}>Get started</button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        className="ff-grid ff-noise"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "100px 24px 80px",
          background: `radial-gradient(ellipse 80% 55% at 50% -5%, ${A.glow} 0%, transparent 65%), radial-gradient(ellipse 45% 35% at 85% 55%, rgba(220,38,38,.08) 0%, transparent 60%)`,
        }}
      >
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>

          <div className={`ff-up d1 ${heroVisible ? "on" : ""}`} style={{ marginBottom: 20 }}>
            <span className="ff-tag">Form infrastructure for modern teams</span>
          </div>

          <h1
            className={`ff-display ff-up d2 ff-hero-h ${heroVisible ? "on" : ""}`}
            style={{ fontSize: "clamp(42px, 6vw, 78px)", lineHeight: 1.06, color: "#fff", maxWidth: 820, fontWeight: 300 }}
          >
            Forms that feel like{" "}
            <em style={{ color: A.text, fontStyle: "italic" }}>products,</em>
            <br />not paperwork.
          </h1>

          <p className={`ff-up d3 ${heroVisible ? "on" : ""}`} style={{ color: "rgba(255,255,255,.45)", fontSize: 16, lineHeight: 1.75, marginTop: 24, maxWidth: 480 }}>
            Build dynamic forms, collect responses at scale, and understand your
            audience — in a type-safe, developer-first platform.
          </p>

          <div className={`ff-up d4 ${heroVisible ? "on" : ""}`} style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 36, justifyContent: "center" }}>
            <button className="ff-btn-primary" style={{ padding: "13px 30px", fontSize: 15 }} onClick={() => router.push("/signup")}>Start building free</button>
            <button className="ff-btn-ghost" style={{ padding: "13px 30px", fontSize: 15 }} onClick={() => router.push("/login")}>View live demo →</button>
          </div>

          {/* Floating mock form */}
          <div
            className={`ff-float ff-up d5 ${heroVisible ? "on" : ""}`}
            style={{
              marginTop: 56,
              width: "100%",
              maxWidth: 420,
              background: "rgba(255,255,255,.04)",
              border: "1px solid rgba(255,255,255,.09)",
              borderRadius: 18,
              padding: 28,
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <p style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>User Research Survey</p>
                <p style={{ color: "rgba(255,255,255,.35)", fontSize: 12, marginTop: 3 }}>3 of 5 questions</p>
              </div>
              <span className="ff-tag">LIVE</span>
            </div>
            <div className="ff-progress" style={{ marginBottom: 22 }}>
              <div className="ff-progress-fill" />
            </div>
            <label style={{ color: "rgba(255,255,255,.5)", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>
              What is your role?
            </label>
            <input className="ff-input" placeholder="e.g. Product Designer" readOnly />
            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              {["← Back", "Continue →"].map((t, i) => (
                <button key={t} style={{
                  flex: 1, padding: "10px 0", borderRadius: 8, fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: "pointer",
                  background: i === 1 ? A.base : "rgba(255,255,255,.06)",
                  color: i === 1 ? "#fff" : "rgba(255,255,255,.4)",
                  border: i === 1 ? "none" : "1px solid rgba(255,255,255,.08)",
                  transition: "all .2s",
                }}>{t}</button>
              ))}
            </div>
          </div>

          {/* Field type pills */}
          <div className={`ff-up d6 ${heroVisible ? "on" : ""}`} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 28, justifyContent: "center" }}>
            {FIELD_TYPES.map((f, i) => (
              <span key={f.label} style={{
                fontSize: 12, fontWeight: 500, padding: "6px 13px", borderRadius: 99,
                background: i === activeField ? A.subtle : "rgba(255,255,255,.05)",
                border: `1px solid ${i === activeField ? A.border : "rgba(255,255,255,.07)"}`,
                color: i === activeField ? A.text : "rgba(255,255,255,.4)",
                transition: "all .3s",
              }}>
                <span style={{ marginRight: 5, opacity: .7 }}>{f.icon}</span>{f.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "56px 24px", borderTop: "1px solid rgba(255,255,255,.05)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { value: 12000, suffix: "+",  label: "Forms created" },
            { value: 98,    suffix: "%",  label: "Uptime SLA" },
            { value: 340,   suffix: "K+", label: "Responses collected" },
            { value: 4200,  suffix: "+",  label: "Developers using API" },
          ].map(s => (
            <div key={s.label} className="ff-stat">
              <div className="ff-display" style={{ fontSize: "clamp(44px, 6vw, 72px)", lineHeight: 1, color: "#fff", fontWeight: 300 }}>
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <p style={{ color: "rgba(255,255,255,.35)", fontSize: 12, marginTop: 8, letterSpacing: ".04em" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "88px 24px" }} ref={featRef as React.RefObject<HTMLElement>}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div className={`ff-up ${featVisible ? "on" : ""}`} style={{ marginBottom: 56 }}>
            <p className="ff-label" style={{ marginBottom: 12 }}>What you get</p>
            <h2 className="ff-display ff-section-h" style={{ fontSize: "clamp(30px, 3.8vw, 50px)", color: "#fff", fontWeight: 300, lineHeight: 1.12 }}>
              Everything forms need.{" "}
              <em style={{ color: "rgba(255,255,255,.3)", fontStyle: "italic" }}>Nothing they don&apos;t.</em>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={f.number} className={`ff-card ff-up d${Math.min(i+1,6)} ${featVisible ? "on" : ""}`} style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <span className="ff-display" style={{ fontSize: 40, lineHeight: 1, color: "rgba(16,185,129,.25)", fontWeight: 300 }}>{f.number}</span>
                  <span className="ff-tag">{f.tag}</span>
                </div>
                <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: "rgba(255,255,255,.42)", fontSize: 13.5, lineHeight: 1.65 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="ff-divider" style={{ margin: "0 24px" }} />

      {/* BUILDER PREVIEW */}
      <section style={{ padding: "88px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 64, alignItems: "center" }}>
          <div>
            <p className="ff-label" style={{ marginBottom: 16 }}>Form Builder</p>
            <h2 className="ff-display ff-section-h" style={{ fontSize: "clamp(28px, 3.5vw, 46px)", color: "#fff", fontWeight: 300, lineHeight: 1.12, marginBottom: 20 }}>
              From blank canvas to{" "}
              <em style={{ color: A.text }}>live form</em> in minutes.
            </h2>
            <p style={{ color: "rgba(255,255,255,.42)", fontSize: 14, lineHeight: 1.8, marginBottom: 28, maxWidth: 400 }}>
              Add fields, configure validations, pick a theme and hit publish. Your form
              is live — shareable via link or embeddable anywhere.
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Zod-validated schemas, always consistent",
                "Public & unlisted visibility modes",
                "No login required for respondents",
                "Real-time response dashboard",
              ].map(item => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13.5, color: "rgba(255,255,255,.55)" }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: A.subtle, border: `1px solid ${A.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke={A.base} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.07)", background: "rgba(255,255,255,.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
              {["#f87171","#fbbf24","#34d399"].map(c => (
                <span key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: .6 }} />
              ))}
              <span style={{ marginLeft: 10, fontSize: 12, color: "rgba(255,255,255,.25)", fontFamily: "'DM Sans', sans-serif" }}>formflow.app/builder</span>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 14 }}>
                <div style={{ width: 112, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                  {FIELD_TYPES.slice(0, 5).map((f, i) => (
                    <div key={f.label} style={{
                      fontSize: 12, padding: "8px 10px", borderRadius: 8, cursor: "pointer",
                      background: i === 0 ? A.subtle : "rgba(255,255,255,.04)",
                      color: i === 0 ? A.text : "rgba(255,255,255,.32)",
                      border: `1px solid ${i === 0 ? A.border : "transparent"}`,
                    }}>
                      <span style={{ marginRight: 5 }}>{f.icon}</span>{f.label}
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { q: "Full name", type: "Short Text" },
                    { q: "Work email", type: "Email" },
                    { q: "Company size", type: "Select" },
                  ].map((field, i) => (
                    <div key={field.q} style={{
                      padding: "12px 14px", borderRadius: 10,
                      background: i === 1 ? A.subtle : "rgba(255,255,255,.04)",
                      border: `1px solid ${i === 1 ? A.border : "rgba(255,255,255,.07)"}`,
                    }}>
                      <p style={{ color: "rgba(255,255,255,.7)", fontSize: 12, fontWeight: 500 }}>{field.q}</p>
                      <p style={{ color: "rgba(255,255,255,.25)", fontSize: 11, marginTop: 2 }}>{field.type}</p>
                    </div>
                  ))}
                  <button style={{
                    padding: "9px 0", borderRadius: 10, fontSize: 12,
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: "pointer",
                    background: "rgba(255,255,255,.02)",
                    border: "1px dashed rgba(255,255,255,.1)",
                    color: "rgba(255,255,255,.28)",
                  }}>+ Add field</button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.05)" }}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.28)" }}>Draft · 3 fields</span>
                <button className="ff-btn-primary" style={{ padding: "7px 16px", fontSize: 12 }}>Publish form</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="ff-divider" style={{ margin: "0 24px" }} />

      {/* TESTIMONIALS */}
      <section style={{ padding: "88px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <p className="ff-label" style={{ marginBottom: 14, textAlign: "center" }}>Testimonials</p>
          <h2 className="ff-display" style={{ fontSize: "clamp(28px, 3.5vw, 46px)", color: "#fff", fontWeight: 300, textAlign: "center", marginBottom: 52 }}>
            Trusted by builders.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.author} className="ff-card" style={{ padding: 24 }}>
                <p style={{ color: "rgba(255,255,255,.55)", fontSize: 14, lineHeight: 1.75, marginBottom: 24 }}>&ldquo;{t.quote}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{t.initials}</span>
                  </div>
                  <div>
                    <p style={{ color: "#fff", fontSize: 13.5, fontWeight: 600 }}>{t.author}</p>
                    <p style={{ color: "rgba(255,255,255,.32)", fontSize: 12, marginTop: 1 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="ff-divider" style={{ margin: "0 24px" }} />

      {/* PRICING */}
      <section id="pricing" style={{ padding: "88px 24px" }} ref={pricRef as React.RefObject<HTMLElement>}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div className={`ff-up ${pricVisible ? "on" : ""}`} style={{ textAlign: "center", marginBottom: 52 }}>
            <p className="ff-label" style={{ marginBottom: 12 }}>Pricing</p>
            <h2 className="ff-display" style={{ fontSize: "clamp(28px, 3.5vw, 46px)", color: "#fff", fontWeight: 300 }}>
              Simple, honest pricing.
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 16 }}>
            {PLANS.map((plan, i) => (
              <div
                key={plan.name}
                className={`ff-up d${i+1} ${pricVisible ? "on" : ""}`}
                style={{
                  borderRadius: 18, padding: 28,
                  display: "flex", flexDirection: "column",
                  background: plan.highlighted ? A.subtle : "rgba(255,255,255,.03)",
                  border: `1px solid ${plan.highlighted ? A.border : "rgba(255,255,255,.07)"}`,
                }}
              >
                {plan.highlighted && (
                  <span className="ff-tag" style={{ alignSelf: "flex-start", marginBottom: 14 }}>Most popular</span>
                )}
                <p style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{plan.name}</p>
                <p style={{ color: "rgba(255,255,255,.38)", fontSize: 12, marginTop: 4, marginBottom: 18 }}>{plan.desc}</p>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 22 }}>
                  <span className="ff-display" style={{ fontSize: 52, lineHeight: 1, color: "#fff", fontWeight: 300 }}>${plan.price}</span>
                  <span style={{ color: "rgba(255,255,255,.32)", fontSize: 13, marginBottom: 6 }}>/mo</span>
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, flex: 1, marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "rgba(255,255,255,.52)" }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                        <circle cx="7" cy="7" r="6.5" stroke={A.border}/>
                        <path d="M4.5 7l2 2 3-3" stroke={A.base} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePlanClick(plan.name)}
                  style={{
                    padding: 12, borderRadius: 10, fontSize: 14, width: "100%",
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: "pointer",
                    background: plan.highlighted ? A.base : "rgba(255,255,255,.07)",
                    color: plan.highlighted ? "#fff" : "rgba(255,255,255,.6)",
                    border: plan.highlighted ? "none" : "1px solid rgba(255,255,255,.1)",
                    transition: "all .2s",
                  }}>{plan.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="ff-divider" style={{ margin: "0 24px" }} />

      {/* CTA */}
      <section style={{ padding: "96px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 90% 70% at 50% 50%, ${A.glow} 0%, transparent 70%)`, pointerEvents: "none" }} />
          <p className="ff-label" style={{ marginBottom: 18, position: "relative" }}>Get started today</p>
          <h2 className="ff-display" style={{ fontSize: "clamp(32px, 4.5vw, 58px)", color: "#fff", fontWeight: 300, lineHeight: 1.1, marginBottom: 20, position: "relative" }}>
            Your first form is<br />
            <em style={{ color: A.text }}>one click away.</em>
          </h2>
          <p style={{ color: "rgba(255,255,255,.38)", fontSize: 14, lineHeight: 1.75, marginBottom: 36, position: "relative" }}>
            No credit card required. Free plan forever. Cancel anytime.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", position: "relative" }}>
            <button className="ff-btn-primary" style={{ padding: "13px 32px", fontSize: 15 }} onClick={() => router.push("/signup")}>Create your first form</button>
            <button className="ff-btn-ghost" style={{ padding: "13px 32px", fontSize: 15 }}>View API docs</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: A.base, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 10, fontWeight: 800 }}>FF</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: 14, color: "rgba(255,255,255,.75)" }}>Form Flow</span>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {["Privacy","Terms","Docs","GitHub","Status"].map(l => (
              <a key={l} href="#" style={{ color: "rgba(255,255,255,.3)", fontSize: 12, textDecoration: "none", transition: "color .2s" }}
                onMouseEnter={e => (e.target as HTMLAnchorElement).style.color = "rgba(255,255,255,.7)"}
                onMouseLeave={e => (e.target as HTMLAnchorElement).style.color = "rgba(255,255,255,.3)"}
              >{l}</a>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,.22)", fontSize: 12 }}>© 2025 Form Flow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
