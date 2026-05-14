import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Database,
  GitBranch,
  Search,
  Shield,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';

import { buildApiUrl } from '../lib/api';
import { cn } from '../lib/utils';
import { Footer } from './Footer';
import { SeoHead } from './SeoHead';

const LOGO_IMAGE = '/assets/logo.svg';

const ACTIVE_USERS = [
  'https://i.pravatar.cc/80?img=11',
  'https://i.pravatar.cc/80?img=32',
  'https://i.pravatar.cc/80?img=48',
  'https://i.pravatar.cc/80?img=59',
  'https://i.pravatar.cc/80?img=68',
  'https://i.pravatar.cc/80?img=12',
];

const SOURCES = [
  'Codeforces',
  'LeetCode',
  'AtCoder',
  'Kaggle',
  'Devpost',
  'MLH',
  'Devfolio',
  'ETHGlobal',
  'Gitcoin',
  'Google Developers',
  'HackerRank',
  'TopCoder',
  'CodeChef',
  'SPOJ',
  'Project Euler',
  'GeeksforGeeks',
  'Codewars',
  'CodinGame',
  'Frontend Mentor',
  'Dev.to',
  'Medium',
  'AWS Events',
  'Google Cloud',
  'Docker',
  'React',
  'Vue',
  'Python',
  'Go',
  'Rust',
  'Web3',
  'Ethereum',
  'Y Combinator',
  'HackerNews',
];

const SOURCE_APPS = [
  { name: 'Codeforces', domain: 'codeforces.com', status: '2 events detected', tone: 'cyan' },
  { name: 'LeetCode', domain: 'leetcode.com', status: 'weekly contest found', tone: 'amber' },
  { name: 'AtCoder', domain: 'atcoder.jp', status: 'round indexed', tone: 'blue' },
  { name: 'Kaggle', domain: 'kaggle.com', status: 'deadline detected', tone: 'sky' },
  { name: 'Devpost', domain: 'devpost.com', status: 'submission window', tone: 'violet' },
  { name: 'ETHGlobal', domain: 'ethglobal.com', status: 'registration live', tone: 'emerald' },
  { name: 'Nvidia', domain: 'nvidia.com', status: 'workshop found', tone: 'lime' },
  {
    name: 'Google Devs',
    domain: 'developers.google.com',
    status: 'conference found',
    tone: 'rose',
  },
  { name: 'HackerRank', domain: 'hackerrank.com', status: 'contest active', tone: 'emerald' },
  { name: 'TopCoder', domain: 'topcoder.com', status: 'match scheduled', tone: 'amber' },
  { name: 'MLH', domain: 'mlh.io', status: 'hackathon live', tone: 'rose' },
  { name: 'CodeChef', domain: 'codechef.com', status: 'cook-off soon', tone: 'amber' },
];

const HeroPositions = [
  ['5%', '15%'],
  ['40%', '2%'],
  ['80%', '10%'],
  ['90%', '40%'],
  ['85%', '80%'],
  ['50%', '92%'],
  ['10%', '85%'],
  ['2%', '50%'],
  ['20%', '25%'],
  ['75%', '25%'],
  ['80%', '65%'],
  ['20%', '75%'],
];

const SAMPLE_EVENTS = [
  { day: '03', name: 'Codeforces Round', meta: 'contest / 02:14:33', kind: 'Contest' },
  { day: '05', name: 'Frontend Guild Sync', meta: 'community / online', kind: 'Conf' },
  { day: '08', name: 'ETHGlobal Hackathon', meta: 'hackathon / opens soon', kind: 'Hackathon' },
  { day: '11', name: 'Nvidia AI Workshop', meta: 'learning / limited seats', kind: 'AI' },
  { day: '13', name: 'Kaggle AI Challenge', meta: 'data science / deadline', kind: 'AI' },
  { day: '15', name: 'LeetCode Weekly', meta: 'contest / regular', kind: 'Contest' },
  { day: '18', name: 'picoCTF Live', meta: 'security / ongoing', kind: 'CTF' },
  { day: '21', name: 'React India 2026', meta: 'conference / bangalore', kind: 'Conf' },
  { day: '24', name: 'Google Developer Conf', meta: 'conference / online', kind: 'Conf' },
  { day: '26', name: 'MLH Build Weekend', meta: 'hackathon / world-wide', kind: 'Hackathon' },
  { day: '29', name: 'Devpost Submission', meta: 'deadline / 23:59', kind: 'Due' },
];

const KIND_THEMES: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    glow: string;
    dot: string;
    accent: string;
    pattern: string;
  }
> = {
  Contest: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    text: 'text-cyan-300',
    glow: 'shadow-[0_0_15px_rgba(34,211,238,0.2)]',
    dot: 'bg-cyan-400',
    accent: 'from-cyan-400/5',
    pattern: 'bg-[radial-gradient(circle_at_1px_1px,rgba(34,211,238,0.05)_1px,transparent_0)]',
  },
  Hackathon: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-300',
    glow: 'shadow-[0_0_15px_rgba(52,211,153,0.2)]',
    dot: 'bg-emerald-400',
    accent: 'from-emerald-400/5',
    pattern:
      'bg-[linear-gradient(45deg,rgba(52,211,153,0.03)_25%,transparent_25%,transparent_50%,rgba(52,211,153,0.03)_50%,rgba(52,211,153,0.03)_75%,transparent_75%,transparent)]',
  },
  AI: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_15px_rgba(251,191,36,0.2)]',
    dot: 'bg-amber-400',
    accent: 'from-amber-400/5',
    pattern: 'bg-[radial-gradient(rgba(251,191,36,0.05)_1.5px,transparent_0)]',
  },
  CTF: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-300',
    glow: 'shadow-[0_0_15px_rgba(251,113,133,0.2)]',
    dot: 'bg-rose-400',
    accent: 'from-rose-400/5',
    pattern:
      'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(251,113,133,0.03)_10px,rgba(251,113,133,0.03)_11px)]',
  },
  Conf: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-300',
    glow: 'shadow-[0_0_15px_rgba(167,139,250,0.2)]',
    dot: 'bg-violet-400',
    accent: 'from-violet-400/5',
    pattern: 'bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.04)_0,transparent_70%)]',
  },
  Due: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    text: 'text-orange-300',
    glow: 'shadow-[0_0_15px_rgba(251,146,60,0.2)]',
    dot: 'bg-orange-400',
    accent: 'from-orange-400/5',
    pattern: 'bg-[linear-gradient(to_right,rgba(251,146,60,0.03)_1px,transparent_1px)]',
  },
};

