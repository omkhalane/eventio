import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import {
  Infinity as InfinityIcon,
  Zap,
  Github,
  ArrowRight,
  Terminal,
  Globe,
  Command,
  Sparkles,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

const SOURCES = [
  "Codeforces",
  "LeetCode",
  "AtCoder",
  "CodeChef",
  "HackerRank",
  "Devpost",
  "MLH",
  "Kaggle",
  "Devfolio",
  "TopCoder",
  "HackerEarth",
  "GeeksforGeeks",
  "CodingNinjas",
  "ICPC",
  "Google KickStart",
  "Unstop",
  "Taikai",
  "Luogu",
];

const PerfStyles = () => (
  <style>{`
    .hardware-accel { transform: translateZ(0); will-change: transform, opacity; }
    .spin-ultra-slow { animation: spin 150s linear infinite; }
    .spin-ultra-slow-reverse { animation: spin 150s linear infinite reverse; }
    .marquee-scroll { animation: scrollLeft 60s linear infinite; }
    @keyframes scrollLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    
    .smoke-anim { animation: smoke 12s ease-in-out infinite alternate; }
    @keyframes smoke {
      0% { transform: scale(1) translate(0, 0) rotate(0deg); opacity: 0.6; }
      50% { transform: scale(1.1) translate(2%, -2%) rotate(2deg); opacity: 0.9; }
      100% { transform: scale(1) translate(-2%, 2%) rotate(-2deg); opacity: 0.6; }
    }
    
    .smoke-anim-reverse { animation: smokeReverse 15s ease-in-out infinite alternate; }
    @keyframes smokeReverse {
      0% { transform: scale(1) translate(0, 0) rotate(0deg); opacity: 0.5; }
      50% { transform: scale(1.15) translate(-3%, 3%) rotate(-3deg); opacity: 0.8; }
      100% { transform: scale(1) translate(3%, -3%) rotate(3deg); opacity: 0.5; }
    }

    .noise-bg {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    .fluid-text-hero {
      font-size: clamp(4rem, 12vw, 10rem);
      line-height: 0.85;
    }
  `}</style>
);

const Noise = () => (
  <div className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.03] mix-blend-overlay noise-bg hardware-accel" />
);

// --- Advanced 3D Spotlight Card ---
const SpotlightCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const mouseX = useSpring(0, { stiffness: 300, damping: 50 });
  const mouseY = useSpring(0, { stiffness: 300, damping: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    requestAnimationFrame(() => {
      setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      // Gentle 3D tilt constraint
      mouseX.set((e.clientX - rect.left - rect.width / 2) / 40);
      mouseY.set(-(e.clientY - rect.top - rect.height / 2) / 40);
    });
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => {
        setOpacity(0);
        mouseX.set(0);
        mouseY.set(0);
      }}
      style={{
        rotateX: mouseY,
        rotateY: mouseX,
        perspective: 2000,
      }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] bg-[#070707] border border-white/5 group transition-colors duration-500 hover:border-white/20 hardware-accel shadow-2xl",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 z-10 hardware-accel"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  );
};

const FadeUpText = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: [0.25, 1, 0.5, 1] }}
    className={cn("hardware-accel", className)}
  >
    {children}
  </motion.div>
);

