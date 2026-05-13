import {
  ChevronLeft,
  Clock,
  Cpu,
  Database,
  Filter,
  Layers,
  Server,
  Shield,
  Smartphone,
} from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { Link } from 'react-router-dom';

import { SeoHead } from './SeoHead';
import { cn } from '../lib/utils';

const PerfStyles = () => (
  <style>{`
    .hardware-accel { transform: translateZ(0); will-change: transform, opacity; }
    .spin-ultra-slow { animation: spin 150s linear infinite; }
    .line-flow-right { animation: flowRight 2s linear infinite; }
    .line-flow-left { animation: flowLeft 2s linear infinite; }
    .line-flow-down { animation: flowDown 2s linear infinite; }
    @keyframes flowRight { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    @keyframes flowLeft { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
    @keyframes flowDown { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
    .noise-bg {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }
  `}</style>
);

const Noise = () => (
  <div className="noise-bg hardware-accel pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.03] mix-blend-overlay" />
);

const ArchNode = ({ title, subtitle, icon, delay = 0 }: any) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay, duration: 0.5, type: 'spring' }}
    className="relative flex w-32 shrink-0 flex-col items-center gap-6 md:w-48"
  >
    <div className="absolute -inset-12 animate-pulse rounded-full bg-white/5 blur-3xl" />
    <div className="group relative z-10 flex h-20 w-20 cursor-default items-center justify-center overflow-hidden rounded-[2rem] border border-white/20 bg-[#0a0a0a] shadow-[0_0_40px_rgba(255,255,255,0.05)] transition-transform duration-500 hover:scale-110 md:h-32 md:w-32 md:rounded-[3rem]">
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      {icon}
    </div>
    <div className="relative z-10 text-center">
      <div className="text-sm font-black tracking-widest whitespace-nowrap text-white uppercase md:text-xl">
        {title}
      </div>
      <div className="mt-2 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-bold tracking-widest whitespace-nowrap text-zinc-500 uppercase md:text-xs">
        {subtitle}
      </div>
    </div>
  </motion.div>
);

const ArchLineHorizontal = ({ direction = 'right' }) => (
  <div className="relative mx-4 mt-10 h-px min-w-[40px] flex-1 md:mx-8 md:mt-16">
    <div className="absolute inset-0 border-t-2 border-dashed border-white/20 bg-white/10" />
    <div className="absolute top-[-3px] h-[6px] w-full overflow-hidden">
      <div
        className={cn(
          'h-full w-20 rounded-full bg-white shadow-[0_0_20px_#fff]',
          direction === 'right' ? 'line-flow-right' : 'line-flow-left',
        )}
      />
    </div>
  </div>
);

const ArchLineVertical = () => (
  <div className="relative mx-auto my-8 h-24 w-px md:h-40">
    <div className="absolute inset-0 border-l-2 border-dashed border-white/20 bg-white/10" />
    <div className="absolute left-[-3px] h-full w-[6px] overflow-hidden">
      <div className="line-flow-down h-20 w-full rounded-full bg-white shadow-[0_0_20px_#fff]" />
    </div>
  </div>
);

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="hardware-accel relative flex min-h-screen flex-col overflow-hidden bg-[#050505] font-sans text-white">
      <SeoHead
        title="Eventio Architecture"
        description="Explore the production architecture behind Eventio's scraping, normalization, indexing, and frontend delivery pipeline."
        canonicalPath="/architecture"
      />
      <PerfStyles />
      <Noise />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="spin-ultra-slow pointer-events-none absolute top-[-50%] left-[-20%] h-[150%] w-[150%] overflow-hidden rounded-full border-[1px] border-dashed border-white/5 opacity-30" />

      {/* Header */}
      <div className="relative z-20 flex items-center justify-between p-8 md:p-12">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-6 py-3 text-[10px] font-black tracking-widest text-zinc-400 uppercase backdrop-blur-md transition-all hover:-translate-x-2 hover:text-white md:text-xs"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Home
        </Link>
        <div className="text-right">
          <h1 className="mb-2 flex items-center justify-end gap-4 text-2xl font-black tracking-tighter text-white uppercase md:text-5xl">
            <Layers className="h-8 w-8 text-white" /> System Architecture
          </h1>
          <p className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase md:text-sm">
            High-Performance Data Pipeline
          </p>
        </div>
      </div>

      {/* Diagram Container */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-hidden p-6 md:p-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col">
          {/* Top Row: Left to Right */}
          <div className="flex w-full items-start justify-between">
            <ArchNode
              title="Cron Jobs"
              subtitle="Schedule"
              icon={<Clock className="h-8 w-8 text-white md:h-12 md:w-12" />}
              delay={0}
            />
            <ArchLineHorizontal direction="right" />
            <ArchNode
              title="Scrapers"
              subtitle="Python API"
              icon={<Cpu className="h-8 w-8 text-white md:h-12 md:w-12" />}
              delay={0.2}
            />
            <ArchLineHorizontal direction="right" />
            <ArchNode
              title="Data Normalization."
              subtitle="Pipeline"
              icon={<Filter className="h-8 w-8 text-white md:h-12 md:w-12" />}
              delay={0.4}
            />
          </div>

          {/* Vertical Drop Aligning with Right Node */}
          <div className="flex w-full justify-end pr-[4rem] md:pr-[6rem]">
            <ArchLineVertical />
          </div>

          {/* Bottom Row: Right to Left */}
          <div className="relative mt-8 flex w-full flex-row-reverse items-start justify-between">
            <ArchNode
              title="Supabase"
              subtitle="PostgreSQL"
              icon={<Database className="h-8 w-8 text-white md:h-12 md:w-12" />}
              delay={0.6}
            />
            <ArchLineHorizontal direction="left" />
            <ArchNode
              title="Edge Index"
              subtitle="Redis Cache"
              icon={<Server className="h-8 w-8 text-white md:h-12 md:w-12" />}
              delay={0.8}
            />
            <ArchLineHorizontal direction="left" />
            <div className="relative">
              <ArchNode
                title="Vite App"
                subtitle="React Client"
                icon={<Smartphone className="h-8 w-8 text-white md:h-12 md:w-12" />}
                delay={1.0}
              />

              {/* Firebase Auth floating below Vite App */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8, type: 'spring' }}
                className="absolute -bottom-40 left-1/2 flex -translate-x-1/2 flex-col items-center gap-4"
              >
                <div className="h-12 w-px border-l-2 border-dashed border-white/30 bg-white/20" />
                <div className="group flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-white/20 bg-[#111] shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-transform hover:scale-110 md:h-20 md:w-20">
                  <Shield className="h-8 w-8 text-zinc-300 md:h-10 md:w-10" />
                </div>
                <div className="rounded-full border border-white/10 bg-black/80 px-4 py-2 text-[10px] font-black tracking-widest whitespace-nowrap text-zinc-300 uppercase backdrop-blur-md md:text-xs">
                  Firebase Auth
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="h-40 w-full md:h-52" />
      </div>
    </div>
  );
};
