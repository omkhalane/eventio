import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Terminal, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export const ApiDocs = () => {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText('http://localhost:3000/api/v1');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-black min-h-screen text-stone-50 font-sans selection:bg-stone-50 selection:text-black relative overflow-hidden pb-32">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(52,211,153,0.1),transparent_50%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.015)_1px,transparent_1px)] bg-[size:44px_44px]" />
      
      <div className="relative z-10 w-full max-w-5xl mx-auto pt-24 px-6">
        <Link
          to="/"
          className="group flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black tracking-widest text-stone-400 uppercase transition-all hover:bg-white/10 hover:text-white mb-16"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Home
        </Link>
        
        <header className="mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-300 uppercase mb-6 shadow-[0_0_15px_rgba(52,211,153,0.2)]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            API Reference
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-br from-white to-stone-500 bg-clip-text text-transparent">
            Eventio API
          </h1>
          <p className="mt-6 text-stone-400 text-lg md:text-xl max-w-2xl leading-relaxed">
            Programmatically access our comprehensive database of competitive programming contests, hackathons, and developer conferences.
          </p>
        </header>

        <div className="space-y-16">
          {/* Base URL */}
          <section className="relative rounded-[32px] border border-white/10 bg-black/50 p-1 md:p-2 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-[32px] pointer-events-none" />
            <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-8 md:p-10 relative z-10">
              <h2 className="text-xl font-bold tracking-tight text-white mb-6 flex items-center gap-3">
                <Terminal className="h-5 w-5 text-emerald-400" /> Base URL
              </h2>
              <div className="flex items-center justify-between gap-4 bg-black border border-white/10 rounded-2xl p-4 overflow-hidden group">
                <code className="text-emerald-300 font-mono text-sm md:text-base overflow-x-auto whitespace-nowrap custom-scrollbar">
                  http://localhost:3000/api/v1
                </code>
                <button 
                  onClick={copyUrl}
                  className="shrink-0 rounded-xl bg-white/5 p-3 hover:bg-white/10 transition-colors border border-white/5 text-stone-400 hover:text-white"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </section>

          {/* Endpoints */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight text-white">Endpoints</h2>
            
            {/* Events Endpoint */}
            <div className="relative rounded-[32px] border border-white/10 bg-black/50 p-1 md:p-2 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-[32px] pointer-events-none" />
              <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-8 md:p-10 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-8 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1.5 rounded-lg font-black text-[10px] tracking-widest uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                      GET
                    </span>
                    <code className="text-2xl font-mono font-bold text-white tracking-tight">/events</code>
                  </div>
                  <p className="text-stone-400 text-sm md:text-base">
                    Fetch and filter the global catalog of events.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-xs font-bold tracking-widest text-stone-500 uppercase mb-6">Query Parameters</h4>
                    <div className="space-y-4">
                      <ParamRow name="platforms" type="string" desc="Comma-separated platform IDs (codeforces, leetcode)" />
                      <ParamRow name="startDate" type="ISO 8601" desc="Events starting after this date" />
                      <ParamRow name="endDate" type="ISO 8601" desc="Events starting before this date" />
                      <ParamRow name="categories" type="string" desc="Filter by categories (competitive-programming, hackathon)" />
                      <ParamRow name="tags" type="string" desc="Filter by specific event tags" />
                      <ParamRow name="search" type="string" desc="Full-text search on event titles" />
                      <ParamRow name="isFree" type="boolean" desc="Filter strictly for free events ('true'/'false')" />
                      <ParamRow name="eventType" type="string" desc="Filter by event format (online, offline, hybrid)" />
                      <ParamRow name="price" type="number" desc="Max price threshold" />
                      <ParamRow name="fees" type="string" desc="Exclude specific fee structures" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold tracking-widest text-stone-500 uppercase mb-6">Response Example</h4>
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                        <div className="h-2.5 w-2.5 rounded-full bg-rose-500/50" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                      </div>
                      <pre className="p-5 overflow-x-auto custom-scrollbar text-[13px] leading-relaxed font-mono text-stone-300">
{`{
  "data": [
    {
      "id": "123e4567-e89b-12d3...",
      "title": "Codeforces Round 999",
      "description": "Div 1 + Div 2",
      "startTime": "2026-06-15T14:35:00Z",
      "endTime": "2026-06-15T16:35:00Z",
      "url": "https://codeforces.com/...",
      "platform": "codeforces",
      "event_type": "competitive-programming",
      "status": "upcoming",
      "is_free": true,
      "extra": {
        "platforms": ["codeforces"],
        "tags": ["competitive-programming"]
      }
    }
  ]
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Endpoint */}
            <div className="relative rounded-[32px] border border-white/10 bg-black/50 p-1 md:p-2 backdrop-blur-xl mt-8">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent rounded-[32px] pointer-events-none" />
              <div className="rounded-[24px] border border-white/5 bg-white/[0.02] p-8 md:p-10 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-8 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="bg-violet-500/20 text-violet-300 border border-violet-500/30 px-3 py-1.5 rounded-lg font-black text-[10px] tracking-widest uppercase shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                      GET
                    </span>
                    <code className="text-2xl font-mono font-bold text-white tracking-tight">/stats</code>
                  </div>
                  <p className="text-stone-400 text-sm md:text-base">
                    Fetch global counts for upcoming and historical events.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-xs font-bold tracking-widest text-stone-500 uppercase mb-6">Response Example</h4>
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                        <div className="h-2.5 w-2.5 rounded-full bg-rose-500/50" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                      </div>
                      <pre className="p-5 overflow-x-auto custom-scrollbar text-[13px] leading-relaxed font-mono text-stone-300">
{`{
  "upcoming": 452,
  "past": 18934
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </section>
        </div>
      </div>
    </div>
  );
};

const ParamRow = ({ name, type, desc }: { name: string, type: string, desc: string }) => (
  <div className="flex items-start md:items-center justify-between py-3 border-b border-white/5 last:border-0 flex-col md:flex-row gap-2 md:gap-4">
    <div className="flex items-center gap-3 min-w-[200px]">
      <code className="text-sm font-mono text-white bg-white/5 px-2 py-1 rounded border border-white/10">{name}</code>
    </div>
    <div className="flex items-center gap-4 flex-1">
      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded tracking-widest uppercase shrink-0">{type}</span>
      <span className="text-sm text-stone-400">{desc}</span>
    </div>
  </div>
);
