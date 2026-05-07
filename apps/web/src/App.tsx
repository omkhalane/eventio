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

import { ArchitecturePage } from './components/ArchitecturePage';
import { CookieConsent } from './components/CookieConsent';
import EventModal from './components/EventModal';
import { LandingPage } from './components/LandingPage';
import MainCalendar from './components/MainCalendar';
import MiniCalendar from './components/MiniCalendar';
import { SubscriptionModal } from './components/SubscriptionModal';
import TopNav from './components/TopNav';
import { CATEGORIES } from './constants';
import { auth, googleProvider } from './lib/firebase';
import { supabase } from './lib/supabase';
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

      if (user && supabase) {
        try {
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('is_subscribed')
            .eq('google_id', user.uid)
            .single();

          if (fetchError && fetchError.code === 'PGRST116') {
            setShowSubModal(true);
          } else if (!fetchError && existingUser) {
            await supabase
              .from('users')
              .update({ updated_at: new Date().toISOString() })
              .eq('google_id', user.uid);
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
    if (googleUser && supabase) {
      try {
        const { error } = await supabase.from('users').upsert(
          {
            email: googleUser.email,
            google_id: googleUser.uid,
            is_subscribed: subscribed,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'email',
          },
        );

        if (error) console.error('Error saving subscription preference:', error);
      } catch (err) {
        console.error('Subscription save error:', err);
      }
    }
  };

  useEffect(() => {
    async function fetchEvents() {
      if (!supabase) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('events').select('*').limit(5000);

        if (error) throw error;

        if (data) {
          const formattedEvents: CalendarEvent[] = data.map((ev) => ({
            ...ev,
            tags: ev.tags || [],
            extra: ev.extra || {},
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        console.error('Error fetching from Supabase:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, []);

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
          <div className="bg-background/80 fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 backdrop-blur-md">
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

        <div className="border-border bg-card flex hidden w-[280px] shrink-0 flex-col gap-6 overflow-hidden border-r p-6 pb-0 lg:flex">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight">Calendar</h3>
              <div className="ml-1 flex gap-0.5">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="hover:bg-muted text-muted-foreground rounded p-1 transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="hover:bg-muted text-muted-foreground rounded p-1 transition-colors"
                >
                  <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                </button>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
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
        <Route path="/architecture" element={<ArchitecturePage />} />
        <Route path="/calendar" element={<CalendarApp />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route
          path="/privacy"
          element={
            <div className="bg-background flex min-h-screen flex-col items-center p-10 md:p-20">
              <div className="w-full max-w-3xl space-y-12">
                <Link
                  to="/"
                  className="text-primary flex w-fit items-center gap-2 text-[10px] font-black tracking-widest uppercase transition-transform hover:translate-x-1"
                >
                  <ChevronLeft className="h-3 w-3" /> Back to Home
                </Link>
                <h1 className="text-6xl font-black tracking-tight">Privacy Policy</h1>
                <div className="text-muted-foreground space-y-6 text-lg leading-relaxed font-medium">
                  <p>At Eventio, we prioritize your data security and privacy.</p>
                  <h2 className="text-foreground text-xl font-black tracking-wider uppercase">
                    1. Data Collection
                  </h2>
                  <p>
                    We only collect the data necessary to provide you with the best scheduling
                    experience. This includes your Google Calendar integration if explicitly
                    authorized.
                  </p>
                  <h2 className="text-foreground text-xl font-black tracking-wider uppercase">
                    2. Data Usage
                  </h2>
                  <p>
                    Your event data is used solely for display and synchronization purposes. We
                    never sell or share your personal information with third parties.
                  </p>
                  <h2 className="text-foreground text-xl font-black tracking-wider uppercase">
                    3. Security
                  </h2>
                  <p>
                    We use industry-standard encryption and security protocols to ensure your data
                    remains protected at all times.
                  </p>
                </div>
              </div>
            </div>
          }
        />
        <Route
          path="/terms"
          element={
            <div className="bg-background flex min-h-screen flex-col items-center p-10 md:p-20">
              <div className="w-full max-w-3xl space-y-12">
                <Link
                  to="/"
                  className="text-primary flex w-fit items-center gap-2 text-[10px] font-black tracking-widest uppercase transition-transform hover:translate-x-1"
                >
                  <ChevronLeft className="h-3 w-3" /> Back to Home
                </Link>
                <h1 className="text-6xl font-black tracking-tight">Terms of Service</h1>
                <div className="text-muted-foreground space-y-6 text-lg leading-relaxed font-medium">
                  <p>By using Eventio, you agree to the following terms.</p>
                  <h2 className="text-foreground text-xl font-black tracking-wider uppercase">
                    1. Acceptance of Terms
                  </h2>
                  <p>
                    By accessing this application, you accept these terms in full. If you disagree,
                    you must not use this application.
                  </p>
                  <h2 className="text-foreground text-xl font-black tracking-wider uppercase">
                    2. Permitted Use
                  </h2>
                  <p>
                    You may use this tool for personal, non-commercial purposes only. Any automated
                    scraping of our dashboard is strictly prohibited.
                  </p>
                  <h2 className="text-foreground text-xl font-black tracking-wider uppercase">
                    3. Disclaimer
                  </h2>
                  <p>
                    While we strive for accuracy, we cannot guarantee the correctness of all event
                    data fetched from external sources.
                  </p>
                </div>
              </div>
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CookieConsent />
    </Router>
  );
}
