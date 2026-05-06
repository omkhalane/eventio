import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Sun, Moon, User, Settings, Info, X, Command, Globe, LogOut, Github, Calendar as CalendarIcon, Infinity as InfinityIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { CATEGORIES, PLATFORMS } from '../constants';
import { FilterState, EventCategory, CalendarEvent } from '../types';
import { cn } from '../lib/utils';

interface TopNavProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  googleUser: any | null;
  allEvents: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export default function TopNav({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
  theme,
  setTheme,
  onGoogleSignIn,
  onGoogleSignOut,
  googleUser,
  allEvents,
  onEventClick
}: TopNavProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchQuery]);

  const availableCategories = useMemo(() => {
    const present = new Set(allEvents.map(e => e.event_type));
    return CATEGORIES.filter(cat => present.has(cat.id));
  }, [allEvents]);

  const availablePlatforms = useMemo(() => {
    const present = new Set(allEvents.map(e => e.platform.toLowerCase()));
    return Array.from(new Set(PLATFORMS)).filter(plat => present.has(plat.toLowerCase()));
  }, [allEvents]);

  const toggleCategory = (cat: EventCategory) => {
    const newCats = filters.categories.includes(cat)
      ? filters.categories.filter(c => c !== cat)
      : [...filters.categories, cat];
    setFilters({ ...filters, categories: newCats });
  };

  const togglePlatform = (plat: string) => {
    const newPlats = filters.platforms.includes(plat)
      ? filters.platforms.filter(p => p !== plat)
      : [...filters.platforms, plat];
    setFilters({ ...filters, platforms: newPlats });
  };

  return (
    <header className="h-[56px] border-b border-border bg-card sticky top-0 z-40 flex items-center px-6">
      {/* Logo Area (aligned with Sidebar) */}
      <Link to="/" className="w-[256px] flex items-center shrink-0 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center shadow-lg">
          <InfinityIcon className="w-5 h-5 text-background" strokeWidth={3} />
        </div>
        <span className="ml-3 font-bold tracking-tighter text-2xl italic">Eventio</span>
      </Link>

      {/* Main Content Area (aligned with MainCalendar) */}
      <div className="flex-1 flex items-center justify-between min-w-0">
        <div className="flex items-center gap-6 flex-1">
          <div className="relative group max-w-md w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-foreground transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/50 border border-transparent focus:border-border rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm"
            />

            {/* Search Dropdown */}
            <AnimatePresence>
              {searchQuery.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-[60] max-h-[400px] overflow-y-auto custom-scrollbar"
                >
                  {allEvents
                    .filter(e => 
                      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      e.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      e.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .slice(0, 8)
                    .map(event => (
                      <button
                        key={event.id}
                        onClick={() => {
                          onEventClick(event);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-4 p-4 hover:bg-muted transition-colors text-left border-b border-border/50 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center border border-border shrink-0">
                          <InfinityIcon className="w-5 h-5 opacity-40" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{event.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{event.platform}</span>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                              {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(event.start_time))}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  {allEvents.filter(e => 
                    e.title.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-sm font-bold text-muted-foreground">No matches found</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                  "flex items-center gap-2 p-2 px-3 rounded-xl font-bold transition-all hover:bg-muted border border-border/50 shadow-sm",
                  isFilterOpen 
                    ? "bg-primary/10 text-primary border-primary/20" 
                    : "text-muted-foreground hover:text-foreground bg-background"
                )}
              >
                <Filter className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-widest hidden sm:inline">Filters</span>
                {(filters.categories.length > 0 || filters.platforms.length > 0) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>

              <button
                onClick={() => setIsHelpOpen(true)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                title="Keyboard Shortcuts"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            <AnimatePresence>
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 top-full mt-2 w-[280px] md:w-[320px] bg-card border border-border rounded-2xl shadow-2xl p-4 z-50 flex flex-col max-h-[85vh]"
                  >
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Active Filters</h3>
                      <button
                        onClick={() => {
                          setFilters({ categories: [], platforms: [], mode: 'all', difficulty: undefined });
                        }}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        Reset
                      </button>
                    </div>

                    <div className="space-y-6 overflow-y-auto custom-scrollbar flex-1 pr-1">
                      {availableCategories.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-foreground mb-3 px-1">Category</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {availableCategories.map(cat => (
                              <FilterButton
                                key={cat.id}
                                label={cat.label}
                                active={filters.categories.includes(cat.id as EventCategory)}
                                onClick={() => toggleCategory(cat.id as EventCategory)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {availablePlatforms.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-foreground mb-3 px-1">Platforms</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {availablePlatforms.map(plat => (
                              <FilterButton
                                key={plat}
                                label={plat}
                                active={filters.platforms.includes(plat)}
                                onClick={() => togglePlatform(plat)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="text-xs font-bold text-foreground mb-3 px-1">Access</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {(['all', 'online', 'offline', 'hybrid'] as const).map(m => (
                            <FilterButton
                              key={m}
                              label={m.charAt(0).toUpperCase() + m.slice(1)}
                              active={filters.mode === m}
                              onClick={() => setFilters({ ...filters, mode: m })}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-foreground mb-3 px-1">Difficulty</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(d => (
                            <FilterButton
                              key={d}
                              label={d.charAt(0).toUpperCase() + d.slice(1)}
                              active={(filters.difficulty || 'all') === d}
                              onClick={() => setFilters({ ...filters, difficulty: d === 'all' ? undefined : d })}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="w-full py-2 bg-foreground text-background rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/omkhalane/eventio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-foreground text-background rounded-xl hover:opacity-90 transition-all shadow-sm group"
          >
            <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Star us</span>
          </a>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2.5 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <a
            href="https://github.com/omkhalane/eventio/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </a>
          
          <div className="w-px h-6 bg-border mx-1"></div>
          
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full border-[1.5px] border-black dark:border-white transition-transform active:scale-95 group overflow-hidden bg-muted"
            >
              {googleUser?.photoURL ? (
                <img src={googleUser.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-4 w-[240px] bg-card border border-border rounded-2xl shadow-2xl p-4 z-50"
                >
                  {googleUser ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 px-2">
                        {googleUser.photoURL && (
                          <img src={googleUser.photoURL} alt="" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{googleUser.displayName || 'User'}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{googleUser.email}</p>
                        </div>
                      </div>
                      <div className="h-px bg-border" />
                      <button
                        onClick={() => {
                          onGoogleSignOut();
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-2 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs text-muted-foreground px-2">Connect your Google account to sync events to your calendar.</p>
                      <button 
                        onClick={() => {
                          onGoogleSignIn();
                          setIsProfileOpen(false);
                        }}
                        className="gsi-material-button w-full"
                      >
                        <div className="gsi-material-button-state"></div>
                        <div className="gsi-material-button-content-wrapper">
                          <div className="gsi-material-button-icon">
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'block' }}>
                              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                              <path fill="none" d="M0 0h48v48H0z"></path>
                            </svg>
                          </div>
                          <span className="gsi-material-button-contents text-xs">Sign in with Google</span>
                        </div>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {isHelpOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsHelpOpen(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-card border border-border rounded-3xl shadow-2xl p-8 max-w-sm w-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Shortcuts</h3>
                  <button onClick={() => setIsHelpOpen(false)} className="p-1 hover:bg-muted rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-auto pr-2 custom-scrollbar">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Search</span>
                    <div className="flex gap-1">
                      <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] font-bold">Ctrl</kbd>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] font-bold">K</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Go to Today</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] font-bold">D</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Month Prev/Next</span>
                    <div className="flex gap-1">
                      <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] font-bold">A</kbd>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] font-bold">F</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Year Prev/Next</span>
                    <div className="flex gap-1">
                      <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] font-bold">S</kbd>
                      <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] font-bold">W</kbd>
                    </div>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">List View</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] font-bold">L</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Month View</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] font-bold">M</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Week View</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] font-bold">K</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Day View</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] font-bold">Y</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Close Popup</span>
                    <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] font-bold">Esc</kbd>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
        active
          ? "bg-foreground text-background border-foreground shadow-sm px-4"
          : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
