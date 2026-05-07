import {
  Activity,
  ArrowRight,
  Bot,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Code2,
  Database,
  Flame,
  Github,
  GitPullRequest,
  Layers3,
  MapPin,
  Radio,
  Rocket,
  Search,
  Shield,
  Sparkles,
  Terminal,
  Trophy,
} from 'lucide-react';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'motion/react';
import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '../lib/utils';

const HERO_IMAGE = '/assets/hero.png';
const BANNER_IMAGE = '/assets/banner.png';
const OG_IMAGE = '/assets/og-image.png';
const LOGO_IMAGE = '/assets/logo.svg';

const SOURCES = [
  'Codeforces',
  'LeetCode',
  'AtCoder',
  'HackerRank',
  'Topcoder',
  'Devpost',
  'MLH',
  'Devfolio',
  'Kaggle',
  'Zindi',
  'ETHGlobal',
  'Gitcoin',
  'Solana',
  'AWS',
  'Google Developers',
  'Microsoft',
  'Nvidia',
  'Eventbrite',
  'Meetup',
];

const HERO_WIDGETS = [
  { label: 'Codeforces Round', meta: 'starts in 02:14:33', tone: 'cyan' },
  { label: 'Kaggle Deadline', meta: 'synced to calendar', tone: 'green' },
  { label: 'ETHGlobal', meta: 'registration open', tone: 'amber' },
  { label: 'picoCTF', meta: 'ongoing now', tone: 'red' },
  { label: 'Google Calendar', meta: 'ready', tone: 'violet' },
];

const CATEGORIES = [
  { name: 'Competitive', icon: Trophy, color: '#22d3ee', sample: 'AtCoder Beginner Contest' },
  { name: 'Hackathons', icon: Rocket, color: '#34d399', sample: 'ETHGlobal Hackathon' },
  { name: 'AI/Data', icon: Bot, color: '#fbbf24', sample: 'Kaggle AI Challenge' },
  { name: 'CTF/Security', icon: Shield, color: '#fb7185', sample: 'picoCTF Live' },
  { name: 'Conferences', icon: MapPin, color: '#a78bfa', sample: 'Google Developer Conf' },
  { name: 'Open Source', icon: GitPullRequest, color: '#60a5fa', sample: 'Hacktoberfest Window' },
];

const CALENDAR_EVENTS = [
  { day: 3, title: 'Codeforces Round', tag: 'contest', tone: 'cyan' },
  { day: 6, title: 'ETHGlobal Hackathon', tag: 'hackathon', tone: 'green' },
  { day: 11, title: 'Kaggle AI Challenge', tag: 'ai/data', tone: 'amber' },
  { day: 15, title: 'picoCTF', tag: 'security', tone: 'red' },
  { day: 20, title: 'Google Dev Conf', tag: 'conference', tone: 'violet' },
  { day: 24, title: 'Devpost Deadline', tag: 'deadline', tone: 'amber' },
  { day: 27, title: 'Nvidia Workshop', tag: 'livestream', tone: 'cyan' },
  { day: 30, title: 'OpenAI Livestream', tag: 'ai', tone: 'green' },
];

const WORKFLOWS = [
  {
    id: 'discover',
    label: 'Discover',
    title: 'Signals arrive from everywhere.',
    body: 'Search, filter, and scan developer opportunities before they disappear into scattered feeds.',
  },
  {
    id: 'decide',
    label: 'Decide',
    title: 'Every event gets context.',
    body: 'Inspect platform, tags, mode, pricing, deadline, timezone, and raw metadata in one focused view.',
  },
  {
    id: 'sync',
    label: 'Sync',
    title: 'Important dates leave the browser.',
    body: 'Send contests, hackathons, and deadlines into Google Calendar when they are worth protecting.',
  },
];

const toneClasses: Record<string, string> = {
  cyan: 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100 shadow-cyan-500/20',
  green: 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100 shadow-emerald-500/20',
  amber: 'border-amber-300/30 bg-amber-300/10 text-amber-100 shadow-amber-500/20',
  red: 'border-rose-300/30 bg-rose-300/10 text-rose-100 shadow-rose-500/20',
  violet: 'border-violet-300/30 bg-violet-300/10 text-violet-100 shadow-violet-500/20',
};

