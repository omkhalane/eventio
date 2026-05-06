import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import TopNav from './components/TopNav';
import MiniCalendar from './components/MiniCalendar';
import MainCalendar from './components/MainCalendar';
import EventModal from './components/EventModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { LandingPage } from './components/LandingPage';
import { ArchitecturePage } from './components/ArchitecturePage';
import { CookieConsent } from './components/CookieConsent';
import { CalendarEvent, FilterState, ViewMode } from './types';
import { CATEGORIES } from './constants';
import { cn } from './lib/utils';
import { auth, googleProvider } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider } from 'firebase/auth';
import { supabase } from './lib/supabase';
import { setGoogleAccessToken } from './services/googleCalendarService';
import { startOfDay, addDays, endOfDay, isSameDay, format, subMonths, addMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Infinity as InfinityIcon } from 'lucide-react';
import { motion } from 'motion/react';

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
      return saved ? JSON.parse(saved) : {
        categories: [],
        platforms: [],
        mode: 'all',
        difficulty: undefined
      };
    } catch {
      return {
        categories: [],
        platforms: [],
        mode: 'all',
        difficulty: undefined
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
        alert('Configuration Error: This domain (localhost) is not authorized in Firebase. Please add it to the Authorized Domains list in your Firebase Console (Authentication -> Settings -> Authorized domains).');
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
        const { error } = await supabase
          .from('users')
          .upsert({
            email: googleUser.email,
            google_id: googleUser.uid,
            is_subscribed: subscribed,
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'email' 
          });
        
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
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .limit(5000); 
        
        if (error) throw error;
        
        if (data) {
          const formattedEvents: CalendarEvent[] = data.map((ev) => ({
            ...ev,
            tags: ev.tags || [],
            extra: ev.extra || {}
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
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') (document.activeElement as HTMLElement).blur();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === '/')) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search events..."]') as HTMLInputElement;
        searchInput?.focus();
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search events..."]') as HTMLInputElement;
        searchInput?.focus();
      }
      
      if (e.key === 'Escape') setSelectedEvent(null);
      
      const isNav = !e.ctrlKey && !e.metaKey && !e.shiftKey;
      if (isNav) {
        if (e.key === 'ArrowLeft' || e.key === 'a') setCurrentMonth(prev => subMonths(prev, 1));
        if (e.key === 'ArrowRight' || e.key === 'f') setCurrentMonth(prev => addMonths(prev, 1));
        if (e.key === 'ArrowUp' || e.key === 'w') setCurrentMonth(prev => addMonths(prev, 12));
        if (e.key === 'ArrowDown' || e.key === 's') setCurrentMonth(prev => subMonths(prev, 12));
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
      .map(e => ({ ...e, _startDate: new Date(e.start_time) }))
      .filter(e => e._startDate >= today && e._startDate <= weekFromNow)
      .sort((a, b) => a._startDate.getTime() - b._startDate.getTime());
    
    const groups: { date: Date, events: CalendarEvent[] }[] = [];
    for (let i = 0; i < 8; i++) {
      const day = addDays(today, i);
      const dayEvents = validEvents
        .filter(e => isSameDay(e._startDate, day))
        .map(({ _startDate, ...rest }) => rest as CalendarEvent);
      
      if (dayEvents.length > 0) {
        groups.push({ date: day, events: dayEvents });
      }
    }
    return groups;
  }, [events]);

  return (
    <div className={cn(
      "flex flex-col h-screen w-full bg-background overflow-hidden selection:bg-primary/30 selection:text-foreground",
    )}>
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

      <main className="flex-1 flex overflow-hidden">
        {isLoading && events.length === 0 && (
          <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex flex-col items-center justify-center gap-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 bg-foreground rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden"
            >
              <InfinityIcon className="w-12 h-12 text-background relative z-10" strokeWidth={3} />
            </motion.div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-xl font-black tracking-tighter uppercase">Initializing</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] animate-pulse">Loading events...</p>
            </div>
          </div>
        )}

        <div className="w-[280px] border-r border-border bg-card p-6 pb-0 flex flex-col gap-6 shrink-0 overflow-hidden hidden lg:flex">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight">Calendar</h3>
              <div className="flex gap-0.5 ml-1">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <button onClick={() => setCurrentMonth(new Date())} className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors"><div className="w-1.5 h-1.5 rounded-full bg-primary" /></button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">{format(currentMonth, 'MMMM yyyy')}</span>
          </div>

          <MiniCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
          
          <div className="mt-4 flex-1 flex flex-col min-h-0">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 opacity-50">Upcoming</h3>
            <div className="flex-1 overflow-auto space-y-6 pr-2 custom-scrollbar pb-8">
              {upcomingEventsByDay.length > 0 ? (
                upcomingEventsByDay.map(group => (
                  <div key={group.date.toISOString()} className="space-y-2">
                    <h4 className="text-[10px] font-bold text-primary/70 uppercase">{isToday(group.date) ? 'Today' : format(group.date, 'dd/MM/yyyy')}</h4>
                    <div className="space-y-3">
                      {group.events.map(event => (
                        <div key={event.id} onClick={() => setSelectedEvent(event)} className="flex gap-3 cursor-pointer group">
                          <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", CATEGORIES.find(c => c.id === event.event_type)?.color)} />
                          <div>
                            <h4 className="text-sm font-medium leading-tight group-hover:text-primary transition-colors line-clamp-2">{event.title}</h4>
                            <p className="text-[11px] text-muted-foreground mt-1">{format(new Date(event.start_time), 'HH:mm')} • {event.platform}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No upcoming events</p>
              )}
            </div>
          </div>
        </div>

        <motion.div className="flex-1 min-w-0 bg-background p-1 relative">
          <MainCalendar 
            selectedDate={selectedDate} setSelectedDate={setSelectedDate} 
            currentMonth={currentMonth} setCurrentMonth={setCurrentMonth}
            viewMode={viewMode} setViewMode={setViewMode}
            events={events} onEventClick={setSelectedEvent}
            searchQuery={searchQuery} filters={filters}
            isLoading={isLoading}
          />
        </motion.div>
      </main>

      <EventModal 
        event={selectedEvent} onClose={() => setSelectedEvent(null)} 
        isAuthorized={hasGoogleToken} onSignIn={handleGoogleSignIn}
      />

      <SubscriptionModal isOpen={showSubModal} onClose={handleSubModalClose} userEmail={googleUser?.email} />
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
        <Route path="/privacy" element={
          <div className="min-h-screen bg-background p-10 md:p-20 flex flex-col items-center">
            <div className="max-w-3xl w-full space-y-12">
              <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:translate-x-1 transition-transform w-fit">
                <ChevronLeft className="w-3 h-3" /> Back to Home
              </Link>
              <h1 className="text-6xl font-black tracking-tight">Privacy Policy</h1>
              <div className="space-y-6 text-muted-foreground font-medium text-lg leading-relaxed">
                <p>At Eventio, we prioritize your data security and privacy.</p>
                <h2 className="text-xl font-black text-foreground uppercase tracking-wider">1. Data Collection</h2>
                <p>We only collect the data necessary to provide you with the best scheduling experience. This includes your Google Calendar integration if explicitly authorized.</p>
                <h2 className="text-xl font-black text-foreground uppercase tracking-wider">2. Data Usage</h2>
                <p>Your event data is used solely for display and synchronization purposes. We never sell or share your personal information with third parties.</p>
                <h2 className="text-xl font-black text-foreground uppercase tracking-wider">3. Security</h2>
                <p>We use industry-standard encryption and security protocols to ensure your data remains protected at all times.</p>
              </div>
            </div>
          </div>
        } />
        <Route path="/terms" element={
          <div className="min-h-screen bg-background p-10 md:p-20 flex flex-col items-center">
            <div className="max-w-3xl w-full space-y-12">
              <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:translate-x-1 transition-transform w-fit">
                <ChevronLeft className="w-3 h-3" /> Back to Home
              </Link>
              <h1 className="text-6xl font-black tracking-tight">Terms of Service</h1>
              <div className="space-y-6 text-muted-foreground font-medium text-lg leading-relaxed">
                <p>By using Eventio, you agree to the following terms.</p>
                <h2 className="text-xl font-black text-foreground uppercase tracking-wider">1. Acceptance of Terms</h2>
                <p>By accessing this application, you accept these terms in full. If you disagree, you must not use this application.</p>
                <h2 className="text-xl font-black text-foreground uppercase tracking-wider">2. Permitted Use</h2>
                <p>You may use this tool for personal, non-commercial purposes only. Any automated scraping of our dashboard is strictly prohibited.</p>
                <h2 className="text-xl font-black text-foreground uppercase tracking-wider">3. Disclaimer</h2>
                <p>While we strive for accuracy, we cannot guarantee the correctness of all event data fetched from external sources.</p>
              </div>
            </div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <CookieConsent />
    </Router>
  );
}
