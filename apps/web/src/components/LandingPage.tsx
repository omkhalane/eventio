import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Code2,
  Database,
  GitBranch,
  Github,
  Layers3,
  Radio,
  Search,
  Shield,
  Sparkles,
  Swords,
  Terminal,
  Trophy,
  Users,
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '../lib/utils';

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

const SAMPLE_EVENTS = [
  { day: '03', name: 'Codeforces Round', meta: 'contest / 02:14:33', kind: 'Contest' },
  { day: '08', name: 'ETHGlobal Hackathon', meta: 'hackathon / opens soon', kind: 'Hackathon' },
  { day: '13', name: 'Kaggle AI Challenge', meta: 'data science / deadline', kind: 'AI' },
  { day: '18', name: 'picoCTF Live', meta: 'security / ongoing', kind: 'CTF' },
  { day: '24', name: 'Google Developer Conf', meta: 'conference / online', kind: 'Conf' },
  { day: '29', name: 'Devpost Submission', meta: 'deadline / 23:59', kind: 'Due' },
];

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
  .source-track { animation: sourceTrack 42s linear infinite; }
  .source-track-alt { animation: sourceTrack 56s linear infinite reverse; }
  .scan-quiet { animation: scanQuiet 5.5s ease-in-out infinite; }
  .slow-float { animation: slowFloat 7s ease-in-out infinite; }
  .slow-pulse { animation: slowPulse 3.6s ease-in-out infinite; }
  .line-flow { animation: lineFlow 3.8s ease-in-out infinite; }
  .orbit-dial { animation: orbitDial 34s linear infinite; }
  .orbit-dial-reverse { animation: orbitDial 46s linear infinite reverse; }
  .user-bob { animation: userBob 4.6s ease-in-out infinite; }
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
  .radar-sweep { animation: radarSweep 5.4s linear infinite; transform-origin: 50% 100%; }
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
  .orbit-dial-tick { animation: orbitDialTick 6s linear infinite; }
  .orbit-dial-tick-slow { animation: orbitDial 32s linear infinite; }
  @keyframes radarBlipEvent {
    0%, 9%, 100% { opacity: 0.05; filter: brightness(0.5); transform: scale(0.95); }
    2% { opacity: 1; filter: brightness(1.5); transform: scale(1.1); }
  }
  .radar-blip-card {
    animation: radarBlipEvent 5.4s linear infinite;
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

const HeroVisual = () => (
  <motion.div
    initial={{ opacity: 0, y: 44, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay: 0.2, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    className="relative mx-auto mt-14 max-w-7xl"
  >
    <div className="pointer-events-none absolute -inset-x-10 top-1/3 h-40 bg-white/[0.06] blur-3xl" />
    <Shell className="rounded-[28px] p-3 shadow-[0_50px_180px_rgba(0,0,0,.75)] md:rounded-[36px] md:p-5">
      <div className="scan-quiet pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-transparent via-white/12 to-transparent" />
      <div className="accent-gradient relative min-h-[460px] overflow-hidden rounded-[22px] border border-white/10 md:min-h-[620px] md:rounded-[28px]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,.12),transparent_35%)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="orbit-dial absolute h-[18rem] w-[18rem] rounded-full border-2 border-white/20 md:h-[24rem] md:w-[24rem]" />
          <div className="orbit-dial-reverse absolute h-[21rem] w-[21rem] rounded-full border border-dashed border-white/10 md:h-[28rem] md:w-[28rem]" />

          <div className="radar-sweep absolute bottom-1/2 left-1/2 z-20 h-[12rem] w-[2px] origin-bottom md:h-[28rem]">
            <div className="absolute right-0 bottom-0 h-full w-[14rem] origin-bottom-right rounded-tl-full bg-gradient-to-tl from-emerald-400/20 via-emerald-400/5 to-transparent blur-md md:w-[28rem]" />
            <div className="h-full w-full bg-gradient-to-t from-emerald-300 via-emerald-300/40 to-transparent shadow-[0_0_20px_rgba(52,211,153,0.8)]" />
          </div>
          <div className="absolute h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl md:h-64 md:w-64" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[460px] max-w-5xl items-center justify-center px-5 md:min-h-[620px]">
          <div className="group relative flex h-56 w-56 items-center justify-center rounded-full border border-emerald-500/30 bg-black/60 shadow-[0_0_100px_rgba(52,211,153,.15)] backdrop-blur-xl transition-colors duration-500 hover:border-emerald-400/50 md:h-80 md:w-80">
            <div className="absolute h-[85%] w-[85%] rounded-full border border-emerald-400/20" />
            <div className="absolute h-[70%] w-[70%] rounded-full border border-dashed border-emerald-400/20" />
            <div className="z-30 flex h-36 w-36 flex-col items-center justify-center rounded-full border border-white/20 bg-black/95 p-4 text-center shadow-[0_0_40px_rgba(0,0,0,1)] backdrop-blur-2xl transition-transform duration-500 group-hover:scale-105 md:h-48 md:w-48">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)] md:mb-3 md:h-12 md:w-12">
                <Github className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <p className="text-sm font-bold tracking-tight text-white md:text-lg">
                omkhalane/
                <br />
                eventio
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[8px] font-bold tracking-widest text-emerald-300 uppercase shadow-[0_0_15px_rgba(52,211,153,0.2)] md:mt-3 md:py-1 md:text-[9px]">
                <span className="slow-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
                scanning
              </div>
            </div>
          </div>

          {SOURCE_APPS.map((app, index) => {
            const positions = [
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
            return (
              <div
                key={app.name}
                className="soft-card-hover radar-blip-card group absolute hidden w-48 rounded-2xl border border-white/10 bg-black/80 p-3 text-left shadow-[0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 hover:border-white/30 hover:bg-black/90 md:block"
                style={{
                  left: positions[index][0],
                  top: positions[index][1],
                  animationDelay: `${index * 0.45}s`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1.5 transition-colors group-hover:bg-white/10">
                    <img
                      src={`https://icon.horse/icon/${app.domain}`}
                      alt={`${app.name} logo`}
                      className="h-full w-full rounded-md object-contain drop-shadow-md filter"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-stone-100 transition-colors group-hover:text-white">
                      {app.name}
                    </p>
                    <p className="mt-0.5 truncate text-[9px] font-bold tracking-wider text-stone-400 uppercase group-hover:text-stone-300">
                      {app.status}
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10 shadow-inner">
                  <div
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
                    style={{ width: `${56 + index * 5}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  </motion.div>
);

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

      <Shell className="rounded-[32px] p-5">
        <div className="relative min-h-[560px] overflow-hidden rounded-[24px] border border-white/10 bg-[#050505] p-5 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(125,211,252,.05),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.015)_1px,transparent_1px)] bg-[size:40px_40px]" />

          <div className="relative z-10 mx-auto flex h-[510px] max-w-lg items-center justify-center">
            <div className="absolute h-[28rem] w-[28rem] rounded-full border border-white/5 shadow-[0_0_50px_rgba(255,255,255,0.02)]" />
            <div className="orbit-dial absolute h-[22rem] w-[22rem] rounded-full border border-dashed border-white/10" />
            <div className="orbit-dial-reverse absolute h-[18rem] w-[18rem] rounded-full border border-white/10" />

            <div className="relative z-20 flex h-[14rem] w-[14rem] items-center justify-center rounded-full border border-white/20 bg-black shadow-[0_0_100px_rgba(0,0,0,1)] md:h-[18rem] md:w-[18rem]">
              <div className="absolute inset-2 rounded-full border border-stone-800" />
              <div
                className="orbit-dial absolute inset-4 rounded-full border-2 border-dashed border-stone-700"
                style={{ animationDuration: '60s' }}
              />
              <div className="orbit-dial-tick absolute top-1/2 left-1/2 h-[48%] w-[12px] origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-gradient-to-t from-red-600 to-red-400 shadow-[0_0_25px_rgba(220,38,38,0.9)]" />
              <div className="orbit-dial-tick-slow absolute top-1/2 left-1/2 h-[35%] w-[8px] origin-bottom -translate-x-1/2 -translate-y-full rounded-full bg-gradient-to-t from-rose-600 to-orange-500 shadow-[0_0_25px_rgba(225,29,72,0.9)]" />
              <div className="absolute top-1/2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-black bg-white shadow-[0_0_20px_rgba(255,255,255,1)]" />
              <div className="pointer-events-none absolute -inset-10 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>

            {SOURCE_APPS.map((app, index) => {
              const positions = [
                ['15%', '25%'],
                ['75%', '20%'],
                ['85%', '60%'],
                ['25%', '80%'],
                ['50%', '10%'],
                ['10%', '60%'],
                ['60%', '85%'],
                ['90%', '40%'],
                ['30%', '15%'],
                ['70%', '75%'],
                ['40%', '85%'],
                ['20%', '45%'],
              ];
              return (
                <div
                  key={`clock-${app.name}`}
                  className="logo-kill absolute hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-black/80 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl md:flex"
                  style={{
                    left: positions[index % positions.length][0],
                    top: positions[index % positions.length][1],
                    animationDelay: `${index * 0.5}s`,
                  }}
                >
                  <img
                    src={`https://icon.horse/icon/${app.domain}`}
                    alt=""
                    className="h-8 w-8 rounded-lg object-contain"
                  />
                </div>
              );
            })}
          </div>
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

      <div className="grid gap-2 md:hidden">
        {SAMPLE_EVENTS.map((event) => (
          <div
            key={event.name}
            className="soft-card-hover flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4"
          >
            <div>
              <p className="text-sm font-semibold text-stone-50">{event.name}</p>
              <p className="mt-1 text-[10px] font-semibold tracking-widest text-stone-500 uppercase">
                {event.meta}
              </p>
            </div>
            <span className="rounded-full bg-stone-50 px-3 py-1 text-xs font-semibold text-black">
              {event.day}
            </span>
          </div>
        ))}
      </div>

      <div className="hidden gap-5 md:grid lg:grid-cols-[280px_1fr]">
        <aside className="hidden space-y-3 lg:block">
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
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[10px] font-semibold tracking-widest text-stone-600 uppercase"
            >
              {day}
            </div>
          ))}
          {Array.from({ length: 35 }).map((_, index) => {
            const event = SAMPLE_EVENTS.find((item) => Number(item.day) === index + 1);
            const gradients = [
              'from-emerald-500/10 via-emerald-400/5 to-teal-500/10',
              'from-rose-500/10 via-rose-400/5 to-pink-500/10',
              'from-amber-500/10 via-amber-400/5 to-orange-500/10',
              'from-cyan-500/10 via-cyan-400/5 to-sky-500/10',
              'from-violet-500/10 via-violet-400/5 to-purple-500/10',
            ];
            const activeGradient = gradients[index % gradients.length];
            return (
              <div
                key={index}
                className="soft-card-hover group relative min-h-28 overflow-hidden rounded-2xl border border-white/5 bg-stone-900/40 p-2 transition-all duration-300 hover:border-white/10 md:min-h-36"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-cyan-400/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10 mb-2 flex items-center justify-between">
                  <span className="text-xs font-black text-stone-600 transition-colors group-hover:text-stone-200">
                    {index + 1}
                  </span>
                  {event && (
                    <span className="slow-pulse h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                  )}
                </div>
                {event && (
                  <motion.div
                    initial={{ opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`relative z-10 rounded-xl border border-white/20 bg-stone-100 p-3 text-black opacity-95 shadow-[0_10px_25px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.05] group-hover:border-white/50 group-hover:opacity-100 group-hover:shadow-[0_15px_30px_rgba(255,255,255,0.2)] md:p-4`}
                  >
                    <div className="flex h-full flex-col justify-between gap-3">
                      <p className="line-clamp-2 text-xs leading-tight font-black text-stone-900 transition-colors md:text-sm">
                        {event.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="rounded-full border border-emerald-300 bg-emerald-200/80 px-2 py-1 text-[9px] font-black tracking-[0.2em] text-emerald-900 uppercase shadow-sm">
                          {event.kind}
                        </p>
                        <ArrowRight className="h-3 w-3 -translate-x-2 text-emerald-700 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  </section>
);

const Pipeline = () => (
  <section className="relative overflow-hidden bg-[#090909] px-6 py-28 md:py-36">
    <SectionHeader
      kicker="How it works"
      title="From source noise to calendar signal."
      copy="A simple data path: public event pages, scraper adapters, normalized schema, Supabase, then a calendar you can use."
    />
    <Shell className="mx-auto max-w-7xl rounded-[32px] p-4 md:p-6">
      <div className="absolute top-1/2 right-8 left-8 hidden h-px bg-white/10 md:block" />
      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: 'Sources', icon: Radio, color: 'text-rose-400', bg: 'bg-rose-400/10' },
          { label: 'Scrapers', icon: Code2, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Schema', icon: Terminal, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Supabase', icon: Database, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
          {
            label: 'Calendar',
            icon: CalendarCheck,
            color: 'text-violet-400',
            bg: 'bg-violet-400/10',
          },
        ].map(({ label, icon: Icon, color, bg }, index) => (
          <motion.div
            key={label}
            {...fadeUp}
            transition={{ duration: 0.65, delay: index * 0.05 }}
            className="group relative"
          >
            <div className="soft-card-hover relative z-10 min-h-[220px] overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6 backdrop-blur-sm transition-all hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <div
                className={`absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-gradient-to-bl from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100`}
              />
              <div
                className={`mb-10 flex h-14 w-14 items-center justify-center rounded-2xl ${bg} border border-white/10 transition-transform group-hover:scale-110`}
              >
                <Icon className={`h-7 w-7 ${color}`} />
              </div>
              <p className="text-2xl font-bold tracking-tight text-white transition-colors group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-stone-400 group-hover:bg-clip-text group-hover:text-transparent">
                {label}
              </p>
              <p className="mt-2 text-sm leading-6 font-medium text-stone-400">
                {index === 0 && 'Contests, hackathons, CTFs, conferences.'}
                {index === 1 && 'Adapters collect clean event data.'}
                {index === 2 && 'Fields become predictable and searchable.'}
                {index === 3 && 'Events and preferences are persisted.'}
                {index === 4 && 'Month, week, day, list, and sync.'}
              </p>
              <span
                className={`absolute top-6 right-6 text-xl font-black tracking-tighter ${color} opacity-20 transition-opacity group-hover:opacity-100`}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
          </motion.div>
        ))}
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

export const LandingPage: React.FC = () => {
  const [pointer, setPointer] = useState({ x: -400, y: -400 });

  return (
    <div
      onMouseMove={(event) => setPointer({ x: event.clientX, y: event.clientY })}
      className="relative min-h-screen overflow-x-hidden bg-black font-sans text-stone-50 selection:bg-stone-50 selection:text-black"
    >
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
          <div className="hidden items-center gap-8 text-xs font-bold tracking-[0.2em] text-stone-400 uppercase md:flex">
            <a href="#product" className="transition-colors hover:text-emerald-400">
              Product
            </a>
            <a href="#pipeline" className="transition-colors hover:text-emerald-400">
              Pipeline
            </a>
            <a href="#coverage" className="transition-colors hover:text-emerald-400">
              Coverage
            </a>
            <Link to="/architecture" className="transition-colors hover:text-emerald-400">
              Architecture
            </Link>
          </div>
          <Link
            to="/calendar"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-3 text-xs font-bold tracking-widest text-black uppercase shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-cyan-200 opacity-0 transition-opacity group-hover:opacity-100"></div>
            <span className="relative z-10 flex items-center gap-2 group-hover:text-black">
              Launch{' '}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </nav>

      <header className="relative z-10 px-6 pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(52,211,153,0.15),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.015)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />
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
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-6xl text-6xl leading-[0.95] font-extrabold tracking-[-0.04em] sm:text-7xl md:text-8xl lg:text-[8rem]"
          >
            <span className="text-stone-100 drop-shadow-sm">Never miss the next</span>
            <br />
            <span className="text-emerald-400 drop-shadow-sm">thing worth building.</span>
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
              className="group magnetic-link inline-flex items-center justify-center gap-3 rounded-full bg-stone-50 px-9 py-4 text-xs font-bold tracking-widest text-black uppercase shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
            >
              Open Calendar{' '}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://github.com/omkhalane/eventio"
              target="_blank"
              rel="noopener noreferrer"
              className="group magnetic-link inline-flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/[0.05] px-9 py-4 text-xs font-bold tracking-widest text-stone-100 uppercase shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              Star GitHub <Github className="h-5 w-5 transition-transform group-hover:scale-110" />
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
      <div id="pipeline">
        <Pipeline />
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
            <Link
              to="/architecture"
              className="group magnetic-link inline-flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/[0.05] px-9 py-5 text-xs font-bold tracking-widest text-stone-100 uppercase shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              View Architecture{' '}
              <Layers3 className="h-5 w-5 transition-transform group-hover:scale-110" />
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="relative border-t border-white/10 bg-[#050505] px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <div className="group flex cursor-pointer items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/20 bg-white/[0.05] shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-transform group-hover:scale-110">
              <img src={LOGO_IMAGE} alt="" className="h-7 w-7 rounded-md" />
            </span>
            <span className="bg-gradient-to-r from-stone-50 to-stone-500 bg-clip-text text-2xl font-black tracking-tighter text-transparent">
              Eventio
            </span>
          </div>
          <a
            href="https://github.com/omkhalane"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-xs font-bold tracking-widest text-stone-400 uppercase shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            <Github className="h-5 w-5 transition-transform group-hover:scale-125" />
            Built by Om Khalane
          </a>
        </div>
      </footer>
    </div>
  );
};