const SceneStyles = () => (
  <style>{`
    .eventio-noise {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E");
    }
    .signal-marquee { animation: signalMarquee 38s linear infinite; }
    .signal-marquee-reverse { animation: signalMarquee 46s linear infinite reverse; }
    .orbit-slow { animation: orbitSlow 34s linear infinite; }
    .orbit-medium { animation: orbitSlow 24s linear infinite reverse; }
    .spin-radar { animation: spinRadar 3.2s linear infinite; transform-origin: bottom center; }
    .scanline { animation: scanline 4.8s ease-in-out infinite; }
    .packet-flow { animation: packetFlow 3.8s linear infinite; }
    .pulse-soft { animation: pulseSoft 2.7s ease-in-out infinite; }
    .float-a { animation: floatA 5.8s ease-in-out infinite; }
    .float-b { animation: floatB 7.2s ease-in-out infinite; }
    .clock-hand { animation: spinRadar 9s linear infinite; transform-origin: bottom center; }
    .terminal-type { animation: typeWidth 4.2s steps(38) infinite alternate; }
    @keyframes signalMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes orbitSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes spinRadar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes scanline {
      0%, 100% { transform: translateY(-20%); opacity: 0; }
      20% { opacity: .75; }
      60% { transform: translateY(115%); opacity: .25; }
      85% { opacity: 0; }
    }
    @keyframes packetFlow {
      0% { transform: translateX(-8%); opacity: 0; }
      12% { opacity: 1; }
      88% { opacity: 1; }
      100% { transform: translateX(108%); opacity: 0; }
    }
    @keyframes pulseSoft {
      0%, 100% { opacity: .45; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.04); }
    }
    @keyframes floatA { 0%, 100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(0,-18px,0); } }
    @keyframes floatB { 0%, 100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(12px,-22px,0); } }
    @keyframes typeWidth { from { max-width: 12ch; } to { max-width: 38ch; } }
    @media (prefers-reduced-motion: reduce) {
      .signal-marquee, .signal-marquee-reverse, .orbit-slow, .orbit-medium, .spin-radar,
      .scanline, .packet-flow, .pulse-soft, .float-a, .float-b, .clock-hand, .terminal-type {
        animation: none !important;
      }
    }
  `}</style>
);

const SectionIntro = ({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.7 }}
    className="mx-auto mb-14 max-w-4xl text-center"
  >
    <p className="mb-5 text-[11px] font-black tracking-[0.34em] text-cyan-200/70 uppercase">
      {eyebrow}
    </p>
    <h2 className="text-4xl leading-[0.92] font-black tracking-tight text-white uppercase md:text-7xl">
      {title}
    </h2>
    <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">{body}</p>
  </motion.div>
);

const GlassFrame = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div
    className={cn(
      'relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] shadow-[0_24px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl',
      className,
    )}
  >
    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.12),transparent_34%)]" />
    <div className="relative z-10">{children}</div>
  </div>
);

const HeroConstellation = () => (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
    <div className="orbit-slow absolute h-[34rem] w-[34rem] rounded-full border border-white/10 md:h-[48rem] md:w-[48rem]">
      {SOURCES.slice(0, 7).map((source, index) => (
        <span
          key={source}
          className="absolute rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[10px] font-black tracking-[0.18em] text-white/70 uppercase backdrop-blur-md"
          style={{
            top: `${50 + Math.sin((index / 7) * Math.PI * 2) * 48}%`,
            left: `${50 + Math.cos((index / 7) * Math.PI * 2) * 48}%`,
          }}
        >
          {source}
        </span>
      ))}
    </div>
    <div className="orbit-medium absolute h-[22rem] w-[22rem] rounded-full border border-dashed border-cyan-200/15 md:h-[34rem] md:w-[34rem]" />
    <div className="absolute h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
    {Array.from({ length: 38 }).map((_, index) => (
      <span
        key={index}
        className="pulse-soft absolute h-1 w-1 rounded-full bg-white/60"
        style={{
          left: `${(index * 29) % 100}%`,
          top: `${(index * 47) % 100}%`,
          animationDelay: `${index * 0.13}s`,
        }}
      />
    ))}
  </div>
);

