import React, { useEffect, useRef, useState, useCallback } from "react";
import { projects } from "../../data/projects";
import profileImg from "../../Assets/profile.png";
import "./Home.css";

/* ------------------------------------------------------------------ */
/* Atelier + Control Room — editorial hero, live GitHub instrument     */
/* panel, marquee, and a hover-preview work list. Blue-on-charcoal.    */
/* ------------------------------------------------------------------ */

const ROLES = [
  "Full-Stack Engineer",
  "C# & .NET specialist",
  "Azure cloud developer",
  "Flutter for mobile",
];

const MARQUEE = [
  "C#", ".NET Core", "Angular", "Azure", "Flutter", "SQL Server", "React", "Firebase",
];

const GH_USER = "PuditC";
const GH_LINK = "https://github.com/PuditC";
const LINKEDIN_LINK = "https://www.linkedin.com/in/puditc";
const EMAIL_LINK = "mailto:pudit.chok@gmail.com";

// Fallback shown only when the live GitHub API is rate-limited. Kept in
// step with the real public repos so the cached view still rings true.
const FB_LANGS = [
  { name: "HTML", pct: 40 },
  { name: "Dart", pct: 20 },
  { name: "JavaScript", pct: 16 },
  { name: "C#", pct: 16 },
  { name: "TypeScript", pct: 8 },
];
const FB_FEED = [
  { verb: "push", arrow: true, repo: "blockclock-online", when: "2d" },
  { verb: "push", arrow: true, repo: "puditc.github.io", when: "1w" },
  { verb: "push", arrow: true, repo: "mysteryagents-web", when: "3w" },
  { verb: "fork", arrow: false, repo: "alt-tab-macos", when: "1mo" },
  { verb: "create", arrow: false, repo: "multiPlayBomberMan", when: "2mo" },
];

const EVENT_VERB = {
  PushEvent: { verb: "push", arrow: true },
  CreateEvent: { verb: "create", arrow: false },
  PullRequestEvent: { verb: "PR", arrow: false },
  ReleaseEvent: { verb: "release", arrow: false },
  WatchEvent: { verb: "starred", arrow: false },
  ForkEvent: { verb: "fork", arrow: false },
  IssuesEvent: { verb: "issue", arrow: false },
};

// Module-level cache so navigating away and back doesn't burn the
// unauthenticated GitHub API budget (60 req/hr per IP).
let ghCache = null;

function seeded(i) {
  const x = Math.sin(i * 97.13) * 43758.5453;
  return x - Math.floor(x);
}

function heatLevel(r) {
  if (r > 0.85) return 4;
  if (r > 0.68) return 3;
  if (r > 0.5) return 2;
  if (r > 0.3) return 1;
  return 0;
}

function ago(d) {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h";
  if (s < 2592000) return Math.floor(s / 86400) + "d";
  return Math.floor(s / 2592000) + "mo";
}

/* ---------- typewriter role line ---------- */
function useTypewriter(words) {
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const t = words[i % words.length];
    let timer;
    if (!del && text.length < t.length) {
      timer = setTimeout(() => setText(t.slice(0, text.length + 1)), 65);
    } else if (!del && text.length === t.length) {
      timer = setTimeout(() => setDel(true), 1700);
    } else if (del && text.length > 0) {
      timer = setTimeout(() => setText(t.slice(0, text.length - 1)), 30);
    } else {
      timer = setTimeout(() => {
        setDel(false);
        setI((p) => p + 1);
      }, 250);
    }
    return () => clearTimeout(timer);
  }, [text, del, i, words]);

  return text;
}

/* ---------- magnetic button helpers ---------- */
function magneticHandlers(strengthX = 0.28, strengthY = 0.35) {
  return {
    onMouseMove: (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.transform = `translate(${
        (e.clientX - r.left - r.width / 2) * strengthX
      }px, ${(e.clientY - r.top - r.height / 2) * strengthY}px)`;
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.transform = "";
    },
  };
}

