import React from "react";
import { motion } from "motion/react";
import {
  Database,
  Server,
  Smartphone,
  Cpu,
  Shield,
  Layers,
  Clock,
  Filter,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

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
  <div className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.03] mix-blend-overlay noise-bg hardware-accel" />
);

const ArchNode = ({ title, subtitle, icon, delay = 0 }: any) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay, duration: 0.5, type: "spring" }}
    className="flex flex-col items-center gap-6 relative w-32 md:w-48 shrink-0"
  >
    <div className="absolute -inset-12 bg-white/5 rounded-full blur-3xl animate-pulse" />
    <div className="w-20 h-20 md:w-32 md:h-32 rounded-[2rem] md:rounded-[3rem] bg-[#0a0a0a] border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.05)] flex items-center justify-center relative overflow-hidden group hover:scale-110 transition-transform duration-500 z-10 cursor-default">
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      {icon}
    </div>
    <div className="text-center relative z-10">
      <div className="text-sm md:text-xl font-black uppercase tracking-widest text-white whitespace-nowrap">
        {title}
      </div>
      <div className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2 border border-white/10 px-3 py-1 rounded-full bg-black/50 whitespace-nowrap">
        {subtitle}
      </div>
    </div>
  </motion.div>
);

const ArchLineHorizontal = ({ direction = "right" }) => (
  <div className="flex-1 h-px relative mx-4 md:mx-8 mt-10 md:mt-16 min-w-[40px]">
    <div className="absolute inset-0 bg-white/10 border-t-2 border-dashed border-white/20" />
    <div className="absolute top-[-3px] w-full h-[6px] overflow-hidden">
      <div
        className={cn(
          "w-20 h-full bg-white shadow-[0_0_20px_#fff] rounded-full",
          direction === "right" ? "line-flow-right" : "line-flow-left",
        )}
      />
    </div>
  </div>
);

const ArchLineVertical = () => (
  <div className="w-px h-24 md:h-40 relative mx-auto my-8">
    <div className="absolute inset-0 bg-white/10 border-l-2 border-dashed border-white/20" />
    <div className="absolute left-[-3px] w-[6px] h-full overflow-hidden">
      <div className="w-full h-20 bg-white shadow-[0_0_20px_#fff] rounded-full line-flow-down" />
    </div>
  </div>
);

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-sans relative hardware-accel flex flex-col">
      <PerfStyles />
      <Noise />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] border-[1px] border-white/5 rounded-full border-dashed opacity-30 pointer-events-none spin-ultra-slow overflow-hidden" />

      {/* Header */}
      <div className="relative z-20 p-8 md:p-12 flex items-center justify-between">
        <Link
          to="/"
          className="text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 hover:text-white hover:-translate-x-2 transition-all bg-black/50 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="text-right">
          <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2 flex items-center gap-4 justify-end">
            <Layers className="w-8 h-8 text-white" /> System Architecture
          </h1>
          <p className="text-zinc-500 font-black text-[10px] md:text-sm tracking-[0.2em] uppercase">
            High-Performance Data Pipeline
          </p>
        </div>
      </div>

      {/* Diagram Container */}
      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center p-6 md:p-20 z-10">
        <div className="flex flex-col w-full max-w-7xl mx-auto">
          {/* Top Row: Left to Right */}
          <div className="flex items-start justify-between w-full">
            <ArchNode
              title="Cron Jobs"
              subtitle="Schedule"
              icon={<Clock className="w-8 h-8 md:w-12 md:h-12 text-white" />}
              delay={0}
            />
            <ArchLineHorizontal direction="right" />
            <ArchNode
              title="Scrapers"
              subtitle="Python API"
              icon={<Cpu className="w-8 h-8 md:w-12 md:h-12 text-white" />}
              delay={0.2}
            />
            <ArchLineHorizontal direction="right" />
            <ArchNode
              title="Data Normalization."
              subtitle="Pipeline"
              icon={<Filter className="w-8 h-8 md:w-12 md:h-12 text-white" />}
              delay={0.4}
            />
          </div>

          {/* Vertical Drop Aligning with Right Node */}
          <div className="flex justify-end w-full pr-[4rem] md:pr-[6rem]">
            <ArchLineVertical />
          </div>

          {/* Bottom Row: Right to Left */}
          <div className="flex items-start justify-between w-full flex-row-reverse relative mt-8">
            <ArchNode
              title="Supabase"
              subtitle="PostgreSQL"
              icon={<Database className="w-8 h-8 md:w-12 md:h-12 text-white" />}
              delay={0.6}
            />
            <ArchLineHorizontal direction="left" />
            <ArchNode
              title="Edge Index"
              subtitle="Redis Cache"
              icon={<Server className="w-8 h-8 md:w-12 md:h-12 text-white" />}
              delay={0.8}
            />
            <ArchLineHorizontal direction="left" />
            <div className="relative">
              <ArchNode
                title="Vite App"
                subtitle="React Client"
                icon={
                  <Smartphone className="w-8 h-8 md:w-12 md:h-12 text-white" />
                }
                delay={1.0}
              />

              {/* Firebase Auth floating below Vite App */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8, type: "spring" }}
                className="absolute -bottom-40 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
              >
                <div className="w-px h-12 bg-white/20 border-l-2 border-dashed border-white/30" />
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-[#111] border border-white/20 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.1)] group hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 md:w-10 md:h-10 text-zinc-300" />
                </div>
                <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-300 bg-black/80 px-4 py-2 rounded-full border border-white/10 whitespace-nowrap backdrop-blur-md">
                  Firebase Auth
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="h-40 md:h-52 w-full" />
      </div>
    </div>
  );
};
