import { Analytics } from '@vercel/analytics/react';
import {
  addDays,
  addMonths,
  endOfDay,
  format,
  isSameDay,
  isToday,
  startOfDay,
  subMonths,
} from 'date-fns';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { ChevronLeft, ChevronRight, Infinity as InfinityIcon } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Link, Navigate, Route, Routes } from 'react-router-dom';

import { ApiDocs } from './components/ApiDocs';
import { ArchitecturePage } from './components/ArchitecturePage';
import { CookieConsent } from './components/CookieConsent';
import EventModal from './components/EventModal';
import LandingPage from './components/LandingPage';
import MainCalendar from './components/MainCalendar';
import MiniCalendar from './components/MiniCalendar';
import { SeoHead } from './components/SeoHead';
import { SubscriptionModal } from './components/SubscriptionModal';
import TopNav from './components/TopNav';
import { CATEGORIES } from './constants';
import { buildApiUrl } from './lib/api';
import { auth, googleProvider } from './lib/firebase';
import { cn } from './lib/utils';
import { setGoogleAccessToken } from './services/googleCalendarService';
import { CalendarEvent, FilterState, ViewMode } from './types';

const CalendarApp = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      return (localStorage.getItem('app-theme') as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const [hasGoogleToken, setHasGoogleToken] = useState(false);

  const [filters, setFilters] = useState<FilterState>(() => {
    if (typeof window === 'undefined') return { categories: [], platforms: [], mode: 'all' };
    try {
      const saved = localStorage.getItem('app-filters');
      return saved
        ? JSON.parse(saved)
        : {
            categories: [],
            platforms: [],
            mode: 'all',
            difficulty: undefined,
          };
    } catch {
      return {
        categories: [],
        platforms: [],
        mode: 'all',
        difficulty: undefined,
      };
    }
  });

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem('app-filters', JSON.stringify(filters));
    } catch (e) {
      console.warn('LocalStorage blocked:', e);
    }
  }, [filters]);

  useEffect(() => {
    try {
      localStorage.setItem('app-theme', theme);
    } catch (e) {
      console.warn('LocalStorage blocked:', e);
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleGoogleSignIn = async () => {
    if (!auth) {
      console.warn('Firebase Auth is not initialized');
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (token) {
        setGoogleAccessToken(token);
        setHasGoogleToken(true);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.code === 'auth/unauthorized-domain') {
        const hostname = window.location.hostname;
        alert(
          `Configuration Error: This domain (${hostname}) is not authorized in Firebase. Add it in Firebase Console -> Authentication -> Settings -> Authorized domains.`,
        );
      } else {
        alert('Google Sign-In failed. Please try again.');
      }
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      setGoogleUser(null);
      setHasGoogleToken(false);
      setGoogleAccessToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setGoogleUser(user);

      if (user) {
        try {
          const res = await fetch(buildApiUrl(`/api/v1/users/${user.uid}`));
          if (res.status === 404) {
            setShowSubModal(true);
          }
        } catch (err) {
          console.error('User check error:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubModalClose = async (subscribed: boolean) => {
    setShowSubModal(false);
    if (googleUser) {
      try {
        const res = await fetch(buildApiUrl('/api/v1/users'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            googleId: googleUser.uid,
            email: googleUser.email || '',
            isSubscribed: subscribed,
          }),
        });

        if (!res.ok) console.error('Error saving subscription preference');
      } catch (err) {
        console.error('Subscription save error:', err);
      }
    }
  };

  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.platforms && filters.platforms.length > 0) {
          params.set('platforms', filters.platforms.join(','));
        }
        if (filters.categories && filters.categories.length > 0) {
          params.set('categories', filters.categories.join(','));
        }
        if (searchQuery && searchQuery.length > 1) {
          params.set('search', searchQuery);
        }

        const res = await fetch(buildApiUrl(`/api/v1/events?${params.toString()}`));
        if (!res.ok) throw new Error('Failed to fetch events');

        const json = await res.json();
        const data = json.data;

        if (data) {
          const formattedEvents: CalendarEvent[] = data.map((ev: any) => ({
            ...ev,
            start_time: ev.startTime || ev.start_time,
            end_time: ev.endTime || ev.end_time,
            event_type: ev.event_type || 'contest',
            platform: ev.platform || 'Unknown',
            tags: ev.tagsJson || ev.tags || [],
            extra: ev.platformsJson || ev.extra || {},
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error('Error fetching from API:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [filters, searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        if (e.key === 'Escape') (document.activeElement as HTMLElement).blur();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === '/')) {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder="Search events..."]',
        ) as HTMLInputElement;
        searchInput?.focus();
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[placeholder="Search events..."]',
        ) as HTMLInputElement;
        searchInput?.focus();
      }

      if (e.key === 'Escape') setSelectedEvent(null);

      const isNav = !e.ctrlKey && !e.metaKey && !e.shiftKey;
      if (isNav) {
        if (e.key === 'ArrowLeft' || e.key === 'a') setCurrentMonth((prev) => subMonths(prev, 1));
        if (e.key === 'ArrowRight' || e.key === 'f') setCurrentMonth((prev) => addMonths(prev, 1));
        if (e.key === 'ArrowUp' || e.key === 'w') setCurrentMonth((prev) => addMonths(prev, 12));
        if (e.key === 'ArrowDown' || e.key === 's') setCurrentMonth((prev) => subMonths(prev, 12));
        if (e.key === 'd' || e.key === 'h' || e.key === 't') {
          setSelectedDate(new Date());
          setCurrentMonth(new Date());
        }
        if (e.key === 'l') setViewMode('list');
        if (e.key === 'm') setViewMode('month');
        if (e.key === 'k') setViewMode('week');
        if (e.key === 'y') setViewMode('day');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const upcomingEventsByDay = useMemo(() => {
    const today = startOfDay(new Date());
    const weekFromNow = endOfDay(addDays(today, 7));

    const validEvents = events
      .map((e) => ({ ...e, _startDate: new Date(e.start_time) }))
      .filter((e) => e._startDate >= today && e._startDate <= weekFromNow)
      .sort((a, b) => a._startDate.getTime() - b._startDate.getTime());

    const groups: { date: Date; events: CalendarEvent[] }[] = [];
    for (let i = 0; i < 8; i++) {
      const day = addDays(today, i);
      const dayEvents = validEvents
        .filter((e) => isSameDay(e._startDate, day))
        .map(({ _startDate, ...rest }) => rest as CalendarEvent);

      if (dayEvents.length > 0) {
        groups.push({ date: day, events: dayEvents });
      }
    }
    return groups;
  }, [events]);

  return (
    <div
      className={cn(
        'bg-background selection:bg-primary/30 selection:text-foreground flex h-screen w-full flex-col overflow-hidden',
      )}
    >
      <TopNav
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        setFilters={setFilters}
        theme={theme}
        setTheme={setTheme}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleSignOut}
        googleUser={googleUser}
        allEvents={events}
        onEventClick={setSelectedEvent}
      />

      <main className="flex flex-1 overflow-hidden">
        {isLoading && events.length === 0 && (
          <div className="bg-background/80 fixed inset-0 z-100 flex flex-col items-center justify-center gap-6 backdrop-blur-md">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="bg-foreground relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl shadow-2xl"
            >
              <InfinityIcon className="text-background relative z-10 h-12 w-12" strokeWidth={3} />
            </motion.div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-xl font-black tracking-tighter uppercase">Initializing</h2>
              <p className="text-muted-foreground animate-pulse text-xs font-bold tracking-[0.3em] uppercase">
                Loading events...
              </p>
            </div>
          </div>
        )}

        <div className="border-border bg-card hidden w-70 shrink-0 flex-col gap-6 overflow-hidden border-r p-6 pb-0 lg:flex">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight">Calendar</h3>
              <div className="ml-1 flex gap-0.5">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  aria-label="Previous month"
                  className="hover:bg-muted text-muted-foreground rounded p-1 transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  aria-label="Jump to current month"
                  className="hover:bg-muted text-muted-foreground rounded p-1 transition-colors"
                >
                  <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                </button>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  aria-label="Next month"
                  className="hover:bg-muted text-muted-foreground rounded p-1 transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <span className="text-muted-foreground text-[10px] font-bold uppercase opacity-50">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
          </div>

          <MiniCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
          />

          <div className="mt-4 flex min-h-0 flex-1 flex-col">
            <h3 className="text-muted-foreground mb-4 text-[10px] font-bold tracking-widest uppercase opacity-50">
              Upcoming
            </h3>
            <div className="custom-scrollbar flex-1 space-y-6 overflow-auto pr-2 pb-8">
              {upcomingEventsByDay.length > 0 ? (
                upcomingEventsByDay.map((group) => (
                  <div key={group.date.toISOString()} className="space-y-2">
                    <h4 className="text-primary/70 text-[10px] font-bold uppercase">
                      {isToday(group.date) ? 'Today' : format(group.date, 'dd/MM/yyyy')}
                    </h4>
                    <div className="space-y-3">
                      {group.events.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className="group flex cursor-pointer gap-3"
                        >
                          <div
                            className={cn(
                              'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                              CATEGORIES.find((c) => c.id === event.event_type)?.color,
                            )}
                          />
                          <div>
                            <h4 className="group-hover:text-primary line-clamp-2 text-sm leading-tight font-medium transition-colors">
                              {event.title}
                            </h4>
                            <p className="text-muted-foreground mt-1 text-[11px]">
                              {format(new Date(event.start_time), 'HH:mm')} • {event.platform}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-xs italic">No upcoming events</p>
              )}
            </div>
          </div>
        </div>

        <motion.div className="bg-background relative min-w-0 flex-1 p-1">
          <MainCalendar
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            viewMode={viewMode}
            setViewMode={setViewMode}
            events={events}
            onEventClick={setSelectedEvent}
            searchQuery={searchQuery}
            filters={filters}
            isLoading={isLoading}
          />
        </motion.div>
      </main>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        isAuthorized={hasGoogleToken}
        onSignIn={handleGoogleSignIn}
      />

      <SubscriptionModal
        isOpen={showSubModal}
        onClose={handleSubModalClose}
        userEmail={googleUser?.email}
      />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/calendar" element={<CalendarApp />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
        <Route path="/docs" element={<ApiDocs />} />
        <Route path="/api" element={<Navigate to="/docs" replace />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/privacy" element={<LegalPage kind="privacy" />} />
        <Route path="/terms" element={<LegalPage kind="terms" />} />
        <Route path="/cookies" element={<LegalPage kind="cookies" />} />
        <Route path="/api-usage" element={<LegalPage kind="api-usage" />} />
        <Route path="/disclaimer" element={<LegalPage kind="disclaimer" />} />
        <Route path="/contact" element={<LegalPage kind="contact" />} />
        <Route path="/about" element={<LegalPage kind="about" />} />
        <Route path="/opensource" element={<LegalPage kind="opensource" />} />
        <Route path="/security" element={<LegalPage kind="security" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CookieConsent />
      <Analytics />
    </Router>
  );
}

type LegalKind =
  | 'privacy'
  | 'terms'
  | 'cookies'
  | 'api-usage'
  | 'disclaimer'
  | 'contact'
  | 'about'
  | 'opensource'
  | 'security';

function LegalPage({ kind }: { kind: LegalKind }) {
  const content = getLegalContent(kind);

  return (
    <div className="bg-background min-h-screen p-8 md:p-20">
      <SeoHead
        title={content.title}
        description={content.description}
        canonicalPath={content.path}
      />
      <div className="mx-auto w-full max-w-4xl space-y-10">
        <Link
          to="/"
          className="text-primary flex w-fit items-center gap-2 text-[10px] font-black tracking-widest uppercase transition-transform hover:translate-x-1"
        >
          <ChevronLeft className="h-3 w-3" /> Back to Home
        </Link>
        <header className="space-y-4">
          <h1 className="text-5xl font-black tracking-tight md:text-6xl">{content.title}</h1>
          <p className="text-muted-foreground max-w-3xl text-lg leading-relaxed">
            {content.description}
          </p>
        </header>
        <div className="space-y-8 text-base leading-7 md:text-lg">
          {content.sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="text-foreground text-xl font-black tracking-wider uppercase">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
        <footer className="border-border text-muted-foreground flex flex-wrap gap-4 border-t pt-6 text-sm">
          <Link to="/docs" className="hover:text-foreground transition-colors">
            API docs
          </Link>
          <Link to="/architecture" className="hover:text-foreground transition-colors">
            Architecture
          </Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
          <Link to="/security" className="hover:text-foreground transition-colors">
            Security
          </Link>
        </footer>
      </div>
    </div>
  );
}

function getLegalContent(kind: LegalKind) {
  const base = {
    privacy: {
      title: 'Privacy Policy',
      path: '/privacy',
      description:
        'How Eventio handles account data, event preferences, analytics, and integrations.',
      sections: [
        {
          heading: 'Data Collection',
          paragraphs: [
            'We only collect data required to operate the product, including authentication state, event preferences, and optional integration settings.',
          ],
        },
        {
          heading: 'Data Usage',
          paragraphs: [
            'Your event data is used to power search, calendar views, and synchronization workflows. We do not sell personal information.',
          ],
        },
        {
          heading: 'Security',
          paragraphs: [
            'Eventio uses production-grade authentication, HTTPS transport, and defensive browser headers to protect user sessions and API access.',
          ],
        },
      ],
    },
    terms: {
      title: 'Terms of Service',
      path: '/terms',
      description:
        'Usage terms for Eventio, including acceptable use, warranties, and service limitations.',
      sections: [
        {
          heading: 'Acceptance',
          paragraphs: [
            'By using Eventio you agree to these terms. If you do not accept them, do not use the service.',
          ],
        },
        {
          heading: 'Permitted Use',
          paragraphs: [
            'Use the product for lawful purposes only. Do not abuse the API, attempt unauthorized access, or interfere with platform operations.',
          ],
        },
        {
          heading: 'Service Limits',
          paragraphs: [
            'We provide best-effort event aggregation and may update, rate-limit, or remove features to maintain reliability.',
          ],
        },
      ],
    },
    cookies: {
      title: 'Cookie Policy',
      path: '/cookies',
      description:
        'How Eventio uses cookies and similar technologies for auth, preferences, and analytics.',
      sections: [
        {
          heading: 'Cookie Categories',
          paragraphs: [
            'Essential cookies keep sessions secure and maintain application state. Preference cookies store theme and filter choices.',
          ],
        },
        {
          heading: 'Analytics',
          paragraphs: [
            'Analytics cookies help us understand usage patterns and improve performance. You can disable non-essential cookies in the browser.',
          ],
        },
      ],
    },
    'api-usage': {
      title: 'API Usage Policy',
      path: '/api-usage',
      description: 'Rules for using the Eventio API safely and fairly.',
      sections: [
        {
          heading: 'Rate Limits',
          paragraphs: [
            'Use caching, exponential backoff, and incremental refreshes when polling the API.',
          ],
        },
        {
          heading: 'Attribution',
          paragraphs: [
            'If you surface Eventio data externally, preserve source attribution and link back to the canonical event page.',
          ],
        },
      ],
    },
    disclaimer: {
      title: 'Disclaimer',
      path: '/disclaimer',
      description: 'Important limitations about third-party event data and platform availability.',
      sections: [
        {
          heading: 'Accuracy',
          paragraphs: [
            'Event data is aggregated from third-party sources and may change without notice. Verify critical details before relying on them.',
          ],
        },
        {
          heading: 'Availability',
          paragraphs: [
            'We may experience outages or source changes. Use the product with appropriate operational safeguards.',
          ],
        },
      ],
    },
    contact: {
      title: 'Contact',
      path: '/contact',
      description: 'How to reach the Eventio team for support, security, or partnership questions.',
      sections: [
        {
          heading: 'Email',
          paragraphs: ['General and partnership inquiries: om.khalane@gmail.com'],
        },
        {
          heading: 'Security',
          paragraphs: [
            'Report vulnerabilities privately via the security policy page before disclosing publicly.',
          ],
        },
      ],
    },
    about: {
      title: 'About Eventio',
      path: '/about',
      description: 'The story and mission behind Eventio.',
      sections: [
        {
          heading: 'Mission',
          paragraphs: [
            'Eventio helps developers discover, monitor, and act on events, hackathons, and competitions with fast search and high-signal organization.',
          ],
        },
        {
          heading: 'Author',
          paragraphs: ['Built by Om Khalane for modern event discovery and developer workflows.'],
        },
      ],
    },
    opensource: {
      title: 'Open Source Attribution',
      path: '/opensource',
      description: 'Third-party licenses and attribution for packages used by Eventio.',
      sections: [
        {
          heading: 'Dependencies',
          paragraphs: [
            'This project depends on open-source libraries across React, Fastify, Vite, and related tooling.',
          ],
        },
        {
          heading: 'License Review',
          paragraphs: [
            'Review the repository license and package manifests before redistributing the platform.',
          ],
        },
      ],
    },
    security: {
      title: 'Security Policy',
      path: '/security',
      description:
        'How to report vulnerabilities and what to expect from Eventio security handling.',
      sections: [
        {
          heading: 'Reporting',
          paragraphs: [
            'Please report security issues privately by email with reproduction steps, affected surface area, and potential impact.',
          ],
        },
        {
          heading: 'Response',
          paragraphs: [
            'We triage and remediate confirmed issues as quickly as possible and coordinate disclosure where appropriate.',
          ],
        },
      ],
    },
  } as const;

  return base[kind];
}