const CATEGORIES = [
  {
    title: 'Competitive programming',
    icon: Trophy,
    copy: 'Rounds, contests, ratings, and start windows.',
    domains: ['codeforces.com', 'leetcode.com', 'atcoder.jp'],
    accent: 'from-cyan-500/10 via-cyan-500/5',
  },
  {
    title: 'Hackathons',
    icon: GitBranch,
    copy: 'Registrations, build weekends, and submission deadlines.',
    domains: ['devpost.com', 'mlh.io', 'ethglobal.com'],
    accent: 'from-emerald-500/10 via-emerald-500/5',
  },
  {
    title: 'AI and data',
    icon: Database,
    copy: 'Kaggle-style challenges, workshops, and research events.',
    domains: ['kaggle.com', 'nvidia.com', 'developers.google.com'],
    accent: 'from-amber-500/10 via-amber-500/5',
  },
  {
    title: 'CTF and security',
    icon: Shield,
    copy: 'Live security competitions and challenge windows.',
    domains: ['picoctf.org', 'ctftime.org', 'tryhackme.com'],
    accent: 'from-rose-500/10 via-rose-500/5',
  },
];

const LANDING_CSS = `
  .eventio-grain {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.42'/%3E%3C/svg%3E");
  }
  .source-track { animation: sourceTrack 42s linear infinite; will-change: transform; }
  .source-track-alt { animation: sourceTrack 56s linear infinite reverse; will-change: transform; }
  .scan-quiet { animation: scanQuiet 5.5s ease-in-out infinite; will-change: transform, opacity; }
  .slow-float { animation: slowFloat 7s ease-in-out infinite; will-change: transform; }
  .slow-pulse { animation: slowPulse 3.6s ease-in-out infinite; will-change: opacity, transform; }
  .line-flow { animation: lineFlow 3.8s ease-in-out infinite; will-change: transform, opacity; }
  .orbit-dial { animation: orbitDial 34s linear infinite; will-change: transform; }
  .orbit-dial-reverse { animation: orbitDial 46s linear infinite reverse; will-change: transform; }
  .user-bob { animation: userBob 4.6s ease-in-out infinite; will-change: transform; }
  @keyframes shimmer {
    from { transform: translateX(-100%); }
    to { transform: translateX(100%); }
  }
  .magnetic-link { transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1); }
  .magnetic-link:hover { transform: translateY(-2px); }
  .logo-blink { animation: logoBlink 6s ease-in-out infinite; opacity: 0; }
  .pointer-glow {
    background: radial-gradient(circle, rgba(125,211,252,.12), rgba(255,255,255,.05) 32%, transparent 64%);
  }
  .accent-gradient {
    background:
      radial-gradient(circle at 20% 20%, rgba(125,211,252,.16), transparent 28%),
      radial-gradient(circle at 78% 36%, rgba(52,211,153,.12), transparent 28%),
      radial-gradient(circle at 50% 90%, rgba(251,191,36,.10), transparent 30%),
      #050505;
  }
  .soft-card-hover { transition: transform .35s ease, border-color .35s ease, background .35s ease; }
  .soft-card-hover:hover { transform: translateY(-4px); border-color: rgba(255,255,255,.22); background: rgba(255,255,255,.055); }
  .magnetic-link { transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease; }
  .magnetic-link:hover { transform: translateY(-2px); box-shadow: 0 18px 50px rgba(255,255,255,.12); }
  .radar-sweep { animation: radarSweep 5.4s linear infinite; transform-origin: 50% 100%; will-change: transform; }
  @keyframes sourceTrack { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes scanQuiet {
    0%, 100% { transform: translateY(-20%); opacity: 0; }
    28% { opacity: .38; }
    68% { transform: translateY(110%); opacity: .16; }
  }
  @keyframes slowFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes slowPulse {
    0%, 100% { opacity: .45; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.04); }
  }
  @keyframes lineFlow {
    0%, 100% { transform: translateX(-30%); opacity: 0; }
    35%, 70% { opacity: .8; }
    100% { transform: translateX(115%); opacity: 0; }
  }
  @keyframes orbitDial { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes radarSweep {
    from { transform: rotate(0deg); opacity: .08; }
    35% { opacity: .38; }
    to { transform: rotate(360deg); opacity: .08; }
  }
  @keyframes userBob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  @keyframes logoKill {
    0%, 15% { opacity: 1; transform: scale(1); filter: blur(0px); }
    16%, 95% { opacity: 0; transform: scale(0.5); filter: blur(4px); }
    96%, 100% { opacity: 1; transform: scale(1); filter: blur(0px); }
  }
  .logo-kill { animation: logoKill 6s linear infinite; }
  @keyframes orbitDialTick {
    0% { transform: rotate(0deg); }
    10% { transform: rotate(360deg); }
    20% { transform: rotate(720deg); }
    30% { transform: rotate(1080deg); }
    80% { transform: rotate(1260deg); }
    100% { transform: rotate(1440deg); }
  }
  .orbit-dial-tick { animation: orbitDialTick 6s linear infinite; will-change: transform; }
  .orbit-dial-tick-slow { animation: orbitDial 32s linear infinite; will-change: transform; }
  @keyframes radarBlipEvent {
    0%, 2%, 12%, 100% { opacity: 0.1; transform: scale(0.96); }
    5% { opacity: 1; transform: scale(1.02); }
    10% { opacity: 1; transform: scale(1); }
  }
  @keyframes radarRipple {
    0% { transform: scale(0); opacity: 1; border-width: 2px; }
    100% { transform: scale(4); opacity: 0; border-width: 0.5px; }
  }
  .radar-ripple {
    animation: radarRipple 6s linear infinite;
    border-color: rgba(255,255,255,0.4);
  }
  .radar-blip-card {
    animation: radarBlipEvent 5.4s linear infinite;
    will-change: transform, opacity;
  }
  @media (prefers-reduced-motion: reduce) {
    .source-track, .source-track-alt, .scan-quiet, .slow-float, .slow-pulse, .line-flow,
    .orbit-dial, .orbit-dial-reverse, .user-bob, .radar-sweep {
      animation: none !important;
    }
  }
`;