const HeroProduct = ({
  rotateX,
  rotateY,
}: {
  rotateX: ReturnType<typeof useSpring>;
  rotateY: ReturnType<typeof useSpring>;
}) => (
  <motion.div
    style={{ rotateX, rotateY }}
    initial={{ opacity: 0, y: 80, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
    className="relative mx-auto mt-14 max-w-6xl px-3"
  >
    <div className="absolute -inset-8 rounded-[3rem] bg-[conic-gradient(from_90deg,rgba(34,211,238,.22),rgba(16,185,129,.12),rgba(245,158,11,.18),rgba(244,63,94,.12),rgba(34,211,238,.22))] opacity-60 blur-3xl" />
    <GlassFrame className="rounded-[2rem] p-2 md:rounded-[2.5rem] md:p-3">
      <div className="absolute top-5 left-6 z-20 hidden gap-2 md:flex">
        <span className="h-3 w-3 rounded-full bg-rose-400" />
        <span className="h-3 w-3 rounded-full bg-amber-300" />
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
      </div>
      <div className="scanline pointer-events-none absolute inset-0 z-30 bg-gradient-to-b from-transparent via-cyan-200/25 to-transparent" />
      <img
        src={HERO_IMAGE}
        alt="Eventio calendar dashboard with developer events"
        className="relative z-10 w-full rounded-[1.4rem] border border-white/10 object-cover opacity-90 shadow-2xl md:rounded-[2rem]"
      />
    </GlassFrame>
    {HERO_WIDGETS.map((widget, index) => (
      <motion.div
        key={widget.label}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 + index * 0.08, duration: 0.6 }}
        className={cn(
          'float-a absolute hidden min-w-48 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl lg:block',
          toneClasses[widget.tone],
        )}
        style={{
          left: index % 2 === 0 ? `${-2 + index * 4}%` : 'auto',
          right: index % 2 === 1 ? `${-2 + index * 3}%` : 'auto',
          top: `${12 + index * 15}%`,
          animationDelay: `${index * 0.7}s`,
        }}
      >
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-current shadow-[0_0_18px_currentColor]" />
          <div>
            <p className="text-xs font-black tracking-wide text-white">{widget.label}</p>
            <p className="mt-0.5 text-[10px] font-bold tracking-[0.16em] uppercase opacity-70">
              {widget.meta}
            </p>
          </div>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

const SourceStream = () => (
  <section
    id="sources"
    className="relative z-10 overflow-hidden border-y border-white/10 bg-black py-10"
  >
    <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-28 bg-gradient-to-r from-black to-transparent md:w-56" />
    <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-28 bg-gradient-to-l from-black to-transparent md:w-56" />
    <div className="signal-marquee flex w-max gap-4">
      {[...SOURCES, ...SOURCES].map((source, index) => (
        <div
          key={`${source}-${index}`}
          className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-black tracking-[0.18em] text-white/80 uppercase"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,.9)]" />
          {source}
          <span className="text-cyan-200/60">{String((index * 7) % 91).padStart(2, '0')}</span>
        </div>
      ))}
    </div>
    <div className="signal-marquee-reverse mt-4 flex w-max gap-4 opacity-60">
      {[...SOURCES.slice().reverse(), ...SOURCES.slice().reverse()].map((source, index) => (
        <div
          key={`${source}-reverse-${index}`}
          className="flex items-center gap-3 rounded-full border border-cyan-200/10 bg-cyan-200/[0.04] px-5 py-2 text-[10px] font-black tracking-[0.2em] text-cyan-100/70 uppercase"
        >
          <Radio className="h-3 w-3" /> packet received
          <span>{source}</span>
        </div>
      ))}
    </div>
  </section>
);

const EventUniverse = () => {
  const [active, setActive] = useState(0);
  const category = CATEGORIES[active];
  const Icon = category.icon;

  return (
    <section className="relative z-10 overflow-hidden bg-[#030405] px-6 py-28 md:py-36">
      <SectionIntro
        eyebrow="Event Universe"
        title="A living map of developer opportunities"
        body="Instead of a flat feature list, Eventio turns categories and sources into a navigable signal field."
      />
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <GlassFrame className="min-h-[560px] p-6">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.045)_1px,transparent_1px)] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)] bg-[size:44px_44px]" />
          <div className="relative flex min-h-[510px] items-center justify-center">
            <div className="absolute h-[22rem] w-[22rem] rounded-full border border-white/10 md:h-[34rem] md:w-[34rem]" />
            <div className="orbit-slow absolute h-[22rem] w-[22rem] rounded-full md:h-[34rem] md:w-[34rem]">
              {CATEGORIES.map((item, index) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.name}
                    onMouseEnter={() => setActive(index)}
                    className="absolute flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border border-white/10 bg-black/80 text-white shadow-2xl backdrop-blur-xl transition-transform hover:scale-110 md:h-24 md:w-24"
                    style={{
                      top: `${50 + Math.sin((index / CATEGORIES.length) * Math.PI * 2) * 48}%`,
                      left: `${50 + Math.cos((index / CATEGORIES.length) * Math.PI * 2) * 48}%`,
                      boxShadow: `0 0 46px ${item.color}30`,
                    }}
                  >
                    <ItemIcon className="h-7 w-7" style={{ color: item.color }} />
                  </button>
                );
              })}
            </div>
            {CATEGORIES.map((item, index) => (
              <span
                key={`${item.name}-line`}
                className="absolute h-px w-1/2 origin-left bg-gradient-to-r from-white/25 to-transparent"
                style={{
                  transform: `rotate(${index * 60}deg)`,
                }}
              />
            ))}
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 flex h-56 w-56 flex-col items-center justify-center rounded-full border border-white/15 bg-black/75 text-center shadow-[0_0_90px_rgba(34,211,238,.18)] backdrop-blur-2xl md:h-72 md:w-72"
            >
              <Icon className="mb-5 h-11 w-11" style={{ color: category.color }} />
              <p className="text-2xl font-black tracking-tight text-white">{category.name}</p>
              <p className="mt-3 max-w-40 text-xs leading-5 text-zinc-400">{category.sample}</p>
            </motion.div>
          </div>
        </GlassFrame>
        <GlassFrame className="p-6 md:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black tracking-[0.25em] text-zinc-500 uppercase">
                Live category
              </p>
              <h3 className="mt-2 text-3xl font-black text-white">{category.name}</h3>
            </div>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-black tracking-widest text-emerald-200 uppercase">
              active
            </span>
          </div>
          <div className="space-y-3">
            {['Detected', 'Normalized', 'Ranked', 'Calendar-ready'].map((step, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/40 p-4"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                  {index + 1}
                </span>
                <div>
                  <p className="font-bold text-white">{step}</p>
                  <p className="text-sm text-zinc-500">{category.sample}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassFrame>
      </div>
    </section>
  );
};

const AliveBento = () => {
  const cards = [
    { title: 'Contest Radar', icon: Trophy, tone: 'cyan' },
    { title: 'Hackathon Launchpad', icon: Rocket, tone: 'green' },
    { title: 'AI Challenge Tracker', icon: Bot, tone: 'amber' },
    { title: 'CTF Watch', icon: Shield, tone: 'red' },
    { title: 'Conference Map', icon: MapPin, tone: 'violet' },
    { title: 'Sync Engine', icon: CalendarCheck, tone: 'green' },
  ];

  return (
    <section id="features" className="relative z-10 bg-black px-6 py-28 md:py-36">
      <SectionIntro
        eyebrow="Animated Product Scenes"
        title="No dead cards. Every feature moves."
        body="Each surface is a tiny product clip: radar sweeps, timelines slide, terminals type, and sync states glow."
      />
      <div className="mx-auto grid max-w-7xl auto-rows-[320px] grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, icon: Icon, tone }, index) => (
          <GlassFrame
            key={title}
            className={cn('group p-6 transition-transform duration-500 hover:-translate-y-2', {
              'lg:col-span-2': index === 0 || index === 5,
            })}
          >
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className={cn('rounded-2xl border p-3 shadow-xl', toneClasses[tone])}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-black tracking-[0.22em] text-zinc-500 uppercase">
                  scene {index + 1}
                </span>
              </div>
              <div className="absolute inset-12 flex items-center justify-center">
                {index === 0 && (
                  <div className="relative h-44 w-44 rounded-full border border-cyan-200/20 bg-cyan-200/5">
                    <div className="spin-radar absolute top-1/2 left-1/2 h-20 w-px origin-bottom bg-gradient-to-t from-cyan-200 to-transparent" />
                    {[20, 44, 70].map((size) => (
                      <span
                        key={size}
                        className="absolute rounded-full border border-cyan-200/10"
                        style={{ inset: `${size}px` }}
                      />
                    ))}
                    <span className="pulse-soft absolute top-10 left-24 h-3 w-3 rounded-full bg-cyan-300" />
                    <span className="pulse-soft absolute right-12 bottom-14 h-2 w-2 rounded-full bg-amber-300 [animation-delay:.7s]" />
                  </div>
                )}
                {index === 1 && (
                  <div className="grid w-full max-w-xs grid-cols-3 gap-3">
                    {['Idea', 'Build', 'Ship'].map((lane, laneIndex) => (
                      <div
                        key={lane}
                        className="rounded-2xl border border-white/10 bg-black/40 p-2"
                      >
                        <p className="mb-2 text-[9px] font-black text-zinc-500 uppercase">{lane}</p>
                        {[0, 1, 2].map((card) => (
                          <motion.div
                            key={card}
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 2.4,
                              repeat: Infinity,
                              delay: laneIndex * 0.25 + card * 0.12,
                            }}
                            className="mb-2 h-10 rounded-xl bg-emerald-300/10"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                {index === 2 && (
                  <div className="w-full max-w-xs space-y-3">
                    {[78, 62, 91, 48].map((width, bar) => (
                      <div key={width} className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-xl bg-amber-300/10 text-center text-xs leading-8 text-amber-100">
                          {bar + 1}
                        </span>
                        <motion.span
                          initial={{ width: 0 }}
                          whileInView={{ width: `${width}%` }}
                          className="h-3 rounded-full bg-gradient-to-r from-amber-300 to-white"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {index === 3 && (
                  <div className="w-full max-w-sm rounded-2xl border border-rose-300/20 bg-black p-4 font-mono text-xs text-rose-100">
                    {[
                      '> source: ctftime',
                      '> event: picoCTF',
                      '> status: ongoing',
                      '> flag: watched',
                    ].map((line, lineIndex) => (
                      <p
                        key={line}
                        className="terminal-type mb-2 overflow-hidden whitespace-nowrap"
                        style={{ animationDelay: `${lineIndex * 0.2}s` }}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                )}
                {index === 4 && (
                  <div className="relative h-44 w-full max-w-sm rounded-3xl border border-violet-300/15 bg-[radial-gradient(circle_at_center,rgba(167,139,250,.16),transparent_60%)]">
                    {['Online', 'SF', 'BLR', 'Berlin'].map((pin, pinIndex) => (
                      <span
                        key={pin}
                        className="pulse-soft absolute rounded-full border border-violet-200/25 bg-violet-300/10 px-3 py-1 text-[10px] font-black text-violet-100"
                        style={{
                          left: `${12 + pinIndex * 22}%`,
                          top: `${22 + ((pinIndex * 19) % 52)}%`,
                          animationDelay: `${pinIndex * 0.3}s`,
                        }}
                      >
                        {pin}
                      </span>
                    ))}
                  </div>
                )}
                {index === 5 && (
                  <div className="relative w-full max-w-lg">
                    <div className="packet-flow absolute top-1/2 h-1 w-20 rounded-full bg-emerald-300 shadow-[0_0_24px_rgba(52,211,153,.9)]" />
                    <div className="flex items-center justify-between">
                      <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
                        <CalendarDays className="mb-3 h-8 w-8 text-white" />
                        <p className="text-sm font-bold text-white">Eventio event</p>
                      </div>
                      <div className="h-px flex-1 bg-gradient-to-r from-emerald-300/70 to-cyan-300/70" />
                      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                        <CheckCircle2 className="mb-3 h-8 w-8 text-emerald-200" />
                        <p className="text-sm font-bold text-white">Calendar synced</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  A focused animated interface for the moments developers actually care about.
                </p>
              </div>
            </div>
          </GlassFrame>
        ))}
      </div>
    </section>
  );
};

const Pipeline = () => (
  <section className="relative z-10 overflow-hidden bg-[#030405] px-6 py-28 md:py-36">
    <SectionIntro
      eyebrow="Scraper Pipeline"
      title="From scattered pages to one clean timeline"
      body="The page should explain engineering through motion: adapters, schema, database, calendar, sync."
    />
    <GlassFrame className="mx-auto max-w-7xl p-6 md:p-10">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.2fr_0.9fr]">
        <div className="space-y-3">
          {SOURCES.slice(0, 6).map((source, index) => (
            <motion.div
              key={source}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/50 p-4"
            >
              <span className="font-bold text-white">{source}</span>
              <CircleDot className="h-4 w-4 text-cyan-200" />
            </motion.div>
          ))}
        </div>
        <div className="relative overflow-hidden rounded-3xl border border-cyan-200/15 bg-black p-5 font-mono text-xs text-cyan-50">
          <div className="mb-4 flex items-center gap-2 text-zinc-500">
            <Terminal className="h-4 w-4" /> normalized CalendarEvent
          </div>
          <pre className="leading-6 text-cyan-100/90">{`{
  "title": "ETHGlobal Hackathon",
  "platform": "ethglobal",
  "start_time": "2026-06-18T10:00:00Z",
  "end_time": "2026-06-20T18:00:00Z",
  "event_type": "hackathon",
  "tags": ["web3", "builders"],
  "is_online": false,
  "url": "https://...",
  "status": "upcoming"
}`}</pre>
          <div className="packet-flow absolute bottom-0 left-0 h-px w-24 bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,.8)]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Scrapers', icon: Code2 },
            { label: 'Supabase', icon: Database },
            { label: 'Eventio', icon: CalendarDays },
            { label: 'Google Sync', icon: CalendarCheck },
          ].map(({ label, icon: Icon }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
              className="flex min-h-36 flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.04] p-5"
            >
              <Icon className="h-8 w-8 text-white" />
              <p className="font-black text-white">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassFrame>
  </section>
);

const Workflow = () => {
  const [active, setActive] = useState(0);
  const current = WORKFLOWS[active];

  return (
    <section id="workflow" className="relative z-10 bg-black px-6 py-28 md:py-36">
      <SectionIntro
        eyebrow="Workflow"
        title="Discover. Decide. Sync."
        body="A Huly-quality page does not explain with paragraphs alone. It changes the product scene while you read."
      />
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <GlassFrame className="p-5">
          <div className="mb-6 grid grid-cols-3 gap-2">
            {WORKFLOWS.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActive(index)}
                className={cn(
                  'rounded-2xl px-3 py-3 text-xs font-black tracking-widest uppercase transition',
                  active === index
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-zinc-400 hover:text-white',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-4xl font-black text-white">{current.title}</h3>
              <p className="mt-5 leading-7 text-zinc-400">{current.body}</p>
            </motion.div>
          </AnimatePresence>
        </GlassFrame>
        <GlassFrame className="min-h-[480px] p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 40, filter: 'blur(8px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -40, filter: 'blur(8px)' }}
              className="h-full"
            >
              {active === 0 && <DiscoverMock />}
              {active === 1 && <DecideMock />}
              {active === 2 && <SyncMock />}
            </motion.div>
          </AnimatePresence>
        </GlassFrame>
      </div>
    </section>
  );
};

const DiscoverMock = () => (
  <div className="flex h-full flex-col">
    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/60 p-4">
      <Search className="h-5 w-5 text-cyan-200" />
      <span className="text-zinc-400">Search hackathons, contests, AI challenges...</span>
    </div>
    <div className="mb-5 flex flex-wrap gap-2">
      {['online', 'free', 'advanced', 'this week', 'AI'].map((filter) => (
        <span
          key={filter}
          className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs font-bold text-cyan-100"
        >
          {filter}
        </span>
      ))}
    </div>
    <div className="grid flex-1 gap-3 md:grid-cols-2">
      {CALENDAR_EVENTS.slice(0, 6).map((event, index) => (
        <motion.div
          key={event.title}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: index * 0.18 }}
          className={cn('rounded-2xl border p-4 shadow-xl', toneClasses[event.tone])}
        >
          <p className="font-black text-white">{event.title}</p>
          <p className="mt-2 text-xs tracking-widest uppercase opacity-70">{event.tag}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

const DecideMock = () => (
  <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-black/70 p-6 shadow-2xl">
    <div className="mb-5 flex items-start justify-between">
      <div>
        <p className="text-[10px] font-black tracking-[0.25em] text-amber-200 uppercase">
          deadline protected
        </p>
        <h3 className="mt-2 text-3xl font-black text-white">Kaggle AI Challenge</h3>
      </div>
      <Flame className="h-8 w-8 text-amber-300" />
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        ['Platform', 'Kaggle'],
        ['Mode', 'Online'],
        ['Price', 'Free'],
        ['Status', 'Upcoming'],
        ['Tags', 'AI, dataset'],
        ['Timezone', 'UTC'],
      ].map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">{label}</p>
          <p className="mt-2 font-bold text-white">{value}</p>
        </div>
      ))}
    </div>
  </div>
);

const SyncMock = () => (
  <div className="relative flex min-h-[420px] items-center justify-center">
    <div className="packet-flow absolute top-1/2 h-1 w-32 rounded-full bg-emerald-300 shadow-[0_0_36px_rgba(52,211,153,.95)]" />
    <div className="grid w-full max-w-3xl grid-cols-[1fr_80px_1fr] items-center gap-3">
      <div className="rounded-3xl border border-white/10 bg-black/70 p-6">
        <CalendarDays className="mb-5 h-10 w-10 text-white" />
        <h3 className="text-2xl font-black text-white">ETHGlobal Hackathon</h3>
        <p className="mt-2 text-zinc-400">Eventio event card</p>
      </div>
      <div className="flex justify-center">
        <ChevronRight className="h-10 w-10 text-emerald-200" />
      </div>
      <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-6">
        <CheckCircle2 className="mb-5 h-10 w-10 text-emerald-200" />
        <h3 className="text-2xl font-black text-white">Synced</h3>
        <p className="mt-2 text-emerald-100/70">Google Calendar ready</p>
      </div>
    </div>
  </div>
);

const CalendarShowcase = () => {
  const eventByDay = useMemo(() => new Map(CALENDAR_EVENTS.map((event) => [event.day, event])), []);

  return (
    <section className="relative z-10 overflow-hidden bg-[#030405] px-6 py-28 md:py-36">
      <SectionIntro
        eyebrow="Calendar Showcase"
        title="The product becomes the art"
        body="A full product mockup, animated states, real event names, and enough detail to feel usable."
      />
      <GlassFrame className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-[10px] font-black tracking-[0.28em] text-zinc-500 uppercase">
              June 2026
            </p>
            <h3 className="text-3xl font-black text-white">Developer Opportunity Calendar</h3>
          </div>
          <div className="flex gap-2">
            {['Month', 'Week', 'Day', 'List'].map((view, index) => (
              <span
                key={view}
                className={cn(
                  'rounded-full px-4 py-2 text-xs font-black tracking-widest uppercase',
                  index === 0 ? 'bg-white text-black' : 'bg-white/5 text-zinc-400',
                )}
              >
                {view}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[10px] font-black tracking-widest text-zinc-500 uppercase"
            >
              {day}
            </div>
          ))}
          {Array.from({ length: 35 }).map((_, index) => {
            const day = index + 1;
            const event = eventByDay.get(day);
            return (
              <div
                key={day}
                className={cn(
                  'group min-h-28 rounded-2xl border border-white/10 bg-black/40 p-2 transition hover:-translate-y-1 hover:border-white/25 md:min-h-36',
                  event && 'shadow-2xl',
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500">{day}</span>
                  {event && (
                    <span className="pulse-soft h-2 w-2 rounded-full bg-current text-emerald-300" />
                  )}
                </div>
                {event && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className={cn(
                      'rounded-xl border p-2 text-[11px] shadow-xl md:p-3',
                      toneClasses[event.tone],
                    )}
                  >
                    <p className="line-clamp-2 font-black text-white">{event.title}</p>
                    <p className="mt-2 hidden text-[9px] font-black tracking-widest uppercase opacity-70 md:block">
                      {event.tag}
                    </p>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </GlassFrame>
    </section>
  );
};

const ArchitectureScene = () => (
  <section id="architecture" className="relative z-10 bg-black px-6 py-28 md:py-36">
    <SectionIntro
      eyebrow="Open Source System"
      title="Beautiful outside. Real engineering inside."
      body="Eventio is not a fake landing page. It has scrapers, docs, provider config, CI, and a deployable app."
    />
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <GlassFrame className="p-6">
        <Github className="mb-6 h-10 w-10 text-white" />
        <h3 className="text-3xl font-black text-white">Open-source core</h3>
        <p className="mt-4 leading-7 text-zinc-400">
          Source adapters, calendar UI, docs, deployment notes, and health checks live in the repo.
        </p>
        <a
          href="https://github.com/omkhalane/eventio"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-xs font-black tracking-widest text-black uppercase"
        >
          Star repository <ArrowRight className="h-4 w-4" />
        </a>
      </GlassFrame>
      <GlassFrame className="p-6 font-mono text-sm">
        {[
          ['apps/web/src', 'React calendar and landing page'],
          ['services/scraper', 'Python source adapters'],
          ['api/v1/health.ts', 'Vercel health endpoint'],
          ['docs/', 'Setup, scraping, scaling, SEO'],
          ['Supabase', 'Event and user data'],
          ['Firebase', 'Google auth and Calendar scope'],
        ].map(([path, desc], index) => (
          <motion.div
            key={path}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className="mb-3 flex items-center justify-between rounded-2xl border border-white/10 bg-black/50 p-4"
          >
            <span className="text-cyan-100">{path}</span>
            <span className="hidden text-zinc-500 md:block">{desc}</span>
          </motion.div>
        ))}
      </GlassFrame>
    </div>
  </section>
);

export const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const opacity = useTransform(scrollYProgress, [0, 0.22], [1, 0.2]);
  const rotateX = useSpring(0, { stiffness: 120, damping: 28 });
  const rotateY = useSpring(0, { stiffness: 120, damping: 28 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const x = (event.clientX - window.innerWidth / 2) / 70;
    const yValue = -(event.clientY - window.innerHeight / 2) / 90;
    rotateY.set(x);
    rotateX.set(yValue);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-x-hidden bg-black font-sans text-white selection:bg-cyan-300/25"
    >
      <SceneStyles />
      <div className="eventio-noise pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-overlay" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.18),transparent_30%),radial-gradient(circle_at_10%_40%,rgba(16,185,129,.12),transparent_24%),radial-gradient(circle_at_88%_45%,rgba(245,158,11,.10),transparent_26%),#020202]" />

      <nav className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/45 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0_0_36px_rgba(255,255,255,.18)]">
              <img src={LOGO_IMAGE} alt="Eventio" className="h-7 w-7" />
            </span>
            <span className="text-xl font-black tracking-tight">Eventio</span>
          </Link>
          <div className="hidden items-center gap-8 text-xs font-black tracking-[0.18em] text-zinc-400 uppercase md:flex">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#sources" className="hover:text-white">
              Sources
            </a>
            <a href="#workflow" className="hover:text-white">
              Workflow
            </a>
            <Link to="/architecture" className="hover:text-white">
              Architecture
            </Link>
          </div>
          <Link
            to="/calendar"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-black tracking-widest text-black uppercase"
          >
            Launch <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      <header className="relative z-10 overflow-hidden px-6 pt-36 pb-20 md:pt-44">
        <HeroConstellation />
        <motion.div
          style={{ y, opacity }}
          className="pointer-events-none absolute inset-x-0 top-0 h-[45rem] bg-[linear-gradient(to_bottom,rgba(255,255,255,.10),transparent)]"
        />
        <div className="relative mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-8 inline-flex items-center gap-3 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-5 py-3 text-xs font-black tracking-[0.25em] text-cyan-100 uppercase backdrop-blur-xl"
          >
            <Sparkles className="h-4 w-4" /> Live developer event intelligence
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 42 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.8 }}
            className="mx-auto max-w-6xl text-5xl leading-[0.86] font-black tracking-tight text-white uppercase sm:text-7xl md:text-8xl lg:text-[9.4rem]"
          >
            Never miss the next thing worth building.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.8 }}
            className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-300 md:text-2xl"
          >
            Track contests, hackathons, AI challenges, CTFs, conferences, and developer deadlines
            from scattered public sources in one fast calendar.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.8 }}
            className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
          >
            <Link
              to="/calendar"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-xs font-black tracking-widest text-black uppercase shadow-[0_0_50px_rgba(255,255,255,.18)]"
            >
              Launch Calendar <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/architecture"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-8 py-4 text-xs font-black tracking-widest text-white uppercase backdrop-blur-xl"
            >
              View Architecture <Layers3 className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
        <HeroProduct rotateX={rotateX} rotateY={rotateY} />
      </header>

      <SourceStream />
      <EventUniverse />
      <AliveBento />
      <Pipeline />
      <Workflow />
      <CalendarShowcase />
      <section className="relative z-10 overflow-hidden bg-black px-6 py-28">
        <div className="absolute inset-0 opacity-20">
          <img src={BANNER_IMAGE} alt="" className="h-full w-full object-cover" />
        </div>
        <SectionIntro
          eyebrow="Media Layer"
          title="Screenshots, signals, and product art"
          body="The landing page uses the product as imagery, not decoration. This is how Eventio stops feeling text-only."
        />
        <div className="relative mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          <GlassFrame className="p-3">
            <img
              src={OG_IMAGE}
              alt="Eventio visual preview"
              className="rounded-3xl border border-white/10"
            />
          </GlassFrame>
          <GlassFrame className="p-8">
            <Activity className="mb-8 h-12 w-12 text-cyan-200" />
            <h3 className="text-4xl font-black text-white">
              A designed system, not a decorated page.
            </h3>
            <p className="mt-5 leading-7 text-zinc-300">
              Huly works because each section is a product world. Eventio now follows that rhythm:
              source streams, category universe, pipeline film, workflow scene, and calendar
              showcase.
            </p>
          </GlassFrame>
        </div>
      </section>
      <ArchitectureScene />

      <section className="relative z-10 overflow-hidden bg-[#030405] px-6 py-32 text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)] bg-[size:56px_56px]" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center">
          <div className="relative mb-10 flex h-44 w-44 items-center justify-center rounded-full border border-white/10 bg-black">
            <div className="absolute h-36 w-36 rounded-full border border-cyan-200/20" />
            <div className="clock-hand absolute bottom-1/2 h-16 w-1 rounded-full bg-cyan-200" />
            <Clock3 className="h-16 w-16 text-white" />
          </div>
          <h2 className="text-5xl leading-[0.9] font-black tracking-tight text-white uppercase md:text-8xl">
            Track the deadline before it tracks you.
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
            Open the calendar, choose what matters, and protect the next contest, hackathon, or
            launch window before it slips away.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/calendar"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-9 py-5 text-xs font-black tracking-widest text-black uppercase"
            >
              Launch Calendar <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="https://github.com/omkhalane/eventio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-9 py-5 text-xs font-black tracking-widest text-white uppercase"
            >
              Star GitHub <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-black px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
              <img src={LOGO_IMAGE} alt="" className="h-7 w-7" />
            </span>
            <span className="text-2xl font-black">Eventio</span>
          </div>
          <p className="text-xs font-bold tracking-widest text-zinc-600 uppercase">
            Built for developers who live by deadlines.
          </p>
        </div>
      </footer>
    </div>
  );
};
