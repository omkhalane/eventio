import { CheckCircle2,ChevronLeft, Copy, Terminal } from 'lucide-react';
import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { buildApiUrl } from '../lib/api';
import { SeoHead } from './SeoHead';

export const ApiDocs = () => {
  const [copied, setCopied] = useState(false);
  const baseUrl = buildApiUrl('/api/v1');

  const copyUrl = () => {
    navigator.clipboard.writeText(baseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black pb-32 font-sans text-stone-50 selection:bg-stone-50 selection:text-black">
      <SeoHead
        title="Eventio API Docs"
        description="Interactive API documentation for Eventio event search, stats, pagination, and production usage patterns."
        canonicalPath="/docs"
      />
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(52,211,153,0.1),transparent_50%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.015)_1px,transparent_1px)] bg-size-[44px_44px]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 pt-24">
        <Link
          to="/"
          className="group mb-16 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black tracking-widest text-stone-400 uppercase transition-all hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back
          to Home
        </Link>

        <header className="mb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-300 uppercase shadow-[0_0_15px_rgba(52,211,153,0.2)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            API Reference
          </div>
          <h1 className="bg-linear-to-br from-white to-stone-500 bg-clip-text text-5xl font-black tracking-tighter text-transparent md:text-7xl">
            Eventio API
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-400 md:text-xl">
            Programmatically access our comprehensive database of competitive programming contests,
            hackathons, and developer conferences.
          </p>
        </header>

        <div className="space-y-16">
          {/* Base URL */}
          <section className="relative rounded-4xl border border-white/10 bg-black/50 p-1 backdrop-blur-xl md:p-2">
            <div className="pointer-events-none absolute inset-0 rounded-4xl bg-linear-to-br from-emerald-500/5 to-transparent" />
            <div className="relative z-10 rounded-3xl border border-white/5 bg-white/2 p-8 md:p-10">
              <h2 className="mb-6 flex items-center gap-3 text-xl font-bold tracking-tight text-white">
                <Terminal className="h-5 w-5 text-emerald-400" /> Base URL
              </h2>
              <div className="group flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-black p-4">
                <code className="custom-scrollbar overflow-x-auto font-mono text-sm whitespace-nowrap text-emerald-300 md:text-base">
                  {baseUrl}
                </code>
                <button
                  onClick={copyUrl}
                  className="shrink-0 rounded-xl border border-white/5 bg-white/5 p-3 text-stone-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Endpoints */}
          <section className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight text-white">Endpoints</h2>

            {/* Events Endpoint */}
            <div className="relative rounded-4xl border border-white/10 bg-black/50 p-1 backdrop-blur-xl md:p-2">
              <div className="pointer-events-none absolute inset-0 rounded-4xl bg-linear-to-br from-cyan-500/5 to-transparent" />
              <div className="relative z-10 rounded-3xl border border-white/5 bg-white/2 p-8 md:p-10">
                <div className="mb-8 flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-center">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg border border-cyan-500/30 bg-cyan-500/20 px-3 py-1.5 text-[10px] font-black tracking-widest text-cyan-300 uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                      GET
                    </span>
                    <code className="font-mono text-2xl font-bold tracking-tight text-white">
                      /events
                    </code>
                  </div>
                  <p className="text-sm text-stone-400 md:text-base">
                    Fetch and filter the global catalog of events.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                  <div>
                    <h4 className="mb-6 text-xs font-bold tracking-widest text-stone-500 uppercase">
                      Query Parameters
                    </h4>
                    <div className="space-y-4">
                      <ParamRow
                        name="platforms"
                        type="string"
                        desc="Comma-separated platform IDs (codeforces, leetcode)"
                      />
                      <ParamRow
                        name="startDate"
                        type="ISO 8601"
                        desc="Events starting after this date"
                      />
                      <ParamRow
                        name="endDate"
                        type="ISO 8601"
                        desc="Events starting before this date"
                      />
                      <ParamRow
                        name="categories"
                        type="string"
                        desc="Filter by categories (competitive-programming, hackathon)"
                      />
                      <ParamRow name="tags" type="string" desc="Filter by specific event tags" />
                      <ParamRow
                        name="search"
                        type="string"
                        desc="Full-text search on event titles"
                      />
                      <ParamRow
                        name="isFree"
                        type="boolean"
                        desc="Filter strictly for free events ('true'/'false')"
                      />
                      <ParamRow
                        name="eventType"
                        type="string"
                        desc="Filter by event format (online, offline, hybrid)"
                      />
                      <ParamRow name="price" type="number" desc="Max price threshold" />
                      <ParamRow name="fees" type="string" desc="Exclude specific fee structures" />
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-6 text-xs font-bold tracking-widest text-stone-500 uppercase">
                      Response Example
                    </h4>
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-2 border-b border-white/5 bg-white/2 px-4 py-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-rose-500/50" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                      </div>
                      <pre className="custom-scrollbar overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-stone-300">
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
            <div className="relative mt-8 rounded-4xl border border-white/10 bg-black/50 p-1 backdrop-blur-xl md:p-2">
              <div className="pointer-events-none absolute inset-0 rounded-4xl bg-linear-to-br from-violet-500/5 to-transparent" />
              <div className="relative z-10 rounded-3xl border border-white/5 bg-white/2 p-8 md:p-10">
                <div className="mb-8 flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-center">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg border border-violet-500/30 bg-violet-500/20 px-3 py-1.5 text-[10px] font-black tracking-widest text-violet-300 uppercase shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                      GET
                    </span>
                    <code className="font-mono text-2xl font-bold tracking-tight text-white">
                      /stats
                    </code>
                  </div>
                  <p className="text-sm text-stone-400 md:text-base">
                    Fetch global counts for upcoming and historical events.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                  <div>
                    <h4 className="mb-6 text-xs font-bold tracking-widest text-stone-500 uppercase">
                      Response Example
                    </h4>
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-2 border-b border-white/5 bg-white/2 px-4 py-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-rose-500/50" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
                      </div>
                      <pre className="custom-scrollbar overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-stone-300">
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

const ParamRow = ({ name, type, desc }: { name: string; type: string; desc: string }) => (
  <div className="flex flex-col items-start justify-between gap-2 border-b border-white/5 py-3 last:border-0 md:flex-row md:items-center md:gap-4">
    <div className="flex min-w-50 items-center gap-3">
      <code className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-sm text-white">
        {name}
      </code>
    </div>
    <div className="flex flex-1 items-center gap-4">
      <span className="shrink-0 rounded bg-cyan-400/10 px-2 py-0.5 font-mono text-[10px] tracking-widest text-cyan-400 uppercase">
        {type}
      </span>
      <span className="text-sm text-stone-400">{desc}</span>
    </div>
  </div>
);