const fadeUp = {
  initial: { opacity: 1, y: 0 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
} as const;

const Shell = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div
    className={cn('relative overflow-hidden border border-white/10 bg-white/[0.035]', className)}
  >
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
    <div className="relative z-10">{children}</div>
  </div>
);

const SectionHeader = ({
  kicker,
  title,
  copy,
}: {
  kicker: string;
  title: string;
  copy: string;
}) => (
  <motion.div {...fadeUp} className="mx-auto mb-14 max-w-3xl text-center">
    <p className="mb-5 text-[11px] font-semibold tracking-[0.32em] text-stone-400 uppercase">
      {kicker}
    </p>
    <h2 className="text-4xl leading-[0.95] font-semibold tracking-[-0.04em] text-stone-50 md:text-7xl">
      {title}
    </h2>
    <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-stone-400 md:text-lg">{copy}</p>
  </motion.div>
);

const SourceMarquee = () => (
  <section className="relative overflow-hidden border-y border-white/10 bg-[#070707] py-7">
    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-[#070707] to-transparent md:w-64" />
    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-[#070707] to-transparent md:w-64" />
    <div className="source-track flex w-max gap-3">
      {[...SOURCES, ...SOURCES].map((source, index) => (
        <span
          key={`${source}-${index}`}
          className="soft-card-hover inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-[11px] font-semibold tracking-[0.18em] text-stone-300 uppercase"
        >
          <img
            src={`https://icon.horse/icon/${SOURCE_APPS[index % SOURCE_APPS.length].domain}`}
            alt=""
            className="h-4 w-4 rounded"
          />
          {source}
        </span>
      ))}
    </div>
  </section>
);

const HeroVisual = () => {
  const calculateDelay = (xStr: string, yStr: string) => {
    const x = parseFloat(xStr);
    const y = parseFloat(yStr);
    const dx = x - 50;
    const dy = y - 50;
    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return (angle / 360) * 5.4;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 44, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-14 max-w-7xl"
    >
      <div className="pointer-events-none absolute -inset-x-10 top-1/3 h-40 bg-white/[0.06] blur-3xl" />
      <Shell className="rounded-[28px] p-0 shadow-[0_50px_180px_rgba(0,0,0,.75)] md:rounded-[36px] md:p-5">
        <div className="origin-center scale-[0.5] py-10 sm:scale-[0.7] md:scale-100 md:py-0">
          <div className="scan-quiet pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-transparent via-white/12 to-transparent" />
          <div className="accent-gradient relative min-h-[500px] overflow-hidden rounded-[22px] border border-white/10 md:min-h-[620px] md:rounded-[28px]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:44px_44px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,.12),transparent_35%)]" />

            {/* Hero Radar Visual Background */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(52,211,153,0.08),transparent_55%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_40%,rgba(0,0,0,1)_100%)]" />
            </div>

            {/* Connection Lines (SVG Layer) */}
            <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-40">
              {SOURCE_APPS.map((app, index) => {
                const x = parseFloat(HeroPositions[index][0]);
                const y = parseFloat(HeroPositions[index][1]);
                const delay = calculateDelay(HeroPositions[index][0], HeroPositions[index][1]);
                return (
                  <motion.line
                    key={`line-${app.name}`}
                    x1="50%"
                    y1="50%"
                    x2={`${x}%`}
                    y2={`${y}%`}
                    stroke="white"
                    strokeWidth="0.5"
                    strokeDasharray="4 4"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{
                      opacity: [0, 0.4, 0],
                      pathLength: [0, 1, 1],
                    }}
                    transition={{
                      duration: 5.4,
                      repeat: Infinity,
                      delay: delay,
                      times: [0, 0.05, 1],
                      ease: 'linear',
                    }}
                  />
                );
              })}
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="orbit-dial absolute h-[18rem] w-[18rem] rounded-full border-2 border-white/10 md:h-[24rem] md:w-[24rem]" />
              <div className="orbit-dial-reverse absolute h-[21rem] w-[21rem] rounded-full border border-dashed border-white/5 md:h-[28rem] md:w-[28rem]" />

              {/* Ripple Rings */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={`ripple-${i}`}
                    className="radar-ripple absolute rounded-full border"
                    style={{
                      width: '32rem',
                      height: '32rem',
                      animationDelay: `${i * 1.2}s`,
                    }}
                  />
                ))}
              </div>

              <div className="radar-sweep absolute bottom-1/2 left-1/2 z-20 h-[12rem] w-[2px] origin-bottom md:h-[28rem]">
                <div className="absolute right-0 bottom-0 h-full w-[14rem] origin-bottom-right rounded-tl-full bg-gradient-to-tl from-emerald-400/40 via-emerald-400/10 to-transparent blur-2xl md:w-[32rem]" />
                <div className="relative h-full w-full bg-gradient-to-t from-emerald-100 via-emerald-300 to-transparent shadow-[0_0_40px_rgba(52,211,153,1)]">
                  <div className="absolute inset-0 bg-white/20 blur-[2px]" />
                </div>
              </div>
              <div className="absolute h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl md:h-64 md:w-64" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-[400px] max-w-5xl items-center justify-center px-5 md:min-h-[620px]">
              <div className="group relative flex h-48 w-48 items-center justify-center rounded-full border border-emerald-500/30 bg-black shadow-[0_0_80px_rgba(52,211,153,.15)] backdrop-blur-md transition-colors duration-500 hover:border-emerald-400/50 md:h-80 md:w-80">
                <div className="absolute h-[92%] w-[92%] rounded-full border border-emerald-400/10" />
                <div className="absolute h-[84%] w-[84%] rounded-full border border-emerald-400/5" />
                <div className="absolute h-[76%] w-[76%] rounded-full border border-dashed border-emerald-400/5" />
                <div className="z-30 flex h-32 w-32 flex-col items-center justify-center rounded-full border border-white/20 bg-black p-4 text-center shadow-[0_0_40px_rgba(0,0,0,1)] backdrop-blur-xl transition-transform duration-500 group-hover:scale-105 md:h-48 md:w-48">
                  <p className="text-base font-black tracking-tighter text-white md:text-2xl">
                    eventio
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[8px] font-bold tracking-widest text-emerald-300 uppercase shadow-[0_0_15px_rgba(52,211,153,0.2)] md:mt-3 md:text-[10px]">
                    <span className="slow-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    scanning
                  </div>
                </div>
              </div>

              {SOURCE_APPS.map((app, index) => {
                const delay = calculateDelay(HeroPositions[index][0], HeroPositions[index][1]);
                const baseOpacity = 0.4 + (index % 4) * 0.12;
                return (
                  <div
                    key={`${app.name}-container`}
                    style={{
                      position: 'absolute',
                      left: HeroPositions[index][0],
                      top: HeroPositions[index][1],
                      opacity: baseOpacity,
                    }}
                  >
                    {/* Detection Pulse Ring */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: [0, 0.6, 0],
                        scale: [0.8, 1.8],
                        borderWidth: ['1px', '0px'],
                      }}
                      transition={{
                        duration: 5.4,
                        repeat: Infinity,
                        delay: delay,
                        times: [0, 0.05, 0.3],
                        ease: 'easeOut',
                      }}
                      className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40"
                    />

                    <div
                      className="soft-card-hover radar-blip-card group absolute flex w-28 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-black/80 p-1.5 text-left shadow-[0_10px_25px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:bg-black/90 md:w-48 md:rounded-2xl md:p-3"
                      style={{
                        animationDelay: `${delay}s`,
                      }}
                    >
                      <div className="flex items-center gap-1.5 md:gap-3">
                        <div className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5 p-1 transition-colors group-hover:bg-white/10 md:h-10 md:w-10 md:rounded-xl md:p-1.5">
                          <img
                            src={`https://icon.horse/icon/${app.domain}`}
                            alt={`${app.name} logo`}
                            className="h-full w-full rounded-sm object-contain drop-shadow-md filter md:rounded-md"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-bold text-stone-100 transition-colors group-hover:text-white md:text-sm">
                            {app.name}
                          </p>
                          <p className="mt-0.5 truncate text-[7px] font-bold tracking-wider text-stone-400 uppercase group-hover:text-stone-300 md:text-[9px]">
                            {app.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10 text-white/20 shadow-inner md:mt-3 md:h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${56 + index * 5}%` }}
                          transition={{ delay: delay + 0.1, duration: 1 }}
                          className={cn(
                            'h-full rounded-full shadow-[0_0_10px_currentColor]',
                            app.tone === 'cyan' && 'bg-cyan-400 text-cyan-400',
                            app.tone === 'amber' && 'bg-amber-400 text-amber-400',
                            app.tone === 'blue' && 'bg-blue-400 text-blue-400',
                            app.tone === 'sky' && 'bg-sky-400 text-sky-400',
                            app.tone === 'violet' && 'bg-violet-400 text-violet-400',
                            app.tone === 'emerald' && 'bg-emerald-400 text-emerald-400',
                            app.tone === 'lime' && 'bg-lime-400 text-lime-400',
                            app.tone === 'rose' && 'bg-rose-400 text-rose-400',
                          )}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Shell>
    </motion.div>
  );
};

const ProblemClock = () => {
  const clockPositions = [
    { angle: 30, left: '15%', top: '25%' },
    { angle: 70, left: '75%', top: '20%' },
    { angle: 120, left: '81%', top: '55%' },
    { angle: 210, left: '25%', top: '80%' },
    { angle: 0, left: '50%', top: '8%' },
    { angle: 260, left: '9%', top: '60%' },
    { angle: 170, left: '60%', top: '85%' },
    { angle: 100, left: '90%', top: '40%' },
    { angle: 45, left: '30%', top: '12%' },
    { angle: 150, left: '72%', top: '78%' },
    { angle: 190, left: '42%', top: '84%' },
    { angle: 300, left: '18%', top: '42%' },
  ];

  return (
    <div className="relative z-10 mx-auto flex h-[400px] w-full max-w-lg items-center justify-center md:h-[510px]">
      {/* Background Pulse Animation */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="h-[24rem] w-[24rem] rounded-full bg-emerald-500/10 blur-[80px] md:h-[32rem] md:w-[32rem]"
        />
      </div>

      <div className="absolute h-[20rem] w-[20rem] rounded-full border border-white/5 shadow-[0_0_60px_rgba(255,255,255,0.01)] md:h-[28rem] md:w-[28rem]" />
      <div className="orbit-dial absolute h-[16rem] w-[16rem] rounded-full border border-dashed border-white/5 md:h-[22rem] md:w-[22rem]" />
      <div className="orbit-dial-reverse absolute h-[14rem] w-[14rem] rounded-full border border-white/5 md:h-[18rem] md:w-[18rem]" />

      {/* Main Clock Body */}
      <div className="relative z-20 flex h-[12rem] w-[12rem] items-center justify-center rounded-full bg-black shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_0_40px_rgba(255,255,255,0.03)] md:h-[18rem] md:w-[18rem]">
        <div className="absolute inset-2 rounded-full border border-stone-800" />

        {/* Hour Hand (Tapered/Pointer) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 z-10 h-[28%] w-[6px] origin-bottom -translate-x-1/2 -translate-y-full md:w-[8px]"
          style={{
            background: 'linear-gradient(to top, rgba(225,29,72,0.8), rgba(251,146,60,1))',
            clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
          }}
        />

        {/* Minute Hand (Tapered/Pointer) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 z-20 h-[92%] w-[2px] origin-bottom -translate-x-1/2 -translate-y-full md:w-[3px]"
          style={{
            background: 'linear-gradient(to top, rgba(220,38,38,0.8), rgba(255,255,255,1))',
            clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
          }}
        />

        {/* Center Point */}
        <div className="absolute top-1/2 left-1/2 z-30 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-black bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] md:h-5 md:w-5" />
        <div className="pointer-events-none absolute -inset-10 rounded-full bg-emerald-500/10 opacity-30 blur-2xl md:-inset-14 md:blur-3xl" />
      </div>

      {SOURCE_APPS.map((app, index) => {
        const pos = clockPositions[index % clockPositions.length];

        return (
          <div
            key={`clock-${app.name}`}
            className="absolute flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/80 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md md:h-14 md:w-14 md:rounded-2xl"
            style={{
              left: pos.left,
              top: pos.top,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <img
              src={`https://icon.horse/icon/${app.domain}`}
              alt=""
              className="h-5 w-5 rounded-sm object-contain opacity-70 md:h-8 md:w-8 md:rounded-md"
            />
          </div>
        );
      })}
    </div>
  );
};

