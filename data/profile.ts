/**
 * Single source of truth for every piece of personal content in the profile.
 * Everything here is transcribed from Srushti Kalokhe's resume, from her own
 * repositories, or from corrections she gave directly — nothing is invented.
 * The React app and the README asset generator both read from this file.
 */

export const identity = {
  name: 'Srushti Sachin Kalokhe',
  shortName: 'Srushti Kalokhe',
  handle: 'GitBeat16',
  role: 'Computer Engineering Undergraduate',
  // Tagline is assembled only from facts on the resume.
  tagline: 'I build full-stack products end to end — Next.js on the front, FastAPI and Postgres behind it.',
  location: 'Pune, Maharashtra',
  email: 'ksrushti1610@gmail.com',
  phone: '9657797554',
  github: 'https://github.com/GitBeat16',
  githubHandle: 'GitBeat16',
  linkedin: 'https://linkedin.com/in/srushti-kalokhe-95a887385',
  linkedinHandle: 'srushti-kalokhe',
} as const;

export const education = {
  degree: 'B.E. Computer Engineering',
  field: 'Computer Engineering',
  institute: 'Pune Institute of Computer Technology (PICT), Pune',
  affiliation: 'Affiliated to SPPU',
  status: 'Second Year (SE), Semester III',
  marks: [
    { label: 'CGPA', value: '9.44 / 10' },
    { label: 'SGPA Sem I', value: '9.54 / 10' },
    { label: 'SGPA Sem II', value: '9.29 / 10' },
    { label: 'MHT-CET', value: '99.34 %ile' },
    { label: 'SSC', value: '96.40 %' },
    { label: 'HSC', value: '76.17 %' },
  ],
} as const;

/** "Spider Arsenal" — grouped exactly as the resume groups them. */
export const arsenal = [
  {
    id: 'languages',
    label: 'Languages',
    items: ['C', 'C++', 'Python', 'TypeScript', 'JavaScript'],
    note: 'C++ proficient · Python familiar',
  },
  {
    id: 'frameworks',
    label: 'Frameworks & Libraries',
    items: ['Next.js (App Router)', 'React', 'React Native (Expo)', 'FastAPI', 'Tailwind CSS', 'Framer Motion', 'Streamlit'],
  },
  {
    id: 'data',
    label: 'Databases & Backend',
    items: ['MongoDB', 'Supabase (PostgreSQL)', 'REST APIs', 'JWT / session auth', 'OAuth 2.0'],
  },
  {
    id: 'tools',
    label: 'Tools & Platforms',
    items: ['Git / GitHub', 'Vercel', 'Railway', 'Claude & Groq APIs', 'Leaflet / d3-geo', 'Wix Studio'],
  },
  {
    id: 'spoken',
    label: 'Spoken',
    items: ['English', 'Hindi', 'Marathi'],
  },
] as const;

/**
 * Missions. `repos` drives both the in-card repo line and the clickable
 * link badges rendered underneath each card in README.md — `slug` is the
 * filename stem of the generated badge (readme/btn-<slug>.svg).
 */
