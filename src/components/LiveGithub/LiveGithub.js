import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import GitHubCalendar from "react-github-calendar";
import { AiFillGithub, AiOutlineStar, AiOutlineFork } from "react-icons/ai";
import { BsDot } from "react-icons/bs";
import useTilt from "../../hooks/useTilt";
import useSpotlight from "../../hooks/useSpotlight";
import "./LiveGithub.css";

function TiltCard({ children, className = "", ...rest }) {
  const tilt = useTilt({ max: 4, scale: 1.005 });
  return (
    <motion.div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className={`live-github-card tilt-card ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

const GH_USER = "PuditC";
const API = "https://api.github.com";

// Module-level cache: the component unmounts/remounts on every section change,
// and the unauthenticated GitHub API is capped at 60 req/hr per IP. Caching the
// first successful response keeps navigation from burning through that budget.
let ghCache = null; // { repos, events }

const LANG_COLOR = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Dart: "#00B4AB",
  "C#": "#178600",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
  Shell: "#89e051",
  Java: "#b07219",
  Vue: "#41b883",
  Go: "#00ADD8",
};

function eventToLine(e) {
  const repo = e.repo?.name || "";
  const short = repo.split("/").pop();
  const when = new Date(e.created_at);
  const rel = timeAgo(when);
  switch (e.type) {
    case "PushEvent": {
      const n = e.payload?.commits?.length || 0;
      const msg = e.payload?.commits?.[0]?.message?.split("\n")[0] || "";
      return { icon: "⬆", text: `pushed ${n} commit${n === 1 ? "" : "s"} to ${short}`, sub: msg, rel };
    }
    case "PullRequestEvent":
      return {
        icon: "◆",
        text: `${e.payload?.action || "updated"} PR on ${short}`,
        sub: e.payload?.pull_request?.title,
        rel,
      };
    case "IssuesEvent":
      return {
        icon: "●",
        text: `${e.payload?.action || "updated"} issue on ${short}`,
        sub: e.payload?.issue?.title,
        rel,
      };
    case "CreateEvent":
      return { icon: "＋", text: `created ${e.payload?.ref_type} ${short}`, sub: e.payload?.ref, rel };
    case "WatchEvent":
      return { icon: "★", text: `starred ${short}`, sub: "", rel };
    case "ForkEvent":
      return { icon: "⑂", text: `forked ${short}`, sub: "", rel };
    default:
      return { icon: "·", text: `${e.type.replace("Event", "")} on ${short}`, sub: "", rel };
  }
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function LiveGithub() {
  const [repos, setRepos] = useState(null);
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (ghCache) {
      setRepos(ghCache.repos);
      setEvents(ghCache.events);
      return;
    }
    Promise.all([
      axios.get(`${API}/users/${GH_USER}/repos?sort=updated&per_page=6`),
      axios.get(`${API}/users/${GH_USER}/events/public?per_page=10`),
    ])
      .then(([r, e]) => {
        ghCache = { repos: r.data, events: e.data };
        if (!mounted) return;
        setRepos(r.data);
        setEvents(e.data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.response?.status === 403 ? "rate-limited" : "offline");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const langTotals = (repos || []).reduce((acc, r) => {
    if (r.language) acc[r.language] = (acc[r.language] || 0) + 1;
    return acc;
  }, {});
  const langList = Object.entries(langTotals).sort((a, b) => b[1] - a[1]);
  const langSum = langList.reduce((s, [, n]) => s + n, 0) || 1;

  return (
    <LiveGithubWrap>
      <motion.div
        className="live-github-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2>
          <AiFillGithub /> Live from GitHub
        </h2>
        <p>Pulled straight from the GitHub API — no edits, no snapshots.</p>
      </motion.div>

      <div className="live-github-grid">
        {/* Activity */}
        <TiltCard
          className="activity"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="card-title">
            Recent Activity <BsDot className="live-dot" />
          </div>
          {!events && !error && <div className="skeleton-list" />}
          {error && (
            <div className="lg-error">
              {error === "rate-limited"
                ? "GitHub rate limit hit — refresh in a minute."
                : "Couldn't reach GitHub right now."}
            </div>
          )}
          {events && (
            <ul className="activity-list">
              {events.slice(0, 7).map((e) => {
                const line = eventToLine(e);
                return (
                  <li key={e.id}>
                    <span className="ev-icon">{line.icon}</span>
                    <div className="ev-body">
                      <div className="ev-text">{line.text}</div>
                      {line.sub && <div className="ev-sub">{line.sub}</div>}
                    </div>
                    <span className="ev-time">{line.rel}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </TiltCard>

        {/* Language bar */}
        <TiltCard
          className="langs"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="card-title">Languages in recent repos</div>
          {langList.length === 0 ? (
            <div className="skeleton-bar" />
          ) : (
            <>
              <div className="lang-bar">
                {langList.map(([lang, n]) => (
                  <div
                    key={lang}
                    className="lang-seg"
                    style={{
                      width: `${(n / langSum) * 100}%`,
                      background: LANG_COLOR[lang] || "#888",
                    }}
                    title={`${lang} — ${n}`}
                  />
                ))}
              </div>
              <ul className="lang-legend">
                {langList.slice(0, 6).map(([lang, n]) => (
                  <li key={lang}>
                    <span
                      className="lang-dot"
                      style={{ background: LANG_COLOR[lang] || "#888" }}
                    />
                    {lang}
                    <span className="lang-n">{n}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </TiltCard>

        {/* Recent repos */}
        <TiltCard
          className="repos"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="card-title">Recently updated repos</div>
          {!repos && !error && <div className="skeleton-list" />}
          {repos && (
            <ul className="repo-list">
              {repos.slice(0, 5).map((r) => (
                <li key={r.id}>
                  <a href={r.html_url} target="_blank" rel="noopener noreferrer">
                    <div className="repo-name">{r.name}</div>
                    <div className="repo-desc">{r.description || "—"}</div>
                    <div className="repo-meta">
                      {r.language && (
                        <span>
                          <span
                            className="lang-dot"
                            style={{ background: LANG_COLOR[r.language] || "#888" }}
                          />
                          {r.language}
                        </span>
                      )}
                      <span>
                        <AiOutlineStar /> {r.stargazers_count}
                      </span>
                      <span>
                        <AiOutlineFork /> {r.forks_count}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </TiltCard>

        {/* Contribution calendar */}
        <TiltCard
          className="calendar"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <div className="card-title">Contribution heatmap</div>
          <div className="calendar-inner">
            <GitHubCalendar
              username={GH_USER}
              blockSize={11}
              blockMargin={3}
              color="#818cf8"
              fontSize={12}
            />
          </div>
        </TiltCard>
      </div>
    </LiveGithubWrap>
  );
}

function LiveGithubWrap({ children }) {
  const spot = useSpotlight();
  return (
    <div
      className="live-github spotlight"
      ref={spot.ref}
      onMouseMove={spot.onMouseMove}
      onMouseLeave={spot.onMouseLeave}
    >
      {children}
    </div>
  );
}