const ProblemScene = () => (
  <section className="relative overflow-hidden bg-[#0a0a0a] px-6 py-28 md:py-36">
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:52px_52px]" />
    <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
      <motion.div {...fadeUp}>
        <p className="mb-5 text-[11px] font-semibold tracking-[0.32em] text-stone-500 uppercase">
          The problem
        </p>
        <h2 className="max-w-xl bg-gradient-to-b from-stone-50 to-stone-400 bg-clip-text text-5xl leading-[0.92] font-black tracking-[-0.045em] text-transparent md:text-7xl">
          Deadlines scattered across the web.
        </h2>
        <p className="mt-7 max-w-lg text-lg leading-8 text-stone-400">
          Eventio turns contest pages, hackathon portals, challenge feeds, and conference listings
          into one calm calendar. Less hunting. More building.
        </p>
      </motion.div>

      <Shell className="rounded-[36px] p-4 md:p-6">
        <div className="relative min-h-[580px] overflow-hidden rounded-[28px] border border-white/5 bg-black/90 p-5 shadow-[inset_0_0_120px_rgba(0,0,0,1)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(125,211,252,.05),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.015)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <ProblemClock />
        </div>
      </Shell>
    </div>
  </section>
);

const CalendarShowcase = () => (
  <section className="relative bg-black px-6 py-28 md:py-36">
    <SectionHeader
      kicker="The product"
      title="A calendar that feels composed."
      copy="Dense enough for serious developers, quiet enough to scan every day."
    />
    <Shell className="mx-auto max-w-7xl rounded-[32px] p-4 md:p-7">
      <div className="pointer-events-none absolute top-8 right-8 hidden h-28 w-28 rounded-full border border-white/10 md:block" />
      <div className="pointer-events-none absolute top-16 right-16 hidden h-14 w-14 rounded-full border border-dashed border-white/10 md:block" />
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold tracking-[0.28em] text-cyan-400 uppercase drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            June 2026
          </p>
          <h3 className="mt-2 bg-gradient-to-r from-stone-50 to-stone-400 bg-clip-text text-3xl font-bold tracking-[-0.035em] text-transparent">
            Developer opportunity calendar
          </h3>
        </div>
        <div className="flex gap-2 rounded-full border border-white/10 bg-black/50 p-1 backdrop-blur-md">
          {['Month', 'Week', 'Day', 'List'].map((view, index) => (
            <span
              key={view}
              className={cn(
                'magnetic-link cursor-pointer rounded-full px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase transition-all duration-300',
                index === 0
                  ? 'bg-stone-100 text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                  : 'text-stone-400 hover:bg-white/5 hover:text-stone-100',
              )}
            >
              {view}
            </span>
          ))}
        </div>
      </div>

      {/* Content for all screens, but grid becomes scrollable on small ones */}
      <div className="relative">
        <div className="overflow-x-auto pb-4 md:overflow-visible md:pb-0">
          <div className="flex gap-4 md:grid md:grid-cols-[280px_1fr] md:gap-5">
            <aside className="hidden w-[280px] shrink-0 space-y-3 lg:block">
              <div className="soft-card-hover rounded-3xl border border-white/10 bg-black p-5">
                <div className="mb-4 flex items-center gap-3">
                  <Search className="h-4 w-4 text-stone-400" />
                  <span className="text-xs font-semibold tracking-widest text-stone-500 uppercase">
                    Search events
                  </span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-stone-400">
                  hackathon, contest, AI...
                </div>
              </div>
              <div className="soft-card-hover rounded-3xl border border-white/10 bg-black p-5">
                <p className="mb-4 text-xs font-semibold tracking-widest text-stone-500 uppercase">
                  Quick filters
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Online', 'Free', 'This week', 'Syncable', 'AI'].map((filter, index) => (
                    <span
                      key={filter}
                      className={cn(
                        'rounded-full border px-3 py-1 text-[10px] font-semibold tracking-widest uppercase',
                        index === 0
                          ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100'
                          : 'border-white/10 text-stone-400',
                      )}
                    >
                      {filter}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-emerald-300/20 bg-gradient-to-br from-emerald-300/10 to-transparent p-5">
                <CalendarCheck className="mb-5 h-7 w-7 text-emerald-200" />
                <p className="text-lg font-semibold text-stone-50">3 events ready to sync</p>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Google Calendar connection is available for protected deadlines.
                </p>
              </div>
              <div className="soft-card-hover overflow-hidden rounded-3xl border border-white/10 bg-black p-5">
                <p className="mb-4 text-xs font-semibold tracking-widest text-stone-500 uppercase">
                  Source radar
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {SOURCE_APPS.slice(0, 7).map((app) => (
                    <span
                      key={app.name}
                      className="flex aspect-square items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035]"
                    >
                      <img
                        src={`https://icon.horse/icon/${app.domain}`}
                        alt={`${app.name} logo`}
                        className="h-6 w-6 rounded-md"
                      />
                    </span>
                  ))}
                  <span className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.02] text-xs font-bold text-stone-400">
                    +70
                  </span>
                </div>
              </div>
            </aside>

            <div className="min-w-[700px] flex-1 md:min-w-0">
              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-[10px] font-semibold tracking-widest text-stone-600 uppercase"
                  >
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }).map((_, index) => {
                  const eventDay = String(index + 1).padStart(2, '0');
                  const event = SAMPLE_EVENTS.find((item) => item.day === eventDay);
                  const theme = event ? KIND_THEMES[event.kind] : null;

                  return (
                    <div
                      key={index}
                      className="soft-card-hover group relative min-h-[90px] overflow-hidden rounded-xl border border-white/5 bg-stone-900/20 p-1.5 transition-all duration-300 hover:border-white/10 md:min-h-40 md:rounded-2xl md:p-2"
                    >
                      <div
                        className={cn(
                          'absolute inset-0 bg-gradient-to-br from-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                          theme?.accent,
                        )}
                      />

                      <div className="relative z-10 mb-1 flex items-center justify-between md:mb-2">
                        <span
                          className={cn(
                            'text-[10px] font-black transition-colors md:text-xs',
                            event ? 'text-stone-300' : 'text-stone-700 group-hover:text-stone-500',
                          )}
                        >
                          {index + 1}
                        </span>
                        {theme && (
                          <div
                            className={cn(
                              'slow-pulse h-1 w-1 rounded-full md:h-1.5 md:w-1.5',
                              theme.dot,
                              theme.glow,
                            )}
                          />
                        )}
                      </div>

                      {event && theme && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          className={cn(
                            'relative z-10 h-[calc(100%-1.5rem)] overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-md transition-all duration-500 md:h-[calc(100%-2rem)] md:rounded-xl md:p-2.5',
                            'group-hover:-translate-y-1 group-hover:border-white/20 group-hover:bg-white/[0.08] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]',
                          )}
                        >
                          <div
                            className={cn(
                              'absolute inset-0 bg-[size:6px_6px] opacity-30 md:bg-[size:10px_10px]',
                              theme.pattern,
                            )}
                          />
                          <div className="relative flex h-full flex-col justify-between overflow-hidden">
                            <p className="line-clamp-2 text-[9px] leading-[1.1] font-bold text-stone-100 md:text-xs md:leading-tight">
                              {event.name}
                            </p>
                            <div className="mt-1 flex items-center justify-between md:mt-2">
                              <div
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-md border px-1 py-0.5 text-[6px] font-black tracking-widest uppercase transition-colors md:gap-1.5 md:px-1.5 md:text-[8px]',
                                  theme.border,
                                  theme.bg,
                                  theme.text,
                                )}
                              >
                                <span
                                  className={cn(
                                    'h-0.5 w-0.5 rounded-full md:h-1 md:w-1',
                                    theme.dot,
                                  )}
                                />
                                {event.kind}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  </section>
);


const CategoryGrid = () => (
  <section className="bg-black px-6 py-28 md:py-36">
    <SectionHeader
      kicker="Coverage"
      title="Built around the events developers chase."
      copy="No decorative feature grid. Just the core worlds Eventio needs to handle well."
    />
    <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2">
      {CATEGORIES.map(({ title, icon: Icon, copy, domains, accent }, index) => (
        <motion.div key={title} {...fadeUp} transition={{ duration: 0.65, delay: index * 0.06 }}>
          <Shell className="soft-card-hover group min-h-72 rounded-[30px] border-white/10 p-7 transition-colors duration-700 hover:border-transparent">
            <div
              className={cn(
                'pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] to-transparent opacity-60',
                accent,
              )}
            />
            <div className="pointer-events-none absolute right-0 bottom-0 h-48 w-48 rounded-tl-[100px] border-t-2 border-l-2 border-white/10 bg-gradient-to-tl from-white/5 to-transparent opacity-0 transition-all duration-700 group-hover:opacity-100" />
            <div className="pointer-events-none absolute right-12 bottom-12 flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-dashed border-white/20 opacity-30 transition-all duration-1000 group-hover:scale-[1.3] group-hover:rotate-[360deg] group-hover:border-white/50 group-hover:opacity-100">
              <Swords className="h-6 w-6 text-white opacity-0 transition-opacity delay-200 duration-1000 group-hover:opacity-100" />
              <span className="mt-1 text-[8px] font-bold tracking-widest text-white uppercase opacity-0 transition-opacity delay-300 duration-1000 group-hover:opacity-100">
                Battle
              </span>
            </div>
            <div className="relative z-10 mb-16 flex items-center justify-between">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)] backdrop-blur-md transition-transform group-hover:scale-110">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-3 transition-all duration-300 hover:space-x-1">
                  {domains.map((domain) => (
                    <span
                      key={domain}
                      className="z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-stone-900 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all hover:z-20 hover:scale-125"
                    >
                      <img
                        src={`https://icon.horse/icon/${domain}`}
                        alt=""
                        className="h-6 w-6 rounded-md"
                      />
                    </span>
                  ))}
                </div>
                <span className="ml-2 text-xs font-bold text-stone-500">+ more</span>
              </div>
            </div>
            <h3 className="relative z-10 text-3xl font-bold tracking-tight text-white transition-colors group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-stone-400 group-hover:bg-clip-text group-hover:text-transparent">
              {title}
            </h3>
            <p className="relative z-10 mt-4 max-w-md leading-relaxed font-medium text-stone-400">
              {copy}
            </p>
            <div className="relative z-10 mt-8 flex items-center gap-4 text-xs font-bold tracking-widest text-stone-500 uppercase">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-white shadow-inner">
                0{index + 1} monitored
              </span>
            </div>
          </Shell>
        </motion.div>
      ))}
    </div>
  </section>
);

