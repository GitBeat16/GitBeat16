/**
 * Single source of truth for every piece of personal content in the profile.
 * Everything here is transcribed from Srushti Kalokhe's resume — nothing is invented.
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
  email: 'srushtipict@gmail.com',
  phone: '9657797554',
  github: 'https://github.com/GitBeat16',
  linkedin: 'https://linkedin.com/in/srushti-kalokhe-95a887385',
} as const;

export const education = {
  degree: 'B.E. Computer Engineering',
  institute: 'Pune Institute of Computer Technology (PICT), Pune',
  affiliation: 'Affiliated to SPPU',
  status: 'Second Year (SE), Semester I',
  marks: [
    { label: 'CGPA (FY)', value: '9.41 / 10' },
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

export const missions = [
  {
    code: 'MISSION 01',
    name: 'Wanderly',
    subtitle: 'Adaptive AI Travel Dashboard',
    badge: 'Hackathon winner',
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Supabase (Postgres)', 'Framer Motion'],
    bullets: [
      'Winning project, IEEE TechRush 26 Hackathon (Frontend Development track) — a travel planner that reshapes its theme, recommendations and content around a six-question onboarding profile and the user’s own trip history.',
      'Explainable personalisation engine that scores destinations against stated preferences and past travel, surfacing the reason behind every recommendation.',
      'Deterministic, weather-driven packing rules over the Open-Meteo forecast and historical archive, plus a budget planner with per-destination feasibility floors that refuses infeasible optimisations.',
      'Server-side auth built from scratch: scrypt hashing, HMAC-SHA256 httpOnly session cookies, Google OAuth 2.0 with PKCE, and an offline-first store mirrored to localStorage with debounced background sync.',
      'Entire UI hand-built with no component library — ~33,700 lines across 160+ files, including a canvas-rendered d3-geo globe, 64 SVG icons and 19 procedurally synthesised WebAudio sounds.',
    ],
    metrics: [
      { k: '~33.7k', v: 'lines' },
      { k: '160+', v: 'files' },
      { k: '64', v: 'SVG icons' },
      { k: '19', v: 'synth sounds' },
    ],
  },
  {
    code: 'MISSION 02',
    name: 'Lumi',
    subtitle: 'AI Companion App',
    badge: 'In progress',
    stack: ['React Native (Expo)', 'TypeScript', 'FastAPI', 'MongoDB'],
    bullets: [
      'Cross-platform AI companion mobile app with an emotionally aware chat assistant supporting emotion detection and full voice interaction (speech-to-text and text-to-speech).',
      'FastAPI + MongoDB backend with JWT authentication, mood tracking and check-ins, mood-based daily action suggestions, and Spotify integration for music.',
      'Mobile frontend in React Native (Expo) and TypeScript using Expo Router, animations and secure on-device token storage.',
    ],
    metrics: [],
  },
  {
    code: 'MISSION 03',
    name: 'Streamlit Web Applications',
    subtitle: 'Data-driven UI experiments',
    badge: '',
    stack: ['Python', 'Streamlit'],
    bullets: [
      'Interactive web applications built with Python and Streamlit, exploring data-driven UI development.',
    ],
    metrics: [],
  },
] as const;

export const achievements = [
  {
    title: 'IEEE TechRush 26 Hackathon — Winner (1st Place)',
    detail: 'Frontend Development track. Won 1st place in a four-member team for Wanderly, an adaptive AI travel dashboard built end to end during the hackathon.',
    kind: 'win',
  },
  {
    title: 'Pictoreal Hackathon — CodeTheCause 2025-26',
    detail: "Participated as a member of team 'The Semicolon', demonstrating innovation and teamwork.",
    kind: 'event',
  },
  {
    title: 'Impetus and Concepts 2026',
    detail: 'Participated in this international-level technical event organised by Pune Institute of Computer Technology.',
    kind: 'event',
  },
  {
    title: 'MHT-CET 2024 — 99.34 percentile',
    detail: 'Earned admission to PICT, one of the top engineering colleges in Pune.',
    kind: 'score',
  },
] as const;

export const about = [
  'Second-year Computer Engineering student at PICT Pune (CGPA 9.41), working mostly in TypeScript across Next.js, React Native and FastAPI.',
  'Most of what I build is full-stack and finished rather than prototyped — Wanderly shipped with hand-rolled auth (scrypt + HMAC session cookies + Google OAuth/PKCE), an offline-first store and a canvas globe, and won the IEEE TechRush 26 frontend track.',
  'Currently building Lumi, a React Native + FastAPI AI companion app with emotion detection and voice interaction.',
] as const;

export const speech = {
  hero: "LET'S BUILD.",
  contact: 'SHIP IT.',
} as const;