export const missions = [
  {
    code: 'MISSION 01',
    name: 'Wanderly',
    subtitle: 'Adaptive AI Travel Dashboard',
    badge: 'Hackathon winner',
    accent: 'red',
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Supabase (Postgres)', 'Framer Motion'],
    repos: [{ slug: 'techrush-26', label: 'TechRush-26', url: 'https://github.com/GitBeat16/TechRush-26' }],
    bullets: [
      'Winning project, IEEE TechRush 26 Hackathon (Frontend Development track) — a travel planner that reshapes its theme, recommendations and content around a six-question onboarding profile and the user’s own trip history.',
      'Explainable personalisation engine that scores destinations against stated preferences and past travel, surfacing the reason behind every recommendation.',
      'Deterministic, weather-driven packing rules over the Open-Meteo forecast and historical archive, plus a budget planner with per-destination feasibility floors that refuses infeasible optimisations.',
      'Server-side auth built from scratch: scrypt hashing, HMAC-SHA256 httpOnly session cookies, Google OAuth 2.0 with PKCE, and an offline-first store mirrored to localStorage with debounced background sync.',
      'Entire UI hand-built with no component library, including a canvas-rendered d3-geo globe, SVG icon set and procedurally synthesised WebAudio sounds.',
    ],
  },
  {
    code: 'MISSION 02',
    name: 'BoardroomAI',
    subtitle: 'AI Virtual Board of Directors',
    badge: 'Hackathon build',
    accent: 'navy',
    stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Groq API', 'Supabase'],
    repos: [{ slug: 'hackagent', label: 'HackAgent', url: 'https://github.com/GitBeat16/HackAgent' }],
    bullets: [
      'Founders pitch to a panel of eight AI executives — CEO, CTO, CFO, CMO, VC, Legal, Research and Growth — who debate the pitch live, vote, and return an investment decision.',
      'Each session generates the full pack: SWOT, market research, financial model, risk matrix, pitch deck, roadmap, PRD and an executive report.',
      'Dashboard analytics with score trends, health scores, radar charts, recent meetings and an activity feed; Groq drives the debate and document generation, Supabase handles auth and persistence.',
    ],
  },
  {
    code: 'MISSION 03',
    name: 'Lumi',
    subtitle: 'AI Companion App',
    badge: 'In progress',
    accent: 'navy',
    stack: ['React Native (Expo)', 'TypeScript', 'FastAPI', 'MongoDB'],
    repos: [{ slug: 'aura-2', label: 'aura_2', url: 'https://github.com/GitBeat16/aura_2' }],
    bullets: [
      'Cross-platform AI companion mobile app with an emotionally aware chat assistant supporting emotion detection and full voice interaction (speech-to-text and text-to-speech).',
      'FastAPI + MongoDB backend with JWT authentication, mood tracking and check-ins, mood-based daily action suggestions, and Spotify integration for music.',
      'Mobile frontend in React Native (Expo) and TypeScript using Expo Router, animations and secure on-device token storage.',
    ],
  },
  {
    code: 'MISSION 04',
    name: 'Streamlit Applications',
    subtitle: 'StockZ Terminal · Sahay',
    badge: '',
    accent: 'navy',
    stack: ['Python', 'Streamlit', 'Plotly', 'pandas', 'NumPy'],
    repos: [
      { slug: 'stockz1', label: 'StockZ · stockz1', url: 'https://github.com/GitBeat16/stockz1' },
      { slug: 'adaptive-learning-ngo', label: 'Sahay · adaptive_learning_ngo', url: 'https://github.com/GitBeat16/adaptive_learning_ngo' },
    ],
    bullets: [
      'StockZ Terminal — a quantitative paper-trading dashboard that detects chart formations such as bullish engulfing and hammer over a 120-day window, simulates order execution with configurable per-trade risk, and reports win-rate statistics.',
      'Sahay — an adaptive peer-learning matchmaker that pairs mentors and mentees on complementary academic strengths, with session chat, file sharing, credits, badges and a mentor leaderboard.',
    ],
  },
] as const;

export const achievements = [
  {
    title: 'IEEE TechRush 26 Hackathon — Winner (1st Place)',
    detail: 'Frontend Development track. Won 1st place in a four-member team for Wanderly, an adaptive AI travel dashboard built end to end during the hackathon.',
    kind: 'win',
  },
  {
    title: 'BoardroomAI — AI board-of-directors hackathon build',
    detail: 'Built an eight-agent AI executive panel that debates a founder’s pitch live, votes on it, and generates the full investment pack — SWOT, market research, financials, roadmap, PRD and pitch deck.',
    kind: 'agent',
  },
  {
    title: 'Pictoreal Hackathon — CodeTheCause 2025-26',
    detail: "Participated as a member of team 'The Semicolon', building Sahay — a peer-learning matchmaking platform for NGO and college classrooms.",
    kind: 'code',
  },
  {
    title: 'Impetus and Concepts 2026',
    detail: 'Participated in this international-level technical event organised by Pune Institute of Computer Technology.',
    kind: 'globe',
  },
] as const;

export const about = [
  'Second-year Computer Engineering student at PICT Pune (CGPA 9.44), working mostly in TypeScript across Next.js, React Native and FastAPI.',
  'Most of what I build is full-stack and finished rather than prototyped — Wanderly shipped with hand-rolled auth (scrypt + HMAC session cookies + Google OAuth/PKCE), an offline-first store and a canvas globe, and won the IEEE TechRush 26 frontend track.',
  'Currently building Lumi, a React Native + FastAPI AI companion app with emotion detection and voice interaction.',
] as const;

export const speech = {
  hero: "LET'S BUILD.",
  contact: 'SHIP IT.',
} as const;
