import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { projects } from "../../data/projects";
import { experience } from "../../data/experience";
import "./Terminal.css";

const BANNER = [
  "       _ _ _                                   _",
  "  _ __(_|_) |_   _ _ _ __ ___   ___  __ _ _ __| |__",
  " | '_ \\ | | | | | | | | '_ ` _ \\ / _ \\/ _` | '__| '_ \\",
  " | |_) | | | | |_| | | | | | | | |  __/ (_| | |  | | | |",
  " | .__/|_|_|\\__\\__,_|_|_| |_| |_|\\___|\\__,_|_|  |_| |_|",
  " |_|",
  "",
  "  pudit.dev — v2.0.0  ·  type `help` to see commands",
  "",
];

const HELP = [
  "available commands:",
  "  help               — this list",
  "  about              — who I am",
  "  skills             — stack overview",
  "  experience         — work history",
  "  projects           — list projects",
  "  open <project>     — open a project's live demo",
  "  cat <project>      — show project case study",
  "  contact            — how to reach me",
  "  goto <section>     — navigate to a section of the site",
  "  clear              — clear the terminal",
  "  whoami             — you",
  "  exit               — close terminal (same as Esc)",
];

const ABOUT = [
  "name:       Pudit Chokmeesuk",
  "role:       Mid-Level Software Developer @ PTT Digital Solutions",
  "focus:      Full-stack — C# / .NET / Angular / Azure, Flutter on mobile",
  "location:   Bangkok, Thailand",
  "github:     github.com/PuditC",
  "linkedin:   linkedin.com/in/puditc",
];

const SKILLS = [
  "backend     C#  ·  .NET Core  ·  SQL Server  ·  Oracle",
  "frontend    Angular  ·  React  ·  TypeScript  ·  Bootstrap",
  "mobile      Flutter  ·  Dart",
  "cloud       Azure (Functions, Web Apps, Key Vault, AD)",
  "other       Git  ·  Bitcoin / Lightning / Nostr",
];

// Derived from the shared experience source so the terminal can't drift
// out of sync with the About / Timeline cards.
const EXPERIENCE = experience
  .flatMap((e) => [
    `${e.company} — ${e.position}`,
    `  ${e.period} · ${e.location}`,
    `  ${e.summary}`,
    "",
  ])
  .slice(0, -1);

const CONTACT = [
  "email:      pudit.chok@gmail.com",
  "github:     https://github.com/PuditC",
  "linkedin:   https://linkedin.com/in/puditc",
];

const SECTIONS = ["home", "about", "skills", "experience", "projects", "github"];

function runCommand(raw, ctx) {
  const [cmd, ...rest] = raw.trim().split(/\s+/);
  const arg = rest.join(" ").toLowerCase();

  switch (cmd) {
    case "":
      return [];
    case "help":
    case "?":
      return HELP;
    case "about":
      return ABOUT;
    case "skills":
      return SKILLS;
    case "experience":
    case "exp":
      return EXPERIENCE;
    case "whoami":
      return ["guest@pudit.dev"];
    case "contact":
      return CONTACT;
    case "projects":
    case "ls":
      return [
        "projects:",
        ...projects.map((p) => `  ${p.id.padEnd(16)} ${p.tagline}`),
      ];
    case "open": {
      const p = projects.find((p) => p.id === arg || p.title.toLowerCase() === arg);
      if (!p) return [`open: no project named "${arg}". try \`projects\`.`];
      if (!p.demoLink) return [`open: ${p.title} has no public demo yet.`];
      window.open(p.demoLink, "_blank", "noopener,noreferrer");
      return [`opening ${p.title} → ${p.demoLink}`];
    }
    case "cat": {
      const p = projects.find((p) => p.id === arg || p.title.toLowerCase() === arg);
      if (!p) return [`cat: ${arg}: no such project`];
      return [
        `== ${p.title} ==`,
        p.tagline,
        "",
        "problem:",
        `  ${p.problem}`,
        "",
        "architecture:",
        ...p.architecture.map((a) => `  - ${a}`),
        "",
        "metrics:",
        ...p.metrics.map((m) => `  ${m.label.padEnd(28)} ${m.value}`),
        "",
        ...(p.demoLink ? [`demo:   ${p.demoLink}`] : []),
        ...(p.githubLink ? [`source: ${p.githubLink}`] : []),
      ];
    }
    case "goto":
    case "cd": {
      if (!SECTIONS.includes(arg)) {
        return [`goto: unknown section "${arg}". options: ${SECTIONS.join(", ")}`];
      }
      ctx.onNavigate(arg);
      ctx.close();
      return [`navigating to /${arg} ...`];
    }
    case "clear":
    case "cls":
      ctx.clear();
      return [];
    case "exit":
    case "quit":
      ctx.close();
      return [];
    case "echo":
      return [rest.join(" ")];
    case "date":
      return [new Date().toString()];
    default:
      return [`${cmd}: command not found. try \`help\`.`];
  }
}

export default function Terminal({ open, onClose, onNavigate }) {
  const [lines, setLines] = useState(() => BANNER.map((l) => ({ kind: "out", text: l })));
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [histIndex, setHistIndex] = useState(-1);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  const clear = useCallback(() => setLines([]), []);
  const close = onClose;

  const submit = useCallback(
    (raw) => {
      const prompt = `guest@pudit.dev:~$ ${raw}`;
      const out = runCommand(raw, {
        onNavigate,
        clear,
        close,
      });
      setLines((prev) => [
        ...prev,
        { kind: "in", text: prompt },
        ...out.map((t) => ({ kind: "out", text: t })),
      ]);
      if (raw.trim()) setHistory((h) => [raw, ...h].slice(0, 50));
      setHistIndex(-1);
    },
    [onNavigate, clear, close]
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      submit(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = Math.min(histIndex + 1, history.length - 1);
      setHistIndex(next);
      setInput(history[next] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(histIndex - 1, -1);
      setHistIndex(next);
      setInput(next === -1 ? "" : history[next]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const tokens = input.split(/\s+/);
      const last = tokens[tokens.length - 1] || "";
      const commands = [
        "help", "about", "skills", "experience", "projects", "open",
        "cat", "contact", "goto", "clear", "whoami", "exit", "echo", "date",
      ];
      const pool = tokens.length === 1 ? commands : projects.map((p) => p.id).concat(SECTIONS);
      const matches = pool.filter((c) => c.startsWith(last));
      if (matches.length === 1) {
        tokens[tokens.length - 1] = matches[0];
        setInput(tokens.join(" ") + " ");
      } else if (matches.length > 1) {
        setLines((prev) => [
          ...prev,
          { kind: "in", text: `guest@pudit.dev:~$ ${input}` },
          { kind: "out", text: matches.join("  ") },
        ]);
      }
    } else if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      clear();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="term-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="term-window"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="term-titlebar">
              <div className="term-dots">
                <span className="dot red" onClick={close} />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="term-title">pudit@portfolio — zsh</div>
              <div className="term-hint">Esc to close</div>
            </div>
            <div className="term-body" ref={bodyRef} onClick={() => inputRef.current?.focus()}>
              {lines.map((l, i) => (
                <div key={i} className={`term-line ${l.kind}`}>
                  {l.text}
                </div>
              ))}
              <div className="term-input-line">
                <span className="term-prompt">guest@pudit.dev:~$</span>
                <input
                  ref={inputRef}
                  className="term-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
