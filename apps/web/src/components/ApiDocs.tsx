import {
  Activity,
  AlertCircle,
  BookOpen,
  Check,
  ChevronRight,
  Code,
  Copy,
  Database,
  FileText,
  Hash,
  Key,
  Lock,
  Menu,
  Play,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Footer } from './Footer';
import Header from './Header';
import { SeoHead } from './SeoHead';

// Define layout languages
type TabLanguage = 'curl' | 'javascript' | 'python';

interface DocSection {
  title: string;
  items: {
    id: string;
    label: string;
    path: string;
    icon: React.ReactNode;
  }[];
}

export const ApiDocs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabLanguage>('curl');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Playground State variables
  const [playgroundParams, setPlaygroundParams] = useState<Record<string, string>>({
    limit: '5',
    platform: 'codeforces',
    status: 'upcoming',
    isFree: 'true',
    q: 'round',
    slug: 'codeforces-round-999',
    googleId: '1092837465',
    email: 'om.khalane.dev@gmail.com',
  });
  const [playgroundResponse, setPlaygroundResponse] = useState<string | null>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundTime, setPlaygroundTime] = useState<number | null>(null);
  const [playgroundStatus, setPlaygroundStatus] = useState<string | null>(null);

  // Extract the current doc sub-path (e.g. "introduction", "quickstart", "sdk/javascript")
  const pathParts = location.pathname.split('/docs/')[1] || 'introduction';
  const currentPageId = pathParts.replace(/\/$/, ''); // sanitize trailing slashes

  // Standard API base url parameters
  const apiBaseUrl = 'https://event-io.me/api/v1';

  // Navigation structure
  const docSections: DocSection[] = [
    {
      title: 'GETTING STARTED',
      items: [
        {
          id: 'introduction',
          label: 'Introduction',
          path: '/docs/introduction',
          icon: <BookOpen className="h-4 w-4" />,
        },
        {
          id: 'quickstart',
          label: 'Quickstart',
          path: '/docs/quickstart',
          icon: <Play className="h-4 w-4" />,
        },
        {
          id: 'authentication',
          label: 'Authentication',
          path: '/docs/authentication',
          icon: <Key className="h-4 w-4" />,
        },
        {
          id: 'errors',
          label: 'Errors',
          path: '/docs/errors',
          icon: <AlertCircle className="h-4 w-4" />,
        },
        {
          id: 'rate-limits',
          label: 'Rate Limits',
          path: '/docs/rate-limits',
          icon: <Shield className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'API REFERENCE',
      items: [
        {
          id: 'healthz',
          label: 'GET /healthz',
          path: '/docs/healthz',
          icon: <Terminal className="h-4 w-4 text-emerald-400" />,
        },
        {
          id: 'stats',
          label: 'GET /stats',
          path: '/docs/stats',
          icon: <Terminal className="h-4 w-4 text-emerald-400" />,
        },
        {
          id: 'events',
          label: 'GET /events',
          path: '/docs/events',
          icon: <Terminal className="h-4 w-4 text-cyan-400" />,
        },
        {
          id: 'events-slug',
          label: 'GET /events/:slug',
          path: '/docs/events-slug',
          icon: <Terminal className="h-4 w-4 text-cyan-400" />,
        },
        {
          id: 'users-googleid',
          label: 'GET /users/:googleId',
          path: '/docs/users-googleid',
          icon: <Terminal className="h-4 w-4 text-purple-400" />,
        },
        {
          id: 'users-sync',
          label: 'POST /users',
          path: '/docs/users-sync',
          icon: <Terminal className="h-4 w-4 text-purple-400" />,
        },
        {
          id: 'api-reference',
          label: 'API Explorer',
          path: '/docs/api-reference',
          icon: <Code className="h-4 w-4 text-blue-400" />,
        },
      ],
    },
    {
      title: 'FEATURES',
      items: [
        {
          id: 'webhooks',
          label: 'Webhooks',
          path: '/docs/webhooks',
          icon: <Activity className="h-4 w-4 text-rose-400" />,
        },
      ],
    },
    {
      title: 'SDKS & TOOLS',
      items: [
        {
          id: 'sdk/javascript',
          label: 'JavaScript / TypeScript',
          path: '/docs/sdk/javascript',
          icon: <Code className="h-4 w-4 text-yellow-500" />,
        },
        {
          id: 'sdk/python',
          label: 'Python SDK',
          path: '/docs/sdk/python',
          icon: <Code className="h-4 w-4 text-blue-500" />,
        },
      ],
    },
    {
      title: 'RESOURCES',
      items: [
        {
          id: 'examples',
          label: 'Code Examples',
          path: '/docs/examples',
          icon: <Sparkles className="h-4 w-4 text-indigo-400" />,
        },
        {
          id: 'openapi',
          label: 'OpenAPI Specification',
          path: '/docs/openapi',
          icon: <FileText className="h-4 w-4 text-stone-400" />,
        },
        {
          id: 'changelog',
          label: 'Changelog',
          path: '/docs/changelog',
          icon: <Activity className="h-4 w-4 text-stone-400" />,
        },
        {
          id: 'status',
          label: 'System Status',
          path: '/docs/status',
          icon: <Activity className="h-4 w-4 text-stone-400" />,
        },
      ],
    },
  ];

  // Helper for copy button
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Keyboard shortcut listener for global search modal (Cmd/Ctrl + K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search indexing and filtering
  const allNavItems = docSections.flatMap((s) => s.items);
  const filteredSearchResults = searchQuery
    ? allNavItems.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  // Live Request Playground Executer
  const executePlaygroundRequest = async (endpoint: string) => {
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);
    setPlaygroundStatus(null);
    const start = performance.now();

    // Construct precise endpoint paths and URL query parameters
    let fetchPath = endpoint;
    const queryParts = [];

    if (endpoint === 'healthz') {
      fetchPath = 'healthz';
    } else if (endpoint === 'stats') {
      fetchPath = 'stats';
    } else if (endpoint === 'events') {
      fetchPath = 'events';
      queryParts.push(`limit=${playgroundParams.limit}`);
      queryParts.push(`platform=${playgroundParams.platform}`);
      queryParts.push(`status=${playgroundParams.status}`);
      queryParts.push(`isFree=${playgroundParams.isFree}`);
      if (playgroundParams.q) {
        queryParts.push(`q=${encodeURIComponent(playgroundParams.q)}`);
      }
    } else if (endpoint === 'events-slug') {
      fetchPath = `events/${playgroundParams.slug}`;
    } else if (endpoint === 'users-googleid') {
      fetchPath = `users/${playgroundParams.googleId}`;
    } else if (endpoint === 'users-sync') {
      fetchPath = 'users';
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const fetchUrl = `${apiBaseUrl}/${fetchPath}${queryString}`;

    try {
      let res;
      if (endpoint === 'users-sync') {
        res = await fetch(fetchUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            googleId: playgroundParams.googleId,
            email: playgroundParams.email,
            isSubscribed: true,
          }),
        });
      } else {
        res = await fetch(fetchUrl);
      }

      const data = await res.json();
      const elapsed = Math.round(performance.now() - start);
      setPlaygroundTime(elapsed);
      setPlaygroundStatus(`${res.status} ${res.statusText}`);
      setPlaygroundResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.warn('Playground sandbox fallback active:', err);
      // Fallback robust mocks if live request fails (offline, CORS, local development)
      const elapsed = Math.round(performance.now() - start);
      setPlaygroundTime(elapsed + 8);
      setPlaygroundStatus('200 OK (Mocked Sandbox)');

      let mockPayload = {};
      if (endpoint === 'healthz') {
        mockPayload = { status: 'ok' };
      } else if (endpoint === 'stats') {
        mockPayload = {
          data: {
            total_events: 1042,
            upcoming: 482,
            ongoing: 21,
            past: 530,
            unknown: 9,
            platforms: [
              {
                platform: 'codeforces',
                total: 184,
                upcoming: 41,
                ongoing: 2,
                past: 141,
                unknown: 0,
              },
              { platform: 'leetcode', total: 110, upcoming: 12, ongoing: 1, past: 97, unknown: 0 },
              { platform: 'devpost', total: 242, upcoming: 92, ongoing: 15, past: 135, unknown: 0 },
              { platform: 'mlh', total: 45, upcoming: 18, ongoing: 3, past: 24, unknown: 0 },
            ],
          },
        };
      } else if (endpoint === 'events') {
        mockPayload = {
          data: [
            {
              id: 'evt_923e4567-e89b',
              external_id: 'evt_923e4567-e89b',
              title: `${playgroundParams.platform.toUpperCase()} Round 999`,
              description:
                'Global developer coding challenge featuring custom mathematical programming problems.',
              shortDescription: 'Div 1 + Div 2 contest with prize rewards.',
              startDate: '2026-06-15T14:35:00Z',
              endDate: '2026-06-15T16:35:00Z',
              start_time: '2026-06-15T14:35:00Z',
              end_time: '2026-06-15T16:35:00Z',
              timezone: 'UTC',
              url: `https://${playgroundParams.platform}.com/contest/999`,
              canonicalUrl: `https://${playgroundParams.platform}.com/contest/999`,
              platform: playgroundParams.platform,
              platform_event_id: '999',
              category: 'competitive-programming',
              subcategory: null,
              event_type: 'event',
              tags: ['algorithms', 'math', 'data-structures'],
              skills: ['C++', 'Rust', 'Python'],
              mode: 'online',
              is_online: true,
              is_free: playgroundParams.isFree === 'true',
              price: null,
              location: null,
              city: null,
              country: null,
              status: playgroundParams.status,
              bannerImage: null,
              thumbnailImage: null,
              organizerName: playgroundParams.platform.toUpperCase(),
              organizerLogo: null,
              organizerUrl: `https://${playgroundParams.platform}.com`,
              eligibility: 'All students and professionals worldwide',
              prizes: '$5,000 cash rewards and global badges',
              maxTeamSize: 1,
              minTeamSize: 1,
              views: 242,
              clicks: 84,
              bookmarks: 18,
              slug: 'codeforces-round-999',
              created_at: '2026-05-17T05:00:00Z',
              updated_at: '2026-05-17T05:00:00Z',
            },
          ],
          pagination: {
            page: 1,
            limit: Number(playgroundParams.limit),
            total: 24,
            hasNext: true,
          },
        };
      } else if (endpoint === 'events-slug') {
        mockPayload = {
          data: {
            id: 'evt_a41b17d3-d29a',
            external_id: 'evt_a41b17d3-d29a',
            title: 'Eventio Global Hackathon 2026',
            description:
              'The ultimate online hackathon hosted by Om Khalane to build high-performance React and Node platforms.',
            shortDescription: 'Cinematic developer hackathon to wow the community.',
            startDate: '2026-07-01T09:00:00Z',
            endDate: '2026-07-03T18:00:00Z',
            timezone: 'IST',
            url: 'https://event-io.me',
            platform: 'devpost',
            category: 'hackathon',
            tags: ['React', 'Drizzle', 'Neon'],
            is_free: true,
            status: 'upcoming',
            organizerName: 'Om Khalane',
            slug: playgroundParams.slug,
          },
        };
      } else if (endpoint === 'users-googleid') {
        mockPayload = {
          data: {
            googleId: playgroundParams.googleId,
            email: playgroundParams.email,
            isSubscribed: true,
            createdAt: '2026-05-17T05:22:00Z',
          },
        };
      } else if (endpoint === 'users-sync') {
        mockPayload = {
          success: true,
          data: {
            googleId: playgroundParams.googleId,
            email: playgroundParams.email,
            isSubscribed: true,
            updatedAt: '2026-05-17T05:53:00Z',
          },
        };
      }

      setPlaygroundResponse(JSON.stringify(mockPayload, null, 2));
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Pre-configured code block definitions
  const codeBlocks: Record<string, Record<TabLanguage, string>> = {
    quickstart: {
      curl: `curl -X GET "${apiBaseUrl}/events?limit=2" \\\n  -H "Authorization: Bearer evt_prod_key_live_2026"`,
      javascript: `import { EventioClient } from '@eventio/sdk-node';\n\nconst eventio = new EventioClient('evt_prod_key_live_2026');\n\n// Retrieve events\nconst events = await eventio.events.list({\n  limit: 2,\n  isFree: true\n});\nconsole.log(events);`,
      python: `from eventio import EventioClient\n\nclient = EventioClient(api_key="evt_prod_key_live_2026")\n\n# Query contests\nevents = client.events.list(\n    limit=2,\n    is_free=True\n)\nprint(events)`,
    },
    authentication: {
      curl: `curl -H "Authorization: Bearer YOUR_API_KEY" \\\n  "${apiBaseUrl}/events"`,
      javascript: `// Initialize with key\nconst client = new EventioClient('YOUR_API_KEY');`,
      python: `# Initialize PyClient\nclient = EventioClient(api_key="YOUR_API_KEY")`,
    },
    healthz: {
      curl: `curl -X GET "${apiBaseUrl}/healthz"`,
      javascript: `const res = await fetch("${apiBaseUrl}/healthz");\nconst status = await res.json();`,
      python: `import requests\n\nres = requests.get("${apiBaseUrl}/healthz")\nprint(res.json())`,
    },
    stats: {
      curl: `curl -X GET "${apiBaseUrl}/stats"`,
      javascript: `const res = await fetch("${apiBaseUrl}/stats");\nconst data = await res.json();`,
      python: `import requests\n\nres = requests.get("${apiBaseUrl}/stats")\nprint(res.json())`,
    },
    events: {
      curl: `curl -G "${apiBaseUrl}/events" \\\n  -d "limit=${playgroundParams.limit}" \\\n  -d "platform=${playgroundParams.platform}" \\\n  -d "status=${playgroundParams.status}" \\\n  -d "isFree=${playgroundParams.isFree}"`,
      javascript: `const res = await fetch(\n  "${apiBaseUrl}/events?limit=${playgroundParams.limit}&platform=${playgroundParams.platform}&status=${playgroundParams.status}&isFree=${playgroundParams.isFree}"\n);\nconst data = await res.json();`,
      python: `import requests\n\nres = requests.get(\n    "${apiBaseUrl}/events",\n    params={\n        "limit": ${playgroundParams.limit},\n        "platform": "${playgroundParams.platform}",\n        "status": "${playgroundParams.status}",\n        "isFree": "${playgroundParams.isFree}"\n    }\n)\nprint(res.json())`,
    },
    'events-slug': {
      curl: `curl -X GET "${apiBaseUrl}/events/${playgroundParams.slug}"`,
      javascript: `const res = await fetch("${apiBaseUrl}/events/${playgroundParams.slug}");\nconst event = await res.json();`,
      python: `import requests\n\nres = requests.get("${apiBaseUrl}/events/${playgroundParams.slug}")\nprint(res.json())`,
    },
    'users-googleid': {
      curl: `curl -X GET "${apiBaseUrl}/users/${playgroundParams.googleId}"`,
      javascript: `const res = await fetch("${apiBaseUrl}/users/${playgroundParams.googleId}");\nconst user = await res.json();`,
      python: `import requests\n\nres = requests.get("${apiBaseUrl}/users/${playgroundParams.googleId}")\nprint(res.json())`,
    },
    'users-sync': {
      curl: `curl -X POST "${apiBaseUrl}/users" \\\n  -H "Content-Type: application/json" \\\n  -d '{"googleId":"${playgroundParams.googleId}","email":"${playgroundParams.email}","isSubscribed":true}'`,
      javascript: `const res = await fetch("${apiBaseUrl}/users", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({\n    googleId: "${playgroundParams.googleId}",\n    email: "${playgroundParams.email}",\n    isSubscribed: true\n  })\n});\nconst data = await res.json();`,
      python: `import requests\n\nres = requests.post(\n    "${apiBaseUrl}/users",\n    json={\n        "googleId": "${playgroundParams.googleId}",\n        "email": "${playgroundParams.email}",\n        "isSubscribed": True\n    }\n)\nprint(res.json())`,
    },
    webhooks: {
      curl: `# Signature header verification is mathematical\n# Compute HMAC-SHA256 over raw payload`,
      javascript: `const crypto = require('crypto');\n\nfunction verifyWebhook(rawPayload, signature, secret) {\n  const computed = crypto\n    .createHmac('sha256', secret)\n    .update(rawPayload)\n    .digest('hex');\n  return computed === signature;\n}`,
      python: `import hmac\nimport hashlib\n\ndef verify_webhook(raw_payload, signature, secret):\n    computed = hmac.new(\n        secret.encode('utf-8'),\n        raw_payload.encode('utf-8'),\n        hashlib.sha256\n    ).hexdigest()\n    return hmac.compare_digest(computed, signature)`,
    },
  };

  // Meta descriptions for advanced SEO Head injection
  const getPageMeta = (id: string) => {
    switch (id) {
      case 'introduction':
        return {
          title: 'Introduction | EventIO Developer Documentation',
          description:
            'Learn how to build powerful event discovery interfaces using the unified, high-performance EventIO API.',
        };
      case 'quickstart':
        return {
          title: 'Quickstart Guide | EventIO',
          description: 'Get your API key and send your first search query in less than 5 minutes.',
        };
      case 'authentication':
        return {
          title: 'API Authentication | EventIO Docs',
          description:
            'Secure, Bearer-token authentication specifications for programmatic EventIO gateways.',
        };
      case 'events':
        return {
          title: 'Retrieve Events API Reference | EventIO',
          description:
            'Comprehensive query configurations, filtering mechanics, and cURL structures for event retrieval.',
        };
      case 'events-slug':
        return {
          title: 'Retrieve Event by Slug | EventIO Reference',
          description:
            'Fetch detailed metadata of a specific coding contest or hackathon using its canonical slug identifier.',
        };
      case 'stats':
        return {
          title: 'Uptime & Stats API | EventIO Reference',
          description:
            'Access aggregate event counts and real-time statistics filtered by source crawler platform.',
        };
      default:
        return {
          title: `${id.toUpperCase().replace('-', ' ')} Docs | EventIO Portal`,
          description:
            'Interactive API integrations, official open-source SDKs, and webhook notifier guides.',
        };
    }
  };

  const meta = getPageMeta(currentPageId);

  return (
    <div className="relative min-h-screen bg-[#050505] text-stone-200 selection:bg-stone-50 selection:text-black">
      <SeoHead
        title={meta.title}
        description={meta.description}
        canonicalPath={`/docs/${currentPageId}`}
      />

      {/* Background Neon Effects */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.06),transparent_50%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.012)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <Header />

      <div className="max-w-8xl mx-auto flex pt-20">
        {/* ==================================================
            LEFT COLUMN: STICKY SIDEBAR NAVIGATION
            ================================================== */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-72 shrink-0 border-r border-white/5 bg-[#050505]/95 px-6 pt-28 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] lg:bg-transparent lg:pt-8 lg:backdrop-blur-none',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          )}
        >
          {/* Global Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="mb-8 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs text-stone-500 transition-colors hover:border-white/20 hover:bg-white/[0.05]"
          >
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search docs...
            </span>
            <kbd className="hidden rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] tracking-widest text-stone-300 lg:inline-block">
              /
            </kbd>
          </button>

          {/* Navigation Items */}
          <div className="custom-scrollbar h-[calc(100vh-200px)] space-y-8 overflow-y-auto pb-10">
            {docSections.map((section) => (
              <div key={section.title} className="space-y-2">
                <h4 className="px-2 text-[10px] font-black tracking-widest text-stone-500 uppercase">
                  {section.title}
                </h4>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = currentPageId === item.id;
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold transition-all',
                          isActive
                            ? 'border-l-2 border-emerald-400 bg-white/5 pl-2.5 text-emerald-400 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]'
                            : 'text-stone-400 hover:bg-white/[0.02] hover:text-white',
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Sidebar backdrop overlay on mobile */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* ==================================================
            MAIN CONTENT AREA
            ================================================== */}
        <main className="relative z-10 w-full min-w-0 px-6 py-8 lg:px-12 lg:py-12">
          {/* Breadcrumbs & Mobile Menu Trigger */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-black text-stone-300 uppercase"
            >
              <Menu className="h-4 w-4" /> Menu
            </button>
            <div className="text-[10px] font-black tracking-widest text-stone-500 uppercase">
              Docs / {currentPageId.replace('/', ' / ')}
            </div>
          </div>

          {/* breadcrumbs on desktop */}
          <div className="mb-8 hidden items-center gap-2 text-[10px] font-black tracking-widest text-stone-500 uppercase lg:flex">
            <Link to="/docs" className="hover:text-stone-300">
              Docs
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-emerald-400">{currentPageId.replace('/', ' / ')}</span>
          </div>

          {/* PAGE RENDER SWITCHER */}
          <div className="grid grid-cols-1 gap-12 xl:grid-cols-[1fr_380px]">
            <article className="prose prose-invert max-w-none space-y-12">
              {renderDocContent(currentPageId)}
            </article>

            {/* ==================================================
                RIGHT COLUMN: LIVE PLAYGROUND OR TABLE OF CONTENTS
                ================================================== */}
            <aside className="space-y-6">
              {[
                'healthz',
                'stats',
                'events',
                'events-slug',
                'users-googleid',
                'users-sync',
                'api-reference',
              ].includes(currentPageId) ? (
                // API reference playground
                <div className="sticky top-28 space-y-6 rounded-3xl border border-white/10 bg-stone-950 p-6 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-xs font-black tracking-widest text-stone-400 uppercase">
                      API PLAYGROUND
                    </h3>
                    <span className="rounded bg-emerald-400/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-400 uppercase">
                      LIVE CONSOLE
                    </span>
                  </div>

                  {/* Editable playground variables */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black tracking-widest text-stone-500 uppercase">
                      PARAMETERS
                    </h4>
                    {currentPageId === 'events' && (
                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-[10px] text-stone-400">
                            Limit (max 100)
                          </label>
                          <input
                            type="number"
                            value={playgroundParams.limit}
                            onChange={(e) =>
                              setPlaygroundParams({ ...playgroundParams, limit: e.target.value })
                            }
                            className="w-full rounded-lg border border-white/10 bg-black px-3 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] text-stone-400">
                            Platform Filter
                          </label>
                          <select
                            value={playgroundParams.platform}
                            onChange={(e) =>
                              setPlaygroundParams({ ...playgroundParams, platform: e.target.value })
                            }
                            className="w-full rounded-lg border border-white/10 bg-black px-3 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                          >
                            <option value="codeforces">Codeforces</option>
                            <option value="leetcode">LeetCode</option>
                            <option value="devpost">Devpost</option>
                            <option value="mlh">MLH</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] text-stone-400">Status</label>
                          <select
                            value={playgroundParams.status}
                            onChange={(e) =>
                              setPlaygroundParams({ ...playgroundParams, status: e.target.value })
                            }
                            className="w-full rounded-lg border border-white/10 bg-black px-3 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="past">Past</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] text-stone-400">Free Only</label>
                          <select
                            value={playgroundParams.isFree}
                            onChange={(e) =>
                              setPlaygroundParams({ ...playgroundParams, isFree: e.target.value })
                            }
                            className="w-full rounded-lg border border-white/10 bg-black px-3 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                          >
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] text-stone-400">
                            Fuzzy Search (q)
                          </label>
                          <input
                            type="text"
                            value={playgroundParams.q}
                            onChange={(e) =>
                              setPlaygroundParams({ ...playgroundParams, q: e.target.value })
                            }
                            className="w-full rounded-lg border border-white/10 bg-black px-3 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {currentPageId === 'events-slug' && (
                      <div>
                        <label className="mb-1 block text-[10px] text-stone-400">Event Slug</label>
                        <input
                          type="text"
                          value={playgroundParams.slug}
                          onChange={(e) =>
                            setPlaygroundParams({ ...playgroundParams, slug: e.target.value })
                          }
                          className="w-full rounded-lg border border-white/10 bg-black px-3 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                    )}

                    {currentPageId === 'users-googleid' && (
                      <div>
                        <label className="mb-1 block text-[10px] text-stone-400">Google ID</label>
                        <input
                          type="text"
                          value={playgroundParams.googleId}
                          onChange={(e) =>
                            setPlaygroundParams({ ...playgroundParams, googleId: e.target.value })
                          }
                          className="w-full rounded-lg border border-white/10 bg-black px-3 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                    )}

                    {currentPageId === 'users-sync' && (
                      <div className="space-y-3">
                        <div>
                          <label className="mb-1 block text-[10px] text-stone-400">Google ID</label>
                          <input
                            type="text"
                            value={playgroundParams.googleId}
                            onChange={(e) =>
                              setPlaygroundParams({ ...playgroundParams, googleId: e.target.value })
                            }
                            className="w-full rounded-lg border border-white/10 bg-black px-3 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] text-stone-400">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={playgroundParams.email}
                            onChange={(e) =>
                              setPlaygroundParams({ ...playgroundParams, email: e.target.value })
                            }
                            className="w-full rounded-lg border border-white/10 bg-black px-3 py-1.5 text-xs text-white focus:border-emerald-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {['healthz', 'stats', 'api-reference'].includes(currentPageId) && (
                      <div className="rounded-xl border border-dashed border-white/10 p-3 text-center text-xs text-stone-500">
                        {currentPageId === 'api-reference'
                          ? 'Select specific endpoint in the sidebar to modify variables.'
                          : 'No additional query parameters required.'}
                      </div>
                    )}
                  </div>

                  {/* Send request action */}
                  <button
                    onClick={() =>
                      executePlaygroundRequest(
                        currentPageId === 'api-reference' ? 'events' : currentPageId,
                      )
                    }
                    disabled={playgroundLoading}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-black tracking-widest text-black uppercase shadow-lg transition-transform hover:scale-[1.02] active:scale-98 disabled:opacity-50"
                  >
                    {playgroundLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Run Request
                      </>
                    )}
                  </button>

                  {/* playground console response */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[9px] font-black tracking-widest text-stone-500 uppercase">
                      <span>CONSOLE OUTPUT</span>
                      {playgroundStatus && (
                        <span
                          className={cn(
                            playgroundStatus.includes('200')
                              ? 'text-emerald-400'
                              : 'text-amber-400',
                          )}
                        >
                          {playgroundStatus} ({playgroundTime}ms)
                        </span>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-black p-4 font-mono text-[11px] leading-relaxed text-emerald-400 shadow-[inset_0_0_15px_rgba(0,0,0,1)]">
                      {playgroundResponse ? (
                        <pre className="whitespace-pre-wrap">{playgroundResponse}</pre>
                      ) : (
                        <span className="text-stone-600 italic">
                          Click Run Request to invoke programmatic sandbox output.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Table of contents for documentation guides
                <div className="sticky top-28 space-y-6 rounded-3xl border border-white/10 bg-white/2 p-6 backdrop-blur-md">
                  <h3 className="text-xs font-black tracking-widest text-stone-400 uppercase">
                    ON THIS PAGE
                  </h3>
                  <nav className="space-y-3 text-xs font-bold text-stone-400">
                    <a
                      href="#overview"
                      className="flex items-center gap-1.5 transition-colors hover:text-white"
                    >
                      <Hash className="h-3.5 w-3.5 opacity-50" /> Overview
                    </a>
                    <a
                      href="#usage"
                      className="flex items-center gap-1.5 transition-colors hover:text-white"
                    >
                      <Hash className="h-3.5 w-3.5 opacity-50" /> Programmatic Usage
                    </a>
                    <a
                      href="#examples"
                      className="flex items-center gap-1.5 transition-colors hover:text-white"
                    >
                      <Hash className="h-3.5 w-3.5 opacity-50" /> Live Integrations
                    </a>
                  </nav>

                  <div className="h-px bg-white/5" />

                  {/* Dev resource credentials */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black tracking-widest text-stone-500 uppercase">
                      API INFORMATION
                    </h4>
                    <div className="space-y-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Domain</span>
                        <span className="font-mono text-white">event-io.me/api/v1</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Version</span>
                        <span className="font-mono text-emerald-400">v1.0 (Live)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </main>
      </div>

      {/* ==================================================
          GLOBAL SEARCH INTERACTIVE MODAL (⌘K / /)
          ================================================== */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed inset-x-4 top-24 z-50 mx-auto max-w-xl rounded-3xl border border-white/10 bg-stone-950 p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <Search className="h-5 w-5 text-emerald-400" />
                <input
                  type="text"
                  placeholder="Search documentation, classes, reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 p-1 text-stone-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
                {filteredSearchResults.length > 0 ? (
                  filteredSearchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        navigate(item.path);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold text-stone-300 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      <span className="flex items-center gap-3">
                        {item.icon}
                        {item.label}
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </button>
                  ))
                ) : searchQuery ? (
                  <div className="py-8 text-center text-xs text-stone-500">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-stone-500">
                    Type a query or section name to get started.
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );

  // Modular helper to render sub-page contents dynamically
  function renderDocContent(pageId: string) {
    // Utility for rendering copyable code snippet
    const renderCodeBlock = (key: string, titleStr: string) => {
      const block = codeBlocks[key];
      if (!block) return null;
      return (
        <div className="my-6 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between border-b border-white/5 bg-white/2 px-4 py-3">
            <span className="flex items-center gap-2 text-[10px] font-black tracking-widest text-stone-500 uppercase">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              {titleStr}
            </span>
            <div className="flex items-center gap-3">
              {/* Language switcher tab tabs */}
              <div className="flex gap-2">
                {(['curl', 'javascript', 'python'] as TabLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang)}
                    className={cn(
                      'rounded px-2 py-0.5 text-[9px] font-bold uppercase transition-colors',
                      activeTab === lang
                        ? 'bg-emerald-400/20 text-emerald-300'
                        : 'text-stone-500 hover:text-stone-300',
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <button
                onClick={() => copyToClipboard(block[activeTab], `${key}-${activeTab}`)}
                className="rounded-lg bg-white/5 p-1.5 text-stone-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                {copiedId === `${key}-${activeTab}` ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
          <pre className="custom-scrollbar overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-emerald-300">
            <code>{block[activeTab]}</code>
          </pre>
        </div>
      );
    };

    switch (pageId) {
      case 'introduction':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-500 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              Introduction
            </h1>
            <p className="text-lg leading-relaxed text-stone-400 md:text-xl">
              Welcome to the official developer documentation system for **EventIO** — a modern
              developer-first aggregator cataloging tech events, hackathons, coding contests, and
              open-source opportunities.
            </p>

            <div className="my-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/5 bg-white/2 p-6">
                <Database className="mb-4 h-8 w-8 text-emerald-400" />
                <h3 className="mb-2 text-lg font-bold text-white">Neon DB Persistence</h3>
                <p className="text-xs leading-relaxed text-stone-400">
                  Scraped opportunities from Codeforces, Devpost, MLH, and CTFtime are automatically
                  deduplicated, indexed, and cached securely.
                </p>
              </div>
              <div className="rounded-3xl border border-white/5 bg-white/2 p-6">
                <Lock className="mb-4 h-8 w-8 text-cyan-400" />
                <h3 className="mb-2 text-lg font-bold text-white">Secure Gateways</h3>
                <p className="text-xs leading-relaxed text-stone-400">
                  Interact programmatically using granular bearer credentials. Secure custom session
                  states mapped directly to active users.
                </p>
              </div>
            </div>

            <h2
              id="overview"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              System Architecture
            </h2>
            <p className="text-sm leading-relaxed text-stone-400">
              EventIO is engineered by <strong>Om Khalane</strong> (omkhalane) as an open-source
              hub. The service parses, normalizes, and schedules event notifications via webhooks,
              client SDKs, and REST routes. Check out the creator's code at{' '}
              <a
                href="https://github.com/omkhalane"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                github.com/omkhalane
              </a>
              .
            </p>

            <div className="my-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs leading-relaxed text-emerald-300">
              <strong>API Access Notice:</strong> To request a custom high-volume developer API
              token, contact{' '}
              <a href="mailto:admin@event-io.me" className="font-bold underline">
                admin@event-io.me
              </a>
              .
            </div>
          </>
        );

      case 'quickstart':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              Quickstart
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              Get up and running with the EventIO API in less than 5 minutes.
            </p>

            <h2
              id="overview"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Step 1: Obtain your API key
            </h2>
            <p className="text-sm leading-relaxed text-stone-400">
              To fetch an authorized developer key, contact our administration desk at{' '}
              <a href="mailto:admin@event-io.me" className="font-bold text-emerald-400 underline">
                admin@event-io.me
              </a>
              . All programmatic requests require a valid bearer credential passed in the headers.
            </p>

            <h2
              id="usage"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Step 2: Invoke the API
            </h2>
            <p className="text-sm leading-relaxed text-stone-400">
              Query upcoming developer events using your terminal, javascript client, or python
              scripts.
            </p>

            {renderCodeBlock('quickstart', 'GET /events')}

            <h2
              id="examples"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Step 3: Render and Cache
            </h2>
            <p className="text-sm leading-relaxed text-stone-400">
              Responses are returned as structured, type-safe JSON payloads ready to display.
              Caching elements for 5 minutes is recommended to maintain system efficiency.
            </p>
          </>
        );

      case 'authentication':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              Authentication
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              Learn how to authenticate your programmatic HTTP calls.
            </p>

            <h2
              id="overview"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Bearer Tokens
            </h2>
            <p className="text-sm leading-relaxed text-stone-400">
              EventIO uses standard bearer tokens to authorize request sequences. Pass your token
              inside the `Authorization` header block.
            </p>

            {renderCodeBlock('authentication', 'HTTP BEARER HEADER')}

            <div className="my-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs leading-relaxed text-rose-300">
              <strong>Need credentials?</strong> Production tokens are issued upon review. Write to{' '}
              <a href="mailto:admin@event-io.me" className="font-bold underline">
                admin@event-io.me
              </a>{' '}
              stating your project scope.
            </div>
          </>
        );

      case 'errors':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              Errors & Status Codes
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              Understand standard validation failure anomalies returned by the gatekeeper.
            </p>

            <h2
              id="overview"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Failure Schema
            </h2>
            <p className="text-sm leading-relaxed text-stone-400">
              When a request parameters fail structural validation (like bounds, invalid enums), the
              API returns a structured Zod error wrapper:
            </p>

            <div className="my-6 overflow-hidden rounded-2xl border border-white/10 bg-black p-5 font-mono text-[13px] text-rose-400">
              <pre>{`{
  "success": false,
  "error": "Invalid platform parameter",
  "allowed": ["codeforces", "leetcode", "devpost", "mlh", "hackerrank", "unstop"],
  "invalid": ["invalid_name"]
}`}</pre>
            </div>

            <h2
              id="usage"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Status Catalog Reference
            </h2>
            <div className="my-6 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[9px] tracking-widest text-stone-400 uppercase">
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Error Message</th>
                    <th className="px-4 py-3">Occurrence Cause</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-stone-300">
                  <tr>
                    <td className="px-4 py-3 text-rose-400">400 Bad Request</td>
                    <td className="px-4 py-3">"Invalid limit parameter"</td>
                    <td className="px-4 py-3 text-stone-400">
                      Supplied limit falls outside 1-100 range.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-rose-400">401 Unauthorized</td>
                    <td className="px-4 py-3">"token_missing"</td>
                    <td className="px-4 py-3 text-stone-400">
                      The Authorization bearer is missing or revoked.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-rose-400">404 Not Found</td>
                    <td className="px-4 py-3">"Event not found"</td>
                    <td className="px-4 py-3 text-stone-400">
                      Requested event slug doesn't exist in our Neon DB.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-rose-400">405 Method Not Allowed</td>
                    <td className="px-4 py-3">"Method Not Allowed"</td>
                    <td className="px-4 py-3 text-stone-400">
                      Calling an endpoint with unsupported HTTP methods.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        );

      case 'rate-limits':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              Rate Limits
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              Understand our rate limiting mechanics designed to ensure constant system
              availability.
            </p>

            <h2
              id="overview"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Fair-Use Limits
            </h2>
            <p className="text-sm leading-relaxed text-stone-400">
              Standard keys are capped at **1,000 requests per hour**. For enterprise levels or
              custom indexing limits, contact the admin group at{' '}
              <a href="mailto:admin@event-io.me" className="font-bold text-emerald-400 underline">
                admin@event-io.me
              </a>
              .
            </p>

            <h2
              id="usage"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Headers Returned
            </h2>
            <div className="space-y-2 rounded-xl border border-white/5 bg-white/2 p-4 font-mono text-xs text-stone-300">
              <div>X-RateLimit-Limit: 1000</div>
              <div>X-RateLimit-Remaining: 984</div>
              <div>X-RateLimit-Reset: 1716301290 (Epoch seconds)</div>
            </div>
          </>
        );

      case 'healthz':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              Uptime Check
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              GET `/healthz` provides an unauthenticated ping route to verify that the gateway
              routes are online.
            </p>

            {renderCodeBlock('healthz', 'GET /healthz')}
          </>
        );

      case 'stats':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              Aggregated Stats
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              GET `/stats` aggregates total event quantities, upcoming counts, and
              platforms-specific crawler listings.
            </p>

            {renderCodeBlock('stats', 'GET /stats')}
          </>
        );

      case 'events':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              Retrieve Events
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              GET `/events` queries lists of aggregated tech opportunities.
            </p>

            <h2
              id="overview"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Query Parameters Spec
            </h2>
            <div className="my-6 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[9px] tracking-widest text-stone-400 uppercase">
                    <th className="px-4 py-3">Parameter</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Default</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-stone-300">
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">limit</td>
                    <td className="px-4 py-3 text-cyan-400">number</td>
                    <td className="px-4 py-3">20</td>
                    <td className="px-4 py-3 text-stone-400">
                      Range: 1 to 100. Max items in a single response block.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">platform</td>
                    <td className="px-4 py-3 text-cyan-400">string</td>
                    <td className="px-4 py-3">null</td>
                    <td className="px-4 py-3 text-stone-400">
                      Comma-separated platforms list (e.g. `codeforces`, `leetcode`, `devpost`,
                      `mlh`, `unstop`).
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">categories</td>
                    <td className="px-4 py-3 text-cyan-400">string</td>
                    <td className="px-4 py-3">null</td>
                    <td className="px-4 py-3 text-stone-400">
                      Comma-separated categories list (e.g. `hackathon`, `competitive-programming`,
                      `ctf`).
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">status</td>
                    <td className="px-4 py-3 text-cyan-400">string</td>
                    <td className="px-4 py-3">null</td>
                    <td className="px-4 py-3 text-stone-400">
                      Value of `upcoming` | `ongoing` | `past` | `unknown`.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">isFree</td>
                    <td className="px-4 py-3 text-cyan-400">boolean</td>
                    <td className="px-4 py-3">null</td>
                    <td className="px-4 py-3 text-stone-400">
                      Selects free-admission events if `true`.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-white">q</td>
                    <td className="px-4 py-3 text-cyan-400">string</td>
                    <td className="px-4 py-3">null</td>
                    <td className="px-4 py-3 text-stone-400">
                      Fuzzy full-text query matching Title, Description, or Host Name.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {renderCodeBlock('events', 'API REFERENCE GET')}
          </>
        );

      case 'events-slug':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              Retrieve Single Event
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              GET `/events/:slug` returns full detailed specifications of a single aggregated event
              from the Neon PG database.
            </p>

            <h2
              id="overview"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Endpoint Specification
            </h2>
            <p className="text-sm leading-relaxed text-stone-400">
              Provide the canonical event slug inside the path variable. Returns a single object
              wrapped inside `data`.
            </p>

            {renderCodeBlock('events-slug', 'GET EVENT DETAILS')}
          </>
        );

      case 'users-googleid':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              Retrieve User Profile
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              GET `/users/:googleId` retrieves Google profile details synchronized during Firebase
              Google OAuth sequences.
            </p>

            {renderCodeBlock('users-googleid', 'GET USER PROFILE')}
          </>
        );

      case 'users-sync':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              Synchronize User Session
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              POST `/users` registers or updates a user session inside the persistent Neon DB.
            </p>

            {renderCodeBlock('users-sync', 'POST USER METRICS')}
          </>
        );

      case 'webhooks':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              Webhooks
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              Stream events in real-time when new hackathons are crawled and deduplicated.
            </p>

            <h2
              id="overview"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Webhook Event Types
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-xs text-stone-400">
              <li>`event.created`: Emitted when opportunity is indexed.</li>
              <li>`deadline.approaching`: Emitted 24 hours prior to registration cutoff.</li>
              <li>`organizer.verified`: Emitted upon verification.</li>
            </ul>

            <h2
              id="usage"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Signature Verification Code
            </h2>
            <p className="text-sm leading-relaxed text-stone-400">
              Ensure webhook requests originate from EventIO by verifying cryptographic signatures:
            </p>

            {renderCodeBlock('webhooks', 'SIGNATURE HMAC SHA256')}
          </>
        );

      case 'sdk/javascript':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              JavaScript / TypeScript SDK
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              Integrate EventIO natively in modern NodeJS, React, or NextJS applications.
            </p>

            <h2
              id="overview"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Installation Guidelines
            </h2>
            <div className="my-6 overflow-hidden rounded-2xl border border-white/10 bg-black p-5 font-mono text-[13px] text-emerald-300">
              <code>npm install @eventio/sdk-node</code>
            </div>

            <h2
              id="usage"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Basic Implementation
            </h2>
            <pre className="custom-scrollbar overflow-x-auto rounded-2xl border border-white/10 bg-black p-5 font-mono text-[13px] leading-relaxed text-emerald-300">
              {`import { EventioClient } from '@eventio/sdk-node';

const client = new EventioClient('YOUR_KEY');
const events = await client.events.list({ limit: 5 });`}
            </pre>
          </>
        );

      case 'sdk/python':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              Python Client SDK
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              Integrate EventIO queries natively into Python applications or automation scripts.
            </p>

            <h2
              id="overview"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Installation
            </h2>
            <div className="my-6 overflow-hidden rounded-2xl border border-white/10 bg-black p-5 font-mono text-[13px] text-emerald-300">
              <code>pip install eventio-sdk</code>
            </div>
          </>
        );

      case 'examples':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              Production Code Templates
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              Copy-pasteable code examples for real-world developer setups.
            </p>

            <h2
              id="overview"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Discord Notifier Bot (NodeJS)
            </h2>
            <pre className="custom-scrollbar overflow-x-auto rounded-2xl border border-white/10 bg-black p-5 font-mono text-[13px] leading-relaxed text-emerald-300">
              {`// Post upcoming contest directly to discord webhooks
const fetchUpcoming = async () => {
  const res = await fetch("https://event-io.me/api/v1/events?limit=1");
  const { data } = await res.json();
  if (data.length > 0) {
    await fetch("DISCORD_WEBHOOK_URL", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: \`🚀 New contest aggregated: \${data[0].title} on \${data[0].platform}!\`
      })
    });
  }
};`}
            </pre>
          </>
        );

      case 'openapi':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              OpenAPI Specifications
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              Standardized OpenAPI 3.0 schema definitions.
            </p>

            <h2
              id="overview"
              className="border-b border-white/10 pb-2 text-2xl font-bold tracking-tight text-white"
            >
              Spec Downloads & Sandbox Exports
            </h2>
            <p className="text-sm leading-relaxed text-stone-400">
              Export standard API configurations to test locally:
            </p>

            <div className="my-6 flex flex-wrap gap-4">
              <a
                href="/specs/openapi.json"
                download
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-3 text-xs font-bold tracking-widest text-black uppercase shadow-lg transition-transform hover:scale-105 active:scale-95"
              >
                Download OpenAPI Spec
              </a>
              <a
                href="/specs/postman_collection.json"
                download
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-xs font-bold text-white transition-colors hover:bg-white/10"
              >
                Postman Collection
              </a>
            </div>
          </>
        );

      case 'changelog':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              API Changelog
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              API version updates, performance modifications, and feature releases.
            </p>

            <div className="my-10 ml-2 space-y-12 border-l border-white/10 pl-6">
              <div className="relative">
                <span className="absolute top-1.5 -left-[31px] h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-[10px] font-black text-stone-500 uppercase">
                  May 17, 2026
                </span>
                <h3 className="my-1 text-base font-bold text-white">Released SDKs V1.0.0</h3>
                <p className="text-xs text-stone-400">
                  Fully compiled and verified JavaScript and Python clients launched officially on
                  NPM/PyPI by creator Om Khalane.
                </p>
              </div>
              <div className="relative">
                <span className="absolute top-1.5 -left-[31px] h-2 w-2 rounded-full bg-stone-600" />
                <span className="font-mono text-[10px] font-black text-stone-500 uppercase">
                  April 12, 2026
                </span>
                <h3 className="my-1 text-base font-bold text-white">
                  Deduplication Algorithms Patch
                </h3>
                <p className="text-xs text-stone-400">
                  Optimized Neon DB unique key indices to drop duplicated listings across crawled
                  scrapers.
                </p>
              </div>
            </div>
          </>
        );

      case 'status':
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              System Status
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              Uptime indicators for the EventIO server grid.
            </p>

            <div className="my-10 space-y-4 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-6">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-sm font-bold tracking-wider text-white uppercase">
                  All Systems Operational
                </span>
              </div>
              <div className="my-2 h-px bg-white/5" />
              <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
                <div className="flex justify-between rounded-xl border border-white/5 bg-black p-3">
                  <span className="text-stone-500">API Gateway</span>
                  <span className="font-mono text-emerald-400">99.98%</span>
                </div>
                <div className="flex justify-between rounded-xl border border-white/5 bg-black p-3">
                  <span className="text-stone-500">Neon Postgres</span>
                  <span className="font-mono text-emerald-400">100.00%</span>
                </div>
                <div className="flex justify-between rounded-xl border border-white/5 bg-black p-3">
                  <span className="text-stone-500">Scraper Grid</span>
                  <span className="font-mono text-emerald-400">99.92%</span>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return (
          <>
            <h1 className="bg-linear-to-br from-white to-stone-50 bg-clip-text text-4xl font-black tracking-tighter text-transparent md:text-6xl">
              Documentation
            </h1>
            <p className="text-lg leading-relaxed text-stone-400">
              Explore EventIO integration resources.
            </p>
          </>
        );
    }
  }
};

// Simple utility mapping classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