export const LandingPage: React.FC = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  // Gentle Hero Image 3D Tilt
  const mouseX = useSpring(0, { stiffness: 100, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 100, damping: 30 });

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    requestAnimationFrame(() => {
      mouseX.set((clientX - innerWidth / 2) / 60);
      mouseY.set(-(clientY - innerHeight / 2) / 60);
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleHeroMouseMove}
      className="min-h-screen bg-[#020202] text-white overflow-x-hidden font-sans selection:bg-white/20 relative hardware-accel"
    >
      <PerfStyles />
      <Noise />

      {/* Abstract Animated Geometry Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020202] hardware-accel">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)]"></div>

        <motion.div
          style={{ y: y1, opacity }}
          className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-white/5 blur-[120px] hardware-accel"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-white/5 blur-[120px] hardware-accel"
        />

        <div className="absolute top-[-30vw] right-[-20vw] w-[80vw] h-[80vw] border-[1px] border-white/5 rounded-full spin-ultra-slow opacity-30">
          <div className="absolute inset-[10%] border-[1px] border-white/5 rounded-full" />
          <div className="absolute inset-[20%] border-[1px] border-white/5 rounded-full border-dashed" />
        </div>
      </div>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-2xl hardware-accel">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:rotate-180 transition-transform duration-700 hardware-accel">
              <InfinityIcon className="w-6 h-6 text-black" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black tracking-tighter hidden sm:block">
              Eventio
            </span>
          </div>
          <div className="flex items-center gap-6 md:gap-10 text-[10px] md:text-xs font-bold text-zinc-400">
            <a
              href="#features"
              className="hover:text-white transition-colors uppercase tracking-widest py-2"
            >
              Features
            </a>
            <Link
              to="/architecture"
              className="hover:text-white transition-colors uppercase tracking-widest py-2"
            >
              Architecture
            </Link>
            <a
              href="https://github.com/omkhalane/eventio"
              className="hidden sm:inline hover:text-white transition-colors uppercase tracking-widest py-2"
            >
              Source
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/calendar"
              className="px-6 py-2.5 rounded-full bg-white text-black text-[10px] md:text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center gap-2 group hardware-accel"
            >
              Launch{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-48 pb-20 md:pb-32 px-6 min-h-[90vh] flex flex-col justify-center">
        <div className="container mx-auto max-w-7xl text-center flex flex-col items-center relative hardware-accel">
          <FadeUpText
            delay={0}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0a0a0a] border border-white/10 text-zinc-300 text-xs font-bold uppercase tracking-widest mb-12 shadow-[0_0_40px_rgba(255,255,255,0.02)] hover:border-white/30 transition-colors cursor-default"
          >
            <Sparkles className="w-4 h-4 text-white" /> The ultimate dev
            calendar
          </FadeUpText>

          <div className="mb-10 relative w-full group cursor-default">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent blur-3xl opacity-50 hardware-accel group-hover:opacity-80 transition-opacity duration-1000" />
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: [0.25, 1, 0.5, 1], delay: 0.1 }}
              className="fluid-text-hero font-black tracking-tighter uppercase text-white relative z-10 hardware-accel w-full"
            >
              Plan.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-400 to-zinc-800 drop-shadow-2xl transition-all duration-700 group-hover:from-white group-hover:via-white group-hover:to-zinc-500">
                Execute.
              </span>
              <br />
              Win.
            </motion.h1>
          </div>

          <FadeUpText delay={0.2}>
            <p className="text-lg md:text-2xl text-zinc-400 font-medium max-w-3xl mx-auto mb-12 leading-relaxed px-4">
              The ultra-fast aggregator for competitive programming and
              hackathons. Built for the top 1%.
            </p>
          </FadeUpText>

          <FadeUpText delay={0.3}>
            <div className="flex -space-x-4 justify-center mb-6 p-2 rounded-full bg-white/5 border border-white/5 w-fit mx-auto backdrop-blur-md">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#020202] bg-zinc-800 flex items-center justify-center overflow-hidden relative z-10 hover:-translate-y-1 transition-transform"
                >
                  <img
                    src={`https://i.pravatar.cc/100?img=${i + 30}`}
                    alt=""
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                    loading="lazy"
                  />
                </div>
              ))}
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-[#020202] bg-white text-black flex items-center justify-center text-[10px] font-black relative z-10">
                +1K
              </div>
            </div>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 mb-12">
              Used by{" "}
              <span className="text-white border-b border-white/20 pb-0.5">
                1,000+ elite developers
              </span>
            </p>
          </FadeUpText>

          <FadeUpText delay={0.4} className="w-full">
            <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 justify-center w-full px-4">
              <Link
                to="/calendar"
                className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 rounded-full bg-white text-black text-xs md:text-sm uppercase tracking-widest font-black hover:scale-105 transition-transform flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(255,255,255,0.15)] group hardware-accel"
              >
                Enter Dashboard{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://github.com/omkhalane/eventio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 rounded-full bg-[#0a0a0a] text-white border border-white/10 text-xs md:text-sm uppercase tracking-widest font-black hover:bg-white/10 transition-colors flex items-center justify-center gap-3 group"
              >
                <Github className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />{" "}
                Star Repository
              </a>
            </div>
          </FadeUpText>
        </div>
      </section>

      {/* Cinematic App Demo Image with Black Fog */}
      <section className="relative z-20 pb-32 px-4 md:px-8 perspective-[2000px] flex justify-center mt-10 md:mt-0">
        <div className="relative w-full max-w-6xl">
          {/* Intense Black Smoke & Glowing Shadow Effects */}
          <div className="absolute inset-[-100px] z-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,1)_0%,transparent_70%)] blur-3xl opacity-80 mix-blend-multiply pointer-events-none hardware-accel smoke-anim" />
          <div className="absolute inset-[-50px] z-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.9)_0%,transparent_80%)] blur-2xl opacity-60 mix-blend-overlay pointer-events-none hardware-accel smoke-anim-reverse" />

          {/* Pulsing Backlight to contrast the black shadow */}
          <div className="absolute inset-20 z-0 bg-white/5 blur-[100px] opacity-50 animate-pulse pointer-events-none hardware-accel" />

          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            style={{ rotateX: mouseY, rotateY: mouseX }}
            className="relative z-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 bg-[#000] p-1.5 md:p-3 shadow-[0_0_100px_50px_rgba(0,0,0,0.8)] group hardware-accel"
          >
            {/* The Image */}
            <div className="relative overflow-hidden rounded-[1rem] md:rounded-[2rem] w-full bg-[#111]">
              {/* Internal inset shadow to give depth */}
              <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,1)] z-20 pointer-events-none transition-opacity duration-1000 group-hover:opacity-50" />
              <img
                src="/hero.png"
                alt="Hero Image"
                className="w-full h-auto object-cover transition-all duration-1000 opacity-60 grayscale-[50%] group-hover:opacity-100 group-hover:grayscale-0 relative z-10 hardware-accel"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Endless Marquee */}
      <section className="py-16 md:py-24 border-y border-white/5 bg-[#030303] relative z-10 overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-[#030303] to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-[#030303] to-transparent z-20 pointer-events-none" />
        <p className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] text-zinc-600 uppercase mb-8 relative z-20">
          Data streamed from elite sources
        </p>
        <div className="flex w-max marquee-scroll hardware-accel">
          {[...SOURCES, ...SOURCES, ...SOURCES, ...SOURCES].map((src, i) => (
            <span
              key={i}
              className="mx-6 md:mx-12 text-3xl md:text-6xl font-black text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.15)] hover:[-webkit-text-stroke:1px_rgba(255,255,255,0.8)] hover:text-white transition-all duration-300 uppercase tracking-tighter cursor-default drop-shadow-lg"
            >
              {src}
            </span>
          ))}
        </div>
      </section>

      {/* Elegant Bento Grid */}
      <section id="features" className="py-32 px-6 relative z-10 bg-[#020202]">
        <div className="container mx-auto max-w-7xl">
          <FadeUpText className="mb-20 md:mb-24 max-w-4xl">
            <h2 className="text-4xl md:text-[80px] font-black tracking-tighter mb-6 uppercase leading-[0.9] text-white">
              Everything.
              <br />
              <span className="text-zinc-700">Nothing you don't.</span>
            </h2>
            <p className="text-lg md:text-xl text-zinc-400 font-medium leading-relaxed">
              A masterfully crafted interface that puts raw data and speed above
              all else. No distractions.
            </p>
          </FadeUpText>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px] lg:auto-rows-[350px]">
            {/* Card 1: Global Sync */}
            <SpotlightCard className="md:col-span-2 lg:col-span-2 p-8 lg:p-10">
              <div className="flex flex-col justify-between h-full relative z-20">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-white shadow-lg">
                  <Globe className="w-6 h-6 lg:w-8 lg:h-8" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-3xl lg:text-4xl font-black tracking-tight mb-3 text-white">
                    Global Sync
                  </h3>
                  <p className="text-zinc-400 text-sm lg:text-lg font-medium leading-relaxed">
                    Instantly sync events to your Google Calendar. Stay ahead of
                    every deadline perfectly.
                  </p>
                </div>
              </div>
              <div className="absolute -right-32 -top-32 w-[500px] h-[500px] border-[1px] border-white/5 rounded-full border-dashed opacity-50 pointer-events-none spin-ultra-slow" />
              <div className="absolute -right-10 -top-10 w-[300px] h-[300px] border-[1px] border-white/5 rounded-full border-dotted opacity-50 pointer-events-none spin-ultra-slow-reverse" />
            </SpotlightCard>

            {/* Card 2: Real-time */}
            <SpotlightCard className="p-8 lg:p-10">
              <div className="flex flex-col justify-between h-full relative z-20">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-white shadow-lg">
                  <Zap className="w-6 h-6 lg:w-8 lg:h-8" />
                </div>
                <div>
                  <h3 className="text-2xl lg:text-3xl font-black tracking-tight mb-3 text-white">
                    Real-time
                  </h3>
                  <p className="text-zinc-400 text-sm lg:text-base font-medium leading-relaxed">
                    Sub-50ms data updates via Edge caching.
                  </p>
                </div>
              </div>
              <div className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />
            </SpotlightCard>

            {/* Card 3: Command-K */}
            <SpotlightCard className="p-8 lg:p-10">
              <div className="flex flex-col justify-between h-full relative z-20">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-white shadow-lg">
                  <Command className="w-6 h-6 lg:w-8 lg:h-8" />
                </div>
                <div>
                  <h3 className="text-2xl lg:text-3xl font-black tracking-tight mb-3 text-white">
                    Command-K
                  </h3>
                  <p className="text-zinc-400 text-sm lg:text-base font-medium leading-relaxed">
                    Navigate instantly via keyboard.
                  </p>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 border-[1px] border-white/5 rounded-2xl rotate-12 flex items-center justify-center">
                <Command className="w-20 h-20 text-white/5" />
              </div>
            </SpotlightCard>

            {/* Card 4: Deep Metadata */}
            <SpotlightCard className="md:col-span-2 lg:col-span-2 p-8 lg:p-10">
              <div className="absolute right-0 top-0 w-full md:w-2/3 h-full opacity-[0.03] pointer-events-none overflow-hidden [mask-image:linear-gradient(to_right,transparent,black)]">
                <div className="w-full h-full font-mono text-[8px] md:text-[10px] leading-tight text-white whitespace-pre pt-10 pl-10">
                  {`{\n  "id": "codeforces_1993",\n  "name": "Codeforces Round 963",\n  "type": "COMPETITIVE_PROGRAMMING",\n  "start_time": "2026-08-04T14:35:00Z"\n}`}
                </div>
              </div>
              <div className="relative flex flex-col justify-between h-full z-20">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-white shadow-lg">
                  <Terminal className="w-6 h-6 lg:w-8 lg:h-8" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-3xl lg:text-4xl font-black tracking-tight mb-3 text-white">
                    Deep Metadata
                  </h3>
                  <p className="text-zinc-400 text-sm lg:text-lg font-medium leading-relaxed">
                    Inspect raw JSON payloads directly within the UI to see
                    exact schemas.
                  </p>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative z-10 border-t border-white/5 overflow-hidden bg-[#020202]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_100%,#000_70%,transparent_110%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-[50vh] bg-[linear-gradient(transparent,rgba(255,255,255,0.02))] [transform:perspective(1000px)_rotateX(80deg)] pointer-events-none" />

        <div className="container mx-auto max-w-5xl text-center relative z-20 flex flex-col items-center hardware-accel">
          <div className="w-16 h-16 lg:w-20 lg:h-20 mb-8 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)] animate-pulse">
            <Activity
              className="w-8 h-8 lg:w-10 lg:h-10 text-black"
              strokeWidth={3}
            />
          </div>
          <h2 className="text-5xl md:text-[80px] lg:text-[100px] font-black tracking-tighter mb-6 uppercase leading-[0.85] text-white">
            Ready to <br /> ship?
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 mb-12 font-medium max-w-2xl px-4">
            Join 1,000+ elite developers tracking their next big win.
          </p>
          <Link
            to="/calendar"
            className="inline-flex items-center gap-3 px-10 py-5 lg:px-12 lg:py-6 rounded-full bg-white text-black text-xs md:text-sm uppercase tracking-widest font-black hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.15)] group hardware-accel"
          >
            Launch Dashboard{" "}
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 relative z-10 bg-black">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white flex items-center justify-center">
              <InfinityIcon
                className="w-5 h-5 md:w-6 md:h-6 text-black"
                strokeWidth={2.5}
              />
            </div>
            <span className="font-black tracking-tighter text-xl md:text-2xl uppercase">
              Eventio
            </span>
          </div>
          <p className="text-zinc-600 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-center">
            © 2026 Om Khalane. Built for developers.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/omkhalane"
              className="text-zinc-600 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5 md:w-6 md:h-6" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
