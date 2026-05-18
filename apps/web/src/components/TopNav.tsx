import {
  Filter,
  Infinity as InfinityIcon,
  Info,
  Moon,
  Search,
  Settings,
  Sun,
  Terminal,
  User,
  X,
  Bookmark,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { CATEGORIES, PLATFORMS } from '../constants';
import { buildApiUrl } from '../lib/api';
import { cn } from '../lib/utils';
import { CalendarEvent, EventCategory, FilterState } from '../types';

const LOGO_IMAGE = '/assets/logo.svg';

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
  onEventClick,
}: TopNavProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      try {
        const bookmarks = JSON.parse(localStorage.getItem('eventio-bookmarks') || '[]');
        setBookmarkCount(bookmarks.length);
      } catch (e) {
        console.warn('LocalStorage blocked:', e);
      }
    };
    
    updateCount();
    window.addEventListener('eventio-bookmarks-updated', updateCount);
    return () => window.removeEventListener('eventio-bookmarks-updated', updateCount);
  }, []);

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
    return CATEGORIES;
  }, []);

  const availablePlatforms = useMemo(() => {
    return Array.from(new Set(PLATFORMS));
  }, []);

  const toggleCategory = (cat: EventCategory) => {
    const newCats = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    setFilters({ ...filters, categories: newCats });
  };

  const togglePlatform = (plat: string) => {
    const newPlats = filters.platforms.includes(plat)
      ? filters.platforms.filter((p) => p !== plat)
      : [...filters.platforms, plat];
    setFilters({ ...filters, platforms: newPlats });
  };

  return (
    <header className="border-border bg-card sticky top-0 z-40 flex h-14 items-center border-b px-6">
      {/* Logo Area (aligned with Sidebar) */}
      <Link
        to="/"
        className="group flex w-[256px] shrink-0 items-center transition-opacity hover:opacity-90"
      >
        <span className="border-border bg-card group-hover:bg-muted flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm transition-all">
          <img
            src={LOGO_IMAGE}
            alt="Eventio Logo"
            className="h-6 w-6 rounded-md transition-transform group-hover:scale-110"
          />
        </span>
        <span className="ml-2.5 font-sans text-[20px] font-bold tracking-[-0.03em] text-stone-900 select-none">
          EventIO
        </span>
      </Link>

      {/* Main Content Area (aligned with MainCalendar) */}
      <div className="flex min-w-0 flex-1 items-center justify-between">
        <div className="flex flex-1 items-center gap-6">
          <div className="group relative w-full max-w-md">
            <div className="text-muted-foreground group-focus-within:text-foreground pointer-events-none absolute inset-y-0 left-3 flex items-center transition-colors">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/50 focus:border-border focus:ring-primary/5 w-full rounded-xl border border-transparent py-2 pr-4 pl-9 text-sm transition-all focus:ring-4 focus:outline-none"
            />

            {/* Search Dropdown */}
            <AnimatePresence>
              {searchQuery.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="bg-card border-border custom-scrollbar absolute top-full right-0 left-0 z-60 mt-2 max-h-100 overflow-hidden overflow-y-auto rounded-2xl border shadow-2xl"
                >
                  {allEvents
                    .filter(
                      (e) =>
                        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        e.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())),
                    )
                    .slice(0, 8)
                    .map((event) => (
                      <button
                        key={event.id}
                        onClick={() => {
                          onEventClick(event);
                          setSearchQuery('');
                        }}
                        className="hover:bg-muted border-border/50 flex w-full items-center gap-4 border-b p-4 text-left transition-colors last:border-0"
                      >
                        <div className="bg-muted border-border flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
                          <InfinityIcon className="h-5 w-5 opacity-40" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">{event.title}</p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                              {event.platform}
                            </span>
                            <span className="bg-border h-1 w-1 rounded-full" />
                            <span className="text-primary/60 text-[10px] font-black tracking-widest uppercase">
                              {new Intl.DateTimeFormat('en-GB', {
                                day: 'numeric',
                                month: 'short',
                              }).format(new Date(event.start_time))}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  {allEvents.filter((e) =>
                    e.title.toLowerCase().includes(searchQuery.toLowerCase()),
                  ).length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground text-sm font-bold">No matches found</p>
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
                  'hover:bg-muted border-border/50 flex items-center gap-2 rounded-xl border p-2 px-3 font-bold shadow-sm transition-all',
                  isFilterOpen
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'text-muted-foreground hover:text-foreground bg-background',
                )}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden text-[10px] tracking-widest uppercase sm:inline">
                  Filters
                </span>
                {(filters.categories.length > 0 || filters.platforms.length > 0) && (
                  <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setIsHelpOpen(true)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl p-2 transition-all"
                title="Keyboard Shortcuts"
              >
                <Info className="h-4 w-4" />
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
                    className="bg-card border-border absolute top-full left-0 z-50 mt-2 flex max-h-[85vh] w-70 flex-col rounded-2xl border p-4 shadow-2xl md:w-[320px]"
                  >
                    <div className="mb-4 flex items-center justify-between px-1">
                      <h3 className="text-muted-foreground text-[10px] font-black tracking-[0.2em] uppercase">
                        Active Filters
                      </h3>
                      <button
                        onClick={() => {
                          setFilters({
                            categories: [],
                            platforms: [],
                            mode: 'all',
                            difficulty: undefined,
                          });
                        }}
                        className="text-primary text-[10px] font-bold hover:underline"
                      >
                        Reset
                      </button>
                    </div>

                    <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto pr-1">
                      {availableCategories.length > 0 && (
                        <div>
                          <h3 className="text-foreground mb-3 px-1 text-xs font-bold">Category</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {availableCategories.map((cat) => (
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
                          <h3 className="text-foreground mb-3 px-1 text-xs font-bold">Platforms</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {availablePlatforms.map((plat) => (
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
                        <h3 className="text-foreground mb-3 px-1 text-xs font-bold">Access</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {(['all', 'online', 'offline', 'hybrid'] as const).map((m) => (
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
                        <h3 className="text-foreground mb-3 px-1 text-xs font-bold">Difficulty</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((d) => (
                            <FilterButton
                              key={d}
                              label={d.charAt(0).toUpperCase() + d.slice(1)}
                              active={(filters.difficulty || 'all') === d}
                              onClick={() =>
                                setFilters({ ...filters, difficulty: d === 'all' ? undefined : d })
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-border mt-4 border-t pt-4">
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="bg-foreground text-background w-full rounded-xl py-2 text-xs font-black tracking-widest uppercase transition-all hover:opacity-90"
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
          <Link
            to="/events/bookmark"
            className="hover:bg-muted text-stone-700 dark:text-stone-300 hover:text-foreground flex items-center gap-2 rounded-xl border border-border bg-stone-100/50 dark:bg-stone-900/50 p-2 px-3 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="View Bookmarked Events"
          >
            <Bookmark className="h-4 w-4 fill-current text-amber-500" />
            <span className="hidden text-[10px] font-black tracking-widest uppercase sm:inline">
              Bookmarks
            </span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[9px] font-black text-white shadow-sm animate-pulse-subtle">
              {bookmarkCount}
            </span>
          </Link>

          <a
            href="https://github.com/omkhalane/eventio"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-foreground text-background group flex items-center gap-2 rounded-xl px-3 py-2 shadow-sm transition-all hover:opacity-90"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 fill-current transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            <span className="text-[10px] font-black tracking-widest uppercase">Star us</span>
          </a>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="hover:bg-muted text-muted-foreground hover:text-foreground hover:border-border rounded-xl border border-transparent p-2.5 transition-all"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <a
            href="https://github.com/omkhalane/eventio/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-muted text-muted-foreground hover:text-foreground hover:border-border rounded-xl border border-transparent p-2.5 transition-all"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </a>

          <div className="bg-border mx-1 h-6 w-px"></div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="group bg-muted flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-[1.5px] border-black transition-transform active:scale-95"
            >
              {googleUser?.photoURL ? (
                <img
                  src={googleUser.photoURL}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="text-muted-foreground group-hover:text-foreground h-5 w-5 transition-colors" />
              )}
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="bg-card border-border absolute top-full right-0 z-50 mt-4 w-60 rounded-2xl border p-4 shadow-2xl"
                >
                  {googleUser ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 px-2">
                        {googleUser.photoURL && (
                          <img
                            src={googleUser.photoURL}
                            alt=""
                            className="h-10 w-10 rounded-full"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">
                            {googleUser.displayName || 'User'}
                          </p>
                          <p className="text-muted-foreground truncate text-[10px]">
                            {googleUser.email}
                          </p>
                        </div>
                      </div>
                      <div className="bg-border h-px" />
                      <button
                        onClick={() => {
                          onGoogleSignOut();
                          setIsProfileOpen(false);
                        }}
                        className="text-destructive hover:bg-destructive/10 w-full rounded-lg px-2 py-2 text-left text-xs font-medium transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-muted-foreground px-2 text-xs">
                        Connect your Google account to sync events to your calendar.
                      </p>
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
                            <svg
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 48 48"
                              xmlnsXlink="http://www.w3.org/1999/xlink"
                              className="block"
                            >
                              <path
                                fill="#EA4335"
                                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                              ></path>
                              <path
                                fill="#4285F4"
                                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                              ></path>
                              <path
                                fill="#FBBC05"
                                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                              ></path>
                              <path
                                fill="#34A853"
                                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                              ></path>
                              <path fill="none" d="M0 0h48v48H0z"></path>
                            </svg>
                          </div>
                          <span className="gsi-material-button-contents text-xs">
                            Sign in with Google
                          </span>
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
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsHelpOpen(false)}
                className="bg-background/80 absolute inset-0 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border-border relative w-full max-w-sm rounded-3xl border p-8 shadow-2xl"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold">Shortcuts</h3>
                  <button
                    onClick={() => setIsHelpOpen(false)}
                    aria-label="Close shortcuts dialog"
                    className="hover:bg-muted rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="custom-scrollbar max-h-[60vh] space-y-4 overflow-auto pr-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">Search</span>
                    <div className="flex gap-1">
                      <kbd className="bg-muted border-border rounded border px-1.5 py-0.5 text-[9px] font-bold">
                        Ctrl
                      </kbd>
                      <kbd className="bg-muted border-border rounded border px-1.5 py-0.5 text-[9px] font-bold">
                        K
                      </kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">Go to Today</span>
                    <kbd className="bg-muted border-border rounded border px-1.5 py-0.5 text-[9px] font-bold">
                      D
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">
                      Month Prev/Next
                    </span>
                    <div className="flex gap-1">
                      <kbd className="bg-muted border-border rounded border px-1.5 py-0.5 text-[9px] font-bold">
                        A
                      </kbd>
                      <kbd className="bg-muted border-border rounded border px-1.5 py-0.5 text-[9px] font-bold">
                        F
                      </kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">
                      Year Prev/Next
                    </span>
                    <div className="flex gap-1">
                      <kbd className="bg-muted border-border rounded border px-1.5 py-0.5 text-[9px] font-bold">
                        S
                      </kbd>
                      <kbd className="bg-muted border-border rounded border px-1.5 py-0.5 text-[9px] font-bold">
                        W
                      </kbd>
                    </div>
                  </div>
                  <div className="bg-border my-2 h-px" />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">List View</span>
                    <kbd className="bg-muted border-border rounded border px-1.5 py-0.5 text-[9px] font-bold">
                      L
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">Month View</span>
                    <kbd className="bg-muted border-border rounded border px-1.5 py-0.5 text-[9px] font-bold">
                      M
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">Week View</span>
                    <kbd className="bg-muted border-border rounded border px-1.5 py-0.5 text-[9px] font-bold">
                      K
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">Day View</span>
                    <kbd className="bg-muted border-border rounded border px-1.5 py-0.5 text-[9px] font-bold">
                      Y
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">Close Popup</span>
                    <kbd className="bg-muted border-border rounded border px-1.5 py-0.5 text-[9px] font-bold">
                      Esc
                    </kbd>
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
        'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
        active
          ? 'bg-foreground text-background border-foreground px-4 shadow-sm'
          : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground',
      )}
    >
      {label}
    </button>
  );
};
