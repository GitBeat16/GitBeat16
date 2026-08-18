'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

import { identity, education, arsenal, missions, achievements, about, speech } from '@data/profile';
import RiveMascot from '@/components/SpiderMascot/RiveMascot';
import { useMascotState } from '@/components/SpiderMascot/useMascotState';
import HangingMascot from '@/components/HangingMascot/HangingMascot';
import ComicPanel from '@/components/ComicPanel/ComicPanel';
import SpeechBubble from '@/components/SpeechBubble/SpeechBubble';
import WebDivider from '@/components/WebDivider/WebDivider';
import CitySkyline from '@/components/CitySkyline/CitySkyline';
import ContributionWeb from '@/components/ContributionWeb/ContributionWeb';

function SectionHead({ title, kicker }: { title: string; kicker?: string }) {
  return (
    <motion.div
      className="section__head"
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <span className="section__tag">
        <span>{title}</span>
      </span>
      {kicker && <span className="section__kicker">{kicker}</span>}
      <span className="section__rule" />
    </motion.div>
  );
}

export default function Home() {
  const { state, trigger } = useMascotState('idle');
  const footRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: footRef, offset: ['start end', 'end end'] });
  const parallax = useTransform(scrollYProgress, [0, 1], [26, 0]);

  return (
    <>
      <HangingMascot />

      <main className="shell">
        {/* ───────────────────────────────────────────────────── HERO */}
        <header className="hero">
          <div>
            <motion.p
              className="hero__kicker"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              PICT PUNE · {education.field.toUpperCase()}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {identity.shortName.toUpperCase()}
            </motion.h1>

            <motion.p
              className="hero__role"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {identity.role.toUpperCase()}
            </motion.p>

            <motion.p
              className="hero__tagline"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
            >
              {identity.tagline}
            </motion.p>

            <motion.ul
              className="chips"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.36 }}
            >
              {['TypeScript', 'Next.js', 'React Native', 'FastAPI', 'Supabase'].map((s) => (
                <li className="chip" key={s}>
                  {s}
                </li>
              ))}
            </motion.ul>
          </div>

          <div className="hero__stage">
            <motion.button
              type="button"
              className="hero__mascot"
              onMouseEnter={() => trigger('excited')}
              onClick={() => trigger('webShoot')}
              aria-label="Web-Byte, the mascot — hover to cheer, click to fire a web"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 90, damping: 14, delay: 0.2 }}
            >
              <RiveMascot state={state} size={280} uid="hero" />
            </motion.button>
          </div>
        </header>

        <WebDivider />

        {/* ──────────────────────────────────────────────────── ABOUT */}
        <section className="section">
          <SectionHead title="ABOUT" kicker="origin story" />
          <ComicPanel label="WHO">
            {about.map((line) => (
              <p key={line.slice(0, 24)}>{line}</p>
            ))}
            <ul>
              <li>
                {education.degree} — {education.institute} ({education.status})
              </li>
              <li>{education.marks.map((m) => `${m.label} ${m.value}`).join(' · ')}</li>
            </ul>
          </ComicPanel>
        </section>

        {/* ────────────────────────────────────────────────── ARSENAL */}
        <section className="section">
          <SectionHead title="SPIDER ARSENAL" kicker="tools of the trade" />
          <div className="grid2">
            {arsenal.map((group, i) => (
              <ComicPanel key={group.id} accent={i % 2 ? 'navy' : 'red'} delay={i * 0.06}>
                <h4>{group.label.toUpperCase()}</h4>
                <ul className="chips">
                  {group.items.map((item) => (
                    <li className="chip" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
                {'note' in group && group.note ? <p style={{ marginTop: 12 }}>{group.note}</p> : null}
              </ComicPanel>
            ))}
          </div>
        </section>

        {/* ───────────────────────────────────────────────── MISSIONS */}
        <section className="section">
          <SectionHead title="MISSIONS" kicker="things I shipped" />
          {missions.map((m, i) => (
            <ComicPanel key={m.name} label={m.code} accent={m.accent === 'red' ? 'red' : 'navy'} delay={i * 0.06}>
              <div className="mission__top">
                <div>
                  <h3>{m.name}</h3>
                  <p className="mission__sub">{m.subtitle}</p>
                </div>
                {m.badge && (
                  <span className={`badge ${m.accent === 'red' ? '' : 'badge--navy'}`}>{m.badge.toUpperCase()}</span>
                )}
              </div>

              <ul className="chips">
                {m.stack.map((s) => (
                  <li className="chip" key={s}>
                    {s}
                  </li>
                ))}
              </ul>

              <ul>
                {m.bullets.map((b) => (
                  <li key={b.slice(0, 28)}>{b}</li>
                ))}
              </ul>

              <ul className="chips">
                {m.repos.map((r) => (
                  <li key={r.slug}>
                    <a className="chip chip--link" href={r.url} target="_blank" rel="noreferrer">
                      {r.label}
                    </a>
                  </li>
                ))}
              </ul>
            </ComicPanel>
          ))}
        </section>

        {/* ────────────────────────────────────────── CONTRIBUTION WEB */}
        <section className="section">
          <SectionHead title="CONTRIBUTION WEB" kicker="live from github" />
          <ComicPanel>
            <ContributionWeb />
          </ComicPanel>
        </section>

        {/* ───────────────────────────────────────────── ACHIEVEMENTS */}
        <section className="section">
          <SectionHead title="ACHIEVEMENTS" kicker="wall of wins" />
          {achievements.map((a, i) => (
            <ComicPanel key={a.title} accent={a.kind === 'win' ? 'red' : 'navy'} delay={i * 0.05}>
              <h3 style={{ fontSize: 16 }}>{a.title}</h3>
              <p>{a.detail}</p>
            </ComicPanel>
          ))}
        </section>

        {/* ────────────────────────────────────────────────── CONTACT */}
        <section className="section">
          <SectionHead title="CONTACT" kicker="open a thread" />
          <ComicPanel>
            <div className="contact">
              <RiveMascot state="excited" size={110} uid="contact" title="Mascot waving" />
              <SpeechBubble text={speech.contact} onClick={() => trigger('webShoot')} />
              <div className="contact__links">
                <a href={`mailto:${identity.email}`}>{identity.email}</a>
                <a href={identity.github}>github.com/{identity.handle}</a>
                <a href={identity.linkedin}>linkedin.com/in/srushti-kalokhe-95a887385</a>
                <span style={{ color: 'var(--faint)', fontSize: 13 }}>{identity.location}</span>
              </div>
            </div>
          </ComicPanel>
        </section>

        <div ref={footRef}>
          <CitySkyline parallax={parallax as unknown as number} />
          <p className="foot">next.js + framer motion prototype · exported to animated svg · npm run assets</p>
        </div>
      </main>
    </>
  );
}