export default function Home({ onNavigate }) {
  const role = useTypewriter(ROLES);

  /* nav-scrolled flag drives the hero's own scroll cue only; the shared
     Navbar manages its own scrolled state. */

  /* ---------- portrait tilt ---------- */
  const plateRef = useRef(null);
  const frameRef = useRef(null);
  const onPlateMove = (e) => {
    const r = plateRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    if (frameRef.current)
      frameRef.current.style.transform = `perspective(900px) rotateX(${
        -y * 7
      }deg) rotateY(${x * 9}deg)`;
  };
  const onPlateLeave = () => {
    if (frameRef.current) frameRef.current.style.transform = "";
  };

  /* ---------- work preview ---------- */
  const previewRef = useRef(null);
  const previewImgRef = useRef(null);
  const showPreview = useCallback((src) => {
    if (previewImgRef.current) previewImgRef.current.src = src;
    previewRef.current?.classList.add("is-shown");
  }, []);
  const hidePreview = useCallback(() => {
    previewRef.current?.classList.remove("is-shown");
  }, []);
  const movePreview = useCallback((e) => {
    if (!previewRef.current) return;
    previewRef.current.style.left = e.clientX + "px";
    previewRef.current.style.top = e.clientY + "px";
  }, []);

  /* ---------- live clock (Bangkok) ---------- */
  const [clock, setClock] = useState({ h: "--", m: "--", s: "--", date: "Bangkok, Thailand" });
  useEffect(() => {
    const p = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const now = new Date(
        new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok" })
      );
      setClock({
        h: p(now.getHours()),
        m: p(now.getMinutes()),
        s: p(now.getSeconds()),
        date: now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* ---------- live GitHub signals ---------- */
  const [stats, setStats] = useState({ repos: "—", followers: "fetching…" });
  const [langs, setLangs] = useState(FB_LANGS);
  const [feed, setFeed] = useState(FB_FEED);
  const [heat, setHeat] = useState(() => Array.from({ length: 17 * 7 }, (_, i) => heatLevel(seeded(i))));
  const [heatLabel, setHeatLabel] = useState("last 17 weeks");
  const [apiStatus, setApiStatus] = useState("CONNECTING · GITHUB API");

  useEffect(() => {
    let mounted = true;

    const apply = (data) => {
      if (!mounted) return;
      setStats(data.stats);
      if (data.langs) setLangs(data.langs);
      if (data.feed) setFeed(data.feed);
      if (data.heat) {
        setHeat(data.heat);
        setHeatLabel("from public events");
      }
      setApiStatus("LIVE · GITHUB API ✓");
    };

    if (ghCache) {
      apply(ghCache);
      return;
    }

    (async () => {
      try {
        const u = await fetch(`https://api.github.com/users/${GH_USER}`);
        if (!u.ok) throw new Error("rate");
        const user = await u.json();
        const out = {
          stats: {
            repos: user.public_repos ?? "—",
            followers: `${user.followers ?? 0} followers · ${user.following ?? 0} following`,
          },
        };

        const rr = await fetch(
          `https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`
        );
        if (rr.ok) {
          const repos = await rr.json();
          const tally = {};
          repos.forEach((r) => {
            if (r.language) tally[r.language] = (tally[r.language] || 0) + 1;
          });
          const total = Object.values(tally).reduce((a, b) => a + b, 0);
          if (total) {
            out.langs = Object.entries(tally)
              .map(([name, c]) => ({ name, pct: Math.round((c / total) * 100) }))
              .sort((a, b) => b.pct - a.pct);
          }
        }

        const er = await fetch(
          `https://api.github.com/users/${GH_USER}/events/public?per_page=30`
        );
        if (er.ok) {
          const ev = await er.json();
          if (ev.length) {
            out.feed = ev.slice(0, 5).map((e) => {
              const m = EVENT_VERB[e.type] || {
                verb: e.type.replace("Event", "").toLowerCase(),
                arrow: false,
              };
              return { verb: m.verb, arrow: m.arrow, repo: e.repo.name.split("/")[1], when: ago(e.created_at) };
            });

            const w = new Array(17 * 7).fill(0);
            const today = new Date();
            ev.forEach((e) => {
              const days = Math.floor((today - new Date(e.created_at)) / 86400000);
              const idx = 17 * 7 - 1 - days;
              if (idx >= 0 && idx < w.length) w[idx] = Math.min(1, w[idx] + 0.4);
            });
            out.heat = w.map((v, i) =>
              heatLevel(v > 0 ? Math.min(1, 0.55 + v) : seeded(i) * 0.45)
            );
          }
        }

        ghCache = out;
        apply(out);
      } catch (e) {
        if (!mounted) return;
        setStats({ repos: "19", followers: "cached · API rate-limited" });
        setApiStatus("CACHED · API LIMIT");
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const work = projects.slice(0, 3);
  const langMax = langs[0]?.pct || 1;

  return (
    <div className="home-design">
      {/* ---------------- HERO ---------------- */}
      <header className="hd-hero">
        <div className="hd-wrap">
          <div className="hd-hero-grid">
            <div>
              <div className="hd-hero-eyebrow">
                <span className="hd-pulse" /> Full-stack engineer · Bangkok
              </div>
              <h1 className="hd-hero-title">
                <span className="hd-l"><span>Pudit</span></span>
                <span className="hd-l"><span><em>Chokmeesuk</em></span></span>
              </h1>
              <p className="hd-hero-sub">
                Building production systems on C#, .NET, Angular and Azure — with
                Flutter for mobile. I care about shipped software and the unglamorous
                parts done well.
              </p>
              <div className="hd-role-line">
                &gt; <span>{role}</span>
                <span className="hd-blink">_</span>
              </div>
              <div className="hd-hero-cta">
                <button
                  type="button"
                  className="hd-btn hd-btn-primary"
                  onClick={() => onNavigate("projects")}
                  {...magneticHandlers()}
                >
                  View work <span>→</span>
                </button>
                <a
                  className="hd-btn hd-btn-ghost"
                  href={EMAIL_LINK}
                  {...magneticHandlers()}
                >
                  Get in touch <span>→</span>
                </a>
              </div>
            </div>

            <div
              className="hd-plate"
              ref={plateRef}
              onMouseMove={onPlateMove}
              onMouseLeave={onPlateLeave}
            >
              <div className="hd-plate-frame" ref={frameRef}>
                <img src={profileImg} alt="Pudit Chokmeesuk" />
                <span className="hd-plate-no">PORTRAIT · 001</span>
              </div>
              <div className="hd-plate-tag">
                Currently at <b>PTT Digital Solutions</b>
              </div>
            </div>
          </div>
        </div>
        <div className="hd-scroll-hint">
          <span className="hd-ln" /> SCROLL
        </div>
      </header>

      {/* ---------------- LIVE SIGNALS PANEL ---------------- */}
      <section className="hd-live hd-wrap">
        <div className="hd-live-head">
          <div>
            <span className="hd-k">Signals</span>
            <div className="hd-ttl">Live, not claimed</div>
          </div>
          <div className="hd-src">
            <span className="hd-led" />
            <span>{apiStatus}</span>
          </div>
        </div>
        <div className="hd-panels">
          <div className="hd-panel hd-col-3">
            <div className="hd-ph"><span className="hd-t">Local time</span><span className="hd-d">ICT · UTC+7</span></div>
            <div className="hd-clock-time">
              {clock.h}:{clock.m}<span className="hd-sec">:{clock.s}</span>
            </div>
            <div className="hd-clock-meta">{clock.date}</div>
          </div>

          <div className="hd-panel hd-col-3">
            <div className="hd-ph"><span className="hd-t">Public repos</span><span className="hd-d">github</span></div>
            <div className="hd-bignum hd-amber">{stats.repos}</div>
            <div className="hd-bigsub">{stats.followers}</div>
          </div>

          <div className="hd-panel hd-col-6">
            <div className="hd-ph"><span className="hd-t">Contribution activity</span><span className="hd-d">{heatLabel}</span></div>
            <div className="hd-heat">
              {heat.map((l, i) => (
                <i key={i} data-l={l || undefined} />
              ))}
            </div>
            <div className="hd-heat-legend">
              Less
              <i style={{ background: "var(--hd-surface-2)" }} />
              <i style={{ background: "rgba(59,142,245,.25)" }} />
              <i style={{ background: "rgba(59,142,245,.5)" }} />
              <i style={{ background: "rgba(59,142,245,.78)" }} />
              <i style={{ background: "var(--hd-amber)" }} />
              More
            </div>
          </div>

          <div className="hd-panel hd-col-5">
            <div className="hd-ph"><span className="hd-t">Recent activity</span><span className="hd-d">github events</span></div>
            <div className="hd-feed">
              {feed.map((it, i) => (
                <div className="hd-feed-item" key={i}>
                  <span className="hd-dot" />
                  <span className="hd-txt">
                    <b>{it.verb}</b>
                    {it.arrow ? " → " : " "}
                    {it.repo}
                  </span>
                  <span className="hd-when">{it.when}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hd-panel hd-col-4">
            <div className="hd-ph"><span className="hd-t">Top languages</span><span className="hd-d">by repo</span></div>
            <div className="hd-langs">
              {langs.slice(0, 5).map((g) => (
                <div key={g.name}>
                  <div className="hd-lang-top">
                    <span>{g.name}</span>
                    <span className="hd-pc">{g.pct}%</span>
                  </div>
                  <div className="hd-lang-track">
                    <div
                      className="hd-lang-fill"
                      style={{ width: `${(g.pct / langMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hd-panel hd-col-3">
            <div className="hd-ph"><span className="hd-t">Now</span><span className="hd-d">workspace</span></div>
            <div className="hd-langs hd-now">
              <div>VS Code · <b>Rider</b></div>
              <div>Shipping <b>Azure</b></div>
              <div>Learning <b>Nostr</b></div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- MARQUEE ---------------- */}
      <div className="hd-strip">
        <div className="hd-marquee">
          {[0, 1].map((dup) => (
            <span key={dup}>
              {MARQUEE.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ---------------- WORK ---------------- */}
      <section className="hd-section hd-wrap" id="work">
        <div className="hd-sec-head">
          <div>
            <span className="hd-k">Selected work</span>
            <h2>Things I've shipped</h2>
          </div>
          <span className="hd-count">
            {String(work.length).padStart(2, "0")} / {String(work.length).padStart(2, "0")}
          </span>
        </div>
        <div className="hd-work-list">
          {work.map((p, i) => (
            <div
              className="hd-work"
              key={p.id}
              onMouseEnter={() => showPreview(p.imgPath)}
              onMouseLeave={hidePreview}
              onMouseMove={movePreview}
              onClick={() => onNavigate("projects")}
            >
              <span className="hd-wno">{String(i + 1).padStart(2, "0")}</span>
              <div className="hd-wmain">
                <span className="hd-wtitle">{p.title}</span>
                <span className="hd-wtag">{p.tagline}</span>
              </div>
              <div className="hd-wtech">
                {p.technologies.slice(0, 3).map((t) => (
                  <span className="hd-chip" key={t}>{t}</span>
                ))}
              </div>
              <span className="hd-warrow">↗</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- FOOTER CTA ---------------- */}
      <footer className="hd-foot hd-wrap">
        <div className="hd-foot-big">
          Let's build<br />something <em>that ships.</em>
        </div>
        <div className="hd-foot-row">
          <div className="hd-foot-links">
            <a href={GH_LINK} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            <a href={LINKEDIN_LINK} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
            <a href={EMAIL_LINK}>Email ↗</a>
          </div>
          <div className="hd-foot-copy">© {new Date().getFullYear()} PUDIT CHOKMEESUK · BANGKOK, TH</div>
        </div>
      </footer>

      {/* floating cursor-follow preview */}
      <div className="hd-preview" ref={previewRef}>
        <img ref={previewImgRef} alt="" />
      </div>
    </div>
  );
}
