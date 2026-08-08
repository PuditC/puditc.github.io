import mysteryagents from "../Assets/Projects/mysteryagents.png";
import btcclock from "../Assets/Projects/btc-clock.png";
import regolich from "../Assets/Projects/regolich.png";

export const projects = [
  {
    id: "mystery-agents",
    title: "Mystery Agents",
    tagline: "Real-time multiplayer deduction board game for mobile.",
    description: "Board game on mobile",
    imgPath: mysteryagents,
    demoLink: "https://mystery-agents.web.app/",
    githubLink: "https://github.com/PuditC/mysteryagents-web",
    category: "mobile",
    technologies: ["Flutter", "Dart", "Firebase", "Realtime DB"],
    features: [
      "Realtime multiplayer lobbies",
      "Role-based hidden information UI",
      "Cross-platform (iOS / Android / Web)",
      "Stateless reconnect — survives app kill",
    ],
    status: "completed",
    year: 2024,
    problem:
      "Party-deduction games rely on a human moderator who sees private roles. On mobile this is awkward — players have to pass the phone. I wanted a version where each player keeps their role on their own device with no trust in a host.",
    architecture: [
      "Flutter front-end, one codebase for iOS + Android + Web.",
      "Firebase Realtime Database as the single source of truth for game state.",
      "Cloud Functions handle role assignment — clients never see the full role map.",
      "Optimistic UI with onDisconnect handlers so a dropped player doesn't freeze the room.",
    ],
    codeSnippet: {
      language: "dart",
      code: `// Server-authoritative role draw; client only sees its own role.
Future<void> dealRoles(String roomId) async {
  final snap = await _db.ref('rooms/$roomId/players').get();
  final players = snap.children.toList()..shuffle();
  final roles = _rolesFor(players.length);

  final updates = <String, dynamic>{};
  for (var i = 0; i < players.length; i++) {
    updates['rooms/$roomId/privateRoles/\${players[i].key}'] = roles[i];
  }
  updates['rooms/$roomId/phase'] = 'night';
  await _db.ref().update(updates);
}`,
    },
    metrics: [
      { label: "Avg round latency", value: "<80ms" },
      { label: "Cold-start to playable", value: "~1.2s" },
      { label: "Platforms from one codebase", value: "3" },
    ],
    lessons:
      "Server-authoritative state is non-negotiable for games with hidden info — I rewrote the first prototype after realising clients could inspect the Firebase payload in dev tools.",
  },
  {
    id: "btc-clock",
    title: "BTC Clock",
    tagline: "Real-time Bitcoin block, price, and halving dashboard.",
    description:
      "BTC Clock is a web app that displays real-time Bitcoin block height, price, satoshis per unit of currency, local time, and halving estimate.",
    imgPath: btcclock,
    demoLink: "https://blockclock-online.firebaseapp.com/",
    githubLink: "https://github.com/PuditC/blockclock-online",
    category: "web",
    technologies: ["Flutter", "Dart", "Firebase Hosting", "Mempool API"],
    features: [
      "Live block height via WebSocket",
      "Price + sats/USD updated every tick",
      "Halving countdown estimate",
      "Full-screen kiosk mode",
    ],
    status: "completed",
    year: 2023,
    problem:
      "Commercial Bitcoin 'block clocks' cost $400+ and only show one metric. I wanted the same ambient info on any old tablet I had lying around — free, full-screen, and self-updating.",
    architecture: [
      "Single-page Flutter web app, static hosted on Firebase — no backend.",
      "WebSocket subscription to mempool.space for sub-second block updates.",
      "Separate REST poll for price on a slower interval (no rate-limit risk).",
      "Everything animated client-side so an old iPad stays at 60fps.",
    ],
    codeSnippet: {
      language: "javascript",
      code: `// Subscribe to new blocks — one message, no polling loop.
useEffect(() => {
  const ws = new WebSocket("wss://mempool.space/api/v1/ws");
  ws.onopen = () => ws.send(JSON.stringify({ action: "want", data: ["blocks"] }));
  ws.onmessage = (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.block) setHeight(msg.block.height);
  };
  return () => ws.close();
}, []);`,
    },
    metrics: [
      { label: "Block→UI latency", value: "<500ms" },
      { label: "Hosting cost", value: "$0" },
      { label: "Bundle size", value: "58 KB gz" },
    ],
    lessons:
      "Static + public APIs beats a backend for read-only dashboards. WebSocket > polling for anything that fires irregularly — you save battery and get fresher data.",
  },
  {
    id: "regolich",
    title: "RegoLich",
    tagline: "MOBA × Battle Royale with Lightning + Nostr integration.",
    description:
      "RegoLich combines MOBA and Battle Royale genres with Bitcoin integration via Lightning Network and Nostr for decentralized transactions.",
    imgPath: regolich,
    // Private work-in-progress — no public repo or demo yet, so both links
    // are null and the UI hides the Live Demo / View Source buttons.
    demoLink: null,
    githubLink: null,
    category: "web",
    technologies: ["React", "Lightning Network", "Nostr", "Web3"],
    features: [
      "In-match sats tipping via LNURL",
      "Nostr relay for chat / match results",
      "Non-custodial — no wallet held by the server",
      "Match replays signed by the winning player",
    ],
    status: "archived",
    year: 2024,
    problem:
      "Existing 'crypto games' bolt a token on top of gameplay. I wanted the opposite — a real arena-style match where Bitcoin payments are only the settlement layer and Nostr is only the transport, both invisible until a player cares.",
    architecture: [
      "React front-end; game loop runs client-side with server-validated events.",
      "LNURL-pay endpoints for tipping — no custody.",
      "Nostr relay (NIP-01) carries chat + signed match results.",
      "Result events are re-broadcast so any relay can verify without trusting ours.",
    ],
    codeSnippet: {
      language: "javascript",
      code: `// Sign and publish a match result to Nostr — no server trust required.
async function publishResult(match, sk) {
  const event = {
    kind: 30078,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["d", match.id], ["winner", match.winner]],
    content: JSON.stringify(match.summary),
  };
  event.id = getEventHash(event);
  event.sig = signEvent(event, sk);
  relay.publish(event);
}`,
    },
    metrics: [
      { label: "Tip settlement", value: "<2s (LN)" },
      { label: "Server custody of funds", value: "0" },
      { label: "Relay-portable results", value: "yes" },
    ],
    lessons:
      "The interesting design constraint is 'what if the server goes away tomorrow'. Once results are signed Nostr events and payments are LNURL, the game is mostly just a UI over public rails.",
  },
];

export const filters = [
  { id: "all", label: "All Projects" },
  { id: "web", label: "Web Apps" },
  { id: "mobile", label: "Mobile Apps" },
  { id: "completed", label: "Completed" },
  { id: "archived", label: "Archived" },
];
