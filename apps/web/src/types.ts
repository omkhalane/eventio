export type EventCategory =
  | 'competitive_programming'
  | 'global_competition'
  | 'hackathon'
  | 'hiring_challenge'
  | 'data_science'
  | 'community_event'
  | 'conference'
  | 'cybersecurity_ctf'
  | 'open_source'
  | 'live_stream';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface CalendarEvent {
  id: string;
  slug: string;
  title: string;
  platform: string;
  platform_event_id?: string;
  start_time: string;
  end_time?: string;
  timezone: string;
  event_type: string;
  tags: string[];
  skills?: string[];
  mode?: string;
  city?: string;
  country?: string;
  location?: string;
  url: string;
  is_free: boolean;
  price?: string;
  status: EventStatus;
  description?: string;
  shortDescription?: string;
  bannerImage?: string;
  thumbnailImage?: string;
  organizerName?: string;
  organizerLogo?: string;
  organizerUrl?: string;
  eligibility?: string;
  prizes?: string;
  maxTeamSize?: number;
  minTeamSize?: number;
  views?: number;
  clicks?: number;
  bookmarks?: number;
  extra: any;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  google_id: string;
  is_subscribed: boolean;
  created_at: string;
  updated_at: string;
}

export type ViewMode = 'month' | 'week' | 'day' | 'list';

export interface FilterState {
  categories: EventCategory[];
  platforms: string[];
  mode: 'online' | 'offline' | 'hybrid' | 'all';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'all';
}