export default function LandingPage() {
  const [pointer, setPointer] = useState({ x: -100, y: -100 });
  const [stats, setStats] = useState<{ upcoming: number; past: number } | null>(null);

  useEffect(() => {
    fetch(buildApiUrl('/api/v1/stats'))
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      setPointer({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  const [particles, setParticles] = useState<
    {
      initialX: string;
      initialY: string;
      animateX: string;
      duration: number;
    }[]
  >([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(
      [...Array(6)].map(() => ({
        initialX: Math.random() * 100 + '%',
        initialY: Math.random() * 100 + '%',
        animateX: (Math.random() - 0.5) * 200 + 'px',
        duration: 15 + Math.random() * 10,
      })),
    );
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-black font-sans text-stone-50 selection:bg-stone-50 selection:text-black">
      <SeoHead
        title="Eventio | Developer Events, Hackathons, and Contests"
        description="Discover developer events, hackathons, competitions, and coding contests with production-grade search and SEO-friendly event pages."
        canonicalPath="/"
      />
      <style>{LANDING_CSS}</style>
      <div
        className="pointer-glow pointer-events-none fixed z-[60] hidden h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full md:block"
        style={{ left: pointer.x, top: pointer.y }}
      />
      <div className="eventio-grain pointer-events-none fixed inset-0 z-50 opacity-[0.025] mix-blend-screen" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.08),transparent_28%),#000]" />

      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/[0.05] shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-colors group-hover:bg-white/10">
              <img
                src={LOGO_IMAGE}
                alt="Eventio"
                className="h-6 w-6 rounded-md transition-transform group-hover:scale-110"
              />
            </span>
            <span className="bg-gradient-to-r from-stone-50 to-stone-400 bg-clip-text text-2xl font-black tracking-tighter text-transparent">
              Eventio
            </span>
          </Link>
          <div className="hidden items-center gap-6 text-xs font-bold tracking-[0.2em] text-stone-400 uppercase lg:flex">
            <Link to="/" className="transition-colors hover:text-emerald-400">Home</Link>
            <Link to="/calendar" className="transition-colors hover:text-emerald-400">Calendar</Link>
            <Link to="/hackathons" className="transition-colors hover:text-emerald-400">Hackathons</Link>
            <Link to="/contests" className="transition-colors hover:text-emerald-400">Contests</Link>
            <Link to="/resources" className="transition-colors hover:text-emerald-400">Resources</Link>
            <Link to="/about" className="transition-colors hover:text-emerald-400">About</Link>
            <Link to="/api" className="transition-colors hover:text-emerald-400">API Docs</Link>
          </div>
          <div className="flex items-center gap-6">
            {stats && (
              <div className="hidden items-center gap-4 text-xs font-bold tracking-widest text-stone-400 uppercase md:flex">
                <span>
                  <span className="text-emerald-400">{stats.upcoming}</span> upcoming
                </span>
                <span>
                  <span className="text-stone-300">{stats.past}</span> past
                </span>
              </div>
            )}
            <Link
              to="/calendar"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-3 text-xs font-bold tracking-widest text-black uppercase shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-emerald-200 via-white to-cyan-200 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="absolute inset-x-0 h-[unset] bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative z-10 flex items-center gap-2">
                Launch{' '}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <header className="relative z-10 px-6 pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {/* Main Mesh Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(52,211,153,0.15),transparent_70%)]" />

          {/* Animated Artistic Blobs */}
          <motion.div
            animate={{
              x: [0, 80, -40, 0],
              y: [0, -40, 40, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1/4 -left-1/4 h-[80%] w-[80%] rounded-full bg-emerald-500/5 blur-[60px] will-change-transform"
          />
          <motion.div
            animate={{
              x: [0, -60, 100, 0],
              y: [0, 80, -40, 0],
              scale: [1, 0.9, 1.1, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-1/4 -bottom-1/4 h-[80%] w-[80%] rounded-full bg-cyan-500/5 blur-[60px] will-change-transform"
          />

          {/* Artistic Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.015)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] bg-[size:80px_80px]" />

          {/* Digital Grain / Noise effect */}
          <div className="absolute inset-0 [background-image:url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-150 contrast-150" />

          {/* Floating artistic particles */}
          {particles.map((p, i) => (
            <motion.div
              key={i}
              initial={{
                x: p.initialX,
                y: p.initialY,
                opacity: 0,
              }}
              animate={{
                y: ['-20%', '120%'],
                opacity: [0, 0.2, 0],
                x: p.animateX,
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: i * 2,
                ease: 'linear',
              }}
              className="absolute h-1 w-1 rounded-full bg-emerald-400/30 blur-[2px]"
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="mx-auto mb-8 inline-flex items-center gap-3 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-[11px] font-bold tracking-[0.28em] text-emerald-300 uppercase shadow-[0_0_20px_rgba(52,211,153,0.15)]"
          >
            <Sparkles className="slow-pulse h-4 w-4 text-emerald-400" /> Developer event
            intelligence
          </motion.div>
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.15 } },
            }}
            className="mx-auto max-w-6xl text-5xl leading-[0.85] font-black tracking-[-0.065em] sm:text-7xl md:text-8xl lg:text-[9rem]"
          >
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 30, filter: 'blur(30px)' },
                visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
              }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block text-stone-100 drop-shadow-2xl"
            >
              Never miss
            </motion.span>
            <br />
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 30, filter: 'blur(30px)' },
                visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
              }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block text-stone-200/90"
            >
              the next
            </motion.span>
            <br />
            <motion.span
              variants={{
                hidden: { opacity: 0, y: 30, filter: 'blur(30px)' },
                visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
              }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(52,211,153,0.3)]"
            >
              thing worth building.
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.75 }}
            className="mx-auto mt-8 max-w-3xl text-lg leading-8 font-medium text-stone-400 md:text-2xl"
          >
            A quiet command center for coding contests, hackathons, AI challenges, CTFs,
            conferences, and developer deadlines.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.75 }}
            className="mt-10 flex flex-col justify-center gap-5 sm:flex-row"
          >
            <Link
              to="/calendar"
              className="group magnetic-link relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-stone-50 px-9 py-4 text-xs font-bold tracking-widest text-black uppercase shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
            >
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-emerald-200 via-white to-cyan-200 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="absolute inset-x-0 h-full w-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative z-10 flex items-center gap-2">
                Open Calendar{' '}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <a
              href="https://github.com/omkhalane/eventio"
              target="_blank"
              rel="noopener noreferrer"
              className="group magnetic-link inline-flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/[0.05] px-9 py-4 text-xs font-bold tracking-widest text-stone-100 uppercase shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              Star GitHub <Star className="h-5 w-5 transition-transform group-hover:scale-110" />
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.7 }}
            className="mx-auto mt-8 flex w-fit flex-col items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 sm:flex-row"
          >
            <div className="flex -space-x-2">
              {ACTIVE_USERS.map((user, index) => (
                <span
                  key={user}
                  className="user-bob flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-black bg-stone-100"
                  style={{ animationDelay: `${index * 0.16}s` }}
                >
                  <img src={user} alt="" className="h-full w-full object-cover" />
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-stone-400 uppercase">
              <Users className="h-4 w-4 text-stone-300" />
              1K+ active developers
            </div>
          </motion.div>
        </div>
        <HeroVisual />
      </header>

      <SourceMarquee />
      <ProblemScene />
      <div id="product">
        <CalendarShowcase />
      </div>
      <div id="coverage">
        <CategoryGrid />
      </div>

      <section className="relative overflow-hidden bg-[#080808] px-6 py-28 text-center md:py-36">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <motion.div {...fadeUp} className="relative mx-auto max-w-5xl">
          <div className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.035]">
            <CheckCircle2 className="h-10 w-10 text-stone-50" />
          </div>
          <h2 className="text-5xl leading-[0.92] font-semibold tracking-[-0.055em] text-stone-50 md:text-8xl">
            Track the deadline before it tracks you.
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-stone-400">
            Open Eventio, find what matters, and sync the dates you refuse to lose.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-5 sm:flex-row">
            <Link
              to="/calendar"
              className="group magnetic-link inline-flex items-center justify-center gap-3 rounded-full bg-stone-50 px-9 py-5 text-xs font-bold tracking-widest text-black uppercase shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
            >
              Launch Calendar{' '}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
